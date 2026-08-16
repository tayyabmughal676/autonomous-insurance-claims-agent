import React, { useState } from "react";
import { Search, ShieldAlert } from "lucide-react";
import { Claim, ClaimStatus, InsuranceLine } from "../types/claim";

interface ClaimsQueueProps {
  claims: Claim[];
  selectedClaimId: string | null;
  onSelectClaim: (claim: Claim) => void;
  selectedLine: InsuranceLine | "ALL";
}

export const ClaimsQueue: React.FC<ClaimsQueueProps> = ({
  claims,
  selectedClaimId,
  onSelectClaim,
  selectedLine
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredClaims = claims.filter(claim => {
    if (selectedLine !== "ALL" && claim.insurance_line !== selectedLine) return false;
    if (statusFilter === "STP" && claim.status !== "AUTO_APPROVED") return false;
    if (statusFilter === "REVIEW" && !["IN_REVIEW", "INFO_REQUESTED", "SUBMITTED"].includes(claim.status)) return false;
    if (statusFilter === "DENIED" && claim.status !== "DENIED") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = claim.claim_number.toLowerCase().includes(q);
      const matchName = claim.claimant_name.toLowerCase().includes(q);
      const matchDesc = claim.description.toLowerCase().includes(q);
      if (!matchNum && !matchName && !matchDesc) return false;
    }
    return true;
  });

  const getStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case "AUTO_APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" /> STP
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" aria-hidden="true" /> APPROVED
          </span>
        );
      case "DENIED":
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" aria-hidden="true" /> DECLINED
          </span>
        );
      case "IN_REVIEW":
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden="true" /> REVIEW
          </span>
        );
      case "INFO_REQUESTED":
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" aria-hidden="true" /> RFI
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" aria-hidden="true" /> INTAKE
          </span>
        );
    }
  };

  return (
    <section aria-label="Claims queue" className="w-full md:w-80 lg:w-[340px] flex flex-col bg-[#0E121A] rounded-xl border border-white/[0.08] overflow-hidden shrink-0 shadow-sm">
      
      {/* Header & Filter Controls */}
      <div className="p-3 border-b border-white/[0.08] space-y-2 bg-[#121622]">
        
        {/* Quick Search */}
        <div className="relative">
          <label htmlFor="claim-search-input" className="sr-only">Search claims</label>
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
          <input
            id="claim-search-input"
            type="search"
            autoComplete="off"
            spellCheck={false}
            placeholder="Search by claim #, claimant, loss…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#090B10] border border-white/[0.08] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80 transition"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center justify-between text-[11px] pt-0.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`px-2 py-0.5 rounded font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80 ${
                statusFilter === "ALL"
                  ? "bg-[#1F2636] text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("STP")}
              className={`px-2 py-0.5 rounded font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80 ${
                statusFilter === "STP"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              STP
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("REVIEW")}
              className={`px-2 py-0.5 rounded font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80 ${
                statusFilter === "REVIEW"
                  ? "bg-amber-500/20 text-amber-300"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Review
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("DENIED")}
              className={`px-2 py-0.5 rounded font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80 ${
                statusFilter === "DENIED"
                  ? "bg-rose-500/20 text-rose-300"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Declined
            </button>
          </div>

          <span className="font-mono tabular-nums text-[10px] text-slate-500">
            {filteredClaims.length} items
          </span>
        </div>
      </div>

      {/* Claims List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04] max-h-[calc(100vh-140px)]">
        {filteredClaims.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No matching claims found.
          </div>
        ) : (
          filteredClaims.map((claim) => {
            const isSelected = claim.id === selectedClaimId;
            const hasForensicAlert = claim.documents?.some(d => d.forensic_flags && d.forensic_flags.length > 0);

            return (
              <button
                type="button"
                key={claim.id}
                onClick={() => onSelectClaim(claim)}
                className={`w-full text-left p-3 transition relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80 ${
                  isSelected
                    ? "bg-[#161B26] border-l-2 border-l-blue-500"
                    : "hover:bg-[#121622]"
                }`}
              >
                {/* Header Row */}
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-mono text-xs font-semibold text-slate-200">
                      {claim.claim_number}
                    </span>
                  </div>
                  {getStatusBadge(claim.status)}
                </div>

                {/* Claimant & Amount */}
                <div className="flex items-center justify-between text-xs my-0.5">
                  <span className="font-medium text-slate-300 truncate max-w-[170px]">
                    {claim.claimant_name}
                  </span>
                  <span className="font-mono tabular-nums font-semibold text-slate-100">
                    ${claim.total_claimed_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Description */}
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {claim.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-white/[0.04] text-[10px] font-mono tabular-nums text-slate-500">
                  <span>{claim.incident_date}</span>
                  {hasForensicAlert && (
                    <span className="inline-flex items-center gap-0.5 text-rose-400 font-sans font-medium">
                      <ShieldAlert className="h-3 w-3" aria-hidden="true" /> Flagged
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

    </section>
  );
};
