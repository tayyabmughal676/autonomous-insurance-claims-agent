from app.models.claim_schemas import Claim, ClaimLineItem
from app.models.verdict_schemas import (
    FinancialPayout,
    PayoutLineAdjustment,
    PolicyValidationResult,
)


class DeterministicMathEngine:
    """Zero-hallucination deterministic financial calculation engine for insurance claims."""

    @staticmethod
    def calculate_payout(
        claim: Claim,
        policy_result: PolicyValidationResult | None = None,
        custom_line_items: list[ClaimLineItem] | None = None,
    ) -> FinancialPayout:
        lines = custom_line_items if custom_line_items is not None else claim.line_items

        # Policy parameters
        policy = claim.policy
        policy_limit = (
            policy_result.policy_limit
            if policy_result
            else (policy.coverage_limit if policy else 50000.0)
        )
        deductible = (
            policy_result.applicable_deductible
            if policy_result
            else (policy.deductible if policy else 500.0)
        )
        coinsurance_rate = (
            policy_result.co_pay_or_coinsurance_rate
            if policy_result
            else (policy.co_insurance_percent if policy else 0.0)
        ) / 100.0

        total_claimed = 0.0
        total_allowed_gross = 0.0
        total_excluded_amount = 0.0
        applied_depreciation = 0.0

        adjustments: list[PayoutLineAdjustment] = []
        math_audit_trail: list[str] = []

        # 1. Process Line Items
        for item in lines:
            total_claimed += item.claimed_amount

            if not item.is_covered:
                total_excluded_amount += item.claimed_amount
                adjustments.append(
                    PayoutLineAdjustment(
                        line_item_id=item.id,
                        description=item.description,
                        claimed_amount=item.claimed_amount,
                        benchmark_amount=item.benchmark_amount,
                        adjusted_allowed_amount=0.0,
                        deduction_reason=item.exclusion_reason
                        or "Line item excluded by policy terms.",
                    )
                )
                math_audit_trail.append(
                    f"Line '{item.description}': Excluded entirely (${item.claimed_amount:.2f}) - Reason: {item.exclusion_reason or 'Excluded'}"
                )
            else:
                allowed = item.allowed_amount
                if (
                    item.benchmark_amount
                    and item.claimed_amount > item.benchmark_amount
                ):
                    excess = item.claimed_amount - item.benchmark_amount
                    allowed = item.benchmark_amount
                    total_excluded_amount += excess
                    adjustments.append(
                        PayoutLineAdjustment(
                            line_item_id=item.id,
                            description=item.description,
                            claimed_amount=item.claimed_amount,
                            benchmark_amount=item.benchmark_amount,
                            adjusted_allowed_amount=allowed,
                            deduction_reason=f"Adjusted to regional standard benchmark (Excess: ${excess:.2f})",
                        )
                    )
                    math_audit_trail.append(
                        f"Line '{item.description}': Adjusted from ${item.claimed_amount:.2f} to benchmark ${allowed:.2f}"
                    )
                else:
                    adjustments.append(
                        PayoutLineAdjustment(
                            line_item_id=item.id,
                            description=item.description,
                            claimed_amount=item.claimed_amount,
                            benchmark_amount=item.benchmark_amount,
                            adjusted_allowed_amount=allowed,
                            deduction_reason=None,
                        )
                    )

                total_allowed_gross += allowed

        math_audit_trail.append(
            f"Total Claimed: ${total_claimed:.2f} | Total Allowed Gross: ${total_allowed_gross:.2f} | Disallowed/Excluded: ${total_excluded_amount:.2f}"
        )

        # 2. Apply Deductible
        applied_deductible = min(deductible, total_allowed_gross)
        after_deductible = max(0.0, total_allowed_gross - applied_deductible)
        math_audit_trail.append(
            f"Applied Deductible: -${applied_deductible:.2f} (Base Policy Deductible: ${deductible:.2f}) -> Subtotal: ${after_deductible:.2f}"
        )

        # 3. Apply Co-insurance
        applied_coinsurance = round(after_deductible * coinsurance_rate, 2)
        after_coinsurance = max(0.0, after_deductible - applied_coinsurance)
        if applied_coinsurance > 0:
            math_audit_trail.append(
                f"Applied Co-Insurance ({coinsurance_rate * 100:.1f}%): -${applied_coinsurance:.2f} -> Subtotal: ${after_coinsurance:.2f}"
            )

        # 4. Cap at Policy Maximum
        capped_payout = min(after_coinsurance, policy_limit)
        if capped_payout < after_coinsurance:
            math_audit_trail.append(
                f"Payout capped at Policy Maximum Coverage Limit: ${policy_limit:.2f}"
            )

        net_payout = round(capped_payout, 2)
        math_audit_trail.append(f"Final Net Recommended Payout: ${net_payout:.2f}")

        return FinancialPayout(
            total_claimed=round(total_claimed, 2),
            total_allowed_gross=round(total_allowed_gross, 2),
            total_excluded_amount=round(total_excluded_amount, 2),
            applied_deductible=round(applied_deductible, 2),
            applied_coinsurance=round(applied_coinsurance, 2),
            applied_depreciation=round(applied_depreciation, 2),
            net_recommended_payout=net_payout,
            line_adjustments=adjustments,
            math_audit_trail=math_audit_trail,
        )
