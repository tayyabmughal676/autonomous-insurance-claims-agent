import React from "react";
import { ShieldCheck, Flame, Eye, FileSearch } from "lucide-react";
import { FraudAssessment, Severity, Claim } from "../types/claim";

interface FraudRadarProps {
  claim: Claim;
  fraudResult?: FraudAssessment;
}

export const FraudRadar: React.FC<FraudRadarProps> = ({ claim, fraudResult }) => {
  const score = fraudResult?.overall_fraud_score ?? 0;
  const signals = fraudResult?.signals ?? [];
  const riskLevel: Severity = fraudResult?.risk_level ?? "LOW";
  const siuReferral = fraudResult?.requires_siu_referral ?? false;

  const getSeverityBadge = (sev: Severity) => {
    switch (sev) {
      case "CRITICAL":
      case "HIGH":
        return <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-medium">HIGH RISK</span>;
      case "MEDIUM":
        return <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-medium">MODERATE</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-medium">LOW RISK</span>;
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Top Fraud Assessment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Risk Score Metric Box */}
        <div className="md:col-span-4 bg-[#0E121A] rounded-xl border border-white/[0.08] p-4 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 mb-2">
            Multi-Vector Risk Score
          </span>
          
          <div className="relative h-24 w-24 flex items-center justify-center my-1">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="stroke-white/[0.06]"
                strokeWidth="3.5"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${score >= 60 ? "stroke-rose-500" : score >= 20 ? "stroke-amber-500" : "stroke-emerald-500"} transition-all duration-700`}
                strokeWidth="3.5"
                strokeDasharray={`${score}, 100`}
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-xl font-mono font-bold text-white">{Math.round(score)}</span>
              <span className="text-[9px] text-slate-500 font-mono">/ 100</span>
            </div>
          </div>

          <div className="mt-2">
            {getSeverityBadge(riskLevel)}
          </div>
        </div>

        {/* Executive Summary & SIU Notice */}
        <div className="md:col-span-8 bg-[#0E121A] rounded-xl border border-white/[0.08] p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <FileSearch className="h-4 w-4 text-blue-400" />
                <span>Forensics Audit for {claim.claim_number}</span>
              </div>
              {siuReferral && (
                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-medium flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-rose-400" /> SIU Referral Required
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mt-2.5">
              {fraudResult?.summary || "Automated risk analysis completed across image metadata, line-item price benchmarks, and narrative consistency."}
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.06] text-xs">
            <div className="p-2 rounded bg-[#141824] border border-white/[0.04]">
              <span className="text-[10px] text-slate-500 block">Signals Logged</span>
              <span className="font-mono font-semibold text-slate-200">{signals.length}</span>
            </div>
            <div className="p-2 rounded bg-[#141824] border border-white/[0.04]">
              <span className="text-[10px] text-slate-500 block">Metadata Integrity</span>
              <span className={`font-mono font-semibold ${signals.some(s => s.code.includes("EXIF")) ? "text-rose-400" : "text-emerald-400"}`}>
                {signals.some(s => s.code.includes("EXIF")) ? "Inconsistent" : "Verified"}
              </span>
            </div>
            <div className="p-2 rounded bg-[#141824] border border-white/[0.04]">
              <span className="text-[10px] text-slate-500 block">Fee Benchmark</span>
              <span className={`font-mono font-semibold ${signals.some(s => s.code.includes("INFL")) ? "text-amber-400" : "text-emerald-400"}`}>
                {signals.some(s => s.code.includes("INFL")) ? "Inflated" : "Standard"}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Itemized Risk Signals */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Detected Anomaly Signals ({signals.length})
        </div>

        {signals.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs bg-[#0E121A] rounded-xl border border-white/[0.08] flex items-center justify-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>No anomalous risk signals or suspicious billing items identified.</span>
          </div>
        ) : (
          signals.map((sig) => (
            <div
              key={sig.id}
              className="p-3.5 rounded-xl bg-[#0E121A] border border-white/[0.08] space-y-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-400 px-1.5 py-0.5 rounded bg-[#161B26]">
                    {sig.code}
                  </span>
                  <span className="font-medium text-xs text-slate-200">
                    {sig.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getSeverityBadge(sig.severity)}
                  <span className="font-mono text-[10px] text-slate-500">
                    {Math.round(sig.confidence * 100)}% Conf
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-normal pl-0.5">
                {sig.description}
              </p>

              {sig.evidence_source && (
                <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 pt-0.5">
                  <Eye className="h-3 w-3 text-slate-500" /> Source: {sig.evidence_source}
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};
