from typing import Optional

from fastapi import APIRouter, Query

from app.rag.policy_store import policy_store

router = APIRouter()


@router.get("", summary="List all indexed policies")
async def list_policies():
    """List all indexed policy contracts."""
    return policy_store.get_all_policies()


@router.get("/search", summary="ChromaDB semantic clause search")
async def search_policies(
    q: str = Query(..., description="Query terms for semantic clause search"),
    policy_id: Optional[str] = Query(None, description="Filter by Policy ID")
):
    """Semantic ChromaDB vector search over policy clauses and exclusions."""
    return policy_store.search_clauses(query=q, policy_id=policy_id, top_k=5)
