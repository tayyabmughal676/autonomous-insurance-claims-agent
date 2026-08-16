import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  FileQuestion,
  FileText,
  AlertTriangle,
  BookOpen,
  DollarSign,
  Cpu,
  ShieldCheck,
  ShieldAlert,
  FileDown
} from "lucide-react";
import { Claim, ClaimProcessingState, ClaimLineItem } from "../types/claim";
import { DocumentViewer } from "./DocumentViewer";
import { PolicyInspector } from "./PolicyInspector";
import { FraudRadar } from "./FraudRadar";
import { PayoutCalculator } from "./PayoutCalculator";
import { AgentTrace } from "./AgentTrace";

interface AdjusterWorkbenchProps {
  claim: Claim;
  processingState?: ClaimProcessingState;
  isProcessing: boolean;
  onRunAgent: (claimId: string) => void;
  onAdjudicate: (action: "APPROVE" | "DENY" | "REQUEST_INFO", customItems?: ClaimLineItem[], notes?: string) => void;
  onViewLetter: (title: string, content: string, onDownloadPdf?: () => void) => void;
  onUpdateClaimLineItems: (items: ClaimLineItem[]) => void;
  onDownloadSettlementPdf?: (claimId: string, claimNumber: string) => void;
  onDownloadDenialPdf?: (claimId: string, claimNumber: string) => void;
}

export const AdjusterWorkbench: React.FC<AdjusterWorkbenchProps> = ({
  claim,
  processingState,
  isProcessing,
  onRunAgent,
  onAdjudicate,
  onViewLetter,
  onUpdateClaimLineItems,
  onDownloadSettlementPdf,
  onDownloadDenialPdf
}) => {
  const [activeTab, setActiveTab] = useState<"TRACE" | "DOCS" | "POLICY" | "FRAUD" | "PAYOUT">("TRACE");
  const verdict = processingState?.verdict;
  const policyRes = processingState?.policy_result;
  const fraudRes = processingState?.fraud_result;
  const payoutRes = processingState?.payout_result;

  return (
    <section aria-label="Adjuster workbench cockpit" className="flex-1 flex flex-col bg-[#0E121A] rounded-xl border border-white/[0.08] overflow-hidden shadow-sm">
      
      {/* Top Claim Header Bar */}
      <div className="px-4 py-3 border-b border-white/[0.08] bg-[#121622] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Left: Claim Key Identifiers */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <span className="font-mono font-bold text-white text-sm">
            {claim.claim_number}
          </span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#1C2230] text-slate-300 border border-white/[0.08]">
            {claim.insurance_line}
          </span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#161B26] text-slate-400 border border-white/[0.06]">
            {claim.policy_id}
          </span>
          <span className="text-slate-500" aria-hidden="true">|</span>
          <span className="text-slate-300 font-medium">{claim.claimant_name}</span>
          <span className="text-slate-500" aria-hidden="true">|</span>
          <span className="font-mono tabular-nums text-slate-400">{claim.incident_date}</span>
          <span className="text-slate-500" aria-hidden="true">|</span>
          <span className="font-mono tabular-nums font-semibold text-slate-100">${claim.total_claimed_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          
          <button
            type="button"
            onClick={() => onRunAgent(claim.id)}
            disabled={isProcessing}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition disabled:opacity-50 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Sparkles className={`h-3.5 w-3.5 ${isProcessing ? "animate-spin" : ""}`} aria-hidden="true" />
            {isProcessing ? "Executing Pipeline…" : "Run AI Pipeline"}
          </button>

          <button
            type="button"
            onClick={() => onAdjudicate("APPROVE")}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-medium flex items-center gap-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Approve
          </button>

          <button
            type="button"
            onClick={() => onAdjudicate("DENY")}
            className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-medium flex items-center gap-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <XCircle className="h-3.5 w-3.5" aria-hidden="true" /> Decline
          </button>

          <button
            type="button"
            onClick={() => onAdjudicate("REQUEST_INFO")}
            className="px-2.5 py-1.5 rounded-lg bg-[#161B26] hover:bg-[#1E2433] text-slate-300 border border-white/[0.08] text-xs font-medium flex items-center gap-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <FileQuestion className="h-3.5 w-3.5" aria-hidden="true" /> RFI
          </button>
        </div>

      </div>

      {/* High-Signal Verdict Bar */}
      {verdict && (
        <div
          role="region"
          aria-label="Adjudication verdict"
          className={`px-4 py-2.5 border-b text-xs flex flex-col md:flex-row md:items-center justify-between gap-2.5 ${
            verdict.decision === "AUTO_APPROVE"
              ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-300"
              : verdict.decision === "RECOMMEND_DENIAL"
              ? "bg-rose-950/20 border-rose-500/20 text-rose-300"
              : "bg-amber-950/20 border-amber-500/20 text-amber-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {verdict.decision === "AUTO_APPROVE" ? (
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" aria-hidden="true" />
            ) : verdict.decision === "RECOMMEND_DENIAL" ? (
              <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" aria-hidden="true" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" aria-hidden="true" />
            )}
            <span className="font-semibold">{verdict.decision.replace(/_/g, " ")}</span>
            <span className="font-mono tabular-nums text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-slate-300">
              {Math.round(verdict.confidence_score * 100)}% Confidence
            </span>
            <span className="text-slate-400 truncate max-w-[500px]">
              — {verdict.executive_summary}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {verdict.settlement_letter_draft && (
              <>
                <button
                  type="button"
                  onClick={() => onViewLetter("Settlement Notice", verdict.settlement_letter_draft!, () => onDownloadSettlementPdf?.(claim.id, claim.claim_number))}
                  className="px-2 py-1 rounded bg-[#161B26] hover:bg-[#1E2433] text-slate-200 border border-white/[0.08] text-[11px] font-medium flex items-center gap-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <FileText className="h-3 w-3 text-blue-400" aria-hidden="true" /> Settlement Letter
                </button>
                {onDownloadSettlementPdf && (
                  <button
                    type="button"
                    onClick={() => onDownloadSettlementPdf(claim.id, claim.claim_number)}
                    title="Download Official PDF Voucher"
                    className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium flex items-center gap-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <FileDown className="h-3 w-3 text-emerald-400" aria-hidden="true" /> PDF Voucher
                  </button>
                )}
              </>
            )}
            {verdict.denial_letter_draft && (
              <>
                <button
                  type="button"
                  onClick={() => onViewLetter("Notice of Declination", verdict.denial_letter_draft!, () => onDownloadDenialPdf?.(claim.id, claim.claim_number))}
                  className="px-2 py-1 rounded bg-[#161B26] hover:bg-[#1E2433] text-slate-200 border border-white/[0.08] text-[11px] font-medium flex items-center gap-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                >
                  <FileText className="h-3 w-3 text-rose-400" aria-hidden="true" /> Denial Notice
                </button>
                {onDownloadDenialPdf && (
                  <button
                    type="button"
                    onClick={() => onDownloadDenialPdf(claim.id, claim.claim_number)}
                    title="Download Official PDF Notice"
                    className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-medium flex items-center gap-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                  >
                    <FileDown className="h-3 w-3 text-rose-400" aria-hidden="true" /> PDF Notice
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <nav aria-label="Workbench tabs" className="px-4 border-b border-white/[0.08] bg-[#0E121A] flex items-center gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("TRACE")}
          aria-selected={activeTab === "TRACE"}
          role="tab"
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            activeTab === "TRACE"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Cpu className="h-3.5 w-3.5" aria-hidden="true" /> Audit Trace
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("DOCS")}
          aria-selected={activeTab === "DOCS"}
          role="tab"
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            activeTab === "DOCS"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText className="h-3.5 w-3.5" aria-hidden="true" /> Evidence & OCR
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("POLICY")}
          aria-selected={activeTab === "POLICY"}
          role="tab"
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            activeTab === "POLICY"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" aria-hidden="true" /> Policy Clauses
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("FRAUD")}
          aria-selected={activeTab === "FRAUD"}
          role="tab"
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            activeTab === "FRAUD"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" /> Fraud Radar ({fraudRes ? `${fraudRes.overall_fraud_score}/100` : "0"})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("PAYOUT")}
          aria-selected={activeTab === "PAYOUT"}
          role="tab"
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            activeTab === "PAYOUT"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <DollarSign className="h-3.5 w-3.5" aria-hidden="true" /> Financial Schedule
        </button>
      </nav>

      {/* Tab Panel Body */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#090B10]">
        {activeTab === "TRACE" && (
          <AgentTrace processingState={processingState} isProcessing={isProcessing} />
        )}
        {activeTab === "DOCS" && <DocumentViewer claim={claim} />}
        {activeTab === "POLICY" && <PolicyInspector claim={claim} policyResult={policyRes} />}
        {activeTab === "FRAUD" && <FraudRadar claim={claim} fraudResult={fraudRes} />}
        {activeTab === "PAYOUT" && (
          <PayoutCalculator
            claim={claim}
            payoutResult={payoutRes}
            onUpdateLineItems={onUpdateClaimLineItems}
          />
        )}
      </div>

    </section>
  );
};
