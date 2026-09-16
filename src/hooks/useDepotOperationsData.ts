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
import { isApiMode as checkIsApiMode } from "@/lib/utils";

export function useDepotOperationsData(initialDepotId: DepotId = "nairobi") {
  const [activeDepotId, setActiveDepotId] = useState<DepotId>(initialDepotId);
  const [depot, setDepot] = useState<Depot | undefined>(() =>
    flowGuardService.getDepotById(initialDepotId)
  );
  const [allDepots, setAllDepots] = useState<Depot[]>(() => flowGuardService.getDepots());
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
  const [activeIntervention, setActiveIntervention] = useState<AutonomousIntervention | undefined>(
    () => flowGuardService.getDepotIntervention(initialDepotId)
  );
  const [depotEvents, setDepotEvents] = useState<OperationalEvent[]>(() =>
    flowGuardService.getDepotEvents(initialDepotId)
  );
  const [health, setHealth] = useState<SystemHealth>(() => flowGuardService.getSystemHealth());

  const [isLiveActive, setIsLiveActive] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isApiMode = checkIsApiMode();
  const hasSyncFromApi = typeof (flowGuardService as any).syncFromApi === "function";

  // Sync state for current depot
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
  }, []);

  // Initial mount sync
  useEffect(() => {
    if (isApiMode && hasSyncFromApi) {
      setIsLoading(true);
      (flowGuardService as any)
        .syncFromApi()
        .then((ok: boolean) => {
          if (ok) {
            setErrorMessage(null);
          } else {
            setErrorMessage("Failed to sync depot live state from backend");
          }
          syncDepotState(activeDepotId);
        })
        .catch((err: any) => {
          setErrorMessage(err?.message || "Backend unreachable");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isApiMode, hasSyncFromApi, activeDepotId, syncDepotState]);

  // When activeDepotId changes, immediately sync
  const handleSelectDepot = useCallback(
    async (newDepotId: DepotId) => {
      setActiveDepotId(newDepotId);
      if (isApiMode && typeof (flowGuardService as any).fetchDepotLiveFromApi === "function") {
        try {
          await (flowGuardService as any).fetchDepotLiveFromApi(newDepotId);
        } catch {
          // ignore
        }
      }
      syncDepotState(newDepotId);
    },
    [isApiMode, syncDepotState]
  );

  // Live simulation tick or API polling
  useEffect(() => {
    if (!isLiveActive) return;

    if (isApiMode && hasSyncFromApi) {
      const interval = setInterval(async () => {
        try {
          await (flowGuardService as any).syncFromApi();
          syncDepotState(activeDepotId);
        } catch {
          // Keep last cached values
        }
      }, 30_000);
      return () => clearInterval(interval);
    } else {
      const interval = setInterval(() => {
        flowGuardService.stepSimulation();
        syncDepotState(activeDepotId);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isLiveActive, isApiMode, hasSyncFromApi, activeDepotId, syncDepotState]);

  // Manual refresh
  const refresh = useCallback(async () => {
    setIsSyncing(true);
    if (isApiMode && hasSyncFromApi) {
      try {
        await (flowGuardService as any).syncFromApi();
      } catch (err: any) {
        setErrorMessage(err?.message || "Refresh failed");
      }
    }
    syncDepotState(activeDepotId);
    setIsSyncing(false);
  }, [isApiMode, hasSyncFromApi, activeDepotId, syncDepotState]);

  // Approve Intervention
  const approveIntervention = useCallback(
    async (interventionId: string) => {
      await flowGuardService.approveIntervention(interventionId);
      syncDepotState(activeDepotId);
    },
    [activeDepotId, syncDepotState]
  );

  // Execute Intervention
  const executeIntervention = useCallback(
    async (interventionId: string) => {
      await flowGuardService.executeIntervention(interventionId);
      syncDepotState(activeDepotId);
    },
    [activeDepotId, syncDepotState]
  );

  // Toggle Degraded Mode
  const toggleDegradedMode = useCallback(() => {
    flowGuardService.toggleDegradedMode();
    syncDepotState(activeDepotId);
  }, [activeDepotId, syncDepotState]);

  const toggleLiveStream = useCallback(() => {
    setIsLiveActive((prev) => !prev);
  }, []);

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
    isLoading,
    errorMessage,
    refresh,
    approveIntervention,
    executeIntervention,
    toggleDegradedMode,
    toggleLiveStream,
  };
}
