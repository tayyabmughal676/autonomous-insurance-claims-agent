import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "./components/Navbar";
import { ClaimsQueue } from "./components/ClaimsQueue";
import { AdjusterWorkbench } from "./components/AdjusterWorkbench";
import { LetterModal } from "./components/LetterModal";
import { SettingsModal } from "./components/SettingsModal";
import { NewClaimModal } from "./components/NewClaimModal";
import { ClaimsApiService } from "./services/api";
import { Claim, InsuranceLine, ClaimProcessingState, ClaimLineItem } from "./types/claim";

export const App: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedLine, setSelectedLine] = useState<InsuranceLine | "ALL">("ALL");
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [processingState, setProcessingState] = useState<ClaimProcessingState | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [environment, setEnvironment] = useState<"SANDBOX" | "PRODUCTION">("SANDBOX");

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewClaimOpen, setIsNewClaimOpen] = useState(false);
  const [letterModalData, setLetterModalData] = useState<{
    isOpen: boolean;
    title: string;
    content: string;
    onDownloadPdf?: () => void;
  }>({
    isOpen: false,
    title: "",
    content: "",
    onDownloadPdf: undefined
  });

  const handleSelectClaim = useCallback(async (claim: Claim) => {
    setSelectedClaim(claim);
    const detail = await ClaimsApiService.getClaimDetail(claim.id);
    if (detail.processing_state) {
      setProcessingState(detail.processing_state);
    } else {
      setProcessingState(undefined);
    }
  }, []);

  const loadClaims = useCallback(async () => {
    const list = await ClaimsApiService.getClaims(selectedLine === "ALL" ? undefined : selectedLine);
    setClaims(list);
    if (list.length > 0) {
      setSelectedClaim((prev) => {
        if (!prev || !list.some(c => c.id === prev.id)) {
          handleSelectClaim(list[0]);
          return list[0];
        }
        return prev;
      });
    }
  }, [selectedLine, handleSelectClaim]);

  // Load claims on mount & line change
  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  const handleRunAgent = async (claimId: string) => {
    setIsProcessing(true);
    try {
      const state = await ClaimsApiService.processClaimWithAgent(claimId);
      setProcessingState(state);
      if (selectedClaim && selectedClaim.id === claimId) {
        setSelectedClaim(state.claim);
      }
      // Refresh list
      const list = await ClaimsApiService.getClaims(selectedLine === "ALL" ? undefined : selectedLine);
      setClaims(list);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAdjudicate = async (action: "APPROVE" | "DENY" | "REQUEST_INFO", customItems?: ClaimLineItem[], notes?: string) => {
    if (!selectedClaim) return;
    setIsProcessing(true);
    try {
      const res = await ClaimsApiService.adjudicateClaim(selectedClaim.id, action, customItems, notes);
      setLetterModalData({
        isOpen: true,
        title: action === "APPROVE" ? "Statement of Settlement & EOB" : action === "DENY" ? "Notice of Claim Declination" : "Request for Information",
        content: res.settlement_letter || res.denial_letter || res.rfi_letter || "",
        onDownloadPdf: action === "APPROVE"
          ? () => ClaimsApiService.downloadSettlementPdf(selectedClaim.id, selectedClaim.claim_number)
          : action === "DENY"
          ? () => ClaimsApiService.downloadDenialPdf(selectedClaim.id, selectedClaim.claim_number)
          : undefined
      });
      // Refresh claim
      const detail = await ClaimsApiService.getClaimDetail(selectedClaim.id);
      setSelectedClaim(detail.claim);
      if (detail.processing_state) setProcessingState(detail.processing_state);
      const list = await ClaimsApiService.getClaims(selectedLine === "ALL" ? undefined : selectedLine);
      setClaims(list);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetClaims = async () => {
    await ClaimsApiService.resetClaims();
    await loadClaims();
  };

  const handleClaimCreated = async (newClaim: Claim) => {
    const created = await ClaimsApiService.createClaim(newClaim);
    await loadClaims();
    handleSelectClaim(created);
    // Auto-run agent on newly created claim
    handleRunAgent(created.id);
  };

  const handleUpdateClaimLineItems = (items: ClaimLineItem[]) => {
    if (!selectedClaim) return;
    const updated = { ...selectedClaim, line_items: items };
    setSelectedClaim(updated);
  };

  return (
    <div className="min-h-screen bg-[#090B10] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Clean Minimal Header */}
      <Navbar
        selectedLine={selectedLine}
        onSelectLine={setSelectedLine}
        claims={claims}
        environment={environment}
        onToggleEnvironment={setEnvironment}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNewClaim={() => setIsNewClaimOpen(true)}
        onResetClaims={handleResetClaims}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-5 flex flex-col md:flex-row gap-4 overflow-hidden">
        
        {/* Left: Claims Queue */}
        <ClaimsQueue
          claims={claims}
          selectedClaimId={selectedClaim?.id || null}
          onSelectClaim={handleSelectClaim}
          selectedLine={selectedLine}
        />

        {/* Right: Adjuster Workbench */}
        {selectedClaim ? (
          <AdjusterWorkbench
            claim={selectedClaim}
            processingState={processingState}
            isProcessing={isProcessing}
            onRunAgent={handleRunAgent}
            onAdjudicate={handleAdjudicate}
            onViewLetter={(title, content, onPdf) => setLetterModalData({ isOpen: true, title, content, onDownloadPdf: onPdf })}
            onUpdateClaimLineItems={handleUpdateClaimLineItems}
            onDownloadSettlementPdf={(id, num) => ClaimsApiService.downloadSettlementPdf(id, num)}
            onDownloadDenialPdf={(id, num) => ClaimsApiService.downloadDenialPdf(id, num)}
          />
        ) : (
          <div className="flex-1 bg-[#0E121A] rounded-xl border border-white/[0.08] flex items-center justify-center text-slate-500 text-xs">
            Select a claim from the queue to open the adjudication workbench.
          </div>
        )}

      </main>

      {/* Modals */}
      <LetterModal
        isOpen={letterModalData.isOpen}
        onClose={() => setLetterModalData({ ...letterModalData, isOpen: false })}
        title={letterModalData.title}
        letterContent={letterModalData.content}
        onDownloadPdf={letterModalData.onDownloadPdf}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsSaved={() => {}}
      />

      <NewClaimModal
        isOpen={isNewClaimOpen}
        onClose={() => setIsNewClaimOpen(false)}
        onClaimCreated={handleClaimCreated}
      />

    </div>
  );
};

export default App;
