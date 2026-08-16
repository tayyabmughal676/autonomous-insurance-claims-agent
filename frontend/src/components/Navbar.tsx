import React from "react";
import { Shield, Settings2, Plus, RotateCw } from "lucide-react";
import { InsuranceLine, Claim } from "../types/claim";

interface NavbarProps {
  selectedLine: InsuranceLine | "ALL";
  onSelectLine: (line: InsuranceLine | "ALL") => void;
  claims: Claim[];
  environment: "SANDBOX" | "PRODUCTION";
  onToggleEnvironment: (env: "SANDBOX" | "PRODUCTION") => void;
  onOpenSettings: () => void;
  onOpenNewClaim: () => void;
  onResetClaims: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedLine,
  onSelectLine,
  claims,
  environment,
  onToggleEnvironment,
  onOpenSettings,
  onOpenNewClaim,
  onResetClaims
}) => {
  const total = claims.length;
  const autoCount = claims.filter(c => c.insurance_line === "AUTO").length;
  const propCount = claims.filter(c => c.insurance_line === "PROPERTY").length;
  const hlthCount = claims.filter(c => c.insurance_line === "HEALTH").length;

  return (
    <header className="w-full bg-[#0E121A] border-b border-white/[0.08] px-5 py-2.5 sticky top-0 z-40">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
        
        {/* Brand & Line Filters */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Shield className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
            <span className="font-semibold text-sm text-white tracking-tight font-display">Data Daur</span>
          </div>

          {/* Line Filter Segmented Tabs */}
          <nav aria-label="Insurance line filters" className="hidden sm:flex items-center bg-[#080A0E] p-0.5 rounded-lg border border-white/[0.06]">
            <button
              type="button"
              onClick={() => onSelectLine("ALL")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80 ${
                selectedLine === "ALL"
                  ? "bg-[#1C2230] text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All <span className="font-mono text-[10px] text-slate-500 ml-1">{total}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectLine("AUTO")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80 ${
                selectedLine === "AUTO"
                  ? "bg-[#1C2230] text-blue-300 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Auto <span className="font-mono text-[10px] text-slate-500 ml-1">{autoCount}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectLine("PROPERTY")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80 ${
                selectedLine === "PROPERTY"
                  ? "bg-[#1C2230] text-amber-300 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Property <span className="font-mono text-[10px] text-slate-500 ml-1">{propCount}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectLine("HEALTH")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80 ${
                selectedLine === "HEALTH"
                  ? "bg-[#1C2230] text-rose-300 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Health <span className="font-mono text-[10px] text-slate-500 ml-1">{hlthCount}</span>
            </button>
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          
          {/* Environment Switcher */}
          <button
            type="button"
            onClick={() => onToggleEnvironment(environment === "SANDBOX" ? "PRODUCTION" : "SANDBOX")}
            aria-label={`Toggle environment, currently ${environment}`}
            className={`text-[11px] font-mono font-medium px-2.5 py-1 rounded-md border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80 ${
              environment === "SANDBOX"
                ? "bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/15"
                : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/15"
            }`}
          >
            {environment}
          </button>

          {/* Reset Seeds */}
          {environment === "SANDBOX" && (
            <button
              type="button"
              onClick={onResetClaims}
              aria-label="Reset demo seeds"
              title="Reset Seeds"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#161B26] border border-white/[0.06] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80"
            >
              <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}

          {/* Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Open System Settings"
            title="Settings"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#161B26] border border-white/[0.06] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80"
          >
            <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>

          {/* Intake Claim */}
          <button
            type="button"
            onClick={onOpenNewClaim}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition shadow-sm ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Intake Claim
          </button>

        </div>

      </div>
    </header>
  );
};
