from enum import Enum

from pydantic import BaseModel, Field


class Severity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class AdjudicationDecision(str, Enum):
    AUTO_APPROVE = "AUTO_APPROVE"
    ESCALATE_TO_ADJUSTER = "ESCALATE_TO_ADJUSTER"
    RECOMMEND_DENIAL = "RECOMMEND_DENIAL"
    REQUEST_INFO = "REQUEST_INFO"


class FraudSignal(BaseModel):
    id: str
    code: str
    severity: Severity
    title: str
    description: str
    confidence: float
    evidence_source: str | None = (
        None  # e.g., "EXIF Metadata", "Cross-Document Comparison"
    )


class FraudAssessment(BaseModel):
    overall_fraud_score: float  # 0 to 100
    risk_level: Severity
    signals: list[FraudSignal] = Field(default_factory=list)
    summary: str
    requires_siu_referral: bool = False  # Special Investigation Unit


class PolicyClauseMatch(BaseModel):
    clause_id: str
    section_title: str
    section_number: str
    content: str
    relevance_score: float
    is_exclusion: bool = False


class PolicyValidationResult(BaseModel):
    is_covered: bool
    coverage_status: str  # FULLY_COVERED, PARTIALLY_COVERED, EXCLUDED, UNCERTAIN
    matched_peril: str | None = None
    matched_clauses: list[PolicyClauseMatch] = Field(default_factory=list)
    detected_exclusions: list[str] = Field(default_factory=list)
    policy_limit: float
    applicable_deductible: float
    co_pay_or_coinsurance_rate: float
    validation_notes: str


class PayoutLineAdjustment(BaseModel):
    line_item_id: str
    description: str
    claimed_amount: float
    benchmark_amount: float | None = None
    adjusted_allowed_amount: float
    deduction_reason: str | None = None


class FinancialPayout(BaseModel):
    total_claimed: float
    total_allowed_gross: float
    total_excluded_amount: float
    applied_deductible: float
    applied_coinsurance: float
    applied_depreciation: float
    net_recommended_payout: float
    line_adjustments: list[PayoutLineAdjustment] = Field(default_factory=list)
    math_audit_trail: list[str] = Field(default_factory=list)


class AdjudicationVerdict(BaseModel):
    decision: AdjudicationDecision
    confidence_score: float  # 0.0 to 1.0
    stp_eligible: bool
    executive_summary: str
    primary_reasons: list[str] = Field(default_factory=list)
    required_human_actions: list[str] = Field(default_factory=list)
    policy_validation: PolicyValidationResult | None = None
    fraud_assessment: FraudAssessment | None = None
    financial_payout: FinancialPayout | None = None
    settlement_letter_draft: str | None = None
    denial_letter_draft: str | None = None
    rfi_letter_draft: str | None = None
