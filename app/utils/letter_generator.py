from datetime import UTC, datetime

from app.models.claim_schemas import Claim
from app.models.verdict_schemas import (
    AdjudicationVerdict,
    FinancialPayout,
    FraudAssessment,
    PolicyValidationResult,
)


class LetterGenerator:
    """Generates formal insurance letters (Settlement, Denial, RFI) with exact policy citations."""

    @staticmethod
    def generate_settlement_letter(
        claim: Claim,
        payout: FinancialPayout,
        verdict: AdjudicationVerdict | None = None,
        adjuster_notes: str | None = None,
    ) -> str:
        date_str = datetime.now(UTC).strftime("%B %d, %Y")
        policy = claim.policy
        policy_num = policy.policy_number if policy else "POL-ACTIVE"

        breakdown_rows = []
        for adj in payout.line_adjustments:
            status_text = f"Allowed: ${adj.adjusted_allowed_amount:,.2f}"
            if adj.deduction_reason:
                status_text += f" ({adj.deduction_reason})"
            breakdown_rows.append(
                f"- **{adj.description}**: Claimed ${adj.claimed_amount:,.2f} -> {status_text}"
            )

        breakdown_text = "\n".join(breakdown_rows)

        letter = f"""# STATEMENT OF CLAIM SETTLEMENT & EXPLANATION OF BENEFITS

**Date:** {date_str}
**Claim Number:** {claim.claim_number}
**Policy Number:** {policy_num}
**Claimant:** {claim.claimant_name} (ID: {claim.claimant_id})
**Line of Coverage:** {claim.insurance_line.value if hasattr(claim.insurance_line, "value") else claim.insurance_line}
**Incident Date:** {claim.incident_date}

---

Dear {claim.claimant_name},

We have completed the adjudication and verification of your insurance claim filed on **{claim.submission_date}** regarding the incident described as:
> *"{claim.description}"*

### 1. Itemized Adjudication Summary
{breakdown_text}

### 2. Financial Settlement Calculation
- **Total Gross Claimed Amount:** ${payout.total_claimed:,.2f}
- **Disallowed / Excluded Items:** -${payout.total_excluded_amount:,.2f}
- **Gross Allowed Amount:** ${payout.total_allowed_gross:,.2f}
- **Applicable Policy Deductible:** -${payout.applied_deductible:,.2f}
- **Co-Insurance / Cost-Sharing:** -${payout.applied_coinsurance:,.2f}
- **Depreciation Applied:** -${payout.applied_depreciation:,.2f}
- **NET APPROVED SETTLEMENT PAYOUT:** **${payout.net_recommended_payout:,.2f}**

### 3. Payment Processing
A direct electronic fund transfer or check for **${payout.net_recommended_payout:,.2f}** will be disbursed to your account within 2-3 business days.

{f"### 4. Adjuster Remarks\n{adjuster_notes}" if adjuster_notes else ""}

Sincerely,
**Autonomous Claims Adjudication Division**
*Data Daur Assurance Underwriters*
"""
        return letter

    @staticmethod
    def generate_denial_letter(
        claim: Claim,
        policy_res: PolicyValidationResult | None = None,
        fraud_res: FraudAssessment | None = None,
        reason_notes: str | None = None,
    ) -> str:
        date_str = datetime.now(UTC).strftime("%B %d, %Y")
        policy = claim.policy
        policy_num = policy.policy_number if policy else "POL-ACTIVE"

        clauses_text = ""
        if policy_res and policy_res.matched_clauses:
            clauses_text = "\n".join(
                [
                    f'- **Section {c.section_number} ({c.section_title})**: *"{c.content}"*'
                    for c in policy_res.matched_clauses
                    if c.is_exclusion
                ]
            )

        letter = f"""# FORMAL NOTICE OF CLAIM DECLINATION

**Date:** {date_str}
**Claim Number:** {claim.claim_number}
**Policy Number:** {policy_num}
**Insured:** {claim.claimant_name}
**Date of Incident:** {claim.incident_date}

---

Dear {claim.claimant_name},

We have completed the formal review and evaluation of your claim submitted on **{claim.submission_date}** for total requested indemnification of **${claim.total_claimed_amount:,.2f}**.

### Reason for Declination
After thorough investigation and document verification, we regret to inform you that the reported loss is not covered under the terms and conditions of your policy.

**Primary Grounds for Denial:**
{clauses_text if clauses_text else "- The loss event does not fall within the enumerated perils covered by the active policy schedule."}
{f"- **Specific Findings:** {reason_notes}" if reason_notes else ""}

### Right to Appeal
If you have additional documentation, evidence, or dispute this determination, you may file an appeal within thirty (30) days by submitting supplementary records to `claims-appeals@datadaur.com`.

Sincerely,
**Claims Review & Special Adjudication Board**
*Data Daur Assurance Underwriters*
"""
        return letter

    @staticmethod
    def generate_rfi_letter(claim: Claim, questions: list[str]) -> str:
        date_str = datetime.now(UTC).strftime("%B %d, %Y")
        questions_text = "\n".join(
            [f"{idx + 1}. {q}" for idx, q in enumerate(questions)]
        )

        letter = f"""# REQUEST FOR ADDITIONAL INFORMATION (RFI)

**Date:** {date_str}
**Claim Number:** {claim.claim_number}
**Insured:** {claim.claimant_name}

---

Dear {claim.claimant_name},

In order to proceed with the adjudication of your claim **{claim.claim_number}**, our claims processing department requires clarification and supplementary documentation regarding the following items:

{questions_text}

Please provide the requested records within fifteen (15) calendar days to prevent delays in the processing of your settlement.

Sincerely,
**Claims Examination Unit**
"""
        return letter
