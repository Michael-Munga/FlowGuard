"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppSidebar } from "@/components/CommandCentre/Shell/AppSidebar";
import { DepotContextBar } from "./Header/DepotContextBar";
import { DepotSubNav } from "./Nav/DepotSubNav";
import { DepotKpiStrip } from "./Kpis/DepotKpiStrip";
import { BottleneckDiagnosisHero } from "./Bottleneck/BottleneckDiagnosisHero";
import { StageFlow } from "./Stage/StageFlow";
import { FlowGuardActionCard } from "./Action/FlowGuardActionCard";
import { Next90MinutesForecast } from "./Forecast/Next90MinutesForecast";
import { CapacityBoard } from "./Capacity/CapacityBoard";
import { YardTruckBoard } from "./Yard/YardTruckBoard";
import { EquipmentStatePanel } from "./Equipment/EquipmentStatePanel";
import { DepotEventStream } from "./Events/DepotEventStream";
import { TruckDetailDrawer } from "./Drawer/TruckDetailDrawer";
import { LiveToasts } from "./LiveToasts";
import { DepotTwin3D } from "./Twin/DepotTwin3D";
import { DepotOverviewTiles } from "./Overview/DepotOverviewTiles";
import { EventsFullView } from "./Events/EventsFullView";
import { useDepotOperationsData, DepotSubView } from "@/hooks/useDepotOperationsData";
import { useRole } from "@/context/RoleContext";
import { DepotId, YardTruck } from "@/types/flowguard";
import { Lock } from "lucide-react";

interface DepotOperationsViewProps {
  subView: DepotSubView;
  initialDepotId?: DepotId;
  onNavigateDashboard?: (id: string) => void;
}

const fmtKes2 = (n: number) =>
  `KES ${n.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const DepotOperationsView: React.FC<DepotOperationsViewProps> = ({
  subView,
  initialDepotId,
  onNavigateDashboard,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedDepotId, setSelectedDepotId } = useRole();

  const urlDepot = (searchParams.get("depot") as DepotId) || undefined;
  const effectiveInitialDepotId: DepotId =
    urlDepot || initialDepotId || selectedDepotId || "nairobi";

  const {
    activeDepotId,
    setActiveDepotId,
    depot,
    allDepots,
    kpiSummary,
    yardTrucks,
    capacityState,
    equipmentState,
    bottleneck,
    forecast,
    activeIntervention,
    depotEvents,
    health,
    isLiveActive,
    isSyncing,
    demurragePreventedKes,
    refresh,
    approveIntervention,
    executeIntervention,
    toggleDegradedMode,
    toggleLiveStream,
    forceCrisis,
  } = useDepotOperationsData(effectiveInitialDepotId);

  const handleDepotChange = (depotId: DepotId) => {
    setActiveDepotId(depotId);
    setSelectedDepotId(depotId);
  };

  useEffect(() => {
    if (selectedDepotId && selectedDepotId !== activeDepotId) {
      setActiveDepotId(selectedDepotId);
    }
  }, [selectedDepotId, activeDepotId, setActiveDepotId]);

  const [selectedTruck, setSelectedTruck] = useState<YardTruck | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [stageFilter, setStageFilter] = useState<string>("ALL");

  const handleSelectTruck = (truck: YardTruck) => {
    setSelectedTruck(truck);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => setIsDrawerOpen(false);

  const handleAuthorizeIntervention = async (interventionId: string) => {
    await approveIntervention(interventionId);
    if (selectedTruck && selectedTruck.actionDetail) {
      setSelectedTruck({
        ...selectedTruck,
        riskStatus: "GREEN",
        riskLabel: "Authorized: Fast-track dual-arm active",
        flowGuardStatus: "EXECUTED",
        actionDetail: {
          ...selectedTruck.actionDetail,
          actionStatus: "AUTO-EXECUTED",
          approvalState: "AUTO",
        },
      });
    }
  };

  const recentEventCount = depotEvents.filter((e) => e.severity !== "info").length;

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-[#0F1B2B] flex flex-col antialiased">
      <AppSidebar
        activeDashboard="depot-operations"
        onSelectDashboard={onNavigateDashboard}
        activeInterventionsCount={activeIntervention ? 1 : 0}
      />

      <div className="ml-[240px] flex-1 flex flex-col min-w-0">
        <DepotContextBar
          depot={depot}
          allDepots={allDepots}
          onSelectDepot={handleDepotChange}
          health={health}
          isSyncing={isSyncing}
          onRefresh={refresh}
          onToggleDegradedMode={toggleDegradedMode}
          isLiveActive={isLiveActive}
          onToggleLive={toggleLiveStream}
          demurragePreventedKes={demurragePreventedKes}
          onForceCrisis={forceCrisis}
        />

        <DepotSubNav activeDepotId={activeDepotId} activeEventsCount={recentEventCount} />

        <main className="flex-1 flex flex-col space-y-4 py-5 pb-12">
          {/* OVERVIEW */}
          {subView === "overview" && (
            <>
              <DepotKpiStrip summary={kpiSummary} />
              <div className="px-6">
                <DepotOverviewTiles
                  depot={depot}
                  kpi={kpiSummary}
                  capacity={capacityState}
                  equipment={equipmentState}
                  bottleneck={bottleneck}
                  demurragePreventedKes={demurragePreventedKes}
                />
              </div>
            </>
          )}

          {/* LIVE YARD — 3D twin + bottleneck + stage flow + yard board + action/events */}
          {subView === "live" && (
            <>
              <div className="px-6">
                <DepotTwin3D trucks={yardTrucks} capacity={capacityState} height={420} />
              </div>

              <div className="px-6">
                <BottleneckDiagnosisHero bottleneck={bottleneck} />
              </div>

              <div className="px-6">
                <StageFlow
                  trucks={yardTrucks}
                  expectedArrivalCount={depot.expectedDemandNext90Min}
                  selectedStage={stageFilter}
                  onSelectStage={setStageFilter}
                />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 px-6 items-start">
                <div className="xl:col-span-7">
                  <FlowGuardActionCard
                    intervention={activeIntervention}
                    onApprove={approveIntervention}
                    onExecute={executeIntervention}
                    depotName={depot.name}
                  />
                </div>
                <div className="xl:col-span-5">
                  <DepotEventStream events={depotEvents} depotName={depot.name} />
                </div>
              </div>

              <div className="px-6">
                <YardTruckBoard
                  trucks={yardTrucks}
                  onSelectTruck={handleSelectTruck}
                  selectedTruckId={selectedTruck?.id}
                />
              </div>
            </>
          )}

          {/* CAPACITY */}
          {subView === "capacity" && (
            <>
              <div className="px-6">
                <CapacityBoard capacityState={capacityState} />
              </div>
              <div className="px-6">
                <EquipmentStatePanel equipmentState={equipmentState} />
              </div>
            </>
          )}

          {/* FORECAST */}
          {subView === "forecast" && (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 px-6 items-start">
                <div className="xl:col-span-7">
                  <Next90MinutesForecast forecast={forecast} depotName={depot.name} />
                </div>
                <div className="xl:col-span-5 h-full">
                  <FlowGuardActionCard
                    intervention={activeIntervention}
                    onApprove={approveIntervention}
                    onExecute={executeIntervention}
                    depotName={depot.name}
                  />
                </div>
              </div>
              <div className="px-6">
                <BottleneckDiagnosisHero bottleneck={bottleneck} />
              </div>
            </>
          )}

          {/* EVENTS */}
          {subView === "events" && (
            <div className="px-6">
              <EventsFullView events={depotEvents} depotName={depot.name} />
            </div>
          )}
        </main>

        <footer className="bg-white border-t border-[#E2E6EA] px-6 py-2 text-[11px] text-[#5C6B7A] flex flex-wrap items-center justify-between gap-y-2 select-none">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1B7A3D]" />
              <span className="font-semibold text-[#0F1B2B]">Depot Automation:</span>
              <span className="font-mono text-[#0F1B2B]">
                TAS & SCADA Telemetry Active (Simulated)
              </span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1B7A3D]" />
              <span className="font-semibold text-[#0F1B2B]">Demurrage prevented:</span>
              <span className="font-mono text-[#1B7A3D] font-bold">
                {fmtKes2(demurragePreventedKes)}
              </span>
            </div>
            <span className="text-slate-300 hidden md:inline">|</span>
            <div className="hidden md:flex items-center gap-1.5">
              <span className="font-semibold text-[#0F1B2B]">Gantry:</span>
              <span className="font-mono text-[#1B7A3D] font-bold">
                {capacityState.usableNow}/{capacityState.totalPhysicalPositions} usable
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[10px]">
            <span className="text-[#8492A6] uppercase tracking-wider hidden lg:inline">
              KENYA PIPELINE COMPANY LTD © FLOWGUARD CONTROL PLANE
            </span>
            <span className="text-slate-300 hidden lg:inline">|</span>
            <div className="flex items-center gap-1 text-[#0F1B2B] font-mono font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              <Lock className="w-2.5 h-2.5 text-[#1B7A3D]" />
              <span>TERMINAL: {depot.code}</span>
            </div>
          </div>
        </footer>
      </div>

      <TruckDetailDrawer
        truck={selectedTruck}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onAuthorizeAction={handleAuthorizeIntervention}
      />

      <LiveToasts events={depotEvents} />
    </div>
  );
};