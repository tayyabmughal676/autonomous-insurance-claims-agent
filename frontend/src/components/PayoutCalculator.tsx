import React, { useState } from "react";
import { Calculator, Check, X, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Claim, ClaimLineItem, FinancialPayout } from "../types/claim";

interface PayoutCalculatorProps {
  claim: Claim;
  payoutResult?: FinancialPayout;
  onUpdateLineItems: (updatedItems: ClaimLineItem[]) => void;
}

export const PayoutCalculator: React.FC<PayoutCalculatorProps> = ({
  claim,
  payoutResult,
  onUpdateLineItems
}) => {
  const [lineItems, setLineItems] = useState<ClaimLineItem[]>(claim.line_items || []);
  const [showAuditTrail, setShowAuditTrail] = useState(false);

  const policy = claim.policy;
  const deductible = policy?.deductible || 500;
  const coinsuranceRate = (policy?.co_insurance_percent || 0) / 100;
  const policyLimit = policy?.coverage_limit || 50000;

  // Local live deterministic calculation
  let totalClaimed = 0;
  let totalAllowedGross = 0;
  let totalExcluded = 0;

  lineItems.forEach((item) => {
    totalClaimed += item.claimed_amount;
    if (item.is_covered) {
      totalAllowedGross += item.allowed_amount;
      if (item.claimed_amount > item.allowed_amount) {
        totalExcluded += (item.claimed_amount - item.allowed_amount);
      }
    } else {
      totalExcluded += item.claimed_amount;
    }
  });

  const appliedDeductible = Math.min(deductible, totalAllowedGross);
  const afterDeductible = Math.max(0, totalAllowedGross - appliedDeductible);
  const appliedCoinsurance = Math.round(afterDeductible * coinsuranceRate * 100) / 100;
  const afterCoinsurance = Math.max(0, afterDeductible - appliedCoinsurance);
  const netPayout = Math.min(afterCoinsurance, policyLimit);

  const handleToggleCovered = (idx: number) => {
    const updated = [...lineItems];
    updated[idx].is_covered = !updated[idx].is_covered;
    setLineItems(updated);
    onUpdateLineItems(updated);
  };

  const handleAmountChange = (idx: number, newAllowed: number) => {
    const updated = [...lineItems];
    updated[idx].allowed_amount = Number.isNaN(newAllowed) ? 0 : newAllowed;
    setLineItems(updated);
    onUpdateLineItems(updated);
  };

  return (
    <div className="space-y-3 text-xs">
      
      {/* Financial Math Summary Card */}
      <div className="bg-[#0E121A] rounded-xl border border-white/[0.08] p-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-blue-400" aria-hidden="true" />
            <span className="font-semibold text-white text-xs">Deterministic Financial Schedule</span>
          </div>

          {/* Recommended Payout Block */}
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-2.5">
            <span className="text-[10px] uppercase font-semibold text-emerald-400">Net Payout:</span>
            <span className="text-base font-bold font-mono tabular-nums text-emerald-300">
              ${netPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Calculation Step Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-2.5">
          <div className="p-2 rounded-lg bg-[#141824] border border-white/[0.04]">
            <span className="text-[10px] text-slate-500 uppercase block font-medium">Claimed</span>
            <span className="font-mono tabular-nums font-semibold text-white">${totalClaimed.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="p-2 rounded-lg bg-[#141824] border border-white/[0.04]">
            <span className="text-[10px] text-rose-400 uppercase block font-medium">Disallowed</span>
            <span className="font-mono tabular-nums font-semibold text-rose-400">-${totalExcluded.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="p-2 rounded-lg bg-[#141824] border border-white/[0.04]">
            <span className="text-[10px] text-slate-400 uppercase block font-medium">Gross Allowed</span>
            <span className="font-mono tabular-nums font-semibold text-slate-200">${totalAllowedGross.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="p-2 rounded-lg bg-[#141824] border border-white/[0.04]">
            <span className="text-[10px] text-blue-400 uppercase block font-medium">Deductible</span>
            <span className="font-mono tabular-nums font-semibold text-blue-400">-${appliedDeductible.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="p-2 rounded-lg bg-[#141824] border border-white/[0.04]">
            <span className="text-[10px] text-slate-400 uppercase block font-medium">Co-Pay ({policy?.co_insurance_percent || 0}%)</span>
            <span className="font-mono tabular-nums font-semibold text-slate-200">-${appliedCoinsurance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
            <span className="text-[10px] text-emerald-400 uppercase block font-medium">Net Disbursable</span>
            <span className="font-mono tabular-nums font-semibold text-emerald-300">${netPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Itemized Line Items Table */}
      <div className="bg-[#0E121A] rounded-xl border border-white/[0.08] overflow-hidden">
        <div className="p-3 border-b border-white/[0.06] flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Itemized Loss Schedule ({lineItems.length} Items)
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Adjust allowed amounts below</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#121622] text-slate-400 text-[10px] uppercase font-semibold border-b border-white/[0.06]">
              <tr>
                <th scope="col" className="py-2 px-3 w-10 text-center">Cover</th>
                <th scope="col" className="py-2 px-3">Code / Category</th>
                <th scope="col" className="py-2 px-3">Description</th>
                <th scope="col" className="py-2 px-3 text-right">Claimed</th>
                <th scope="col" className="py-2 px-3 text-right">Benchmark</th>
                <th scope="col" className="py-2 px-3 text-right">Allowed Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {lineItems.map((item, idx) => (
                <tr
                  key={item.id || idx}
                  className={`hover:bg-[#121622] transition ${
                    !item.is_covered ? "bg-rose-950/10 opacity-75" : ""
                  }`}
                >
                  <td className="py-2 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleCovered(idx)}
                      aria-label={item.is_covered ? `Disallow ${item.description}` : `Allow ${item.description}`}
                      className={`p-1 rounded border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        item.is_covered
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
                      }`}
                      title={item.is_covered ? "Disallow item" : "Allow item"}
                    >
                      {item.is_covered ? <Check className="h-3 w-3" aria-hidden="true" /> : <X className="h-3 w-3" aria-hidden="true" />}
                    </button>
                  </td>

                  <td className="py-2 px-3 font-mono text-slate-300">
                    <span className="block font-semibold text-slate-200 text-xs">{item.item_code || "—"}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{item.category}</span>
                  </td>

                  <td className="py-2 px-3">
                    <div className="font-medium text-slate-200">{item.description}</div>
                    {item.exclusion_reason && (
                      <div className="text-[10px] text-rose-400 mt-0.5">{item.exclusion_reason}</div>
                    )}
                    {item.inflation_flag && item.is_covered && (
                      <div className="text-[10px] text-amber-400 mt-0.5 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" /> Fee schedule variance (+{item.inflation_variance_percent}%)
                      </div>
                    )}
                  </td>

                  <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-300">
                    ${item.claimed_amount.toFixed(2)}
                  </td>

                  <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-500">
                    {item.benchmark_amount ? `$${item.benchmark_amount.toFixed(2)}` : "—"}
                  </td>

                  <td className="py-2 px-3 text-right font-mono tabular-nums">
                    <input
                      type="number"
                      aria-label={`Allowed amount for ${item.description}`}
                      disabled={!item.is_covered}
                      value={item.allowed_amount}
                      onChange={(e) => handleAmountChange(idx, parseFloat(e.target.value))}
                      className="w-24 bg-[#090B10] border border-white/[0.08] rounded px-2 py-1 text-right text-xs font-mono tabular-nums font-semibold text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40 disabled:line-through"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Trail Accordion */}
      <div className="bg-[#0E121A] rounded-xl border border-white/[0.08] p-3">
        <button
          type="button"
          onClick={() => setShowAuditTrail(!showAuditTrail)}
          aria-expanded={showAuditTrail}
          className="w-full flex items-center justify-between text-xs font-medium text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <span>Calculation Audit Trail ({payoutResult?.math_audit_trail?.length || 4} Operations)</span>
          {showAuditTrail ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />}
        </button>

        {showAuditTrail && (
          <div className="mt-2 p-2.5 rounded-lg bg-[#080A0E] border border-white/[0.04] font-mono tabular-nums text-[11px] text-slate-300 space-y-1">
            {(payoutResult?.math_audit_trail || [
              `Total Claimed: $${totalClaimed.toFixed(2)}`,
              `Total Excluded: -$${totalExcluded.toFixed(2)}`,
              `Gross Allowed: $${totalAllowedGross.toFixed(2)}`,
              `Applied Deductible: -$${appliedDeductible.toFixed(2)}`,
              `Net Payout: $${netPayout.toFixed(2)}`
            ]).map((step, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-slate-600 select-none">{idx + 1}.</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
