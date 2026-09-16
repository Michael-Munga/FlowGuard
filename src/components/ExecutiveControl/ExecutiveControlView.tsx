"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/CommandCentre/Shell/AppSidebar";
import { useExecutiveData } from "@/hooks/useExecutiveData";
import { ExecutiveHeader } from "./Header/ExecutiveHeader";
import { ExecutiveSubNav, ExecutiveSubView } from "./Nav/ExecutiveSubNav";
import { ExecutiveKpiStrip } from "./Kpis/ExecutiveKpiStrip";
import { TurnaroundImpactHero } from "./Hero/TurnaroundImpactHero";
import { ValueWaterfallSection } from "./Breakdown/ValueWaterfallSection";
import { DepotPerformanceTable } from "./Depots/DepotPerformanceTable";
import { ExecutiveAutonomyCard } from "./Autonomy/ExecutiveAutonomyCard";
import { ExecutiveRiskView } from "./Risk/ExecutiveRiskView";
import { RoiBusinessCaseCard } from "./Roi/RoiBusinessCaseCard";
import { DeploymentReadinessPanel } from "./Readiness/DeploymentReadinessPanel";
import { MetricDefinitionModal } from "./Modals/MetricDefinitionModal";
import { ExecutiveOverviewTiles } from "./Overview/ExecutiveOverviewTiles";
import { ReportsWorkspace } from "./Reports/ReportsWorkspace";
import { ShieldCheck, TrendingUp } from "lucide-react";

interface ExecutiveControlViewProps {
  subView: ExecutiveSubView;
  onNavigateDashboard?: (id: string) => void;
}

export const ExecutiveControlView: React.FC<ExecutiveControlViewProps> = ({
  subView,
  onNavigateDashboard,
}) => {
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

  const pageTitle = ({
    overview: "Executive Overview",
    performance: "Network Performance",
    value: "Value & ROI",
    risk: "Exposure & Risk",
    reports: "Reports & Exports",
    readiness: "Deployment Readiness",
  } as const)[subView];

  return (
    <div className="flex min-h-screen bg-[#FAFBFC] text-[#0F1B2B]">
      <AppSidebar
        activeDashboard="executive-control"
        onSelectDashboard={onNavigateDashboard}
        activeInterventionsCount={0}
      />

      <main className="ml-[240px] flex-1 flex flex-col min-w-0">
        <ExecutiveHeader
          kpis={kpis}
          timePeriod={timePeriod}
          onTimePeriodChange={setTimePeriod}
          onOpenDefinitions={() => setIsDefinitionModalOpen(true)}
          onRefresh={refresh}
          pageTitle={pageTitle}
        />

        <ExecutiveSubNav />

        <div className="p-6 space-y-6 flex-1">
          {/* KPI strip hidden on reports + readiness for a calmer workspace */}
          {subView !== "reports" && subView !== "readiness" && (
            <ExecutiveKpiStrip
              kpis={kpis}
              onOpenDefinitions={() => setIsDefinitionModalOpen(true)}
            />
          )}

          {/* OVERVIEW */}
          {subView === "overview" && (
            <>
              <ExecutiveOverviewTiles
                kpis={kpis}
                riskSummary={riskSummary}
                trustHealth={trustHealth}
                alerts={alerts}
                timePeriod={timePeriod}
              />
              <TurnaroundImpactHero kpis={kpis} trend={trend} />
            </>
          )}

          {/* PERFORMANCE */}
          {subView === "performance" && (
            <>
              <TurnaroundImpactHero kpis={kpis} trend={trend} />
              <DepotPerformanceTable
                depots={depotPerformances}
                selectedDepotId={selectedDepotId}
                onSelectDepotId={setSelectedDepotId}
              />
              <ExecutiveAutonomyCard funnel={funnel} />
            </>
          )}

          {/* VALUE */}
          {subView === "value" && (
            <>
              <ValueWaterfallSection
                waterfall={waterfall}
                bottlenecks={bottlenecks}
                totalProtectedKes={kpis?.totalExposureProtectedKes || 14820000}
              />
              <RoiBusinessCaseCard
                currentRoi={currentRoi}
                activeScenario={activeScenario}
                onSelectScenario={setActiveScenario}
              />
            </>
          )}

          {/* RISK */}
          {subView === "risk" && (
            <ExecutiveRiskView riskSummary={riskSummary} alerts={alerts} />
          )}

          {/* REPORTS */}
          {subView === "reports" && (
            <ReportsWorkspace
              kpis={kpis}
              depots={depotPerformances}
              riskSummary={riskSummary}
              trustHealth={trustHealth}
              timePeriod={timePeriod}
            />
          )}

          {/* READINESS */}
          {subView === "readiness" && (
            <DeploymentReadinessPanel
              readiness={readiness}
              trustHealth={trustHealth}
              recommendation={kpis?.recommendation}
            />
          )}

          {/* Footer */}
          <div className="p-4 rounded-lg bg-white border border-[#E2E6EA] text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>KPC FlowGuard Executive Control Plane</strong> · Verified turnaround
                compression, demurrage mitigation, and capital payback across 5 depots.
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">
              Aggregated from verified closed-loop operations.
            </span>
          </div>
        </div>
      </main>

      <MetricDefinitionModal
        isOpen={isDefinitionModalOpen}
        onClose={() => setIsDefinitionModalOpen(false)}
      />
    </div>
  );
};