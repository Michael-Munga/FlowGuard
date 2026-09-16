"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/CommandCentre/Shell/AppSidebar";
import { DepotContextBar } from "./Header/DepotContextBar";
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
import { useDepotOperationsData } from "@/hooks/useDepotOperationsData";
import { useRole } from "@/context/RoleContext";
import { DepotId, YardTruck } from "@/types/flowguard";
import { useDataSource } from "@/context/DataSourceContext";
import { ApiUnavailableCard } from "@/components/shared/ApiUnavailableCard";
import { Lock, Fuel } from "lucide-react";

interface DepotOperationsViewProps {
  initialDepotId?: DepotId;
  subView?: "all" | "live" | "capacity" | "forecast";
  onNavigateDashboard?: (id: string) => void;
}

export const DepotOperationsView: React.FC<DepotOperationsViewProps> = ({
  initialDepotId = "nairobi",
  subView = "all",
  onNavigateDashboard,
}) => {
  const router = useRouter();
  const { selectedDepotId, setSelectedDepotId } = useRole();
  const { dataMode, isApiConnected, isApiLoading } = useDataSource();

  // Use the depot ID from props or role context
  const effectiveInitialDepotId = initialDepotId || selectedDepotId || "nairobi";

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
    refresh,
    approveIntervention,
    executeIntervention,
    toggleDegradedMode,
    toggleLiveStream,
  } = useDepotOperationsData(effectiveInitialDepotId);

  // Synchronize depot selection with role context
  const handleDepotChange = (depotId: DepotId) => {
    setActiveDepotId(depotId);
    setSelectedDepotId(depotId);
  };

  // Sync if selectedDepotId changes externally (e.g. from sidebar selector)
  useEffect(() => {
    if (selectedDepotId && selectedDepotId !== activeDepotId) {
      setActiveDepotId(selectedDepotId);
    }
  }, [selectedDepotId, activeDepotId, setActiveDepotId]);

  // Selected Truck Drawer state
  const [selectedTruck, setSelectedTruck] = useState<YardTruck | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [stageFilter, setStageFilter] = useState<string>("ALL");

  const handleSelectTruck = (truck: YardTruck) => {
    setSelectedTruck(truck);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

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

  // Subview navigation handler
  const handleSelectSubView = (targetSubView: "all" | "live" | "capacity" | "forecast") => {
    if (targetSubView === "live") {
      router.push(`/depot/live?depot=${activeDepotId}`);
    } else if (targetSubView === "capacity") {
      router.push(`/depot/capacity?depot=${activeDepotId}`);
    } else if (targetSubView === "forecast") {
      router.push(`/depot/forecast?depot=${activeDepotId}`);
    } else {
      router.push(`/operations/depot?depot=${activeDepotId}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-[#0F1B2B] flex flex-col antialiased">
      {/* 1. Global Shell Sidebar (delegates to role-specific rail) */}
      <AppSidebar
        activeDashboard="depot-operations"
        onSelectDashboard={onNavigateDashboard}
        activeInterventionsCount={activeIntervention ? 1 : 0}
      />

      {/* 2. Main Terminal Content Area */}
      <div className="ml-[240px] flex-1 flex flex-col min-w-0">
        {/* Depot Context Header Bar */}
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
          activeSubView={subView}
          onSelectSubView={handleSelectSubView}
        />

        {/* Depot Operations Body */}
        <main className="flex-1 flex flex-col space-y-4 py-4 pb-8">
          {dataMode === "api" && !isApiConnected && !isApiLoading && (
            <div className="px-6 pt-2">
              <ApiUnavailableCard onRetry={refresh} />
            </div>
          )}

          {/* Section 1: Standardized 6-Metric Depot KPI Strip */}
          <DepotKpiStrip summary={kpiSummary} />

          {/* ============================================================== */}
          {/* VIEW A: LIVE YARD (/depot/live) PRIMARY VIEW HIERARCHY        */}
          {/* Hierarchy: HEADER -> KPI -> BOTTLENECK -> STAGE FLOW ->       */}
          {/* TRUCK BOARD -> ACTIVE ACTION -> LIVE EVENTS                    */}
          {/* ============================================================== */}
          {subView === "live" && (
            <>
              {/* Bottleneck Hero */}
              <div className="px-6">
                <BottleneckDiagnosisHero bottleneck={bottleneck} />
              </div>

              {/* Stage Flow Pipeline */}
              <div className="px-6">
                <StageFlow
                  trucks={yardTrucks}
                  expectedArrivalCount={depot.expectedDemandNext90Min}
                  selectedStage={stageFilter}
                  onSelectStage={setStageFilter}
                />
              </div>

              {/* Central Active Truck / Collection Board */}
              <div className="px-6">
                <YardTruckBoard
                  trucks={yardTrucks}
                  onSelectTruck={handleSelectTruck}
                  selectedTruckId={selectedTruck?.id}
                />
              </div>

              {/* Active FlowGuard Action & Live Terminal Event Stream */}
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
            </>
          )}

          {/* ============================================================== */}
          {/* VIEW B: CAPACITY & EQUIPMENT (/depot/capacity) VIEW           */}
          {/* Hierarchy: HEADER -> KPI -> CAPACITY BOARD -> EQUIPMENT STATE */}
          {/* ============================================================== */}
          {subView === "capacity" && (
            <>
              {/* Capacity Board & Gantry Allocation */}
              <div className="px-6">
                <CapacityBoard capacityState={capacityState} />
              </div>

              {/* Equipment State & System Readiness */}
              <div className="px-6">
                <EquipmentStatePanel equipmentState={equipmentState} />
              </div>

              {/* Live Terminal Event Stream */}
              <div className="px-6">
                <DepotEventStream events={depotEvents} depotName={depot.name} />
              </div>
            </>
          )}

          {/* ============================================================== */}
          {/* VIEW C: FORECAST & ACTIONS (/depot/forecast) VIEW             */}
          {/* Hierarchy: HEADER -> KPI -> 90M FORECAST -> ACTION CARD ->    */}
          {/* BOTTLENECK DIAGNOSIS -> LIVE EVENTS                            */}
          {/* ============================================================== */}
          {subView === "forecast" && (
            <>
              {/* 90-Minute Predictive Horizon & Active FlowGuard Action */}
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

              {/* Causal Bottleneck Diagnosis Hero */}
              <div className="px-6">
                <BottleneckDiagnosisHero bottleneck={bottleneck} />
              </div>

              {/* Live Terminal Event Stream */}
              <div className="px-6">
                <DepotEventStream events={depotEvents} depotName={depot.name} />
              </div>
            </>
          )}

          {/* ============================================================== */}
          {/* VIEW D: ALL / COMPREHENSIVE VIEW (/operations/depot)           */}
          {/* ============================================================== */}
          {subView === "all" && (
            <>
              {/* Bottleneck Hero */}
              <div className="px-6">
                <BottleneckDiagnosisHero bottleneck={bottleneck} />
              </div>

              {/* Stage Flow Pipeline */}
              <div className="px-6">
                <StageFlow
                  trucks={yardTrucks}
                  expectedArrivalCount={depot.expectedDemandNext90Min}
                  selectedStage={stageFilter}
                  onSelectStage={setStageFilter}
                />
              </div>

              {/* 90-Min Predictive Horizon & Active FlowGuard Action */}
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

              {/* Gantry Capacity Board */}
              <div className="px-6">
                <CapacityBoard capacityState={capacityState} />
              </div>

              {/* Yard Active Truck Board */}
              <div className="px-6">
                <YardTruckBoard
                  trucks={yardTrucks}
                  onSelectTruck={handleSelectTruck}
                  selectedTruckId={selectedTruck?.id}
                />
              </div>

              {/* Equipment State Panel & Live Event Stream */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 px-6 items-start">
                <div className="xl:col-span-8">
                  <EquipmentStatePanel equipmentState={equipmentState} />
                </div>
                <div className="xl:col-span-4">
                  <DepotEventStream events={depotEvents} depotName={depot.name} />
                </div>
              </div>
            </>
          )}
        </main>

        {/* 3. Control System Telemetry Footer Bar */}
        <footer className="bg-white border-t border-[#E2E6EA] px-6 py-2 text-[11px] text-[#5C6B7A] flex flex-wrap items-center justify-between gap-y-2 select-none">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1B7A3D]" />
              <span className="font-semibold text-[#0F1B2B]">Depot Automation:</span>
              <span className="font-mono text-[#0F1B2B]">TAS & SCADA Telemetry Active (Simulated)</span>
            </div>

            <span className="text-slate-300">|</span>

            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1B7A3D]" />
              <span className="font-semibold text-[#0F1B2B]">Optimization Loop:</span>
              <span>Active (0.8s cycle)</span>
            </div>

            <span className="text-slate-300 hidden md:inline">|</span>

            <div className="hidden md:flex items-center gap-1.5">
              <span className="font-semibold text-[#0F1B2B]">Gantry Controller:</span>
              <span className="font-mono text-[#1B7A3D] font-bold">
                {capacityState.usableNow}/{capacityState.totalPhysicalPositions} Bays Usable
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

      {/* 4. Selected Truck Detail Drawer */}
      <TruckDetailDrawer
        truck={selectedTruck}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onAuthorizeAction={handleAuthorizeIntervention}
      />
    </div>
  );
};
