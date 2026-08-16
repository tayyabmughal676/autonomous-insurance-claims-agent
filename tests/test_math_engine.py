from app.agents.math_engine import DeterministicMathEngine
from app.models.claim_schemas import Claim, ClaimLineItem, InsuranceLine, PolicyInfo


def test_clean_auto_math_calculation():
    """Test clean auto claim math: Claimed $1,450, Deductible $500, Co-insurance 0% -> Payout $950."""
    policy = PolicyInfo(
        policy_number="POL-AUTO-TEST",
        holder_name="Test User",
        effective_date="2026-01-01",
        expiration_date="2027-01-01",
        coverage_type="Collision",
        coverage_limit=50000.0,
        deductible=500.0,
        co_insurance_percent=0.0
    )

    claim = Claim(
        id="test-auto-1",
        claim_number="CLM-TEST-001",
        policy_id="POL-AUTO-TEST",
        claimant_name="Test User",
        claimant_id="USR-001",
        insurance_line=InsuranceLine.AUTO,
        incident_date="2026-08-01",
        submission_date="2026-08-02",
        description="Rear bumper damage",
        total_claimed_amount=1450.0,
        policy=policy,
        line_items=[
            ClaimLineItem(
                id="item-1",
                description="Bumper Cover",
                category="PARTS",
                claimed_amount=620.0,
                allowed_amount=620.0,
                benchmark_amount=620.0,
                is_covered=True
            ),
            ClaimLineItem(
                id="item-2",
                description="Labor Refinish",
                category="LABOR",
                claimed_amount=480.0,
                allowed_amount=480.0,
                benchmark_amount=480.0,
                is_covered=True
            ),
            ClaimLineItem(
                id="item-3",
                description="Sensor",
                category="PARTS",
                claimed_amount=220.0,
                allowed_amount=220.0,
                benchmark_amount=220.0,
                is_covered=True
            ),
            ClaimLineItem(
                id="item-4",
                description="Scan",
                category="DIAGNOSTIC",
                claimed_amount=130.0,
                allowed_amount=130.0,
                benchmark_amount=130.0,
                is_covered=True
            )
        ]
    )

    payout = DeterministicMathEngine.calculate_payout(claim)

    assert payout.total_claimed == 1450.0
    assert payout.total_allowed_gross == 1450.0
    assert payout.applied_deductible == 500.0
    assert payout.applied_coinsurance == 0.0
    assert payout.net_recommended_payout == 950.0
    assert len(payout.math_audit_trail) >= 3


def test_health_coinsurance_and_inflation_adjustment():
    """Test health claim with fee schedule benchmark capping and 20% co-insurance."""
    policy = PolicyInfo(
        policy_number="POL-HLTH-TEST",
        holder_name="Health User",
        effective_date="2026-01-01",
        expiration_date="2026-12-31",
        coverage_type="Health PPO",
        coverage_limit=100000.0,
        deductible=1000.0,
        co_insurance_percent=20.0
    )

    claim = Claim(
        id="test-hlth-1",
        claim_number="CLM-TEST-002",
        policy_id="POL-HLTH-TEST",
        claimant_name="Health User",
        claimant_id="USR-002",
        insurance_line=InsuranceLine.HEALTH,
        incident_date="2026-08-01",
        submission_date="2026-08-02",
        description="Emergency Visit",
        total_claimed_amount=4750.0,
        policy=policy,
        line_items=[
            ClaimLineItem(
                id="item-1",
                description="ER Visit",
                category="FACILITY",
                claimed_amount=1850.0,
                allowed_amount=1400.0,
                benchmark_amount=1400.0,  # $450 excess capped
                is_covered=True
            ),
            ClaimLineItem(
                id="item-2",
                description="CTA Scan",
                category="RADIOLOGY",
                claimed_amount=1900.0,
                allowed_amount=1550.0,
                benchmark_amount=1550.0,  # $350 excess capped
                is_covered=True
            ),
            ClaimLineItem(
                id="item-3",
                description="Unbundled Admin Fee",
                category="OTHER",
                claimed_amount=250.0,
                allowed_amount=0.0,
                is_covered=False,
                exclusion_reason="Unbundled fee disallowed"
            )
        ]
    )

    payout = DeterministicMathEngine.calculate_payout(claim)

    # Gross allowed = 1400 + 1550 = 2950
    # Disallowed = 450 (excess 1) + 350 (excess 2) + 250 (unbundled) = 1050
    assert payout.total_allowed_gross == 2950.0
    assert payout.total_excluded_amount == 1050.0
    assert payout.applied_deductible == 1000.0

    # After deductible = 1950.0
    # Coinsurance 20% = 390.0
    # Net payout = 1950 - 390 = 1560.0
    assert payout.applied_coinsurance == 390.0
    assert payout.net_recommended_payout == 1560.0
