import os
from pathlib import Path

from dotenv import load_dotenv
from pydantic import BaseModel

# Load .env from backend root or parent directory
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


class Settings(BaseModel):
    PROJECT_NAME: str = "Insurance Claims Agent"
    API_V1_PREFIX: str = "/api/v1"

    # OpenRouter Configuration
    OPENROUTER_BASE_URL: str = os.getenv(
        "OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"
    )
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")

    # Model Selection (defaults to free model)
    DEFAULT_VISION_MODEL: str = os.getenv(
        "DEFAULT_VISION_MODEL", "google/gemini-2.0-flash-exp:free"
    )
    DEFAULT_REASONING_MODEL: str = os.getenv(
        "DEFAULT_REASONING_MODEL", "openai/gpt-oss-20b:free"
    )

    # Straight-Through Processing (STP) Guardrails
    STP_MAX_CLAIM_AMOUNT: float = float(os.getenv("STP_MAX_CLAIM_AMOUNT", "2500.00"))
    STP_MAX_FRAUD_SCORE: float = float(os.getenv("STP_MAX_FRAUD_SCORE", "15.0"))  # Out of 100
    STP_MIN_CONFIDENCE: float = 0.85  # 85%

    # Vector DB Storage
    CHROMA_PERSIST_DIR: str = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "rag", "chroma_data"
    )
    POLICY_DATA_DIR: str = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "rag", "policy_data"
    )


settings = Settings()
