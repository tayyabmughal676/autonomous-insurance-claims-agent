import {
  Claim,
  ClaimProcessingState,
  AppSettings,
  InsuranceLine,
  ClaimStatus,
  FinancialPayout,
  ClaimLineItem,
  AdjudicationDecision
} from "../types/claim";
import { MOCK_CLAIMS, DEFAULT_SETTINGS } from "../mock/mockData";

const API_BASE = "http://localhost:8000/api/v1";

export class ClaimsApiService {
  private static settings: AppSettings = { ...DEFAULT_SETTINGS };
  private static localClaims: Claim[] = JSON.parse(JSON.stringify(MOCK_CLAIMS));

  static getLocalSettings(): AppSettings {
    const saved = localStorage.getItem("insurance_agent_settings");
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.warn("Failed to parse local settings", e);
      }
    }
    return this.settings;
  }

  static saveLocalSettings(newSettings: AppSettings): void {
    this.settings = newSettings;
    localStorage.setItem("insurance_agent_settings", JSON.stringify(newSettings));
  }

  static async getClaims(line?: InsuranceLine | "ALL", status?: ClaimStatus): Promise<Claim[]> {
    try {
      const url = new URL(`${API_BASE}/claims`);
      if (line && line !== "ALL") url.searchParams.append("line", line);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data: Claim[] = await res.json();
        this.localClaims = data;
        let result = [...data];
        if (status) result = result.filter(c => c.status === status);
        return result;
      }
    } catch (err) {
      console.warn("Backend API unavailable, using local mock store:", err);
    }

    // Fallback to local store
    let filtered = [...this.localClaims];
    if (line && line !== "ALL") filtered = filtered.filter(c => c.insurance_line === line);
    if (status) filtered = filtered.filter(c => c.status === status);
    return filtered;
  }

  static async getClaimDetail(claimId: string): Promise<{ claim: Claim; processing_state?: ClaimProcessingState }> {
    try {
      const res = await fetch(`${API_BASE}/claims/${claimId}`);
      if (res.ok) {
        const claim: Claim = await res.json();
        // Also fetch state if available
        let state: ClaimProcessingState | undefined;
        try {
          const stateRes = await fetch(`${API_BASE}/claims/${claimId}/state`);
          if (stateRes.ok) {
            state = await stateRes.json();
          }
        } catch (e) {
          console.debug("Claim state not yet available", e);
        }
        return { claim, processing_state: state };
      }
    } catch (err) {
      console.warn("Backend API detail fetch failed, fallback:", err);
    }

    const claim = this.localClaims.find(c => c.id === claimId) || this.localClaims[0];
    return {
      claim,
      processing_state: this.generateSimulatedProcessingState(claim)
    };
  }

  static async processClaimWithAgent(claimId: string): Promise<ClaimProcessingState> {
    const settings = this.getLocalSettings();
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      if (settings.openrouter_api_key) {
        headers["X-OpenRouter-Key"] = settings.openrouter_api_key;
      }

      const engineParam = encodeURIComponent(settings.orchestration_engine || "native");
      const res = await fetch(`${API_BASE}/claims/${claimId}/process?engine=${engineParam}`, {
        method: "POST",
        headers
      });
      if (res.ok) {
        const state: ClaimProcessingState = await res.json();
        // Update local cache
        const idx = this.localClaims.findIndex(c => c.id === claimId);
        if (idx >= 0) this.localClaims[idx] = state.claim;
        return state;
      }
    } catch (err) {
      console.warn("Backend agent run failed, generating instant simulation:", err);
    }

    // Client-side fallback simulation
    const claim = this.localClaims.find(c => c.id === claimId) || this.localClaims[0];
    const simulatedState = this.generateSimulatedProcessingState(claim);
    if (simulatedState.verdict?.decision === "AUTO_APPROVE") {
      claim.status = "AUTO_APPROVED";
    } else if (simulatedState.verdict?.decision === "RECOMMEND_DENIAL") {
      claim.status = "DENIED";
    } else {
      claim.status = "IN_REVIEW";
    }
    return simulatedState;
  }

  static async adjudicateClaim(
    claimId: string,
    action: "APPROVE" | "DENY" | "REQUEST_INFO",
    customLineItems?: ClaimLineItem[],
    notes?: string
  ): Promise<{ status: string; payout?: FinancialPayout; settlement_letter?: string; denial_letter?: string; rfi_letter?: string }> {
    try {
      const res = await fetch(`${API_BASE}/claims/${claimId}/adjudicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          custom_line_items: customLineItems,
          adjuster_notes: notes
        })
      });
      if (res.ok) {
        const data = await res.json();
        const claim = this.localClaims.find(c => c.id === claimId);
        if (claim) {
          if (action === "APPROVE") claim.status = "APPROVED";
          else if (action === "DENY") claim.status = "DENIED";
          else if (action === "REQUEST_INFO") claim.status = "INFO_REQUESTED";
        }
        return data;
      }
    } catch (err) {
      console.warn("Adjudication API failed, performing client-side adjudication:", err);
    }

    const claim = this.localClaims.find(c => c.id === claimId) || this.localClaims[0];
    if (action === "APPROVE") claim.status = "APPROVED";
    else if (action === "DENY") claim.status = "DENIED";
    else if (action === "REQUEST_INFO") claim.status = "INFO_REQUESTED";

    return {
      status: action,
      settlement_letter: `# ADJUDICATION VERDICT: ${action}\n\nClaim ${claim.claim_number} for ${claim.claimant_name} processed.\nRemarks: ${notes || "Completed by Adjuster."}`
    };
  }

  static async createClaim(newClaim: Partial<Claim>): Promise<Claim> {
    try {
      const res = await fetch(`${API_BASE}/claims`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClaim)
      });
      if (res.ok) {
        const created: Claim = await res.json();
        this.localClaims.unshift(created);
        return created;
      }
    } catch (err) {
      console.warn("Create claim API failed, creating in local store:", err);
    }

    const created: Claim = {
      id: `clm-custom-${Date.now()}`,
      claim_number: `CLM-2026-${newClaim.insurance_line || "AUTO"}-${Math.floor(1000 + Math.random() * 9000)}`,
      policy_id: newClaim.policy_id || "POL-AUTO-GOLD-001",
      claimant_name: newClaim.claimant_name || "Jane Doe",
      claimant_id: newClaim.claimant_id || "USR-5510",
      insurance_line: newClaim.insurance_line || "AUTO",
      incident_date: newClaim.incident_date || "2026-08-15",
      submission_date: "2026-08-16",
      incident_location: newClaim.incident_location || "San Francisco, CA",
      description: newClaim.description || "Reported incident loss description.",
      total_claimed_amount: newClaim.total_claimed_amount || 1200,
      status: "SUBMITTED",
      documents: newClaim.documents || [],
      line_items: newClaim.line_items || []
    };
    this.localClaims.unshift(created);
    return created;
  }

  static async resetClaims(): Promise<void> {
    try {
      await fetch(`${API_BASE}/seed`, { method: "POST" });
    } catch (e) {
      console.warn("Failed to reset claims via API:", e);
    }
    this.localClaims = JSON.parse(JSON.stringify(MOCK_CLAIMS));
  }

  static async downloadSettlementPdf(claimId: string, claimNumber: string): Promise<void> {
    try {
      const res = await fetch(`${API_BASE}/claims/${claimId}/documents/settlement-pdf`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Settlement_Voucher_${claimNumber}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }
    } catch (e) {
      console.warn("Failed to download PDF from server:", e);
    }
    // Fallback: alert user
    alert("Settlement PDF download requires active backend server on port 8000.");
  }

  static async downloadDenialPdf(claimId: string, claimNumber: string): Promise<void> {
    try {
      const res = await fetch(`${API_BASE}/claims/${claimId}/documents/denial-pdf`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Notice_of_Declination_${claimNumber}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }
    } catch (e) {
      console.warn("Failed to download PDF from server:", e);
    }
    alert("Denial PDF download requires active backend server on port 8000.");
  }

  private static generateSimulatedProcessingState(claim: Claim): ClaimProcessingState {
    const isAutoStp = claim.id === "clm-auto-001" || claim.total_claimed_amount < 2500;
    const isPropDenial = claim.id === "clm-prop-002";

    const fraudScore = isPropDenial ? 65 : isAutoStp ? 4 : 28;
    const decision: AdjudicationDecision = isPropDenial ? "RECOMMEND_DENIAL" : isAutoStp ? "AUTO_APPROVE" : "ESCALATE_TO_ADJUSTER";
    const deductible = claim.policy?.deductible || 500;
    const netPayout = isPropDenial ? 0 : Math.max(0, claim.total_claimed_amount - deductible);

    return {
      claim_id: claim.id,
      claim,
      is_completed: true,
      current_node: undefined,
      errors: [],
      nodes: [
        {
          node_id: "node-intake",
          agent_name: "Multimodal Intake & OCR Agent",
          description: "Extract structured entities, invoice line-items, and parse document EXIF metadata.",
          status: "COMPLETED",
          duration_ms: 124,
          thought_trace: [
            `Ingested ${claim.documents.length} evidence attachments for ${claim.claim_number}.`,
            "Extracted bounding box entities for invoices and incident reports.",
            isPropDenial ? "ALERT: Photo EXIF creation timestamp predates claimed incident date by 24 days." : "Metadata integrity verified with zero tampering flags."
          ],
          step_traces: [
            { timestamp: new Date().toISOString(), action: "Document_OCR_Extracted", detail: `Mapped key entities on ${claim.documents[0]?.name || "evidence.pdf"}` }
          ],
          output_summary: `Processed ${claim.documents.length} documents and verified forensic metadata.`
        },
        {
          node_id: "node-policy",
          agent_name: "Policy Knowledge & Coverage Agent",
          description: "Cross-reference claim loss against policy terms, deductible schedules, and exclusions via ChromaDB.",
          status: "COMPLETED",
          duration_ms: 210,
          thought_trace: [
            `Indexed policy search for ${claim.policy_id} (${claim.insurance_line}).`,
            `Query matched 4 clauses in ChromaDB knowledge base.`,
            isPropDenial ? "ALERT: Ground water foundation ingress triggers Section I Exclusion 3.a." : "Coverage confirmed under standard policy perils."
          ],
          step_traces: [
            { timestamp: new Date().toISOString(), action: "Clause_Evaluated", detail: "Retrieved policy contract conditions." }
          ],
          output_summary: isPropDenial ? "Policy Exclusion Triggered (Section I Exclusion 3.a)." : "Fully covered under active policy terms."
        },
        {
          node_id: "node-fraud",
          agent_name: "Fraud & Forensics Agent",
          description: "Evaluate multi-vector risk signals: EXIF tampering, price inflation, and narrative discrepancies.",
          status: "COMPLETED",
          duration_ms: 180,
          thought_trace: [
            "Evaluated photo metadata forensics and cross-document reconciliation.",
            isPropDenial ? "FLAGGED: Major timestamp anomaly detected in damage photo." : "Zero critical fraud anomalies identified."
          ],
          step_traces: [
            { timestamp: new Date().toISOString(), action: "Fraud_Signal_Logged", detail: `Risk Score: ${fraudScore}/100` }
          ],
          output_summary: `Risk Score: ${fraudScore}/100 (${fraudScore > 50 ? "HIGH" : "LOW"}).`
        },
        {
          node_id: "node-math",
          agent_name: "Deterministic Financial Engine",
          description: "Calculate deductible subtractions, co-insurance, benchmark adjustments, and net payout.",
          status: "COMPLETED",
          duration_ms: 15,
          thought_trace: [
            `Total Claimed: $${claim.total_claimed_amount.toFixed(2)}`,
            `Applied Deductible: -$${deductible.toFixed(2)}`,
            `Net Recommended Payout: $${netPayout.toFixed(2)}`
          ],
          step_traces: [],
          output_summary: `Net payout calculated: $${netPayout.toFixed(2)}.`
        },
        {
          node_id: "node-adjudication",
          agent_name: "Adjudication & Routing Supervisor",
          description: "Assess STP eligibility, synthesize findings, generate adjuster briefs, and draft letters.",
          status: "COMPLETED",
          duration_ms: 95,
          thought_trace: [
            `Evaluating STP criteria (Threshold: $2,500, Max Risk: 15/100).`,
            `Verdict Decision: ${decision}`
          ],
          step_traces: [],
          output_summary: isAutoStp ? "Straight-Through Processing Auto-Approved." : isPropDenial ? "Recommended for Denial due to Policy Exclusion." : "Escalated for Human Adjuster Sign-Off."
        }
      ],
      fraud_result: {
        overall_fraud_score: fraudScore,
        risk_level: fraudScore > 50 ? "HIGH" : fraudScore > 20 ? "MEDIUM" : "LOW",
        signals: isPropDenial ? [
          {
            id: "frd-1",
            code: "FRD-EXIF-001",
            severity: "HIGH",
            title: "Photographic Metadata / Timestamp Inconsistency",
            description: "Photo EXIF creation timestamp predates claimed incident date by 24 days.",
            confidence: 0.94,
            evidence_source: "Forensic EXIF Parser"
          }
        ] : [],
        summary: isPropDenial ? "HIGH RISK: Photo timestamp inconsistency indicates pre-existing loss." : "Clean verification with low risk score.",
        requires_siu_referral: isPropDenial
      },
      policy_result: {
        is_covered: !isPropDenial,
        coverage_status: isPropDenial ? "EXCLUDED" : "FULLY_COVERED",
        matched_peril: isPropDenial ? "Ground Water Ingress" : "Sudden Collision Loss",
        matched_clauses: [
          {
            clause_id: "SEC-1",
            section_number: isPropDenial ? "Section I Exclusion 3.a" : "Section 1.1",
            section_title: isPropDenial ? "Ground Water Seepage Exclusion" : "Collision Coverage",
            content: isPropDenial ? "We do not insure for loss caused directly or indirectly by water below the surface of the ground..." : "The insurer will pay for sudden, accidental direct physical loss to the insured vehicle.",
            relevance_score: 0.94,
            is_exclusion: isPropDenial
          }
        ],
        detected_exclusions: isPropDenial ? ["Section I Exclusion 3.a (Ground Water Seepage)"] : [],
        policy_limit: claim.policy?.coverage_limit || 50000,
        applicable_deductible: deductible,
        co_pay_or_coinsurance_rate: claim.policy?.co_insurance_percent || 0,
        validation_notes: isPropDenial ? "Incident peril is explicitly excluded under policy contract." : "Loss event is fully covered."
      },
      payout_result: {
        total_claimed: claim.total_claimed_amount,
        total_allowed_gross: isPropDenial ? 0 : claim.total_claimed_amount,
        total_excluded_amount: isPropDenial ? claim.total_claimed_amount : 0,
        applied_deductible: isPropDenial ? 0 : Math.min(deductible, claim.total_claimed_amount),
        applied_coinsurance: 0,
        applied_depreciation: 0,
        net_recommended_payout: netPayout,
        line_adjustments: claim.line_items.map(l => ({
          line_item_id: l.id,
          description: l.description,
          claimed_amount: l.claimed_amount,
          adjusted_allowed_amount: isPropDenial ? 0 : l.allowed_amount,
          deduction_reason: isPropDenial ? "Excluded peril" : undefined
        })),
        math_audit_trail: [
          `Total Claimed: $${claim.total_claimed_amount.toFixed(2)}`,
          `Applied Deductible: -$${deductible.toFixed(2)}`,
          `Net Payout: $${netPayout.toFixed(2)}`
        ]
      },
      verdict: {
        decision,
        confidence_score: 0.96,
        stp_eligible: isAutoStp,
        executive_summary: isAutoStp
          ? `Straight-Through Processing Auto-Approved for immediate payout of $${netPayout.toFixed(2)}.`
          : isPropDenial
          ? `Claim recommended for Denial due to Ground Water Exclusion 3.a and EXIF timestamp inconsistency.`
          : `Routed to Human Adjuster Review for payment authorization ($${netPayout.toFixed(2)}).`,
        primary_reasons: isAutoStp
          ? ["Low-complexity claim within STP authorization ceiling ($2,500.00).", "Zero critical fraud flags detected.", "Policy contract fully active."]
          : isPropDenial
          ? ["Loss caused by subsurface groundwater seepage (Exclusion 3.a).", "Photo evidence predates incident date by 24 days."]
          : ["Claim exceeds auto-STP threshold.", "Adjuster manual confirmation required."],
        required_human_actions: isAutoStp
          ? []
          : isPropDenial
          ? ["Issue formal Notice of Declination.", "Refer file to SIU for investigation."]
          : ["Confirm fee schedule adjustments.", "Authorize payment disbursement."]
      }
    };
  }
}
