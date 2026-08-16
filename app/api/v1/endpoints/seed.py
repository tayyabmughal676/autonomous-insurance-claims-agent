from fastapi import APIRouter

from app.db.store import claim_repo
from app.rag.policy_store import policy_store

router = APIRouter()


@router.post("", summary="Seed or reset claim scenarios")
async def seed_or_reset_claims():
    """Seeds or resets the claims repository and ChromaDB policy store with industry scenario datasets."""
    count = claim_repo.seed()
    policy_store.load_and_index_policies()
    return {
        "status": "success",
        "message": f"Successfully seeded {count} multi-line claim scenarios and indexed policy contracts.",
        "claims_count": count,
        "policies_count": len(policy_store.get_all_policies())
    }


@router.get("/scenarios", summary="List evaluation scenario templates")
async def list_available_scenarios():
    """Returns metadata for preloaded evaluation scenarios (Auto STP, Property Denial, Health CPT, Glass)."""
    return [
        {
            "id": "clm-auto-001",
            "scenario_name": "Auto Collision Clean Straight-Through Processing (STP)",
            "line": "AUTO",
            "loss_amount": 1450.00,
            "expected_outcome": "AUTO_APPROVED",
            "key_features": ["Multimodal OCR", "Clean EXIF metadata", "Deterministic $500 deductible calculation", "Net payout $950.00"]
        },
        {
            "id": "clm-prop-002",
            "scenario_name": "Property Water Loss with Policy Exclusion & Timestamp Tampering",
            "line": "PROPERTY",
            "loss_amount": 8850.00,
            "expected_outcome": "RECOMMEND_DENIAL",
            "key_features": ["ChromaDB Section I Exclusion 3.a detection", "EXIF 24-day pre-loss anomaly", "SIU referral trigger"]
        },
        {
            "id": "clm-hlth-003",
            "scenario_name": "Health Emergency Care CPT Code Benchmark Audit",
            "line": "HEALTH",
            "loss_amount": 4750.00,
            "expected_outcome": "IN_REVIEW",
            "key_features": ["CPT fee benchmark capping", "Unbundled administrative charge disallowance", "20% co-insurance math"]
        },
        {
            "id": "clm-auto-004",
            "scenario_name": "Fast-Track Auto Windshield Replacement",
            "line": "AUTO",
            "loss_amount": 680.00,
            "expected_outcome": "AUTO_APPROVED",
            "key_features": ["Sub-$1000 fast track", "ADAS camera recalibration", "Zero fraud signals"]
        }
    ]
