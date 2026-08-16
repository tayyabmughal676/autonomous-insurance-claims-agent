import logging
import time
import uuid
from datetime import UTC, datetime

from app.models.claim_schemas import Claim
from app.models.state_schemas import AgentExecutionNode, AgentStepTrace, NodeStatus
from app.models.verdict_schemas import FraudAssessment, FraudSignal, Severity

logger = logging.getLogger(__name__)


class FraudForensicsAgent:
    """Multi-vector fraud detection, forensic analysis, billing anomaly scoring, and SIU triage."""

    @staticmethod
    async def process(claim: Claim, node: AgentExecutionNode) -> FraudAssessment:
        node.status = NodeStatus.RUNNING
        node.started_at = datetime.now(UTC).isoformat()
        start_time = time.time()

        signals: list[FraudSignal] = []
        accumulated_risk_score = 0.0

        node.thought_trace.append(
            f"Initiating multi-vector fraud & anomaly evaluation for claim {claim.claim_number}..."
        )

        # 1. Check EXIF & Forensic Metadata on Uploaded Documents
        for doc in claim.documents:
            if doc.forensic_flags:
                for flag in doc.forensic_flags:
                    sev = (
                        Severity.HIGH if "predates" in flag.lower() else Severity.MEDIUM
                    )
                    score_impact = 35.0 if sev == Severity.HIGH else 20.0
                    accumulated_risk_score += score_impact

                    sig = FraudSignal(
                        id=str(uuid.uuid4())[:8],
                        code="FRD-EXIF-001",
                        severity=sev,
                        title="Photographic Metadata / Timestamp Inconsistency",
                        description=flag,
                        confidence=0.92,
                        evidence_source=f"Forensic EXIF Parser ({doc.name})",
                    )
                    signals.append(sig)
                    node.thought_trace.append(f"FLAGGED: {sig.title} -> {flag}")

        # 2. Check Line-Item Inflation vs. Benchmark Rates
        inflated_items = [
            item
            for item in claim.line_items
            if item.inflation_flag
            or (
                item.benchmark_amount
                and item.claimed_amount > item.benchmark_amount * 1.3
            )
        ]
        if inflated_items:
            for item in inflated_items:
                variance = item.inflation_variance_percent or round(
                    (
                        (
                            item.claimed_amount
                            - (item.benchmark_amount or item.claimed_amount)
                        )
                        / (item.benchmark_amount or 1)
                    )
                    * 100,
                    1,
                )
                accumulated_risk_score += 15.0
                sig = FraudSignal(
                    id=str(uuid.uuid4())[:8],
                    code="FRD-INFL-002",
                    severity=Severity.MEDIUM,
                    title="Line-Item Price Inflation Anomaly",
                    description=f"Item '{item.description}' claimed at ${item.claimed_amount:,.2f} exceeds regional prevailing benchmark (${item.benchmark_amount:,.2f}) by {variance}%.",
                    confidence=0.88,
                    evidence_source="Regional Cost Fee Schedule Engine",
                )
                signals.append(sig)
                node.thought_trace.append(
                    f"FLAGGED: Line item inflation detected on '{item.description}' (+{variance}%)."
                )

        # 3. Cross-Document Narrative Consistency Check
        desc_lower = claim.description.lower()
        if "cash" in desc_lower and "no police report" in desc_lower:
            accumulated_risk_score += 20.0
            signals.append(
                FraudSignal(
                    id=str(uuid.uuid4())[:8],
                    code="FRD-NARR-003",
                    severity=Severity.MEDIUM,
                    title="Uncorroborated Cash Outlay Narrative",
                    description="Claimant reports high out-of-pocket cash payment without official incident report.",
                    confidence=0.75,
                    evidence_source="Narrative Consistency Engine",
                )
            )

        # 4. Final Risk Level Calibration
        fraud_score = min(100.0, round(accumulated_risk_score, 1))

        if fraud_score >= 60.0:
            risk_level = Severity.HIGH
            siu_referral = True
            summary = f"HIGH RISK (Score: {fraud_score}/100): Critical metadata discrepancies and pricing anomalies detected. Mandatory SIU investigation required."
        elif fraud_score >= 20.0:
            risk_level = Severity.MEDIUM
            siu_referral = False
            summary = f"MODERATE RISK (Score: {fraud_score}/100): Minor anomalies or benchmark variances detected. Adjuster manual review required."
        else:
            risk_level = Severity.LOW
            siu_referral = False
            summary = f"LOW RISK (Score: {fraud_score}/100): No significant fraud or metadata red flags identified. Clean verification."

        node.thought_trace.append(
            f"Fraud analysis finalized. Score: {fraud_score}/100, Level: {risk_level.value}."
        )

        for sig in signals:
            node.step_traces.append(
                AgentStepTrace(
                    timestamp=datetime.now(UTC).isoformat(),
                    action="Fraud_Signal_Logged",
                    detail=f"[{sig.severity.value}] {sig.title}: {sig.description}",
                    data_snapshot={"code": sig.code, "score_delta": sig.confidence},
                )
            )

        node.status = NodeStatus.COMPLETED
        node.completed_at = datetime.now(UTC).isoformat()
        node.duration_ms = round((time.time() - start_time) * 1000, 2)
        node.output_summary = f"Risk Score: {fraud_score}/100 ({risk_level.value}). Logged {len(signals)} signals."

        return FraudAssessment(
            overall_fraud_score=fraud_score,
            risk_level=risk_level,
            signals=signals,
            summary=summary,
            requires_siu_referral=siu_referral,
        )
