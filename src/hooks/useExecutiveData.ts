"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ExecutiveKpiSummary,
  ExecutiveTimePeriod,
  TurnaroundTrendPoint,
  DepotExecutivePerformance,
  ValueWaterfallItem,
  BottleneckImpactSummary,
  AutonomyFunnel,
  ExecutiveRiskSummary,
  RoiModelScenario,
  RoiScenarioName,
  DeploymentReadinessCategory,
  ExecutiveTrustHealth,
  ExecutiveAlert,
  DepotId,
} from "@/types/flowguard";
import { flowGuardService } from "@/services/flowguardService";
import { isApiMode as checkIsApiMode } from "@/lib/utils";

export function useExecutiveData() {
  const [timePeriod, setTimePeriod] = useState<ExecutiveTimePeriod>("30_DAYS");
  const [selectedDepotId, setSelectedDepotId] = useState<DepotId | "ALL">("ALL");
  const [activeScenario, setActiveScenario] = useState<RoiScenarioName>("Expected");

  const [kpis, setKpis] = useState<ExecutiveKpiSummary | null>(() =>
    flowGuardService.getExecutiveKpis("30_DAYS")
  );
  const [trend, setTrend] = useState<TurnaroundTrendPoint[]>(() =>
    flowGuardService.getTurnaroundTrend("30_DAYS")
  );
  const [depotPerformances, setDepotPerformances] = useState<DepotExecutivePerformance[]>(() =>
    flowGuardService.getDepotExecutivePerformance("30_DAYS")
  );
  const [waterfall, setWaterfall] = useState<ValueWaterfallItem[]>(() =>
    flowGuardService.getValueWaterfall("30_DAYS")
  );
  const [bottlenecks, setBottlenecks] = useState<BottleneckImpactSummary[]>(() =>
    flowGuardService.getBottleneckImpact("30_DAYS")
  );
  const [funnel, setFunnel] = useState<AutonomyFunnel | null>(() =>
    flowGuardService.getAutonomyFunnel("30_DAYS")
  );
  const [riskSummary, setRiskSummary] = useState<ExecutiveRiskSummary | null>(() =>
    flowGuardService.getExecutiveRiskSummary("30_DAYS")
  );
  const [roiScenarios, setRoiScenarios] = useState<Record<RoiScenarioName, RoiModelScenario>>(() =>
    flowGuardService.getRoiScenarios()
  );
  const [readiness, setReadiness] = useState<DeploymentReadinessCategory[]>(() =>
    flowGuardService.getDeploymentReadiness()
  );
  const [trustHealth, setTrustHealth] = useState<ExecutiveTrustHealth | null>(() =>
    flowGuardService.getExecutiveTrustHealth()
  );
  const [alerts, setAlerts] = useState<ExecutiveAlert[]>(() =>
    flowGuardService.getExecutiveAlerts()
  );

  const isApiMode = checkIsApiMode();
  const hasSyncFromApi = typeof (flowGuardService as any).syncFromApi === "function";

  const syncState = useCallback(() => {
    setKpis(flowGuardService.getExecutiveKpis(timePeriod));
    setTrend(flowGuardService.getTurnaroundTrend(timePeriod));
    setDepotPerformances(flowGuardService.getDepotExecutivePerformance(timePeriod));
    setWaterfall(flowGuardService.getValueWaterfall(timePeriod));
    setBottlenecks(flowGuardService.getBottleneckImpact(timePeriod));
    setFunnel(flowGuardService.getAutonomyFunnel(timePeriod));
    setRiskSummary(flowGuardService.getExecutiveRiskSummary(timePeriod));
    setRoiScenarios(flowGuardService.getRoiScenarios());
    setReadiness(flowGuardService.getDeploymentReadiness());
    setTrustHealth(flowGuardService.getExecutiveTrustHealth());
    setAlerts(flowGuardService.getExecutiveAlerts());
  }, [timePeriod]);

  const refresh = useCallback(async () => {
    if (isApiMode && hasSyncFromApi) {
      try {
        await (flowGuardService as any).syncFromApi();
      } catch (err) {
        console.error("Failed to sync executive data from API:", err);
      }
    }
    syncState();
  }, [isApiMode, hasSyncFromApi, syncState]);

  // Reactively recompute when timePeriod changes or on mount
  useEffect(() => {
    syncState();
    if (isApiMode && hasSyncFromApi) {
      (flowGuardService as any).syncFromApi().then(() => {
        syncState();
      }).catch(() => {
        syncState();
      });
    }
  }, [isApiMode, hasSyncFromApi, syncState]);

  const currentRoi = useMemo(() => {
    return roiScenarios[activeScenario] || flowGuardService.getRoiSummary(activeScenario);
  }, [roiScenarios, activeScenario]);

  const filteredDepots = useMemo(() => {
    if (selectedDepotId === "ALL") return depotPerformances;
    return depotPerformances.filter((d) => d.depotId === selectedDepotId);
  }, [depotPerformances, selectedDepotId]);

  return {
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
  };
}
