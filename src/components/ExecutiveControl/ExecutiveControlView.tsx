"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/CommandCentre/Shell/AppSidebar";
import { useExecutiveData } from "@/hooks/useExecutiveData";
import { ExecutiveHeader } from "./Header/ExecutiveHeader";
import { ExecutiveKpiStrip } from "./Kpis/ExecutiveKpiStrip";
import { TurnaroundImpactHero } from "./Hero/TurnaroundImpactHero";
import { ValueWaterfallSection } from "./Breakdown/ValueWaterfallSection";
import { DepotPerformanceTable } from "./Depots/DepotPerformanceTable";
import { ExecutiveAutonomyCard } from "./Autonomy/ExecutiveAutonomyCard";
import { ExecutiveRiskView } from "./Risk/ExecutiveRiskView";
import { RoiBusinessCaseCard } from "./Roi/RoiBusinessCaseCard";
import { DeploymentReadinessPanel } from "./Readiness/DeploymentReadinessPanel";
import { MetricDefinitionModal } from "./Modals/MetricDefinitionModal";
import { useDataSource } from "@/context/DataSourceContext";
import { ApiUnavailableCard } from "@/components/shared/ApiUnavailableCard";
import { ShieldCheck, Lock, Award, TrendingUp } from "lucide-react";

interface ExecutiveControlViewProps {
  subView?: "all" | "overview" | "performance" | "value";
  onNavigateDashboard?: (id: string) => void;
}

export const ExecutiveControlView: React.FC<ExecutiveControlViewProps> = ({
  subView = "all",
  onNavigateDashboard,
}) => {
  const { dataMode, isApiConnected, isApiLoading } = useDataSource();
  const {
    kpis,
    trend,
    depotPerformances,
    filteredDepots,
    waterfall,
    bottlenecks,
    funnel,
    riskSummary,
    roiScenarios,
    activeScenario,
    setActiveScenario,
    currentRoi,
    readiness,
    trustHealth,
    alerts,
    selectedDepotId,
    setSelectedDepotId,
    timePeriod,
    setTimePeriod,
    refresh,
  } = useExecutiveData();

  const [isDefinitionModalOpen, setIsDefinitionModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#FAFBFC] text-[#0F1B2B]">
      {/* Fixed Sidebar */}
      <AppSidebar
        activeDashboard="executive-control"
        onSelectDashboard={onNavigateDashboard}
        activeInterventionsCount={0}
      />

      {/* Main Content Area */}
      <main className="ml-[240px] flex-1 flex flex-col min-w-0">
        {/* Executive Header */}
        <ExecutiveHeader
          kpis={kpis}
          timePeriod={timePeriod}
          onTimePeriodChange={setTimePeriod}
          onOpenDefinitions={() => setIsDefinitionModalOpen(true)}
          onRefresh={refresh}
        />

        {/* Dashboard Body */}
        <div className="p-6 space-y-6 flex-1">
          {dataMode === "api" && !isApiConnected && !isApiLoading && (
            <ApiUnavailableCard onRetry={refresh} />
          )}

          {/* 1. Main Executive KPI Strip */}
          <ExecutiveKpiStrip
            kpis={kpis}
            onOpenDefinitions={() => setIsDefinitionModalOpen(true)}
          />

          {/* 2. Turnaround Impact Hero: Before vs After + Sustained Trajectory */}
          {(subView === "all" || subView === "overview" || subView === "performance") && (
            <TurnaroundImpactHero
              kpis={kpis}
              trend={trend}
            />
          )}

          {/* 3. 5-Depot Network Performance Table (Scorecard) */}
          {(subView === "all" || subView === "overview" || subView === "performance") && (
            <DepotPerformanceTable
              depots={depotPerformances}
              selectedDepotId={selectedDepotId}
              onSelectDepotId={setSelectedDepotId}
            />
          )}

          {/* 4. Value Protection Waterfall & Bottleneck Frequency */}
          {(subView === "all" || subView === "performance" || subView === "value") && (
            <ValueWaterfallSection
              waterfall={waterfall}
              bottlenecks={bottlenecks}
              totalProtectedKes={kpis?.totalExposureProtectedKes || 14820000}
            />
          )}

          {/* 5. Autonomy Governance Pipeline & Funnel */}
          {(subView === "all" || subView === "overview") && (
            <ExecutiveAutonomyCard
              funnel={funnel}
            />
          )}

          {/* 6. Financial Demurrage Accounting & Strategic Alerts */}
          {(subView === "all" || subView === "overview" || subView === "value") && (
            <ExecutiveRiskView
              riskSummary={riskSummary}
              alerts={alerts}
            />
          )}

          {/* 7. Economic Model & ROI Scenario Calculator */}
          {(subView === "all" || subView === "value") && (
            <RoiBusinessCaseCard
              currentRoi={currentRoi}
              activeScenario={activeScenario}
              onSelectScenario={setActiveScenario}
            />
          )}

          {/* 8. Production Architecture, Connection Adapters & Final Recommendation */}
          {(subView === "all" || subView === "overview" || subView === "value") && (
            <DeploymentReadinessPanel
              readiness={readiness}
              trustHealth={trustHealth}
              recommendation={kpis?.recommendation}
            />
          )}

          {/* Boardroom Footer */}
          <div className="p-4 rounded-lg bg-white border border-[#E2E6EA] text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>KPC FlowGuard Executive Control Plane (Boardroom View)</strong> • Demonstrating verified turnaround compression, demurrage risk mitigation, and capital payback.
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">
              Aggregated from verified closed-loop operations modeled on KPC terminal networks.
            </span>
          </div>
        </div>
      </main>

      {/* Metric Definitions & Standards Modal */}
      <MetricDefinitionModal
        isOpen={isDefinitionModalOpen}
        onClose={() => setIsDefinitionModalOpen(false)}
      />
    </div>
  );
};
