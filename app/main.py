import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_v1_router

# Setup Logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Data Daur — Insurance Claims Processing Agent API",
    description=(
        "Enterprise-grade multi-line autonomous insurance claims adjudication engine. "
        "Integrates StateGraph multi-agent orchestration, multimodal document understanding, "
        "hybrid ChromaDB policy RAG, EXIF/fee fraud forensics, zero-hallucination deterministic math, "
        "and human-in-the-loop (HITL) supervisor sign-off."
    ),
    version="1.5.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Enable CORS for Next.js / Vite development frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modular v1 Router mounted at /api/v1
app.include_router(api_v1_router, prefix="/api/v1")


@app.get("/", tags=["Health"])
async def root_ping():
    """Root health-check and service identification endpoint."""
    return {
        "service": "Data Daur Claims Agent API",
        "status": "online",
        "version": "1.5.0",
        "documentation": "/docs"
    }
