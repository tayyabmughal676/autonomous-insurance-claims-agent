import React, { useState, useEffect } from "react";
import { X, Settings2, Key, Cpu, Sparkles, ShieldCheck, Check, Workflow } from "lucide-react";
import { AppSettings } from "../types/claim";
import { ClaimsApiService } from "../services/api";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsSaved: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsSaved
}) => {
  const [apiKey, setApiKey] = useState("");
  const [visionModel, setVisionModel] = useState("google/gemini-2.0-flash-exp:free");
  const [reasoningModel, setReasoningModel] = useState("openai/gpt-oss-20b:free");
  const [orchestrationEngine, setOrchestrationEngine] = useState<"native" | "langgraph">("native");
  const [stpMaxAmount, setStpMaxAmount] = useState(2500);
  const [stpMaxFraud, setStpMaxFraud] = useState(15);
  const [stpMinConfidence, setStpMinConfidence] = useState(0.85);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = ClaimsApiService.getLocalSettings();
      setApiKey(current.openrouter_api_key || "");
      setVisionModel(current.vision_model || "google/gemini-2.0-flash-exp:free");
      setReasoningModel(current.reasoning_model || "openai/gpt-oss-20b:free");
      setOrchestrationEngine(current.orchestration_engine || "native");
      setStpMaxAmount(current.stp_max_amount || 2500);
      setStpMaxFraud(current.stp_max_fraud_score || 15);
      setStpMinConfidence(current.stp_min_confidence || 0.85);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AppSettings = {
      openrouter_base_url: "https://openrouter.ai/api/v1",
      has_openrouter_key: Boolean(apiKey.trim()),
      openrouter_api_key: apiKey.trim(),
      vision_model: visionModel,
      reasoning_model: reasoningModel,
      orchestration_engine: orchestrationEngine,
      stp_max_amount: Number(stpMaxAmount),
      stp_max_fraud_score: Number(stpMaxFraud),
      stp_min_confidence: Number(stpMinConfidence)
    };

    ClaimsApiService.saveLocalSettings(updated);
    onSettingsSaved(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="settings-dialog-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0E121A] rounded-2xl border border-white/[0.1] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#121622]">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-blue-400" aria-hidden="true" />
            <div>
              <h3 id="settings-dialog-title" className="font-semibold text-white text-sm font-display">System & Engine Configuration</h3>
              <p className="text-xs text-slate-400">Configure LLM routing, dual-engine runtime, and STP guardrails</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#1C2230] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          
          {/* Orchestration Engine Toggle */}
          <div className="space-y-1.5">
            <label className="font-medium text-slate-300 flex items-center gap-1.5">
              <Workflow className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" /> Orchestration Engine Runtime
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#080A0E] p-1 rounded-lg border border-white/[0.08]">
              <button
                type="button"
                onClick={() => setOrchestrationEngine("native")}
                className={`py-2 px-3 rounded-md text-xs font-medium transition flex flex-col items-start gap-0.5 ${
                  orchestrationEngine === "native"
                    ? "bg-blue-600/20 text-blue-300 border border-blue-500/40"
                    : "text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
              >
                <span className="font-semibold">Native StateGraph</span>
                <span className="text-[10px] text-slate-500 font-normal">Ultra-fast direct pipeline</span>
              </button>
              <button
                type="button"
                onClick={() => setOrchestrationEngine("langgraph")}
                className={`py-2 px-3 rounded-md text-xs font-medium transition flex flex-col items-start gap-0.5 ${
                  orchestrationEngine === "langgraph"
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/40"
                    : "text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
              >
                <span className="font-semibold">LangGraph Official</span>
                <span className="text-[10px] text-slate-500 font-normal">Compiled StateGraph engine</span>
              </button>
            </div>
          </div>

          {/* OpenRouter API Key Input */}
          <div className="space-y-1">
            <label htmlFor="settings-api-key" className="font-medium text-slate-300 flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" /> OpenRouter API Key
            </label>
            <input
              id="settings-api-key"
              name="openrouter_api_key"
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder="sk-or-v1-…"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-[#080A0E] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 font-mono"
            />
            <p className="text-[11px] text-slate-500">
              Connected key enables live model inference via OpenRouter API.
            </p>
          </div>

          {/* Model Selection Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label htmlFor="settings-vision-model" className="font-medium text-slate-300 flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" /> Vision / OCR Model
              </label>
              <select
                id="settings-vision-model"
                name="vision_model"
                value={visionModel}
                onChange={(e) => setVisionModel(e.target.value)}
                className="w-full bg-[#080A0E] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 font-mono"
              >
                <option value="google/gemini-2.0-flash-exp:free">google/gemini-2.0-flash-exp:free (Fast & Free)</option>
                <option value="google/gemini-2.5-flash">google/gemini-2.5-flash</option>
                <option value="google/gemini-2.5-pro">google/gemini-2.5-pro</option>
                <option value="anthropic/claude-3.5-haiku">anthropic/claude-3.5-haiku</option>
                <option value="openai/gpt-4o-mini">openai/gpt-4o-mini</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="settings-reasoning-model" className="font-medium text-slate-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" /> Reasoning Model
              </label>
              <select
                id="settings-reasoning-model"
                name="reasoning_model"
                value={reasoningModel}
                onChange={(e) => setReasoningModel(e.target.value)}
                className="w-full bg-[#080A0E] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 font-mono"
              >
                <option value="openai/gpt-oss-20b:free">openai/gpt-oss-20b:free (Active Free Model)</option>
                <option value="google/gemini-2.0-flash-exp:free">google/gemini-2.0-flash-exp:free</option>
                <option value="meta-llama/llama-3.3-70b-instruct:free">meta-llama/llama-3.3-70b-instruct:free</option>
                <option value="google/gemini-2.5-flash">google/gemini-2.5-flash</option>
                <option value="anthropic/claude-3.7-sonnet">anthropic/claude-3.7-sonnet</option>
              </select>
            </div>
          </div>

          {/* Straight-Through Processing (STP) Guardrails */}
          <div className="pt-3 border-t border-white/[0.06] space-y-2.5">
            <div className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" /> Autonomous STP Guardrails
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="settings-stp-amount" className="text-[11px] text-slate-400">Max Auto-Approval Limit ($)</label>
                <input
                  id="settings-stp-amount"
                  name="stp_max_amount"
                  type="number"
                  value={stpMaxAmount}
                  onChange={(e) => setStpMaxAmount(parseFloat(e.target.value))}
                  className="w-full bg-[#080A0E] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="settings-stp-fraud" className="text-[11px] text-slate-400">Max Risk Threshold (/100)</label>
                <input
                  id="settings-stp-fraud"
                  name="stp_max_fraud"
                  type="number"
                  value={stpMaxFraud}
                  onChange={(e) => setStpMaxFraud(parseFloat(e.target.value))}
                  className="w-full bg-[#080A0E] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-[#161B26] hover:bg-[#1E2433] text-slate-300 rounded-lg text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {savedSuccess ? <Check className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" /> : null}
              {savedSuccess ? "Saved Successfully" : "Save Settings"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
