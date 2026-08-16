import os

from fastapi import APIRouter

from app.config import settings
from app.db.store import claim_repo
from app.rag.policy_store import policy_store

router = APIRouter()


@router.get("", summary="Health status check")
async def health_check():
    """System status, OpenRouter integration status, and loaded record counts."""
    return {
        "status": "healthy",
        "api_version": "v1",
        "openrouter_configured": bool(settings.OPENROUTER_API_KEY or os.getenv("OPENROUTER_API_KEY")),
        "claims_loaded": len(claim_repo.get_all()),
        "policies_loaded": len(policy_store.get_all_policies())
    }
