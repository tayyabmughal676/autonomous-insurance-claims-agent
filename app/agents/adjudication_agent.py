import logging
import time
from datetime import UTC, datetime

from app.config import settings
from app.models.claim_schemas import Claim
from app.models.state_schemas import AgentExecutionNode, AgentStepTrace, NodeStatus
from app.models.verdict_schemas import (
    AdjudicationDecision,
    AdjudicationVerdict,
    FinancialPayout,
    FraudAssessment,
    PolicyValidationResult,
)
from app.utils.letter_generator import LetterGenerator

logger = logging.getLogger(__name__)


class AdjudicationSupervisorAgent:
    """Evaluates comprehensive claim results, enforces STP thresholds, and generates executive adjudication briefs."""

    @staticmethod
    async def process(
        claim: Claim,
        policy_res: PolicyValidationResult,
        fraud_res: FraudAssessment,
        payout_res: FinancialPayout,
        node: AgentExecutionNode,
    ) -> AdjudicationVerdict:
        node.status = NodeStatus.RUNNING
        node.started_at = datetime.now(UTC).isoformat()
        start_time = time.time()

        node.thought_trace.append(
            "Synthesizing multi-agent outputs for final adjudication verdict..."
        )

        primary_reasons: list[str] = []
        required_actions: list[str] = []
        decision: AdjudicationDecision
        stp_eligible: bool = False
        confidence: float = 0.95

        # 1. Check for Outright Exclusion / Denial
        if policy_res.coverage_status == "EXCLUDED":
            decision = AdjudicationDecision.RECOMMEND_DENIAL
            confidence = 0.92
            primary_reasons.append(
                "Loss event is explicitly excluded under active policy clauses."
            )
            primary_reasons.extend(policy_res.detected_exclusions)
            required_actions.append(
                "Confirm policy exclusion grounds with senior adjuster."
            )
            required_actions.append("Issue formal Notice of Declination to claimant.")
            summary = f"Claim recommended for DENIAL due to policy exclusion: {'; '.join(policy_res.detected_exclusions)}."

        # 2. Check for High Fraud / SIU Escalation
        elif fraud_res.overall_fraud_score > 40.0 or fraud_res.requires_siu_referral:
            decision = AdjudicationDecision.ESCALATE_TO_ADJUSTER
            confidence = 0.89
            primary_reasons.append(
                f"Elevated fraud anomaly score ({fraud_res.overall_fraud_score}/100)."
            )
            primary_reasons.extend([s.title for s in fraud_res.signals])
            required_actions.append(
                "Refer file to Special Investigation Unit (SIU) for physical inspection."
            )
            required_actions.append("Verify document timestamps with external records.")
            summary = f"ESCALATED to Adjuster & SIU: {len(fraud_res.signals)} fraud/metadata anomalies detected."

        # 3. Check for Straight-Through Processing (STP) Eligibility
        elif (
            payout_res.net_recommended_payout <= settings.STP_MAX_CLAIM_AMOUNT
            and fraud_res.overall_fraud_score <= settings.STP_MAX_FRAUD_SCORE
            and policy_res.coverage_status == "FULLY_COVERED"
        ):
            decision = AdjudicationDecision.AUTO_APPROVE
            stp_eligible = True
            confidence = 0.98
            primary_reasons.append(
                "Low-complexity routine claim with full policy coverage."
            )
            primary_reasons.append(
                f"Claim amount (${payout_res.net_recommended_payout:,.2f}) within STP threshold (<=${settings.STP_MAX_CLAIM_AMOUNT:,.2f})."
            )
            primary_reasons.append(
                f"Zero critical fraud flags (Risk Score: {fraud_res.overall_fraud_score}/100)."
            )
            summary = f"STRAIGHT-THROUGH PROCESSING: Automatically approved for immediate payment of ${payout_res.net_recommended_payout:,.2f}."

        # 4. Standard Escalation for High-Value or Partial Coverage
        else:
            decision = AdjudicationDecision.ESCALATE_TO_ADJUSTER
            confidence = 0.91
            if payout_res.net_recommended_payout > settings.STP_MAX_CLAIM_AMOUNT:
                primary_reasons.append(
                    f"Net payout (${payout_res.net_recommended_payout:,.2f}) exceeds autonomous STP authorization threshold (${settings.STP_MAX_CLAIM_AMOUNT:,.2f})."
                )
            if policy_res.coverage_status == "PARTIALLY_COVERED":
                primary_reasons.append(
                    "Claim contains partially covered or sub-limited line items requiring adjuster discretion."
                )
            required_actions.append(
                "Review itemized line adjustments and confirm co-insurance calculation."
            )
            required_actions.append("Authorize electronic settlement disbursement.")
            summary = f"Routed to Human Adjuster Review: Payout of ${payout_res.net_recommended_payout:,.2f} requires human sign-off."

        node.thought_trace.append(
            f"Adjudication decision established: {decision.value} (STP: {stp_eligible}, Confidence: {confidence * 100:.0f}%)."
        )

        # Generate letter drafts
        settlement_draft = LetterGenerator.generate_settlement_letter(
            claim, payout_res, None
        )
        denial_draft = LetterGenerator.generate_denial_letter(
            claim, policy_res, fraud_res
        )
        rfi_draft = LetterGenerator.generate_rfi_letter(
            claim,
            [
                "Provide original high-resolution photos with unmodified EXIF metadata.",
                "Furnish itemized diagnostic breakdown from the attending physician/technician.",
            ],
        )

        verdict = AdjudicationVerdict(
            decision=decision,
            confidence_score=confidence,
            stp_eligible=stp_eligible,
            executive_summary=summary,
            primary_reasons=primary_reasons,
            required_human_actions=required_actions,
            policy_validation=policy_res,
            fraud_assessment=fraud_res,
            financial_payout=payout_res,
            settlement_letter_draft=settlement_draft,
            denial_letter_draft=denial_draft,
            rfi_letter_draft=rfi_draft,
        )

        node.step_traces.append(
            AgentStepTrace(
                timestamp=datetime.now(UTC).isoformat(),
                action="Adjudication_Verdict_Compiled",
                detail=f"Decision: {decision.value}, STP: {stp_eligible}, Net: ${payout_res.net_recommended_payout:,.2f}",
                data_snapshot={"verdict": decision.value, "confidence": confidence},
            )
        )

        node.status = NodeStatus.COMPLETED
        node.completed_at = datetime.now(UTC).isoformat()
        node.duration_ms = round((time.time() - start_time) * 1000, 2)
        node.output_summary = summary

        return verdict
