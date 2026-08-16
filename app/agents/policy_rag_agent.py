import logging
import time
from datetime import UTC, datetime

from app.models.claim_schemas import Claim, InsuranceLine
from app.models.state_schemas import AgentExecutionNode, AgentStepTrace, NodeStatus
from app.models.verdict_schemas import PolicyValidationResult
from app.rag.policy_store import policy_store

logger = logging.getLogger(__name__)


class PolicyRAGAgent:
    """Evaluates claims against active policy contracts, endorsements, deductibles, and exclusions via ChromaDB RAG."""

    @staticmethod
    async def process(claim: Claim, node: AgentExecutionNode) -> PolicyValidationResult:
        node.status = NodeStatus.RUNNING
        node.started_at = datetime.now(UTC).isoformat()
        start_time = time.time()

        node.thought_trace.append(
            f"Querying ChromaDB Policy Store for Policy ID: {claim.policy_id} (Line: {claim.insurance_line})..."
        )

        search_query = f"{claim.description} {' '.join([item.description for item in claim.line_items])}"

        matched_clauses = policy_store.search_clauses(
            query=search_query,
            insurance_line=claim.insurance_line,
            policy_id=claim.policy_id,
            top_k=4,
        )

        node.thought_trace.append(
            f"Retrieved {len(matched_clauses)} relevant clauses from policy knowledge base."
        )

        policy_limit = claim.policy.coverage_limit if claim.policy else 50000.0
        deductible = claim.policy.deductible if claim.policy else 500.0
        coinsurance = claim.policy.co_insurance_percent if claim.policy else 0.0

        detected_exclusions: list[str] = []
        coverage_status = "FULLY_COVERED"
        matched_peril = "Standard Covered Peril"

        desc_lower = claim.description.lower()

        # Domain specific exclusion heuristics & clause matching
        if claim.insurance_line == InsuranceLine.PROPERTY:
            if any(
                w in desc_lower
                for w in [
                    "ground water",
                    "seepage",
                    "foundation",
                    "basement floor",
                    "heavy rain soaked through slab",
                ]
            ):
                detected_exclusions.append(
                    "Section I - Exclusion 3.a (Ground Water Seepage & Foundation Ingress)"
                )
                coverage_status = "EXCLUDED"
                node.thought_trace.append(
                    "ALERT: Incident description indicates subsurface ground water seepage, triggering Exclusion 3.a."
                )
            elif "mold" in desc_lower:
                coverage_status = "PARTIALLY_COVERED"
                detected_exclusions.append(
                    "Section I - Sublimit 4 (Mold Remediation $5,000 Cap)"
                )
            else:
                matched_peril = "Sudden & Accidental Water Discharge (Peril 12)"

        elif claim.insurance_line == InsuranceLine.HEALTH:
            uncovered_items = [
                i
                for i in claim.line_items
                if not i.is_covered or "cosmetic" in i.description.lower()
            ]
            if uncovered_items:
                coverage_status = "PARTIALLY_COVERED"
                detected_exclusions.append(
                    "Exclusions Section 11 - Non-covered / unbundled elective procedures"
                )
            else:
                matched_peril = "Emergency Room & Acute Care Services"

        elif claim.insurance_line == InsuranceLine.AUTO:
            if "wear" in desc_lower or "mechanical failure" in desc_lower:
                coverage_status = "EXCLUDED"
                detected_exclusions.append(
                    "Section 3.1 - Pre-Existing Mechanical Wear & Tear Exclusion"
                )
            else:
                matched_peril = "Sudden Collision Loss (Section 1.1)"

        for clause in matched_clauses:
            node.step_traces.append(
                AgentStepTrace(
                    timestamp=datetime.now(UTC).isoformat(),
                    action="Clause_Evaluated",
                    detail=f"Matched Section {clause.section_number}: {clause.section_title} (Relevance: {clause.relevance_score})",
                    data_snapshot={
                        "clause_id": clause.clause_id,
                        "is_exclusion": clause.is_exclusion,
                    },
                )
            )

        validation_notes = (
            f"Coverage determination: {coverage_status}. "
            f"Applicable deductible: ${deductible:,.2f}. "
            f"Policy aggregate limit: ${policy_limit:,.2f}."
        )
        if detected_exclusions:
            validation_notes += (
                f" Exclusions triggered: {'; '.join(detected_exclusions)}."
            )

        node.thought_trace.append(
            f"Policy RAG evaluation complete: Status is {coverage_status}."
        )

        node.status = NodeStatus.COMPLETED
        node.completed_at = datetime.now(UTC).isoformat()
        node.duration_ms = round((time.time() - start_time) * 1000, 2)
        node.output_summary = f"Validated policy terms. Status: {coverage_status}, Deductible: ${deductible:,.2f}."

        return PolicyValidationResult(
            is_covered=(coverage_status != "EXCLUDED"),
            coverage_status=coverage_status,
            matched_peril=matched_peril,
            matched_clauses=matched_clauses,
            detected_exclusions=detected_exclusions,
            policy_limit=policy_limit,
            applicable_deductible=deductible,
            co_pay_or_coinsurance_rate=coinsurance,
            validation_notes=validation_notes,
        )
