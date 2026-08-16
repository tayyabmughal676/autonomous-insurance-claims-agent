import React, { useState } from "react";
import { X, Copy, Check, FileText, Download, FileDown } from "lucide-react";

interface LetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  letterContent: string;
  onDownloadPdf?: () => void;
}

export const LetterModal: React.FC<LetterModalProps> = ({
  isOpen,
  onClose,
  title,
  letterContent,
  onDownloadPdf
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(letterContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([letterContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `claim_letter_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="letter-dialog-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-[#0E121A] rounded-2xl border border-white/[0.1] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#121622]">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-400" aria-hidden="true" />
            <h3 id="letter-dialog-title" className="font-semibold text-white text-sm">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close letter preview"
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#1C2230] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Letter Preview Body */}
        <div className="flex-1 overflow-y-auto p-5 bg-[#090B10]">
          <div className="p-5 rounded-xl bg-[#0E121A] border border-white/[0.06] whitespace-pre-wrap font-mono text-xs text-slate-200 leading-relaxed">
            {letterContent}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-white/[0.08] bg-[#121622] flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Compliant legal notice with exact policy clause citations.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-[#1A2030] hover:bg-[#222A3E] text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-white/[0.08] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy Markdown"}
            </button>
            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="px-3 py-1.5 rounded-lg bg-[#1A2030] hover:bg-[#222A3E] text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-white/[0.08] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" /> Download MD
            </button>
            {onDownloadPdf && (
              <button
                type="button"
                onClick={onDownloadPdf}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <FileDown className="h-3.5 w-3.5" aria-hidden="true" /> Download Official PDF
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
