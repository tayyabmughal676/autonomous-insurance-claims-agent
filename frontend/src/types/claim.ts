export type InsuranceLine = "AUTO" | "PROPERTY" | "HEALTH";

export type ClaimStatus =
  | "SUBMITTED"
  | "ANALYZING"
  | "AUTO_APPROVED"
  | "IN_REVIEW"
  | "APPROVED"
  | "DENIED"
  | "INFO_REQUESTED";

export type DocumentType =
  | "REPAIR_ESTIMATE"
  | "POLICE_REPORT"
  | "DAMAGE_PHOTO"
  | "HOSPITAL_BILL"
  | "PHYSICIAN_NOTES"
  | "CONTRACTOR_QUOTE"
  | "INCIDENT_STATEMENT"
  | "RECEIPT"
  | "OTHER";

export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type AdjudicationDecision =
  | "AUTO_APPROVE"
  | "ESCALATE_TO_ADJUSTER"
  | "RECOMMEND_DENIAL"
  | "REQUEST_INFO";

export type NodeStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "SKIPPED";

export interface BoundingBoxEntity {
  label: string;
  text: string;
  confidence: number;
  box_2d?: [number, number, number, number]; // ymin, xmin, ymax, xmax
}

export interface EvidenceDocument {
  id: string;
  name: string;
  doc_type: DocumentType;
  file_url?: string;
  file_content_base64?: string;
  mime_type?: string;
  extracted_text?: string;
  extracted_entities?: Record<string, string | number | boolean | null | undefined>;
  bounding_boxes: BoundingBoxEntity[];
  exif_metadata?: Record<string, string | number | boolean | null | undefined>;
  forensic_flags: string[];
}

export interface ClaimLineItem {
  id: string;
  item_code?: string;
  description: string;
  category: string;
  claimed_amount: number;
  allowed_amount: number;
  is_covered: boolean;
  exclusion_reason?: string;
  benchmark_amount?: number;
  inflation_flag?: boolean;
  inflation_variance_percent?: number;
}

export interface PolicyInfo {
  policy_id: string;
  policy_number: string;
  holder_name: string;
  holder_id: string;
  insurance_line: InsuranceLine;
  coverage_type: string;
  effective_date: string;
  expiration_date: string;
  is_active: boolean;
  coverage_limit: number;
  deductible: number;
  co_pay_percent: number;
  co_insurance_percent: number;
  out_of_pocket_max?: number;
  applicable_perils?: string[];
  specific_exclusions?: string[];
  notes?: string;
}

export interface Claim {
  id: string;
  claim_number: string;
  policy_id: string;
  claimant_name: string;
  claimant_id: string;
  insurance_line: InsuranceLine;
  incident_date: string;
  submission_date: string;
  incident_location?: string;
  description: string;
  total_claimed_amount: number;
  status: ClaimStatus;
  policy?: PolicyInfo;
  documents: EvidenceDocument[];
  line_items: ClaimLineItem[];
  created_at?: string;
  updated_at?: string;
}

export interface FraudSignal {
  id: string;
  code: string;
  severity: Severity;
  title: string;
  description: string;
  confidence: number;
  evidence_source?: string;
}

export interface FraudAssessment {
  overall_fraud_score: number;
  risk_level: Severity;
  signals: FraudSignal[];
  summary: string;
  requires_siu_referral: boolean;
}

export interface PolicyClauseMatch {
  clause_id: string;
  section_title: string;
  section_number: string;
  content: string;
  relevance_score: number;
  is_exclusion: boolean;
}

export interface PolicyValidationResult {
  is_covered: boolean;
  coverage_status: string;
  matched_peril?: string;
  matched_clauses: PolicyClauseMatch[];
  detected_exclusions: string[];
  policy_limit: number;
  applicable_deductible: number;
  co_pay_or_coinsurance_rate: number;
  validation_notes: string;
}

export interface PayoutLineAdjustment {
  line_item_id: string;
  description: string;
  claimed_amount: number;
  benchmark_amount?: number;
  adjusted_allowed_amount: number;
  deduction_reason?: string;
}

export interface FinancialPayout {
  total_claimed: number;
  total_allowed_gross: number;
  total_excluded_amount: number;
  applied_deductible: number;
  applied_coinsurance: number;
  applied_depreciation: number;
  net_recommended_payout: number;
  line_adjustments: PayoutLineAdjustment[];
  math_audit_trail: string[];
}

export interface AdjudicationVerdict {
  decision: AdjudicationDecision;
  confidence_score: number;
  stp_eligible: boolean;
  executive_summary: string;
  primary_reasons: string[];
  required_human_actions: string[];
  policy_validation?: PolicyValidationResult;
  fraud_assessment?: FraudAssessment;
  financial_payout?: FinancialPayout;
  settlement_letter_draft?: string;
  denial_letter_draft?: string;
  rfi_letter_draft?: string;
}

export interface AgentStepTrace {
  timestamp: string;
  action: string;
  detail: string;
  data_snapshot?: Record<string, unknown>;
}

export interface AgentExecutionNode {
  node_id: string;
  agent_name: string;
  description: string;
  status: NodeStatus;
  started_at?: string;
  completed_at?: string;
  duration_ms?: number;
  thought_trace: string[];
  step_traces: AgentStepTrace[];
  output_summary?: string;
  error?: string;
}

export interface ClaimProcessingState {
  claim_id: string;
  claim: Claim;
  nodes: AgentExecutionNode[];
  policy_result?: PolicyValidationResult;
  fraud_result?: FraudAssessment;
  payout_result?: FinancialPayout;
  verdict?: AdjudicationVerdict;
  current_node?: string;
  is_completed: boolean;
  errors: string[];
}

export interface AppSettings {
  openrouter_base_url: string;
  has_openrouter_key: boolean;
  openrouter_api_key?: string;
  vision_model: string;
  reasoning_model: string;
  orchestration_engine?: "native" | "langgraph";
  stp_max_amount: number;
  stp_max_fraud_score: number;
  stp_min_confidence: number;
}
