from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.config import settings

router = APIRouter()


class SettingsUpdateRequest(BaseModel):
    openrouter_api_key: Optional[str] = None
    vision_model: Optional[str] = None
    reasoning_model: Optional[str] = None
    stp_max_amount: Optional[float] = None
    stp_max_fraud_score: Optional[float] = None


@router.get("", summary="Get system settings")
async def get_runtime_settings():
    """Retrieve active system parameters, model selections, and STP thresholds."""
    return {
        "openrouter_configured": bool(settings.OPENROUTER_API_KEY),
        "vision_model": settings.DEFAULT_VISION_MODEL,
        "reasoning_model": settings.DEFAULT_REASONING_MODEL,
        "stp_max_amount": settings.STP_MAX_CLAIM_AMOUNT,
        "stp_max_fraud_score": settings.STP_MAX_FRAUD_SCORE,
    }


@router.post("", summary="Update system settings")
async def update_runtime_settings(req: SettingsUpdateRequest):
    """Update runtime model routing and autonomous STP authorization thresholds."""
    if req.openrouter_api_key is not None:
        settings.OPENROUTER_API_KEY = req.openrouter_api_key
    if req.vision_model:
        settings.DEFAULT_VISION_MODEL = req.vision_model
    if req.reasoning_model:
        settings.DEFAULT_REASONING_MODEL = req.reasoning_model
    if req.stp_max_amount:
        settings.STP_MAX_CLAIM_AMOUNT = req.stp_max_amount
    if req.stp_max_fraud_score:
        settings.STP_MAX_FRAUD_SCORE = req.stp_max_fraud_score

    return {
        "status": "success",
        "settings": {
            "openrouter_configured": bool(settings.OPENROUTER_API_KEY),
            "vision_model": settings.DEFAULT_VISION_MODEL,
            "reasoning_model": settings.DEFAULT_REASONING_MODEL,
            "stp_max_amount": settings.STP_MAX_CLAIM_AMOUNT,
            "stp_max_fraud_score": settings.STP_MAX_FRAUD_SCORE,
        }
    }
