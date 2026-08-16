from app.models.claim_schemas import (
    BoundingBoxEntity,
    Claim,
    ClaimLineItem,
    ClaimStatus,
    DocumentType,
    EvidenceDocument,
    InsuranceLine,
    PolicyInfo,
)
from app.rag.policy_store import policy_store


def get_preloaded_claims() -> list[Claim]:
    """Provides rich multi-line realistic claims for Auto, Property, and Health scenarios."""

    # -------------------------------------------------------------
    # CLAIM 1: Clean Auto Collision (Straight-Through Processing STP)
    # -------------------------------------------------------------
    auto_policy_dict = policy_store.get_policy("POL-AUTO-GOLD-001") or {}
    auto_policy = PolicyInfo(
        policy_number=auto_policy_dict.get("policy_number", "POL-AUTO-GOLD-001"),
        holder_name="David Martinez",
        effective_date="2026-01-01",
        expiration_date="2027-01-01",
        coverage_type="Gold Comprehensive & Collision",
        coverage_limit=50000.0,
        deductible=500.0,
        co_insurance_percent=0.0,
    )

    claim_1_auto = Claim(
        id="clm-auto-001",
        claim_number="CLM-2026-AUTO-0811",
        policy_id="POL-AUTO-GOLD-001",
        claimant_name="David Martinez",
        claimant_id="USR-AUTO-9821",
        insurance_line=InsuranceLine.AUTO,
        incident_date="2026-08-10",
        submission_date="2026-08-11",
        incident_location="Austin, TX (Intersection of 5th & Lamar)",
        description="Low speed rear-end collision at red light. Rear bumper cover cracked, left parking ultrasonic sensor detached.",
        total_claimed_amount=1450.00,
        status=ClaimStatus.SUBMITTED,
        policy=auto_policy,
        documents=[
            EvidenceDocument(
                id="doc-auto-001-estimate",
                name="CaliberCollision_RepairEstimate_9921.pdf",
                doc_type=DocumentType.REPAIR_ESTIMATE,
                extracted_text="Caliber Collision Center #412\nDate of Estimate: 2026-08-11\nCustomer: David Martinez\nVehicle: 2024 Honda Accord EX\n\n1. OEM Rear Bumper Cover: $620.00\n2. Body Labor & Refinish: $480.00\n3. Ultrasonic Sensor Replacement: $220.00\n4. Diagnostic Scan: $130.00\nTotal Invoiced: $1,450.00",
                bounding_boxes=[
                    BoundingBoxEntity(
                        label="Total Invoiced",
                        text="$1,450.00",
                        confidence=0.99,
                        box_2d=[850, 680, 890, 920],
                    ),
                    BoundingBoxEntity(
                        label="Provider",
                        text="Caliber Collision Center #412",
                        confidence=0.96,
                        box_2d=[100, 150, 140, 520],
                    ),
                    BoundingBoxEntity(
                        label="Date",
                        text="2026-08-11",
                        confidence=0.97,
                        box_2d=[160, 200, 190, 380],
                    ),
                ],
                forensic_flags=[],
            ),
            EvidenceDocument(
                id="doc-auto-001-photo",
                name="RearBumper_DamagePhoto_1.jpg",
                doc_type=DocumentType.DAMAGE_PHOTO,
                extracted_text="Damage photo showing clean hairline fracture on left rear bumper fascia with detached black round proximity sensor.",
                bounding_boxes=[
                    BoundingBoxEntity(
                        label="Bumper Fracture",
                        text="Surface Crack",
                        confidence=0.94,
                        box_2d=[420, 350, 680, 720],
                    )
                ],
                exif_metadata={
                    "camera_make": "Apple",
                    "camera_model": "iPhone 15 Pro",
                    "datetime_original": "2026:08:10 17:42:19",
                    "software": "iOS 19.4",
                },
                forensic_flags=[],
            ),
        ],
        line_items=[
            ClaimLineItem(
                id="line-auto-1",
                description="OEM Rear Bumper Cover (Part #04715-TVA-A00ZZ)",
                category="PARTS",
                claimed_amount=620.00,
                allowed_amount=620.00,
                benchmark_amount=620.00,
                is_covered=True,
            ),
            ClaimLineItem(
                id="line-auto-2",
                description="Body Labor, Prep & Clear Coat Refinish (4.0 hrs @ $120/hr)",
                category="LABOR",
                claimed_amount=480.00,
                allowed_amount=480.00,
                benchmark_amount=480.00,
                is_covered=True,
            ),
            ClaimLineItem(
                id="line-auto-3",
                description="Ultrasonic Blind-Spot/Parking Assist Sensor Assembly",
                category="PARTS",
                claimed_amount=220.00,
                allowed_amount=220.00,
                benchmark_amount=220.00,
                is_covered=True,
            ),
            ClaimLineItem(
                id="line-auto-4",
                description="Pre- & Post-Repair ADAS Electronic Diagnostic Scan",
                category="DIAGNOSTIC",
                claimed_amount=130.00,
                allowed_amount=130.00,
                benchmark_amount=130.00,
                is_covered=True,
            ),
        ],
    )

    # -------------------------------------------------------------
    # CLAIM 2: Property Loss with Policy Exclusion & Fraud Anomaly (HO-3 Water/Seepage)
    # -------------------------------------------------------------
    prop_policy_dict = policy_store.get_policy("POL-PROP-HO3-002") or {}
    prop_policy = PolicyInfo(
        policy_number=prop_policy_dict.get("policy_number", "POL-PROP-HO3-002"),
        holder_name="Elena Vance",
        effective_date="2025-06-01",
        expiration_date="2026-06-01",
        coverage_type="HO-3 Homeowners Special Form",
        coverage_limit=350000.0,
        deductible=1500.0,
        co_insurance_percent=0.0,
    )

    claim_2_prop = Claim(
        id="clm-prop-002",
        claim_number="CLM-2026-PROP-4409",
        policy_id="POL-PROP-HO3-002",
        claimant_name="Elena Vance",
        claimant_id="USR-PROP-1102",
        insurance_line=InsuranceLine.PROPERTY,
        incident_date="2026-08-08",
        submission_date="2026-08-09",
        incident_location="Seattle, WA (1420 Pinecrest Terrace)",
        description="Persistent heavy rain soaked through slab foundation and caused groundwater seepage across finished basement floor. Sump pump did not run.",
        total_claimed_amount=8850.00,
        status=ClaimStatus.SUBMITTED,
        policy=prop_policy,
        documents=[
            EvidenceDocument(
                id="doc-prop-002-quote",
                name="Evergreen_DryRestoration_Quote.pdf",
                doc_type=DocumentType.CONTRACTOR_QUOTE,
                extracted_text="Evergreen Water & Mold Restoration LLC\nJob Location: 1420 Pinecrest Terrace\nFindings: Sub-slab hydrostatic pressure water ingress.\n1. Industrial Dehumidification (4 days): $2,400.00\n2. Drywall & Baseboard demo (2ft flood cut): $3,100.00\n3. Antimicrobial Sub-floor Treatment: $1,850.00\n4. Continuous Moisture Monitoring: $1,500.00\nTotal Proposed: $8,850.00",
                bounding_boxes=[
                    BoundingBoxEntity(
                        label="Total Proposal",
                        text="$8,850.00",
                        confidence=0.98,
                        box_2d=[820, 650, 870, 900],
                    )
                ],
                forensic_flags=[],
            ),
            EvidenceDocument(
                id="doc-prop-002-photo",
                name="Basement_Water_Damage.jpg",
                doc_type=DocumentType.DAMAGE_PHOTO,
                extracted_text="Photo of basement water line showing dark staining on concrete foundation footer.",
                bounding_boxes=[
                    BoundingBoxEntity(
                        label="Water Line",
                        text="Ground Efflorescence",
                        confidence=0.91,
                        box_2d=[300, 200, 700, 800],
                    )
                ],
                exif_metadata={
                    "camera_make": "Canon",
                    "camera_model": "EOS Rebel T7",
                    "datetime_original": "2026:07:15 09:12:40",
                    "software": "Adobe Photoshop 25.1 (Windows)",
                },
                forensic_flags=[
                    "EXIF Timestamp (2026:07:15) predates reported loss date (2026:08:08) by 24 days.",
                    "Metadata reveals image was modified using 'Adobe Photoshop 25.1'.",
                ],
            ),
        ],
        line_items=[
            ClaimLineItem(
                id="line-prop-1",
                description="Industrial Dehumidification & Air Movers (4 Units, 4 Days)",
                category="STRUCTURE",
                claimed_amount=2400.00,
                allowed_amount=0.00,
                benchmark_amount=1600.00,
                is_covered=False,
                exclusion_reason="Excluded under Section I Exclusion 3.a (Ground Water Seepage)",
            ),
            ClaimLineItem(
                id="line-prop-2",
                description="Drywall, Baseboard & Insulation 2ft Flood Cut Removal",
                category="STRUCTURE",
                claimed_amount=3100.00,
                allowed_amount=0.00,
                benchmark_amount=2200.00,
                is_covered=False,
                exclusion_reason="Excluded under Section I Exclusion 3.a (Ground Water Seepage)",
            ),
            ClaimLineItem(
                id="line-prop-3",
                description="Antimicrobial Sub-floor & Foundation Wall Wash",
                category="STRUCTURE",
                claimed_amount=1850.00,
                allowed_amount=0.00,
                benchmark_amount=1200.00,
                is_covered=False,
                exclusion_reason="Excluded under Section I Exclusion 3.a (Ground Water Seepage)",
            ),
            ClaimLineItem(
                id="line-prop-4",
                description="Continuous Thermal & Psychrometric Moisture Monitoring",
                category="STRUCTURE",
                claimed_amount=1500.00,
                allowed_amount=0.00,
                benchmark_amount=600.00,
                is_covered=False,
                exclusion_reason="Excluded under Section I Exclusion 3.a (Ground Water Seepage)",
            ),
        ],
    )

    # -------------------------------------------------------------
    # CLAIM 3: Health Insurance Emergency ER & CPT Code Audit
    # -------------------------------------------------------------
    hlth_policy_dict = policy_store.get_policy("POL-HLTH-PPO-003") or {}
    hlth_policy = PolicyInfo(
        policy_number=hlth_policy_dict.get("policy_number", "POL-HLTH-PPO-003"),
        holder_name="Marcus Aurelius Vance",
        effective_date="2026-01-01",
        expiration_date="2026-12-31",
        coverage_type="Comprehensive Health PPO Choice",
        coverage_limit=1000000.0,
        deductible=1000.0,
        co_insurance_percent=20.0,
    )

    claim_3_health = Claim(
        id="clm-hlth-003",
        claim_number="CLM-2026-HLTH-7731",
        policy_id="POL-HLTH-PPO-003",
        claimant_name="Marcus Vance",
        claimant_id="USR-HLTH-3392",
        insurance_line=InsuranceLine.HEALTH,
        incident_date="2026-08-04",
        submission_date="2026-08-06",
        incident_location="Denver, CO (Presbyterian/St. Luke's Hospital)",
        description="Emergency room admission following acute chest pain and shortness of breath. Coronary CTA and comprehensive blood panel performed.",
        total_claimed_amount=4750.00,
        status=ClaimStatus.SUBMITTED,
        policy=hlth_policy,
        documents=[
            EvidenceDocument(
                id="doc-hlth-003-bill",
                name="Hospital_Itemized_UB04_Claim.pdf",
                doc_type=DocumentType.HOSPITAL_BILL,
                extracted_text="Presbyterian Hospital Center\nPatient: Marcus Vance\nCPT 99285 (ER High Severity): $1,850.00\nCPT 71275 (Coronary CTA with Contrast): $1,900.00\nCPT 80053 (Comprehensive Metabolic Panel): $400.00\nCPT 93000 (12-Lead Electrocardiogram ECG): $350.00\nAdministrative Facility Handling Fee: $250.00\nTotal: $4,750.00",
                bounding_boxes=[
                    BoundingBoxEntity(
                        label="Billed Charges",
                        text="$4,750.00",
                        confidence=0.99,
                        box_2d=[880, 690, 920, 930],
                    )
                ],
                forensic_flags=[],
            )
        ],
        line_items=[
            ClaimLineItem(
                id="line-hlth-1",
                item_code="CPT-99285",
                description="Emergency Department Visit, High Severity / Threat to Life",
                category="FACILITY",
                claimed_amount=1850.00,
                allowed_amount=1400.00,
                benchmark_amount=1400.00,
                is_covered=True,
                inflation_flag=True,
                inflation_variance_percent=32.1,
            ),
            ClaimLineItem(
                id="line-hlth-2",
                item_code="CPT-71275",
                description="Computed Tomographic Angiography (Coronary CTA with Contrast)",
                category="RADIOLOGY",
                claimed_amount=1900.00,
                allowed_amount=1550.00,
                benchmark_amount=1550.00,
                is_covered=True,
                inflation_flag=True,
                inflation_variance_percent=22.6,
            ),
            ClaimLineItem(
                id="line-hlth-3",
                item_code="CPT-80053",
                description="Comprehensive Metabolic Panel (CMP Blood Chemistry)",
                category="LABORATORY",
                claimed_amount=400.00,
                allowed_amount=180.00,
                benchmark_amount=180.00,
                is_covered=True,
                inflation_flag=True,
                inflation_variance_percent=122.2,
            ),
            ClaimLineItem(
                id="line-hlth-4",
                item_code="CPT-93000",
                description="12-Lead Electrocardiogram (ECG) with Physician Interpretation",
                category="CARDIOLOGY",
                claimed_amount=350.00,
                allowed_amount=220.00,
                benchmark_amount=220.00,
                is_covered=True,
            ),
            ClaimLineItem(
                id="line-hlth-5",
                item_code="MISC-UNBUNDLED",
                description="Unbundled Miscellaneous Administrative Facility Fee",
                category="OTHER",
                claimed_amount=250.00,
                allowed_amount=0.00,
                benchmark_amount=0.00,
                is_covered=False,
                exclusion_reason="Unbundled administrative charge disallowed under In-Network PPO agreement",
            ),
        ],
    )

    # -------------------------------------------------------------
    # CLAIM 4: Fast Auto Glass Repair (Clear STP Auto Approval)
    # -------------------------------------------------------------
    claim_4_glass = Claim(
        id="clm-auto-004",
        claim_number="CLM-2026-AUTO-9102",
        policy_id="POL-AUTO-GOLD-001",
        claimant_name="Chloe Bennett",
        claimant_id="USR-AUTO-5541",
        insurance_line=InsuranceLine.AUTO,
        incident_date="2026-08-12",
        submission_date="2026-08-13",
        incident_location="Dallas, TX (Highway 75 North)",
        description="Gravel kicked up by dump truck cracked windshield. Safelite OEM replacement with camera calibration.",
        total_claimed_amount=680.00,
        status=ClaimStatus.SUBMITTED,
        policy=auto_policy,
        documents=[
            EvidenceDocument(
                id="doc-glass-004",
                name="Safelite_Glass_Invoice_8831.pdf",
                doc_type=DocumentType.REPAIR_ESTIMATE,
                extracted_text="Safelite AutoGlass #991\nWindshield Replacement OEM: $480.00\nRecalibration: $200.00\nTotal: $680.00",
                bounding_boxes=[
                    BoundingBoxEntity(
                        label="Total Invoiced",
                        text="$680.00",
                        confidence=0.99,
                        box_2d=[800, 700, 840, 910],
                    )
                ],
                forensic_flags=[],
            )
        ],
        line_items=[
            ClaimLineItem(
                id="line-glass-1",
                description="OEM Acoustic Windshield Glass Replacement",
                category="PARTS",
                claimed_amount=480.00,
                allowed_amount=480.00,
                benchmark_amount=480.00,
                is_covered=True,
            ),
            ClaimLineItem(
                id="line-glass-2",
                description="Forward-Facing Camera ADAS Recalibration",
                category="DIAGNOSTIC",
                claimed_amount=200.00,
                allowed_amount=200.00,
                benchmark_amount=200.00,
                is_covered=True,
            ),
        ],
    )

    return [claim_1_auto, claim_2_prop, claim_3_health, claim_4_glass]
