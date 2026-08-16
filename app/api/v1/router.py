from fastapi import APIRouter

from app.api.v1.endpoints.claims import router as claims_router
from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.policies import router as policies_router
from app.api.v1.endpoints.seed import router as seed_router
from app.api.v1.endpoints.settings import router as settings_router

api_v1_router = APIRouter()

api_v1_router.include_router(health_router, prefix="/health", tags=["Health"])
api_v1_router.include_router(seed_router, prefix="/seed", tags=["Seed & Scenarios"])
api_v1_router.include_router(claims_router, prefix="/claims", tags=["Claims"])
api_v1_router.include_router(policies_router, prefix="/policies", tags=["Policies"])
api_v1_router.include_router(settings_router, prefix="/settings", tags=["Settings"])
