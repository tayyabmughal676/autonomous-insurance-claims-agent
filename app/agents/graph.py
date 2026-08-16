import logging
import time
from datetime import datetime, timezone
from typing import Callable, Optional

from app.agents.adjudication_agent import AdjudicationSupervisorAgent
from app.agents.fraud_agent import FraudForensicsAgent
from app.agents.intake_agent import IntakeAgent
from app.agents.math_engine import DeterministicMathEngine
from app.agents.policy_rag_agent import PolicyRAGAgent
from app.models.claim_schemas import Claim, ClaimStatus
from app.models.state_schemas import AgentExecutionNode, ClaimProcessingState, NodeStatus
from app.models.verdict_schemas import AdjudicationDecision

logger = logging.getLogger(__name__)


class StateGraphClaimsOrchestrator:
    """StateGraph-style multi-agent orchestrator managing linear & branched claim adjudication nodes."""

    @staticmethod
    def initialize_state(claim: Claim) -> ClaimProcessingState:
        nodes = [
            AgentExecutionNode(
                node_id="node-intake",
                agent_name="Multimodal Intake & OCR Agent",
                description="Extracts structured fields, bounding boxes, and performs EXIF forensics on attached evidence."
            ),
            AgentExecutionNode(
                node_id="node-policy-rag",
                agent_name="Policy Knowledge & Coverage Agent",
                description="Queries ChromaDB vector knowledge base to validate coverage, perils, deductibles, and exclusions."
            ),
            AgentExecutionNode(
                node_id="node-fraud",
                agent_name="Fraud & Forensics Agent",
                description="Evaluates metadata tampering, price inflation anomalies, and narrative consistency."
            ),
            AgentExecutionNode(
                node_id="node-math",
                agent_name="Deterministic Financial Engine",
                description="Applies zero-hallucination math for deductibles, co-pays, unbundled items, and policy limits."
            ),
            AgentExecutionNode(
                node_id="node-adjudication",
                agent_name="Adjudication Supervisor Agent",
                description="Evaluates STP rules, routes complex files to human adjusters, and drafts formal notices."
            )
        ]
        return ClaimProcessingState(
            claim_id=claim.id,
            claim=claim,
            nodes=nodes,
            current_node="node-intake"
        )

    @classmethod
    async def execute_graph(
        cls,
        claim: Claim,
        progress_callback: Optional[Callable[[ClaimProcessingState], None]] = None
    ) -> ClaimProcessingState:
        state = cls.initialize_state(claim)

        try:
            # -------------------------------------------------------------
            # NODE 1: Intake & Multimodal OCR
            # -------------------------------------------------------------
            state.current_node = "node-intake"
            intake_node = state.nodes[0]
            if progress_callback:
                progress_callback(state)

            updated_docs = await IntakeAgent.process(claim, intake_node)
            state.claim.documents = updated_docs
            if progress_callback:
                progress_callback(state)

            # -------------------------------------------------------------
            # NODE 2: Policy RAG & Coverage Check
            # -------------------------------------------------------------
            state.current_node = "node-policy-rag"
            policy_node = state.nodes[1]
            if progress_callback:
                progress_callback(state)

            policy_res = await PolicyRAGAgent.process(state.claim, policy_node)
            state.policy_result = policy_res
            if progress_callback:
                progress_callback(state)

            # -------------------------------------------------------------
            # NODE 3: Fraud & Forensics Analysis
            # -------------------------------------------------------------
            state.current_node = "node-fraud"
            fraud_node = state.nodes[2]
            if progress_callback:
                progress_callback(state)

            fraud_res = await FraudForensicsAgent.process(state.claim, fraud_node)
            state.fraud_result = fraud_res
            if progress_callback:
                progress_callback(state)

            # -------------------------------------------------------------
            # NODE 4: Deterministic Financial Math
            # -------------------------------------------------------------
            state.current_node = "node-math"
            math_node = state.nodes[3]
            math_node.status = NodeStatus.RUNNING
            math_node.started_at = datetime.now(timezone.utc).isoformat()
            math_start = time.time()
            if progress_callback:
                progress_callback(state)

            payout_res = DeterministicMathEngine.calculate_payout(state.claim, policy_res)
            state.payout_result = payout_res
            math_node.status = NodeStatus.COMPLETED
            math_node.completed_at = datetime.now(timezone.utc).isoformat()
            math_node.duration_ms = round((time.time() - math_start) * 1000, 2)
            math_node.output_summary = f"Net Recommended Payout: ${payout_res.net_recommended_payout:,.2f} (Deductible: -${payout_res.applied_deductible:,.2f})"
            math_node.thought_trace.extend(payout_res.math_audit_trail)
            if progress_callback:
                progress_callback(state)

            # -------------------------------------------------------------
            # NODE 5: Supervisor Adjudication & Routing
            # -------------------------------------------------------------
            state.current_node = "node-adjudication"
            adjudication_node = state.nodes[4]
            if progress_callback:
                progress_callback(state)

            verdict = await AdjudicationSupervisorAgent.process(
                claim=state.claim,
                policy_res=policy_res,
                fraud_res=fraud_res,
                payout_res=payout_res,
                node=adjudication_node
            )
            state.verdict = verdict

            # Update master claim status
            if verdict.decision == AdjudicationDecision.AUTO_APPROVE:
                state.claim.status = ClaimStatus.AUTO_APPROVED
            elif verdict.decision == AdjudicationDecision.RECOMMEND_DENIAL:
                state.claim.status = ClaimStatus.DENIED
            else:
                state.claim.status = ClaimStatus.IN_REVIEW

            state.is_completed = True
            state.current_node = None
            if progress_callback:
                progress_callback(state)

        except Exception as e:
            logger.error(f"StateGraph execution encountered error: {e}", exc_info=True)
            state.errors.append(str(e))
            for node in state.nodes:
                if node.status == NodeStatus.RUNNING:
                    node.status = NodeStatus.FAILED
                    node.error = str(e)

        return state
