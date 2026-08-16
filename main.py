"""
FastAPI CLI Application Entrypoint
Enables running `fastapi dev` or `fastapi run` directly with zero arguments.
"""

from app.main import app

__all__ = ["app"]
