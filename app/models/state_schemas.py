from enum import Enum
from typing import Any

from pydantic import BaseModel, Field

from app.models.claim_schemas import Claim
from app.models.verdict_schemas import (
    AdjudicationVerdict,
    FinancialPayout,
    FraudAssessment,
    PolicyValidationResult,
)


class NodeStatus(str, Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    SKIPPED = "SKIPPED"


class AgentStepTrace(BaseModel):
    timestamp: str
    action: str
    detail: str
    data_snapshot: dict[str, Any] | None = None


class AgentExecutionNode(BaseModel):
    node_id: str
    agent_name: str
    description: str
    status: NodeStatus = NodeStatus.PENDING
    started_at: str | None = None
    completed_at: str | None = None
    duration_ms: float | None = None
    thought_trace: list[str] = Field(default_factory=list)
    step_traces: list[AgentStepTrace] = Field(default_factory=list)
    output_summary: str | None = None
    error: str | None = None


class ClaimProcessingState(BaseModel):
    claim_id: str
    claim: Claim
    nodes: list[AgentExecutionNode] = Field(default_factory=list)
    policy_result: PolicyValidationResult | None = None
    fraud_result: FraudAssessment | None = None
    payout_result: FinancialPayout | None = None
    verdict: AdjudicationVerdict | None = None
    current_node: str | None = None
    is_completed: bool = False
    errors: list[str] = Field(default_factory=list)
