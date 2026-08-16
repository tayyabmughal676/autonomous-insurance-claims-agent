"""Unit and Parity Tests for the LangGraph Runtime Adapter."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.agents.graph import StateGraphClaimsOrchestrator
from app.agents.langgraph_adapter import (
    LangGraphClaimsOrchestrator,
    compiled_langgraph_app,
)
from app.db.store import claim_repo
from app.main import app
from app.models.verdict_schemas import AdjudicationDecision


def test_langgraph_workflow_compilation():
    """Verify that the official LangGraph StateGraph compiled successfully."""
    assert compiled_langgraph_app is not None
    assert hasattr(compiled_langgraph_app, "ainvoke")


@pytest.mark.asyncio
async def test_langgraph_execution_auto_stp():
    """Test LangGraph execution on clean Auto STP scenario (clm-auto-001)."""
    claim = claim_repo.get_by_id("clm-auto-001")
    assert claim is not None

    state = await LangGraphClaimsOrchestrator.execute_graph(claim)

    assert state.is_completed is True
    assert state.verdict is not None
    assert state.verdict.decision == AdjudicationDecision.AUTO_APPROVE
    assert state.verdict.stp_eligible is True
    assert state.payout_result is not None
    assert state.payout_result.net_recommended_payout == 950.0
    assert len(state.nodes) == 5


@pytest.mark.asyncio
async def test_langgraph_execution_property_denial():
    """Test LangGraph execution on Property Seepage Exclusion scenario (clm-prop-002)."""
    claim = claim_repo.get_by_id("clm-prop-002")
    assert claim is not None

    state = await LangGraphClaimsOrchestrator.execute_graph(claim)

    assert state.is_completed is True
    assert state.verdict is not None
    assert state.verdict.decision == AdjudicationDecision.RECOMMEND_DENIAL
    assert state.payout_result is not None
    assert state.payout_result.net_recommended_payout == 0.0
    assert state.fraud_result is not None
    assert state.fraud_result.requires_siu_referral is True


@pytest.mark.asyncio
async def test_dual_engine_parity_auto_claim():
    """Verify 100% decision and payout parity between Native StateGraph and LangGraph engines."""
    claim_native = claim_repo.get_by_id("clm-auto-001")
    claim_langgraph = claim_repo.get_by_id("clm-auto-001")
    assert claim_native is not None
    assert claim_langgraph is not None

    state_native = await StateGraphClaimsOrchestrator.execute_graph(claim_native)
    state_langgraph = await LangGraphClaimsOrchestrator.execute_graph(claim_langgraph)

    # Parity assertions
    assert state_native.verdict is not None
    assert state_langgraph.verdict is not None
    assert state_native.verdict.decision == state_langgraph.verdict.decision
    assert state_native.payout_result is not None
    assert state_langgraph.payout_result is not None
    assert state_native.payout_result.net_recommended_payout == state_langgraph.payout_result.net_recommended_payout
    assert state_native.payout_result.applied_deductible == state_langgraph.payout_result.applied_deductible
    assert len(state_native.nodes) == len(state_langgraph.nodes)


@pytest.mark.asyncio
async def test_api_v1_process_with_langgraph_engine():
    """Test POST /api/v1/claims/{id}/process?engine=langgraph API endpoint."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.post("/api/v1/claims/clm-auto-001/process?engine=langgraph")
        assert res.status_code == 200
        data = res.json()
        assert data["is_completed"] is True
        assert data["verdict"]["decision"] == "AUTO_APPROVE"
        assert data["payout_result"]["net_recommended_payout"] == 950.0
