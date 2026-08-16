import pytest

from app.agents.graph import StateGraphClaimsOrchestrator
from app.data.preloaded_claims import get_preloaded_claims
from app.models.claim_schemas import ClaimStatus
from app.models.verdict_schemas import AdjudicationDecision


@pytest.mark.asyncio
async def test_stpgraph_execution_auto_stp():
    """Verify Auto Claim 1 successfully achieves Straight-Through Processing (STP) Auto-Approval."""
    claims = get_preloaded_claims()
    auto_claim = claims[0]  # Auto collision claim ($1450)

    state = await StateGraphClaimsOrchestrator.execute_graph(auto_claim)

    assert state.is_completed is True
    assert len(state.errors) == 0
    assert len(state.nodes) == 5

    # Check all nodes completed
    for node in state.nodes:
        assert node.status.value == "COMPLETED"
        assert node.duration_ms is not None

    # Check Verdict
    assert state.verdict is not None
    assert state.verdict.decision == AdjudicationDecision.AUTO_APPROVE
    assert state.verdict.stp_eligible is True
    assert state.claim.status == ClaimStatus.AUTO_APPROVED
    assert state.payout_result is not None
    assert state.payout_result.net_recommended_payout == 950.0  # $1450 - $500 deductible


@pytest.mark.asyncio
async def test_stpgraph_execution_property_denial_routing():
    """Verify Property Claim 2 triggers Policy Exclusion 3.a and routes to Denial."""
    claims = get_preloaded_claims()
    prop_claim = claims[1]  # Property seepage claim ($8850)

    state = await StateGraphClaimsOrchestrator.execute_graph(prop_claim)

    assert state.is_completed is True
    assert len(state.errors) == 0

    # Check Exclusion detected
    assert state.policy_result is not None
    assert state.policy_result.coverage_status == "EXCLUDED"
    assert len(state.policy_result.detected_exclusions) > 0

    # Check Fraud / Metadata alert
    assert state.fraud_result is not None
    assert state.fraud_result.overall_fraud_score >= 40.0

    # Check Adjudication Decision
    assert state.verdict is not None
    assert state.verdict.decision in [
        AdjudicationDecision.RECOMMEND_DENIAL,
        AdjudicationDecision.ESCALATE_TO_ADJUSTER,
    ]
    assert state.verdict.stp_eligible is False
