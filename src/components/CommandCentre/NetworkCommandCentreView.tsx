"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/CommandCentre/Shell/AppSidebar";
import { GlobalStatusBar } from "@/components/CommandCentre/Header/GlobalStatusBar";
import { NetworkKpiStrip } from "@/components/CommandCentre/Kpis/NetworkKpiStrip";
import { DepotNetworkOverview } from "@/components/CommandCentre/Depots/DepotNetworkOverview";
import { FuturePressureTimeline } from "@/components/CommandCentre/Timeline/FuturePressureTimeline";
import { AtRiskOperationsTable } from "@/components/CommandCentre/Risk/AtRiskOperationsTable";
import { RiskExplanationDrawer } from "@/components/CommandCentre/Risk/RiskExplanationDrawer";
import { ActiveInterventionsPanel } from "@/components/CommandCentre/Interventions/ActiveInterventionsPanel";
import { LiveEventStream } from "@/components/CommandCentre/Events/LiveEventStream";
import { DepotDrillDownModal } from "@/components/CommandCentre/Modals/DepotDrillDownModal";
import { useFlowGuardData } from "@/hooks/useFlowGuardData";
import { AtRiskOperation, Depot, DepotId } from "@/types/flowguard";
import { Lock } from "lucide-react";

interface NetworkCommandCentreViewProps {
  subView?: "overview" | "interventions" | "alerts";
  onNavigateDashboard?: (id: string) => void;
  onNavigateDepot?: (depotId: DepotId) => void;
}

export const NetworkCommandCentreView: React.FC<NetworkCommandCentreViewProps> = ({
  subView = "overview",
  onNavigateDashboard,
  onNavigateDepot,
}) => {
  const {
    kpis,
    depots,
    timeline,
    atRiskOps,
    interventions,
    events,
    health,
    isLiveActive,
    isSyncing,
    refresh,
    executeIntervention,
    approveIntervention,
    toggleDegradedMode,
    toggleLiveStream,
  } = useFlowGuardData();

  // Selection & Modal States
  const [selectedOperation, setSelectedOperation] = useState<AtRiskOperation | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDepot, setSelectedDepot] = useState<Depot | null>(null);
  const [isDepotModalOpen, setIsDepotModalOpen] = useState(false);

  // Handlers
  const handleOpenRiskExplanation = (op: AtRiskOperation) => {
    setSelectedOperation(op);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleOpenDepotDrillDown = (depot: Depot) => {
    setSelectedDepot(depot);
    setIsDepotModalOpen(true);
  };

  const handleCloseDepotModal = () => {
    setIsDepotModalOpen(false);
  };

  const handleDrillDownToDepotOperations = (depotId: DepotId) => {
    setIsDepotModalOpen(false);
    if (onNavigateDepot) {
      onNavigateDepot(depotId);
    } else if (onNavigateDashboard) {
      onNavigateDashboard("depot-operations");
    }
  };

  const handleExecuteRiskAction = (op: AtRiskOperation) => {
    const matched = interventions.find((i) => i.depotId === op.depotId);
    if (matched) {
      executeIntervention(matched.id);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-[#0F1B2B] flex flex-col antialiased">
      {/* 1. Global Shell Sidebar (delegates to role-specific rail) */}
      <AppSidebar
        activeDashboard="network-command"
        onSelectDashboard={onNavigateDashboard}
        activeInterventionsCount={kpis.activeInterventionsCount}
      />

      {/* 2. Main Content Area */}
      <div className="ml-[240px] flex-1 flex flex-col min-w-0">
        {/* Global Header & Status */}
        <GlobalStatusBar
          health={health}
          approvalRequiredCount={kpis.approvalRequiredCount}
          isSyncing={isSyncing}
          onRefresh={refresh}
          onToggleDegradedMode={toggleDegradedMode}
          isLiveActive={isLiveActive}
          onToggleLive={toggleLiveStream}
        />

        {/* Command Centre Body */}
        <main className="flex-1 flex flex-col space-y-4 pb-6">
          {/* Section 1: Network KPI Strip */}
          <NetworkKpiStrip kpis={kpis} />

          {/* Section 2: Future Pressure Timeline (The 120-Min Forecast Horizon) */}
          {(subView === "overview" || subView === "alerts") && (
            <div className="px-6">
              <FuturePressureTimeline
                timeline={timeline}
                depotName="Nairobi Terminal (PS10) Operational Bottleneck"
              />
            </div>
          )}

          {/* Section 3: Depot Network Overview (All 5 KPC Depots Prioritized by Risk) */}
          {subView === "overview" && (
            <div className="px-6">
              <DepotNetworkOverview
                depots={depots}
                onSelectDepot={handleOpenDepotDrillDown}
              />
            </div>
          )}

          {/* Section 4: Operational Core (At-Risk Orders Table + Autonomous Interventions & Events) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 px-6 items-start">
            {/* Left/Main Column: At-Risk Operations Table (~65% or full in alerts mode) */}
            <div className={`${subView === "alerts" ? "xl:col-span-12" : subView === "interventions" ? "xl:col-span-6" : "xl:col-span-8"} flex flex-col h-full`}>
              <AtRiskOperationsTable
                operations={atRiskOps}
                selectedOperationId={isDrawerOpen && selectedOperation ? selectedOperation.id : undefined}
                onSelectOperation={handleOpenRiskExplanation}
              />
            </div>

            {/* Right Column: Active Interventions & Live Telemetry Stream */}
            <div className={`${subView === "alerts" ? "hidden" : subView === "interventions" ? "xl:col-span-6" : "xl:col-span-4"} flex flex-col space-y-4`}>
              <ActiveInterventionsPanel
                interventions={interventions}
                onApproveIntervention={approveIntervention}
              />

              <LiveEventStream events={events} />
            </div>
          </div>
        </main>

        {/* 3. Control System Telemetry Footer Status Bar */}
        <footer className="bg-white border-t border-[#E2E6EA] px-6 py-2 text-[11px] text-[#5C6B7A] flex flex-wrap items-center justify-between gap-y-2 select-none">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1B7A3D]" />
              <span className="font-semibold text-[#0F1B2B]">Terminal Automation:</span>
              <span>TAS & SCADA Telemetry Active (Simulated)</span>
            </div>

            <span className="text-slate-300">|</span>

            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1B7A3D]" />
              <span className="font-semibold text-[#0F1B2B]">Optimization Loop:</span>
              <span>Active (0.8s cycle)</span>
            </div>

            <span className="text-slate-300 hidden md:inline">|</span>

            <div className="hidden md:flex items-center gap-1.5">
              <span className="font-semibold text-[#0F1B2B]">Data Integrity:</span>
              <span className="font-mono text-[#1B7A3D] font-bold">100% Synthetic Field Telemetry</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[10px]">
            <span className="text-[#8492A6] uppercase tracking-wider hidden lg:inline">
              KENYA PIPELINE COMPANY LTD © FLOWGUARD CONTROL PLANE
            </span>
            <span className="text-slate-300 hidden lg:inline">|</span>
            <div className="flex items-center gap-1 text-[#0F1B2B] font-mono font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              <Lock className="w-2.5 h-2.5 text-[#1B7A3D]" />
              <span>STN: EMB-88-HQ</span>
            </div>
          </div>
        </footer>
      </div>

      {/* 4. Explainable Risk Detail Drawer */}
      <RiskExplanationDrawer
        operation={selectedOperation}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onExecuteAction={handleExecuteRiskAction}
      />

      {/* 5. Depot Context Drill-Down Modal */}
      <DepotDrillDownModal
        depot={selectedDepot}
        isOpen={isDepotModalOpen}
        onClose={handleCloseDepotModal}
        onOpenDepotOperations={handleDrillDownToDepotOperations}
      />
    </div>
  );
};
