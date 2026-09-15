"use client";

import { useState, useEffect, useCallback } from "react";
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

  // Live simulation tick
  useEffect(() => {
    if (!isLiveActive) return;

    const interval = setInterval(() => {
      flowGuardService.stepSimulation();
      syncFromRepo();
    }, 1000);

    return () => clearInterval(interval);
  }, [isLiveActive, syncFromRepo]);

  // Manual Refresh
  const refresh = useCallback(() => {
    setIsSyncing(true);
    setTimeout(() => {
      syncFromRepo();
      setIsSyncing(false);
    }, 400);
  }, [syncFromRepo]);

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
    refresh,
    executeIntervention: handleExecuteIntervention,
    approveIntervention: handleApproveIntervention,
    toggleDegradedMode,
    toggleLiveStream,
  };
}
