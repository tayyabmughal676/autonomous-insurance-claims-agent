import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query, Response
from pydantic import BaseModel

from app.agents.graph import StateGraphClaimsOrchestrator
from app.agents.langgraph_adapter import LangGraphClaimsOrchestrator
from app.agents.math_engine import DeterministicMathEngine
from app.db.store import claim_repo
from app.models.claim_schemas import Claim, ClaimLineItem, ClaimStatus
from app.models.state_schemas import ClaimProcessingState
from app.utils.letter_generator import LetterGenerator
from app.utils.pdf_generator import generate_denial_pdf, generate_settlement_pdf

logger = logging.getLogger(__name__)
router = APIRouter()


class AdjudicationActionRequest(BaseModel):
    action: str  # "APPROVE", "DENY", "REQUEST_INFO"
    custom_line_items: Optional[List[ClaimLineItem]] = None
    adjuster_notes: Optional[str] = None


@router.get("", response_model=List[Claim], summary="List all claims")
async def list_claims(
    line: Optional[str] = Query(None, description="Filter by insurance line (AUTO, PROPERTY, HEALTH)")
):
    """Retrieve all claims in the pipeline, optionally filtered by line."""
    return claim_repo.get_all(line)


@router.get("/{claim_id}", response_model=Claim, summary="Get claim details")
async def get_claim(claim_id: str):
    """Retrieve a single claim by its unique ID."""
    claim = claim_repo.get_by_id(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail=f"Claim '{claim_id}' not found.")
    return claim


@router.post("", response_model=Claim, summary="Submit new claim")
async def create_claim(claim: Claim):
    """Submit a new claim into the intake queue."""
    saved = claim_repo.save(claim)
    logger.info(f"Ingested new claim {claim.claim_number} ({claim.insurance_line}).")
    return saved


@router.post("/{claim_id}/process", response_model=ClaimProcessingState, summary="Run Multi-Agent AI pipeline")
async def process_claim_with_agent(
    claim_id: str,
    custom_api_key: Optional[str] = Query(None, description="Optional runtime OpenRouter Key override"),
    engine: Optional[str] = Query("native", description="Orchestration engine: 'native' (default) or 'langgraph'")
):
    """Triggers the multi-agent claims processing pipeline via Native StateGraph or official LangGraph runtime."""
    claim = claim_repo.get_by_id(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail=f"Claim '{claim_id}' not found.")

    selected_engine = (engine or "native").lower().strip()
    logger.info(f"Executing claims pipeline on {claim.claim_number} using '{selected_engine}' engine...")

    if selected_engine == "langgraph":
        final_state = await LangGraphClaimsOrchestrator.execute_graph(claim)
    else:
        final_state = await StateGraphClaimsOrchestrator.execute_graph(claim)

    claim_repo.save_state(claim_id, final_state)
    return final_state


@router.get("/{claim_id}/state", response_model=Optional[ClaimProcessingState], summary="Get agent thought trace state")
async def get_claim_processing_state(claim_id: str):
    """Retrieve the cached multi-agent StateGraph thought trace and execution node telemetry."""
    return claim_repo.get_state(claim_id)


@router.post("/{claim_id}/adjudicate", summary="Human adjuster sign-off & adjudication")
async def human_adjudicate_claim(claim_id: str, req: AdjudicationActionRequest):
    """Human adjuster action override, approval sign-off, or declination."""
    claim = claim_repo.get_by_id(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail=f"Claim '{claim_id}' not found.")

    state = claim_repo.get_state(claim_id)

    if req.custom_line_items:
        claim.line_items = req.custom_line_items

    # Deterministic recalculation with adjuster modifications
    new_payout = DeterministicMathEngine.calculate_payout(
        claim,
        state.policy_result if state else None,
        req.custom_line_items
    )

    if req.action == "APPROVE":
        claim.status = ClaimStatus.APPROVED
        settlement_letter = LetterGenerator.generate_settlement_letter(
            claim,
            new_payout,
            state.verdict if state else None,
            req.adjuster_notes
        )
        claim_repo.save(claim)
        return {
            "status": "APPROVED",
            "payout": new_payout,
            "settlement_letter": settlement_letter,
            "message": f"Claim {claim.claim_number} approved for payout of ${new_payout.net_recommended_payout:,.2f}."
        }
    elif req.action == "DENY":
        claim.status = ClaimStatus.DENIED
        denial_letter = LetterGenerator.generate_denial_letter(
            claim,
            state.policy_result if state else None,
            state.fraud_result if state else None,
            req.adjuster_notes
        )
        claim_repo.save(claim)
        return {
            "status": "DENIED",
            "denial_letter": denial_letter,
            "message": f"Claim {claim.claim_number} declined."
        }
    elif req.action == "REQUEST_INFO":
        claim.status = ClaimStatus.INFO_REQUESTED
        rfi_letter = LetterGenerator.generate_rfi_letter(
            claim,
            [req.adjuster_notes or "Please provide itemized documentation and photos."]
        )
        claim_repo.save(claim)
        return {
            "status": "INFO_REQUESTED",
            "rfi_letter": rfi_letter,
            "message": f"Information request issued for claim {claim.claim_number}."
        }
    else:
        raise HTTPException(status_code=400, detail="Invalid adjudication action. Must be APPROVE, DENY, or REQUEST_INFO.")


@router.get("/{claim_id}/documents/settlement-pdf", summary="Download PDF Settlement Voucher & EOB")
async def download_settlement_voucher_pdf(claim_id: str):
    """Generates and downloads a print-ready legal Settlement Voucher and Check Stub PDF."""
    claim = claim_repo.get_by_id(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail=f"Claim '{claim_id}' not found.")

    state = claim_repo.get_state(claim_id)
    payout = state.payout_result if state else None
    verdict = state.verdict if state else None

    pdf_bytes = generate_settlement_pdf(claim, payout, verdict)
    filename = f"Settlement_Voucher_{claim.claim_number}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


@router.get("/{claim_id}/documents/denial-pdf", summary="Download PDF Notice of Claim Declination")
async def download_denial_notice_pdf(claim_id: str):
    """Generates and downloads a print-ready formal legal Notice of Claim Declination PDF."""
    claim = claim_repo.get_by_id(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail=f"Claim '{claim_id}' not found.")

    state = claim_repo.get_state(claim_id)
    policy_res = state.policy_result if state else None
    fraud_res = state.fraud_result if state else None
    verdict = state.verdict if state else None

    pdf_bytes = generate_denial_pdf(claim, policy_res, fraud_res, verdict)
    filename = f"Notice_of_Declination_{claim.claim_number}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
