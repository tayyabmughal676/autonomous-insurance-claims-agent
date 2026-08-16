from enum import Enum
from typing import Any, List, Optional

from pydantic import BaseModel, Field


class InsuranceLine(str, Enum):
    AUTO = "AUTO"
    PROPERTY = "PROPERTY"
    HEALTH = "HEALTH"


class ClaimStatus(str, Enum):
    SUBMITTED = "SUBMITTED"
    ANALYZING = "ANALYZING"
    AUTO_APPROVED = "AUTO_APPROVED"
    IN_REVIEW = "IN_REVIEW"
    APPROVED = "APPROVED"
    DENIED = "DENIED"
    INFO_REQUESTED = "INFO_REQUESTED"


class DocumentType(str, Enum):
    REPAIR_ESTIMATE = "REPAIR_ESTIMATE"
    POLICE_REPORT = "POLICE_REPORT"
    DAMAGE_PHOTO = "DAMAGE_PHOTO"
    HOSPITAL_BILL = "HOSPITAL_BILL"
    PHYSICIAN_NOTES = "PHYSICIAN_NOTES"
    CONTRACTOR_QUOTE = "CONTRACTOR_QUOTE"
    INCIDENT_STATEMENT = "INCIDENT_STATEMENT"
    RECEIPT = "RECEIPT"
    OTHER = "OTHER"


class BoundingBoxEntity(BaseModel):
    label: str
    text: str
    confidence: float
    box_2d: Optional[List[float]] = None  # [ymin, xmin, ymax, xmax] in normalized 0-1000 or percentage


class EvidenceDocument(BaseModel):
    id: str
    name: str
    doc_type: DocumentType
    file_url: Optional[str] = None
    file_content_base64: Optional[str] = None
    mime_type: str = "application/pdf"
    extracted_text: Optional[str] = None
    extracted_entities: dict[str, Any] = Field(default_factory=dict)
    bounding_boxes: List[BoundingBoxEntity] = Field(default_factory=list)
    exif_metadata: dict[str, Any] = Field(default_factory=dict)
    forensic_flags: List[str] = Field(default_factory=list)


class ClaimLineItem(BaseModel):
    id: str
    item_code: Optional[str] = None  # e.g. CPT code, labor code, part SKU
    description: str
    category: str  # PARTS, LABOR, FACILITY, MEDICATION, STRUCTURE, CONTENT
    claimed_amount: float
    allowed_amount: float
    is_covered: bool = True
    exclusion_reason: Optional[str] = None
    benchmark_amount: Optional[float] = None
    inflation_flag: bool = False
    inflation_variance_percent: Optional[float] = None


class PolicyInfo(BaseModel):
    policy_id: Optional[str] = None
    policy_number: str
    holder_name: str
    holder_id: Optional[str] = "USR-DEFAULT"
    insurance_line: Optional[InsuranceLine] = InsuranceLine.AUTO
    coverage_type: str  # Comprehensive Collision, HO-3 Homeowner, Comprehensive PPO
    effective_date: str
    expiration_date: str
    is_active: bool = True
    coverage_limit: float = 50000.0
    deductible: float = 500.0
    co_pay_percent: float = 0.0
    co_insurance_percent: float = 0.0
    out_of_pocket_max: Optional[float] = None
    applicable_perils: List[str] = Field(default_factory=list)
    specific_exclusions: List[str] = Field(default_factory=list)
    notes: Optional[str] = None


class Claim(BaseModel):
    id: str
    claim_number: str
    policy_id: str
    claimant_name: str
    claimant_id: str
    insurance_line: InsuranceLine
    incident_date: str
    submission_date: str
    incident_location: Optional[str] = None
    description: str
    total_claimed_amount: float
    status: ClaimStatus = ClaimStatus.SUBMITTED
    policy: Optional[PolicyInfo] = None
    documents: List[EvidenceDocument] = Field(default_factory=list)
    line_items: List[ClaimLineItem] = Field(default_factory=list)
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
