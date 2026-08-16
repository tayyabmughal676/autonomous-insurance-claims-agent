"""Enterprise PDF Document Generator for Insurance Settlements and Declinations.

Produces print-ready, legally compliant PDF Settlement Vouchers, Explanation of
Benefits (EOB), and Notices of Claim Declination with official insurer
branding.
"""

from __future__ import annotations

import io
from datetime import datetime
from typing import Any, List

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from app.models.claim_schemas import Claim
from app.models.verdict_schemas import FinancialPayout


def generate_settlement_pdf(
    claim: Claim,
    payout: FinancialPayout | None = None,
    verdict: Any | None = None,
) -> bytes:
    """Generate a print-ready Settlement Voucher, EOB Statement, and Check Stub.

    Returns raw PDF bytes.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "HeaderTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=16,
        textColor=colors.HexColor("#0F172A"),
    )
    subtitle_style = ParagraphStyle(
        "HeaderSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#64748B"),
    )
    section_title_style = ParagraphStyle(
        "SectionTitle",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=12,
        textColor=colors.HexColor("#1E293B"),
    )
    body_style = ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#334155"),
    )
    body_bold_style = ParagraphStyle(
        "BodyBold",
        parent=body_style,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#0F172A"),
    )
    table_header_style = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=colors.white,
    )
    table_cell_style = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor("#1E293B"),
    )

    story: List[Any] = []

    # 1. Header Banner
    header_data = [
        [
            Paragraph("<b>DATA DAUR ASSURANCE & UNDERWRITING CORP</b>", title_style),
            Paragraph(
                "<b>STATEMENT OF SETTLEMENT & EOB</b><br/>"
                f"<font color='#64748B'>Date: {datetime.now().strftime('%B %d, %Y')}</font>",
                ParagraphStyle("RightHeader", parent=subtitle_style, alignment=2),
            ),
        ],
        [
            Paragraph(
                "Claims Adjudication Division • NAIC Carrier Code #88492 • Financial Regulation Board Certified",
                subtitle_style,
            ),
            Paragraph(
                f"<b>Disbursement Voucher:</b> VCH-{claim.claim_number[-6:]}",
                ParagraphStyle("RightVoucher", parent=subtitle_style, alignment=2),
            ),
        ],
    ]
    header_table = Table(header_data, colWidths=[360, 180])
    header_table.setStyle(
        TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
            ("TOPPADDING", (0, 0), (-1, -1), 1),
        ])
    )
    story.append(header_table)
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#2563EB"), spaceAfter=8))

    # 2. Claim Identification Metadata Grid
    policy_num = claim.policy.policy_number if claim.policy else claim.policy_id
    cov_type = claim.policy.coverage_type if claim.policy else "Standard Coverage"

    meta_data = [
        [
            Paragraph("<b>Claim Number:</b>", body_bold_style),
            Paragraph(claim.claim_number, body_style),
            Paragraph("<b>Policy Number:</b>", body_bold_style),
            Paragraph(policy_num, body_style),
        ],
        [
            Paragraph("<b>Claimant Name:</b>", body_bold_style),
            Paragraph(claim.claimant_name, body_style),
            Paragraph("<b>Insurance Line:</b>", body_bold_style),
            Paragraph(f"{claim.insurance_line} Insurance", body_style),
        ],
        [
            Paragraph("<b>Date of Loss:</b>", body_bold_style),
            Paragraph(str(claim.incident_date), body_style),
            Paragraph("<b>Coverage Type:</b>", body_bold_style),
            Paragraph(cov_type, body_style),
        ],
        [
            Paragraph("<b>Incident Location:</b>", body_bold_style),
            Paragraph(claim.incident_location or "N/A", body_style),
            Paragraph("<b>Adjudication Status:</b>", body_bold_style),
            Paragraph("<font color='#059669'><b>APPROVED & SETTLED</b></font>", body_style),
        ],
    ]
    meta_table = Table(meta_data, colWidths=[90, 180, 90, 180])
    meta_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ])
    )
    story.append(meta_table)
    story.append(Spacer(1, 8))

    # 3. Itemized Loss Schedule Table
    story.append(Paragraph("<b>ITEMIZED LOSS SCHEDULE & AUDIT</b>", section_title_style))
    story.append(Spacer(1, 3))

    table_rows = [
        [
            Paragraph("<font color='#FFFFFF'><b>Item / Code</b></font>", table_header_style),
            Paragraph("<font color='#FFFFFF'><b>Category</b></font>", table_header_style),
            Paragraph("<font color='#FFFFFF'><b>Description</b></font>", table_header_style),
            Paragraph("<font color='#FFFFFF'><b>Claimed</b></font>", table_header_style),
            Paragraph("<font color='#FFFFFF'><b>Allowed</b></font>", table_header_style),
            Paragraph("<font color='#FFFFFF'><b>Disallowed</b></font>", table_header_style),
        ]
    ]

    total_claimed = 0.0
    total_allowed = 0.0
    total_disallowed = 0.0

    for item in claim.line_items:
        claimed = float(item.claimed_amount)
        allowed = float(item.allowed_amount) if item.is_covered else 0.0
        disallowed = claimed - allowed if item.is_covered else claimed

        total_claimed += claimed
        total_allowed += allowed
        total_disallowed += disallowed

        table_rows.append([
            Paragraph(item.item_code or "—", table_cell_style),
            Paragraph(item.category, table_cell_style),
            Paragraph(item.description, table_cell_style),
            Paragraph(f"${claimed:,.2f}", table_cell_style),
            Paragraph(f"${allowed:,.2f}", table_cell_style),
            Paragraph(f"${disallowed:,.2f}", table_cell_style),
        ])

    line_items_table = Table(table_rows, colWidths=[65, 55, 200, 70, 75, 75])
    table_styles = [
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1E293B")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("ALIGN", (3, 1), (-1, -1), "RIGHT"),
    ]

    # Alternating row colors
    for r in range(1, len(table_rows)):
        if r % 2 == 0:
            table_styles.append(("BACKGROUND", (0, r), (-1, r), colors.HexColor("#F8FAFC")))

    line_items_table.setStyle(TableStyle(table_styles))
    story.append(line_items_table)
    story.append(Spacer(1, 8))

    # 4. Financial Indemnity Calculation Box
    deductible = float(payout.applied_deductible) if payout else float(claim.policy.deductible if claim.policy else 500.0)
    coinsurance = float(payout.applied_coinsurance) if payout else 0.0
    net_payout = float(payout.net_recommended_payout) if payout else max(0.0, total_allowed - deductible - coinsurance)

    calc_data = [
        [
            Paragraph("<b>Calculation Breakdown:</b>", body_bold_style),
            Paragraph("<b>Amount ($)</b>", ParagraphStyle("RBold", parent=body_bold_style, alignment=2)),
        ],
        [
            Paragraph("Total Claimed Loss (Gross Invoice):", body_style),
            Paragraph(f"${total_claimed:,.2f}", ParagraphStyle("R1", parent=body_style, alignment=2)),
        ],
        [
            Paragraph("Less: Non-Covered / Disallowed Fees:", body_style),
            Paragraph(f"-${total_disallowed:,.2f}", ParagraphStyle("R2", parent=body_style, alignment=2)),
        ],
        [
            Paragraph("<b>Total Gross Allowed:</b>", body_bold_style),
            Paragraph(f"<b>${total_allowed:,.2f}</b>", ParagraphStyle("R3", parent=body_bold_style, alignment=2)),
        ],
        [
            Paragraph("Less: Policyholder Applicable Deductible:", body_style),
            Paragraph(f"-${deductible:,.2f}", ParagraphStyle("R4", parent=body_style, alignment=2, textColor=colors.HexColor("#2563EB"))),
        ],
        [
            Paragraph(f"Less: Policyholder Co-Insurance ({claim.policy.co_insurance_percent if claim.policy else 0}%):", body_style),
            Paragraph(f"-${coinsurance:,.2f}", ParagraphStyle("R5", parent=body_style, alignment=2)),
        ],
        [
            Paragraph("<b>NET RECOMMENDED DISBURSEMENT:</b>", ParagraphStyle("NetL", parent=body_bold_style, fontSize=9, textColor=colors.HexColor("#065F46"))),
            Paragraph(f"<b>${net_payout:,.2f}</b>", ParagraphStyle("NetR", parent=body_bold_style, fontSize=9, alignment=2, textColor=colors.HexColor("#065F46"))),
        ],
    ]

    calc_table = Table(calc_data, colWidths=[380, 160])
    calc_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F0FDF4")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#86EFAC")),
            ("LINEBELOW", (0, 0), (-1, 0), 0.5, colors.HexColor("#86EFAC")),
            ("LINEBELOW", (0, 3), (-1, 3), 0.5, colors.HexColor("#86EFAC")),
            ("LINEABOVE", (0, -1), (-1, -1), 1, colors.HexColor("#10B981")),
            ("TOPPADDING", (0, 0), (-1, -1), 2.5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ])
    )
    story.append(calc_table)
    story.append(Spacer(1, 10))

    # 5. Check Disbursement Stub
    story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#94A3B8"), spaceAfter=6))
    story.append(Paragraph("<b>CHECK DISBURSEMENT VOUCHER (FOR YOUR RECORDS)</b>", ParagraphStyle("StubTitle", parent=subtitle_style, fontName="Helvetica-Bold", textColor=colors.HexColor("#475569"))))
    story.append(Spacer(1, 3))

    check_data = [
        [
            Paragraph("<b>DATA DAUR ASSURANCE DISBURSEMENT ACCOUNT</b><br/>JPMorgan Chase Bank, N.A. • New York, NY", table_cell_style),
            Paragraph(f"<b>CHECK NO:</b> 0089412<br/><b>DATE:</b> {datetime.now().strftime('%m/%d/%Y')}", ParagraphStyle("ChkR", parent=table_cell_style, alignment=2)),
        ],
        [
            Paragraph(f"<b>PAY TO THE ORDER OF:</b><br/><font size=9><b>{claim.claimant_name.upper()}</b></font>", table_cell_style),
            Paragraph(f"<b>AMOUNT:</b><br/><font size=10 color='#065F46'><b>${net_payout:,.2f} USD</b></font>", ParagraphStyle("ChkAmt", parent=table_cell_style, alignment=2)),
        ],
        [
            Paragraph(f"<b>MEMO:</b> Claim Settlement {claim.claim_number} / {claim.insurance_line}", table_cell_style),
            Paragraph("<b>AUTHORIZED SIGNATURE:</b><br/><i>Data Daur Automated Adjudication Engine</i>", ParagraphStyle("Sig", parent=table_cell_style, alignment=2)),
        ],
        [
            Paragraph("<b>⑆021000021⑆ 8849209102⑈ 0089412</b>", ParagraphStyle("MICR", parent=table_cell_style, fontName="Helvetica", fontSize=9, textColor=colors.HexColor("#0F172A"))),
            Paragraph("VOID AFTER 90 DAYS • NON-NEGOTIABLE SAMPLE", ParagraphStyle("Void", parent=subtitle_style, alignment=2, textColor=colors.HexColor("#DC2626"))),
        ],
    ]

    check_table = Table(check_data, colWidths=[330, 210])
    check_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#475569")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ])
    )
    story.append(check_table)

    doc.build(story)
    return buffer.getvalue()


def generate_denial_pdf(
    claim: Claim,
    policy_result: Any | None = None,
    fraud_result: Any | None = None,
    verdict: Any | None = None,
) -> bytes:
    """Generate a formal legal Notice of Claim Declination PDF.

    Returns raw PDF bytes.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "DenialTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=16,
        textColor=colors.HexColor("#991B1B"),
    )
    subtitle_style = ParagraphStyle(
        "DenialSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#64748B"),
    )
    section_title = ParagraphStyle(
        "DenialSection",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=9.5,
        leading=12,
        textColor=colors.HexColor("#1E293B"),
    )
    body_style = ParagraphStyle(
        "DenialBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#334155"),
    )
    quote_style = ParagraphStyle(
        "DenialQuote",
        parent=body_style,
        fontName="Helvetica-Oblique",
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#7F1D1D"),
    )

    story: List[Any] = []

    # 1. Header
    header_data = [
        [
            Paragraph("<b>DATA DAUR ASSURANCE & UNDERWRITING CORP</b>", title_style),
            Paragraph(
                "<b>NOTICE OF CLAIM DECLINATION</b><br/>"
                f"<font color='#64748B'>Certified Mail / Electronic Delivery</font><br/>"
                f"<font color='#64748B'>Date: {datetime.now().strftime('%B %d, %Y')}</font>",
                ParagraphStyle("RDenialHead", parent=subtitle_style, alignment=2),
            ),
        ],
        [
            Paragraph(
                "Legal & Compliance Directorate • Bureau of Claims Adjudication",
                subtitle_style,
            ),
            Paragraph(
                f"<b>Notice Ref:</b> DEN-{claim.claim_number[-6:]}",
                ParagraphStyle("RRef", parent=subtitle_style, alignment=2),
            ),
        ],
    ]
    header_table = Table(header_data, colWidths=[340, 200])
    header_table.setStyle(
        TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
            ("TOPPADDING", (0, 0), (-1, -1), 1),
        ])
    )
    story.append(header_table)
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#DC2626"), spaceAfter=8))

    # 2. Addressee & Policy Identifiers
    policy_num = claim.policy.policy_number if claim.policy else claim.policy_id
    meta_data = [
        [
            Paragraph("<b>TO (INSURED):</b>", body_style),
            Paragraph(f"<b>{claim.claimant_name}</b><br/>Claimant ID: {claim.claimant_id}", body_style),
            Paragraph("<b>CLAIM NUMBER:</b>", body_style),
            Paragraph(f"<b>{claim.claim_number}</b>", body_style),
        ],
        [
            Paragraph("<b>POLICY NUMBER:</b>", body_style),
            Paragraph(policy_num, body_style),
            Paragraph("<b>DATE OF LOSS:</b>", body_style),
            Paragraph(str(claim.incident_date), body_style),
        ],
        [
            Paragraph("<b>COVERAGE TYPE:</b>", body_style),
            Paragraph(claim.policy.coverage_type if claim.policy else "Property HO-3", body_style),
            Paragraph("<b>CLAIMED AMOUNT:</b>", body_style),
            Paragraph(f"${claim.total_claimed_amount:,.2f}", body_style),
        ],
    ]
    meta_table = Table(meta_data, colWidths=[90, 180, 90, 180])
    meta_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FEF2F2")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#FCA5A5")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#FECACA")),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ])
    )
    story.append(meta_table)
    story.append(Spacer(1, 8))

    # 3. Formal Declination Statement
    story.append(Paragraph("<b>1. FORMAL NOTICE OF COVERAGE DENIAL</b>", section_title))
    story.append(Spacer(1, 3))
    statement_text = (
        f"Dear {claim.claimant_name},<br/><br/>"
        f"Data Daur Assurance & Underwriting Corp has completed a comprehensive investigation and coverage analysis "
        f"concerning the above-referenced loss reported on {claim.incident_date}. Following thorough review of "
        f"the submitted documents, repair estimates, and contract terms under Policy #{policy_num}, "
        f"we regret to inform you that <b>coverage cannot be extended for this loss event</b>."
    )
    story.append(Paragraph(statement_text, body_style))
    story.append(Spacer(1, 6))

    # 4. Specific Exclusions & Contract Citations
    story.append(Paragraph("<b>2. CONTRACTUAL PROVISIONS & EXCLUSION CITATIONS</b>", section_title))
    story.append(Spacer(1, 3))

    exclusions = []
    if policy_result and getattr(policy_result, "detected_exclusions", None):
        exclusions = policy_result.detected_exclusions
    elif claim.policy and claim.policy.specific_exclusions:
        exclusions = claim.policy.specific_exclusions
    else:
        exclusions = ["Section I - Exclusion 3.a (Ground Water Seepage & Foundation Ingress)"]

    for exc in exclusions:
        story.append(
            Paragraph(
                f"<b>• Triggered Contract Exclusion:</b> {exc}",
                ParagraphStyle("ExcB", parent=body_style, textColor=colors.HexColor("#991B1B")),
            )
        )
        story.append(
            Paragraph(
                "<i>\"We do not insure for loss caused directly or indirectly by water below the surface of the ground, "
                "including water which exerts pressure on, or seeps, leaks or flows through a building, sidewalk, "
                "driveway, patio, foundation, basement floor or walls.\"</i>",
                quote_style,
            )
        )
        story.append(Spacer(1, 4))

    # 5. Factual Investigation Findings
    story.append(Paragraph("<b>3. SUMMARY OF FACTUAL FINDINGS & EVIDENCE</b>", section_title))
    story.append(Spacer(1, 3))

    findings = []
    if verdict and getattr(verdict, "primary_reasons", None):
        findings = verdict.primary_reasons
    else:
        findings = [
            f"The loss described as \"{claim.description}\" involves subsurface moisture ingress rather than sudden and accidental discharge.",
            "Photographic forensic analysis identified chronological inconsistencies with the reported date of loss.",
            "Contractor documentation confirms structural dampness originating below slab foundation level.",
        ]

    for f in findings:
        story.append(Paragraph(f"• {f}", body_style))
        story.append(Spacer(1, 2))

    story.append(Spacer(1, 6))

    # 6. Rights to Appeal & Regulatory Disclosures
    story.append(Paragraph("<b>4. STATUTORY RIGHTS & APPEALS PROTOCOL</b>", section_title))
    story.append(Spacer(1, 3))
    appeal_text = (
        "If you disagree with this determination, you have the right to request a formal re-examination by our Senior Appeals Committee "
        "or submit additional mitigating evidence within sixty (60) days of this notice. Additionally, you may contact the State Department "
        "of Insurance Consumer Services Bureau to request an administrative review."
    )
    story.append(Paragraph(appeal_text, body_style))
    story.append(Spacer(1, 10))

    # 7. Signature Block
    sig_data = [
        [
            Paragraph("<b>Sincerely,</b><br/><br/><b>Authorized Claims Adjudicator</b><br/>Bureau of Claims Adjudication<br/>Data Daur Assurance Corp", body_style),
            Paragraph("<b>COPIES FURNISHED TO:</b><br/>• Insured File Archive<br/>• Underwriting Risk Directorate<br/>• State Regulatory Affairs", subtitle_style),
        ]
    ]
    sig_table = Table(sig_data, colWidths=[300, 240])
    sig_table.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP")]))
    story.append(sig_table)

    doc.build(story)
    return buffer.getvalue()
