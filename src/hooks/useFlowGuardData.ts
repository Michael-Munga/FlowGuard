"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { flowGuardService } from "@/services/flowguardService";
import {
  Depot,
  FuturePressurePoint,
  AtRiskOperation,
  AutonomousIntervention,
  OperationalEvent,
  NetworkKpis,
  SystemHealth,
} from "@/types/flowguard";

export function useFlowGuardData() {
  const [kpis, setKpis] = useState<NetworkKpis>(() => flowGuardService.getNetworkKpis());
  const [depots, setDepots] = useState<Depot[]>(() => flowGuardService.getDepots());
  const [timeline, setTimeline] = useState<FuturePressurePoint[]>(() =>
    flowGuardService.getFuturePressureTimeline()
  );
  const [atRiskOps, setAtRiskOps] = useState<AtRiskOperation[]>(() =>
    flowGuardService.getAtRiskOperations()
  );
  const [interventions, setInterventions] = useState<AutonomousIntervention[]>(() =>
    flowGuardService.getActiveInterventions()
  );
  const [events, setEvents] = useState<OperationalEvent[]>(() =>
    flowGuardService.getRecentEvents()
  );
  const [health, setHealth] = useState<SystemHealth>(() =>
    flowGuardService.getSystemHealth()
  );
  const [isLiveActive, setIsLiveActive] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isApiMode = process.env.NEXT_PUBLIC_FLOWGUARD_DATA_MODE === "api";
  const hasSyncFromApi = typeof (flowGuardService as any).syncFromApi === "function";

  // Sync state from repository
  const syncFromRepo = useCallback(() => {
    setKpis(flowGuardService.getNetworkKpis());
    setDepots(flowGuardService.getDepots());
    setTimeline(flowGuardService.getFuturePressureTimeline());
    setAtRiskOps(flowGuardService.getAtRiskOperations());
    setInterventions(flowGuardService.getActiveInterventions());
    setEvents(flowGuardService.getRecentEvents());
    setHealth(flowGuardService.getSystemHealth());
  }, []);

  // Initial API sync on mount
  useEffect(() => {
    if (isApiMode && hasSyncFromApi) {
      setIsLoading(true);
      (flowGuardService as any)
        .syncFromApi()
        .then((ok: boolean) => {
          if (ok) {
            setErrorMessage(null);
          } else {
            setErrorMessage("Failed to sync live operational data from backend");
          }
          syncFromRepo();
        })
        .catch((err: any) => {
          setErrorMessage(err?.message || "Backend unreachable");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isApiMode, hasSyncFromApi, syncFromRepo]);

  // Polling or Live Simulation tick
  useEffect(() => {
    if (!isLiveActive) return;

    if (isApiMode && hasSyncFromApi) {
      // 30-second interval in API mode
      const interval = setInterval(async () => {
        try {
          await (flowGuardService as any).syncFromApi();
          syncFromRepo();
        } catch {
          // Keep last cached values on transient network error
        }
      }, 30_000);
      return () => clearInterval(interval);
    } else {
      // 1-second simulation tick in synthetic mode
      const interval = setInterval(() => {
        flowGuardService.stepSimulation();
        syncFromRepo();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isLiveActive, isApiMode, hasSyncFromApi, syncFromRepo]);

  // Manual Refresh
  const refresh = useCallback(async () => {
    setIsSyncing(true);
    if (isApiMode && hasSyncFromApi) {
      try {
        await (flowGuardService as any).syncFromApi();
      } catch (err: any) {
        setErrorMessage(err?.message || "Refresh failed");
      }
    }
    syncFromRepo();
    setIsSyncing(false);
  }, [isApiMode, hasSyncFromApi, syncFromRepo]);

  // Execute or Approve intervention
  const handleExecuteIntervention = useCallback(
    async (id: string) => {
      await flowGuardService.executeIntervention(id);
      syncFromRepo();
    },
    [syncFromRepo]
  );

  const handleApproveIntervention = useCallback(
    async (id: string) => {
      await flowGuardService.approveIntervention(id);
      syncFromRepo();
    },
    [syncFromRepo]
  );

  // Toggle Degraded Mode
  const toggleDegradedMode = useCallback(() => {
    flowGuardService.toggleDegradedMode();
    syncFromRepo();
  }, [syncFromRepo]);

  // Toggle Live Simulation Stream
  const toggleLiveStream = useCallback(() => {
    setIsLiveActive((prev) => !prev);
  }, []);

  return {
    kpis,
    depots,
    timeline,
    atRiskOps,
    interventions,
    events,
    health,
    isLiveActive,
    isSyncing,
    isLoading,
    errorMessage,
    refresh,
    executeIntervention: handleExecuteIntervention,
    approveIntervention: handleApproveIntervention,
    toggleDegradedMode,
    toggleLiveStream,
  };
}
