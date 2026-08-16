import React, { useState } from "react";
import { X, Plus, Upload, Car, Home, HeartPulse, FileText } from "lucide-react";
import { Claim, InsuranceLine } from "../types/claim";

interface NewClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimCreated: (createdClaim: Claim) => void;
}

export const NewClaimModal: React.FC<NewClaimModalProps> = ({
  isOpen,
  onClose,
  onClaimCreated
}) => {
  const [line, setLine] = useState<InsuranceLine>("AUTO");
  const [claimantName, setClaimantName] = useState("Sarah Jenkins");
  const [incidentDate, setIncidentDate] = useState("2026-08-14");
  const [location, setLocation] = useState("San Jose, CA");
  const [amount, setAmount] = useState<number>(1850);
  const [description, setDescription] = useState("Low speed rear collision in heavy traffic. Bumper cover cracked and sensor detached.");
  const [fileName, setFileName] = useState("SanJose_BodyShop_RepairOrder.pdf");

  if (!isOpen) return null;

  const handleApplyPreset = (presetLine: InsuranceLine) => {
    setLine(presetLine);
    if (presetLine === "AUTO") {
      setClaimantName("Sarah Jenkins");
      setIncidentDate("2026-08-14");
      setLocation("San Jose, CA");
      setAmount(1850);
      setDescription("Vehicle struck parked pillar in parking garage. Passenger front quarter panel and headlight assembly crushed.");
      setFileName("GarageCollision_Estimate_4421.pdf");
    } else if (presetLine === "PROPERTY") {
      setClaimantName("Robert Taylor");
      setIncidentDate("2026-08-12");
      setLocation("Austin, TX");
      setAmount(4200);
      setDescription("Second-floor bathroom supply line burst overnight, causing localized ceiling water damage in kitchen.");
      setFileName("PlumbingRepair_Quote_8812.pdf");
    } else {
      setClaimantName("Emily Watson");
      setIncidentDate("2026-08-11");
      setLocation("Boston, MA");
      setAmount(3400);
      setDescription("Urgent care evaluation and X-rays following wrist fracture from sports injury.");
      setFileName("MassGeneral_UrgentCare_Bill.pdf");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const policyId = line === "AUTO" ? "POL-AUTO-GOLD-001" : line === "PROPERTY" ? "POL-PROP-HO3-002" : "POL-HLTH-PPO-003";

    const newClaim: Claim = {
      id: `clm-${line.toLowerCase()}-${Date.now().toString().slice(-6)}`,
      claim_number: `CLM-2026-${line}-${Math.floor(1000 + Math.random() * 9000)}`,
      policy_id: policyId,
      claimant_name: claimantName,
      claimant_id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      insurance_line: line,
      incident_date: incidentDate,
      submission_date: "2026-08-16",
      incident_location: location,
      description: description,
      total_claimed_amount: Number(amount),
      status: "SUBMITTED",
      documents: [
        {
          id: `doc-${Date.now()}`,
          name: fileName,
          doc_type: line === "HEALTH" ? "HOSPITAL_BILL" : line === "PROPERTY" ? "CONTRACTOR_QUOTE" : "REPAIR_ESTIMATE",
          extracted_text: description,
          bounding_boxes: [
            { label: "Claimed Total", text: `$${amount.toLocaleString()}`, confidence: 0.98, box_2d: [700, 600, 750, 850] }
          ],
          forensic_flags: []
        }
      ],
      line_items: [
        {
          id: `line-${Date.now()}-1`,
          description: line === "AUTO" ? "Quarter Panel Replacement" : line === "PROPERTY" ? "Ceiling Drywall & Insulation Patch" : "Urgent Care Specialist Visit",
          category: line === "AUTO" ? "PARTS" : line === "PROPERTY" ? "STRUCTURE" : "FACILITY",
          claimed_amount: Number(amount) * 0.6,
          allowed_amount: Number(amount) * 0.6,
          benchmark_amount: Number(amount) * 0.6,
          is_covered: true
        },
        {
          id: `line-${Date.now()}-2`,
          description: line === "AUTO" ? "Body Labor & Paint Refinish" : line === "PROPERTY" ? "Plumbing Fitting & Clean-Up" : "Diagnostic Digital X-Ray",
          category: line === "AUTO" ? "LABOR" : line === "PROPERTY" ? "STRUCTURE" : "RADIOLOGY",
          claimed_amount: Number(amount) * 0.4,
          allowed_amount: Number(amount) * 0.4,
          benchmark_amount: Number(amount) * 0.4,
          is_covered: true
        }
      ]
    };

    onClaimCreated(newClaim);
    onClose();
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="new-claim-dialog-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-[#0E121A] rounded-2xl border border-white/[0.1] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#121622]">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-blue-400" aria-hidden="true" />
            <div>
              <h3 id="new-claim-dialog-title" className="font-semibold text-white text-sm font-display">Submit New Claim File</h3>
              <p className="text-xs text-slate-400">Ingest loss records and trigger autonomous multi-agent adjudication</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close intake modal"
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#1C2230] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="p-4 bg-[#090B10] border-b border-white/[0.06] space-y-2">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Instant Scenario Templates
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleApplyPreset("AUTO")}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                line === "AUTO" ? "bg-[#1C2230] border-blue-500/50 text-white" : "bg-[#0E121A] border-white/[0.06] text-slate-400 hover:text-slate-200"
              }`}
            >
              <Car className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" /> Auto Collision
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset("PROPERTY")}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                line === "PROPERTY" ? "bg-[#1C2230] border-amber-500/50 text-white" : "bg-[#0E121A] border-white/[0.06] text-slate-400 hover:text-slate-200"
              }`}
            >
              <Home className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" /> Property Loss
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset("HEALTH")}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                line === "HEALTH" ? "bg-[#1C2230] border-rose-500/50 text-white" : "bg-[#0E121A] border-white/[0.06] text-slate-400 hover:text-slate-200"
              }`}
            >
              <HeartPulse className="h-3.5 w-3.5 text-rose-400" aria-hidden="true" /> Health PPO
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="claimant-name-input" className="font-medium text-slate-300">Insured Name</label>
              <input
                id="claimant-name-input"
                name="claimant_name"
                type="text"
                autoComplete="name"
                value={claimantName}
                onChange={(e) => setClaimantName(e.target.value)}
                className="w-full bg-[#080A0E] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 font-sans"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="claimed-amount-input" className="font-medium text-slate-300">Total Claimed Amount ($)</label>
              <input
                id="claimed-amount-input"
                name="total_claimed_amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
                className="w-full bg-[#080A0E] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-slate-200 font-mono tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="incident-date-input" className="font-medium text-slate-300">Date of Incident</label>
              <input
                id="incident-date-input"
                name="incident_date"
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="w-full bg-[#080A0E] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-slate-200 font-mono tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="incident-location-input" className="font-medium text-slate-300">Incident Location</label>
              <input
                id="incident-location-input"
                name="incident_location"
                type="text"
                autoComplete="off"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#080A0E] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="claim-description-input" className="font-medium text-slate-300">Narrative & Damage Summary</label>
            <textarea
              id="claim-description-input"
              name="description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#080A0E] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 leading-normal"
              required
            />
          </div>

          {/* Attachment Preview Box */}
          <div className="p-3 rounded-xl bg-[#080A0E] border border-dashed border-white/[0.1] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-400" aria-hidden="true" />
              <div>
                <div className="font-medium text-slate-200 text-xs">{fileName}</div>
                <div className="text-[10px] text-slate-500">Loss documentation payload</div>
              </div>
            </div>
            <button
              type="button"
              aria-label="Upload custom loss documentation"
              className="px-2.5 py-1 rounded bg-[#161B26] hover:bg-[#1E2433] text-slate-300 text-[11px] flex items-center gap-1 border border-white/[0.06] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Upload className="h-3 w-3" aria-hidden="true" /> Select File
            </button>
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
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Ingest & Process Claim
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
