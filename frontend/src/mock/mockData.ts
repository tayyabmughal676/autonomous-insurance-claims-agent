import { Claim, AppSettings } from "../types/claim";

export const DEFAULT_SETTINGS: AppSettings = {
  openrouter_base_url: "https://openrouter.ai/api/v1",
  has_openrouter_key: false,
  openrouter_api_key: "",
  vision_model: "google/gemini-2.0-flash-exp:free",
  reasoning_model: "openai/gpt-oss-20b:free",
  orchestration_engine: "native",
  stp_max_amount: 2500,
  stp_max_fraud_score: 15,
  stp_min_confidence: 0.85
};

export const MOCK_CLAIMS: Claim[] = [
  {
    id: "clm-auto-001",
    claim_number: "CLM-2026-AUTO-0811",
    policy_id: "POL-AUTO-GOLD-001",
    claimant_name: "Marcus Vance",
    claimant_id: "USR-9921",
    insurance_line: "AUTO",
    incident_date: "2026-08-10",
    submission_date: "2026-08-11",
    incident_location: "Oakland, CA",
    description: "Vehicle was rear-ended at a red light. Rear bumper cover cracked and ultrasonic parking sensor displaced.",
    total_claimed_amount: 1450.00,
    status: "AUTO_APPROVED",
    policy: {
      policy_id: "POL-AUTO-GOLD-001",
      policy_number: "PA-884920-G",
      holder_name: "Marcus Vance",
      holder_id: "USR-9921",
      insurance_line: "AUTO",
      coverage_type: "Gold Comprehensive & Collision",
      effective_date: "2026-01-01",
      expiration_date: "2027-01-01",
      is_active: true,
      coverage_limit: 50000,
      deductible: 500,
      co_pay_percent: 0,
      co_insurance_percent: 0,
      applicable_perils: ["Collision with vehicle or object", "Comprehensive vandalism & glass"]
    },
    documents: [
      {
        id: "doc-auto-01",
        name: "DataDaur_BodyShop_RepairEstimate.pdf",
        doc_type: "REPAIR_ESTIMATE",
        extracted_text: "Data Daur Collision Center Repair Order #4910. Vehicle: 2024 Honda Civic. Rear Bumper replacement, sensor calibrate, refinish paint.",
        bounding_boxes: [
          { label: "Facility", text: "Data Daur Collision Center", confidence: 0.99, box_2d: [100, 100, 150, 400] },
          { label: "Total Estimate", text: "$1,450.00", confidence: 0.98, box_2d: [750, 600, 800, 850] }
        ],
        forensic_flags: []
      },
      {
        id: "doc-auto-02",
        name: "Police_Incident_Report_9910.pdf",
        doc_type: "POLICE_REPORT",
        extracted_text: "Oakland PD Incident #9910-26. Date: 2026-08-10. Vehicle 1 rear-ended Vehicle 2 at low speed. No injuries reported.",
        bounding_boxes: [
          { label: "Report Number", text: "#9910-26", confidence: 0.97, box_2d: [120, 150, 160, 350] }
        ],
        forensic_flags: []
      },
      {
        id: "doc-auto-03",
        name: "Rear_Bumper_Damage.jpg",
        doc_type: "DAMAGE_PHOTO",
        exif_metadata: { camera_make: "Apple", camera_model: "iPhone 15 Pro", datetime_original: "2026:08:10 14:22:10" },
        bounding_boxes: [
          { label: "Bumper Crack", text: "Visible horizontal fracture", confidence: 0.96, box_2d: [300, 250, 600, 750] }
        ],
        forensic_flags: []
      }
    ],
    line_items: [
      {
        id: "line-a1",
        item_code: "OEM-71501-T20",
        description: "Rear Bumper Cover (CAPA Certified)",
        category: "PARTS",
        claimed_amount: 650.00,
        allowed_amount: 650.00,
        benchmark_amount: 650.00,
        is_covered: true
      },
      {
        id: "line-a2",
        item_code: "LAB-PAINT",
        description: "Refinish Bumper Paint & Clearcoat (3.5 hrs)",
        category: "LABOR",
        claimed_amount: 227.50,
        allowed_amount: 227.50,
        benchmark_amount: 227.50,
        is_covered: true
      },
      {
        id: "line-a3",
        item_code: "LAB-BODY",
        description: "Bumper Assembly R&I Labor (4.0 hrs)",
        category: "LABOR",
        claimed_amount: 260.00,
        allowed_amount: 260.00,
        benchmark_amount: 260.00,
        is_covered: true
      },
      {
        id: "line-a4",
        item_code: "CAL-ADAS-01",
        description: "ADAS Ultrasonic Parking Sensor Recalibration",
        category: "LABOR",
        claimed_amount: 312.50,
        allowed_amount: 312.50,
        benchmark_amount: 312.50,
        is_covered: true
      }
    ]
  },
  {
    id: "clm-prop-002",
    claim_number: "CLM-2026-PROP-0730",
    policy_id: "POL-PROP-HO3-002",
    claimant_name: "Elena Rostova",
    claimant_id: "USR-7731",
    insurance_line: "PROPERTY",
    incident_date: "2026-08-01",
    submission_date: "2026-08-02",
    incident_location: "Seattle, WA",
    description: "Basement flooded following heavy summer rains. Water soaked through foundation floor and walls ruining drywall and finished flooring.",
    total_claimed_amount: 8850.00,
    status: "DENIED",
    policy: {
      policy_id: "POL-PROP-HO3-002",
      policy_number: "HO-449102-S",
      holder_name: "Elena Rostova",
      holder_id: "USR-7731",
      insurance_line: "PROPERTY",
      coverage_type: "HO-3 Special Form Homeowners",
      effective_date: "2025-06-01",
      expiration_date: "2026-06-01",
      is_active: true,
      coverage_limit: 450000,
      deductible: 1500,
      co_pay_percent: 0,
      co_insurance_percent: 0,
      applicable_perils: ["Fire", "Windstorm", "Sudden & Accidental Water Discharge (Plumbing)"],
      specific_exclusions: ["Section I Exclusion 3.a (Ground Water Seepage & Foundation Ingress)"]
    },
    documents: [
      {
        id: "doc-prop-01",
        name: "Contractor_Remediation_Quote.pdf",
        doc_type: "CONTRACTOR_QUOTE",
        extracted_text: "Pacific Restoration Specialists. Sump failure and heavy rain soaked through slab causing water ingress across 1,200 sq ft.",
        bounding_boxes: [
          { label: "Contractor", text: "Pacific Restoration Specialists", confidence: 0.98, box_2d: [100, 100, 150, 450] },
          { label: "Total Estimate", text: "$8,850.00", confidence: 0.99, box_2d: [780, 620, 830, 890] }
        ],
        forensic_flags: []
      },
      {
        id: "doc-prop-02",
        name: "Basement_Flooding_Photo.jpg",
        doc_type: "DAMAGE_PHOTO",
        exif_metadata: { camera_make: "Samsung", camera_model: "Galaxy S23", datetime_original: "2026:06:15 09:14:02" },
        bounding_boxes: [
          { label: "Water Line", text: "Efflorescence & chronic moisture line", confidence: 0.93, box_2d: [200, 200, 500, 800] }
        ],
        forensic_flags: [
          "Photo EXIF creation timestamp (2026-06-15) predates claimed incident date (2026-08-01) by 47 days."
        ]
      }
    ],
    line_items: [
      {
        id: "line-p1",
        description: "Emergency Water Extraction & Industrial Dehumidification",
        category: "STRUCTURE",
        claimed_amount: 2200.00,
        allowed_amount: 0.00,
        is_covered: false,
        exclusion_reason: "Peril excluded under Section I Exclusion 3.a (Ground Water Seepage)"
      },
      {
        id: "line-p2",
        description: "Drywall Tearout & Anti-Microbial Treatment",
        category: "STRUCTURE",
        claimed_amount: 3150.00,
        allowed_amount: 0.00,
        is_covered: false,
        exclusion_reason: "Peril excluded under Section I Exclusion 3.a"
      },
      {
        id: "line-p3",
        description: "Subfloor Replacement & Waterproof Vinyl Plank Install",
        category: "CONTENT",
        claimed_amount: 3500.00,
        allowed_amount: 0.00,
        is_covered: false,
        exclusion_reason: "Peril excluded under Section I Exclusion 3.a"
      }
    ]
  },
  {
    id: "clm-hlth-003",
    claim_number: "CLM-2026-HLTH-0729",
    policy_id: "POL-HLTH-PPO-003",
    claimant_name: "David Chen",
    claimant_id: "USR-4419",
    insurance_line: "HEALTH",
    incident_date: "2026-07-28",
    submission_date: "2026-07-29",
    incident_location: "Chicago, IL",
    description: "Admitted through Emergency Department for acute abdominal pain, diagnosed with acute appendicitis, followed by laparoscopic appendectomy.",
    total_claimed_amount: 4750.00,
    status: "IN_REVIEW",
    policy: {
      policy_id: "POL-HLTH-PPO-003",
      policy_number: "HP-109283-E",
      holder_name: "David Chen",
      holder_id: "USR-4419",
      insurance_line: "HEALTH",
      coverage_type: "Gold Comprehensive PPO Choice",
      effective_date: "2026-01-01",
      expiration_date: "2027-01-01",
      is_active: true,
      coverage_limit: 1000000,
      deductible: 1000,
      co_pay_percent: 0,
      co_insurance_percent: 20,
      out_of_pocket_max: 6000
    },
    documents: [
      {
        id: "doc-hlth-01",
        name: "Northwestern_Memorial_ItemizedBill.pdf",
        doc_type: "HOSPITAL_BILL",
        extracted_text: "Northwestern Memorial Hospital Itemized UB-04. Patient: David Chen. ER Level 5, Lap Appendectomy, Abdominal CT Scan, Sterile Tray Surcharge.",
        bounding_boxes: [
          { label: "Hospital Provider", text: "Northwestern Memorial Hospital", confidence: 0.99, box_2d: [100, 100, 160, 480] },
          { label: "Total Billed", text: "$4,750.00", confidence: 0.98, box_2d: [800, 650, 850, 900] }
        ],
        forensic_flags: []
      }
    ],
    line_items: [
      {
        id: "line-h1",
        item_code: "CPT-99285",
        description: "Emergency Department Visit - High Complexity (Level 5)",
        category: "FACILITY",
        claimed_amount: 1400.00,
        allowed_amount: 850.00,
        benchmark_amount: 850.00,
        inflation_flag: true,
        inflation_variance_percent: 64.7,
        is_covered: true
      },
      {
        id: "line-h2",
        item_code: "CPT-44970",
        description: "Laparoscopic Appendectomy Surgical Procedure",
        category: "SURGERY",
        claimed_amount: 1800.00,
        allowed_amount: 1800.00,
        benchmark_amount: 1800.00,
        is_covered: true
      },
      {
        id: "line-h3",
        item_code: "CPT-74176",
        description: "Computed Tomography (CT Scan) Abdomen & Pelvis with Contrast",
        category: "RADIOLOGY",
        claimed_amount: 950.00,
        allowed_amount: 750.00,
        benchmark_amount: 750.00,
        inflation_flag: true,
        inflation_variance_percent: 26.7,
        is_covered: true
      },
      {
        id: "line-h4",
        item_code: "SUR-TRAY-99",
        description: "Hospital Unbundled Sterile Operating Room Tray Surcharge",
        category: "FACILITY",
        claimed_amount: 600.00,
        allowed_amount: 0.0,
        is_covered: false,
        exclusion_reason: "Excluded: Unbundled administrative tray fee under Section 11.a"
      }
    ]
  }
];
