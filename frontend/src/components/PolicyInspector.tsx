import React, { useState } from "react";
import { BookOpen, Search, ShieldCheck, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { Claim, PolicyValidationResult, PolicyClauseMatch } from "../types/claim";

interface PolicyInspectorProps {
  claim: Claim;
  policyResult?: PolicyValidationResult;
}

export const PolicyInspector: React.FC<PolicyInspectorProps> = ({ claim, policyResult }) => {
  const policy = claim.policy;
  const [searchQuery, setSearchQuery] = useState("");
  const [customMatches, setCustomMatches] = useState<PolicyClauseMatch[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const clauses = customMatches || policyResult?.matched_clauses || [];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setCustomMatches(null);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/policies/search?q=${encodeURIComponent(searchQuery)}&policy_id=${claim.policy_id}`);
      if (res.ok) {
        const data = await res.json();
        setCustomMatches(data);
      }
    } catch (err) {
      console.warn("Policy search fallback:", err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Top Policy Summary Card */}
      <div className="bg-[#0E121A] rounded-xl border border-white/[0.08] p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-400" aria-hidden="true" />
              <span className="font-semibold text-white text-sm">{policy?.coverage_type || "Active Insurance Contract"}</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#161B26] text-slate-300 border border-white/[0.06]">
                {policy?.policy_number || claim.policy_id}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Insured: <span className="text-slate-200">{policy?.holder_name || claim.claimant_name}</span> | Effective: {policy?.effective_date} to {policy?.expiration_date}
            </p>
          </div>

          {/* Coverage Status Badge */}
          <div>
            {policyResult ? (
              policyResult.is_covered ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Coverage Validated
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-medium">
                  <XCircle className="h-3.5 w-3.5" aria-hidden="true" /> Excluded Peril Triggered
                </div>
              )
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Contract In Force
              </div>
            )}
          </div>
        </div>

        {/* Policy Financial Parameters Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-3 text-xs">
          <div className="p-2.5 rounded-lg bg-[#141824] border border-white/[0.04]">
            <span className="text-[10px] uppercase text-slate-500 block font-medium">Coverage Limit</span>
            <span className="font-mono tabular-nums font-semibold text-white text-sm">
              ${(policy?.coverage_limit || 50000).toLocaleString()}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#141824] border border-white/[0.04]">
            <span className="text-[10px] uppercase text-slate-500 block font-medium">Deductible</span>
            <span className="font-mono tabular-nums font-semibold text-blue-400 text-sm">
              ${(policy?.deductible || 500).toLocaleString()}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#141824] border border-white/[0.04]">
            <span className="text-[10px] uppercase text-slate-500 block font-medium">Co-Insurance</span>
            <span className="font-mono tabular-nums font-semibold text-slate-200 text-sm">
              {policy?.co_insurance_percent || 0}%
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#141824] border border-white/[0.04]">
            <span className="text-[10px] uppercase text-slate-500 block font-medium">Out-of-Pocket Max</span>
            <span className="font-mono tabular-nums font-semibold text-slate-200 text-sm">
              ${(policy?.out_of_pocket_max || 6000).toLocaleString()}
            </span>
          </div>
        </div>

      </div>

      {/* Semantic Search Query Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <label htmlFor="policy-search-input" className="sr-only">Search policy clauses</label>
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
          <input
            id="policy-search-input"
            name="policy_query"
            type="search"
            autoComplete="off"
            placeholder="Search policy contract clauses via ChromaDB semantic vector search…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0E121A] border border-white/[0.08] rounded-lg pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="px-3.5 py-2 bg-[#1C2230] hover:bg-[#252D40] text-slate-200 border border-white/[0.08] rounded-lg text-xs font-medium transition flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Sparkles className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" /> {isSearching ? "Querying…" : "RAG Query"}
        </button>
        {customMatches && (
          <button
            type="button"
            onClick={() => { setCustomMatches(null); setSearchQuery(""); }}
            className="px-3 py-2 bg-[#0E121A] border border-white/[0.08] text-slate-400 hover:text-white rounded-lg text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Reset
          </button>
        )}
      </form>

      {/* Matched Policy Clauses */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>ChromaDB Retrieved Clauses ({clauses.length})</span>
          <span className="text-[11px] font-mono text-slate-500">Cosine Similarity Attribution</span>
        </div>

        {clauses.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs bg-[#0E121A] rounded-xl border border-white/[0.08]">
            No matching policy clauses found. Try another query term.
          </div>
        ) : (
          clauses.map((clause, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition ${
                clause.is_exclusion
                  ? "bg-rose-950/20 border-rose-500/30"
                  : "bg-[#0E121A] border-white/[0.08] hover:border-white/[0.12]"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <span className="font-mono text-xs font-semibold text-blue-400 mr-2">
                    Section {clause.section_number}
                  </span>
                  <span className="font-medium text-xs text-slate-200">
                    {clause.section_title}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {clause.is_exclusion ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      EXCLUSION
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      COVERED PERIL
                    </span>
                  )}
                  <span className="font-mono tabular-nums text-[10px] text-slate-500">
                    {Math.round(clause.relevance_score * 100)}% match
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans bg-[#080A0E] p-2.5 rounded-lg border border-white/[0.04]">
                "{clause.content}"
              </p>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
