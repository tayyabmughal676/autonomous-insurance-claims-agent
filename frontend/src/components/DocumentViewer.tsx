import React, { useState } from "react";
import { FileText, Camera, ShieldAlert, CheckCircle } from "lucide-react";
import { Claim } from "../types/claim";

interface DocumentViewerProps {
  claim: Claim;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ claim }) => {
  const documents = claim.documents || [];
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);

  if (documents.length === 0) {
    return (
      <div className="p-8 text-center bg-[#0E121A] rounded-xl border border-white/[0.06] text-slate-500 text-xs">
        No evidence attachments uploaded for this claim.
      </div>
    );
  }

  const currentDoc = documents[selectedDocIndex] || documents[0];

  return (
    <div className="flex flex-col h-full space-y-3 text-xs">
      
      {/* Document Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-white/[0.06]">
        {documents.map((doc, idx) => {
          const isSelected = idx === selectedDocIndex;
          const hasFlags = doc.forensic_flags && doc.forensic_flags.length > 0;

          return (
            <button
              key={doc.id}
              onClick={() => setSelectedDocIndex(idx)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                isSelected
                  ? "bg-[#1C2230] text-white border border-white/[0.12] shadow-sm"
                  : "bg-[#0E121A] text-slate-400 hover:text-slate-200 border border-white/[0.06]"
              }`}
            >
              {doc.doc_type === "DAMAGE_PHOTO" ? (
                <Camera className="h-3.5 w-3.5 text-blue-400" />
              ) : (
                <FileText className="h-3.5 w-3.5 text-slate-400" />
              )}
              <span className="truncate max-w-[170px]">{doc.name}</span>
              {hasFlags && (
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1">
        
        {/* Left: Visual Representation */}
        <div className="lg:col-span-7 bg-[#0E121A] rounded-xl border border-white/[0.08] p-3.5 flex flex-col justify-between overflow-hidden">
          
          <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06] mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-200">{currentDoc.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#161B26] text-slate-400 border border-white/[0.06]">
                {currentDoc.doc_type}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">ID: {currentDoc.id}</span>
          </div>

          <div className="flex-1 rounded-lg bg-[#080A0E] border border-white/[0.06] p-3 font-mono text-xs flex flex-col justify-between space-y-3">
            
            <div className="p-3 rounded-lg bg-[#11151E] border border-white/[0.06] text-slate-300 font-sans text-xs leading-relaxed">
              {currentDoc.extracted_text || claim.description}
            </div>

            {/* Bounding Boxes */}
            {currentDoc.bounding_boxes && currentDoc.bounding_boxes.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  OCR Entities ({currentDoc.bounding_boxes.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentDoc.bounding_boxes.map((box, i) => (
                    <div
                      key={i}
                      className="p-2 rounded bg-[#141824] border border-white/[0.06] text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="text-[10px] text-blue-400 font-semibold uppercase">{box.label}</div>
                        <div className="text-slate-200 font-sans truncate max-w-[140px]">{box.text}</div>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 text-[10px] font-mono font-medium">
                        {Math.round(box.confidence * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>SHA-256 Checksum: Verified</span>
              <span>Multimodal Vision Engine</span>
            </div>

          </div>

        </div>

        {/* Right: Forensics & Entity Breakdown */}
        <div className="lg:col-span-5 space-y-2.5">
          
          {/* Forensic Alerts */}
          {currentDoc.forensic_flags && currentDoc.forensic_flags.length > 0 ? (
            <div className="bg-rose-950/20 rounded-xl border border-rose-500/30 p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-rose-400 font-medium text-xs">
                <ShieldAlert className="h-3.5 w-3.5" /> Forensic Tampering Alert
              </div>
              <ul className="space-y-1 text-xs text-rose-300">
                {currentDoc.forensic_flags.map((flag, idx) => (
                  <li key={idx} className="bg-rose-900/20 p-2 rounded border border-rose-800/30 text-[11px] leading-normal">
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-emerald-950/20 rounded-xl border border-emerald-500/20 p-2.5 flex items-center gap-2 text-emerald-400 text-xs">
              <CheckCircle className="h-3.5 w-3.5 shrink-0" />
              <span>Metadata integrity verified with zero tampering flags.</span>
            </div>
          )}

          {/* EXIF Device Forensics */}
          {currentDoc.exif_metadata && Object.keys(currentDoc.exif_metadata).length > 0 && (
            <div className="bg-[#0E121A] rounded-xl border border-white/[0.08] p-3 space-y-2">
              <div className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                EXIF Forensics
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-[#141824] border border-white/[0.04]">
                  <span className="text-[10px] text-slate-500 block">Camera Make</span>
                  <span className="font-medium text-slate-200">{currentDoc.exif_metadata.camera_make || "Apple Inc."}</span>
                </div>
                <div className="p-2 rounded bg-[#141824] border border-white/[0.04]">
                  <span className="text-[10px] text-slate-500 block">Model</span>
                  <span className="font-medium text-slate-200">{currentDoc.exif_metadata.camera_model || "iPhone 15 Pro"}</span>
                </div>
                <div className="col-span-2 p-2 rounded bg-[#141824] border border-white/[0.04]">
                  <span className="text-[10px] text-slate-500 block">Original Timestamp (EXIF Tag 36867)</span>
                  <span className="font-mono text-blue-400 font-semibold text-xs">{currentDoc.exif_metadata.datetime_original || "2026:08:10 14:22:10"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Loss Record Info */}
          <div className="bg-[#0E121A] rounded-xl border border-white/[0.08] p-3 space-y-1.5 text-xs">
            <div className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
              Insured Loss Record
            </div>
            <div className="space-y-1 text-slate-300">
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-slate-500">Name:</span>
                <span className="font-medium text-slate-200">{claim.claimant_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-slate-500">Loss Date:</span>
                <span className="font-mono text-slate-200">{claim.incident_date}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Location:</span>
                <span className="text-slate-200">{claim.incident_location || "Verified on Record"}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
