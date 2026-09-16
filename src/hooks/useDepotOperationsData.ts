"use client";

import { useState, useEffect, useCallback } from "react";
import { flowGuardService } from "@/services/flowguardService";
import {
  DepotId,
  Depot,
  YardTruck,
  DepotCapacityState,
  DepotEquipmentState,
  DepotBottleneckDiagnosis,
  DepotForecast,
  DepotKpiSummary,
  AutonomousIntervention,
  OperationalEvent,
  SystemHealth,
} from "@/types/flowguard";

export type DepotSubView = "overview" | "live" | "capacity" | "forecast" | "events";

export function useDepotOperationsData(
  initialDepotId: DepotId = "nairobi"
) {
  const [activeDepotId, setActiveDepotId] = useState<DepotId>(initialDepotId);
  const [depot, setDepot] = useState<Depot | undefined>(() =>
    flowGuardService.getDepotById(initialDepotId)
  );
  const [allDepots, setAllDepots] = useState<Depot[]>(() =>
    flowGuardService.getDepots()
  );
  const [kpiSummary, setKpiSummary] = useState<DepotKpiSummary>(() =>
    flowGuardService.getDepotKpiSummary(initialDepotId)
  );
  const [yardTrucks, setYardTrucks] = useState<YardTruck[]>(() =>
    flowGuardService.getDepotYardTrucks(initialDepotId)
  );
  const [capacityState, setCapacityState] = useState<DepotCapacityState>(() =>
    flowGuardService.getDepotCapacityState(initialDepotId)
  );
  const [equipmentState, setEquipmentState] = useState<DepotEquipmentState>(() =>
    flowGuardService.getDepotEquipmentState(initialDepotId)
  );
  const [bottleneck, setBottleneck] = useState<DepotBottleneckDiagnosis>(() =>
    flowGuardService.getDepotBottleneck(initialDepotId)
  );
  const [forecast, setForecast] = useState<DepotForecast>(() =>
    flowGuardService.getDepotForecast(initialDepotId)
  );
  const [activeIntervention, setActiveIntervention] = useState<
    AutonomousIntervention | undefined
  >(() => flowGuardService.getDepotIntervention(initialDepotId));
  const [depotEvents, setDepotEvents] = useState<OperationalEvent[]>(() =>
    flowGuardService.getDepotEvents(initialDepotId)
  );
  const [health, setHealth] = useState<SystemHealth>(() =>
    flowGuardService.getSystemHealth()
  );

  const [demurragePreventedKes, setDemurragePreventedKes] = useState<number>(() =>
    flowGuardService.getDemurragePreventedKes()
  );

  const [isLiveActive, setIsLiveActive] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const syncDepotState = useCallback((targetDepotId: DepotId) => {
    setDepot(flowGuardService.getDepotById(targetDepotId));
    setAllDepots(flowGuardService.getDepots());
    setKpiSummary(flowGuardService.getDepotKpiSummary(targetDepotId));
    setYardTrucks(flowGuardService.getDepotYardTrucks(targetDepotId));
    setCapacityState(flowGuardService.getDepotCapacityState(targetDepotId));
    setEquipmentState(flowGuardService.getDepotEquipmentState(targetDepotId));
    setBottleneck(flowGuardService.getDepotBottleneck(targetDepotId));
    setForecast(flowGuardService.getDepotForecast(targetDepotId));
    setActiveIntervention(flowGuardService.getDepotIntervention(targetDepotId));
    setDepotEvents(flowGuardService.getDepotEvents(targetDepotId));
    setHealth(flowGuardService.getSystemHealth());
    setDemurragePreventedKes(flowGuardService.getDemurragePreventedKes());
  }, []);

  const handleSelectDepot = useCallback(
    (newDepotId: DepotId) => {
      setActiveDepotId(newDepotId);
      syncDepotState(newDepotId);
    },
    [syncDepotState]
  );

  useEffect(() => {
    if (!isLiveActive) return;
    const interval = setInterval(() => {
      flowGuardService.stepSimulation();
      syncDepotState(activeDepotId);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLiveActive, activeDepotId, syncDepotState]);

  const refresh = useCallback(() => {
    setIsSyncing(true);
    setTimeout(() => {
      syncDepotState(activeDepotId);
      setIsSyncing(false);
    }, 400);
  }, [activeDepotId, syncDepotState]);

  const approveIntervention = useCallback(
    async (interventionId: string) => {
      await flowGuardService.approveIntervention(interventionId);
      syncDepotState(activeDepotId);
    },
    [activeDepotId, syncDepotState]
  );

  const executeIntervention = useCallback(
    async (interventionId: string) => {
      await flowGuardService.executeIntervention(interventionId);
      syncDepotState(activeDepotId);
    },
    [activeDepotId, syncDepotState]
  );

  const toggleDegradedMode = useCallback(() => {
    flowGuardService.toggleDegradedMode();
    syncDepotState(activeDepotId);
  }, [activeDepotId, syncDepotState]);

  const toggleLiveStream = useCallback(() => {
    setIsLiveActive((prev) => !prev);
  }, []);

  const forceCrisis = useCallback(() => {
    flowGuardService.forceCrisis();
    syncDepotState(activeDepotId);
  }, [activeDepotId, syncDepotState]);

  return {
    activeDepotId,
    setActiveDepotId: handleSelectDepot,
    depot: depot || allDepots[0],
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
  };
}