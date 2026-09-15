"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  AutonomyIncident,
  AutonomyPolicyRule,
  TelemetryDataSource,
  AutonomyAggregateMetrics,
  AutonomySubsystemHealth,
  AutonomyState,
  DepotId,
} from "@/types/flowguard";
import { flowGuardService } from "@/services/flowguardService";

export function useAutonomousControlData(initialIncidentId: string = "INT-8801") {
  const [incidents, setIncidents] = useState<AutonomyIncident[]>([]);
  const [activeIncidentId, setActiveIncidentId] = useState<string>(initialIncidentId);
  const [selectedIncident, setSelectedIncident] = useState<AutonomyIncident | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [telemetrySources, setTelemetrySources] = useState<TelemetryDataSource[]>([]);
  const [policyRules, setPolicyRules] = useState<AutonomyPolicyRule[]>([]);
  const [metrics, setMetrics] = useState<AutonomyAggregateMetrics | null>(null);
  const [subsystemHealth, setSubsystemHealth] = useState<AutonomySubsystemHealth | null>(null);
  const [autonomyState, setAutonomyState] = useState<AutonomyState>("AUTONOMOUS");
  const [isDegradedMode, setIsDegradedMode] = useState<boolean>(false);
  const [isActionPending, setIsActionPending] = useState<boolean>(false);

  // Table filter states
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterDepot, setFilterDepot] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const refresh = useCallback(() => {
    setIncidents(flowGuardService.getAutonomyIncidents());
    setTelemetrySources(flowGuardService.getTelemetryDataSources());
    setPolicyRules(flowGuardService.getPolicyRules());
    setMetrics(flowGuardService.getAutonomyMetrics());
    setSubsystemHealth(flowGuardService.getAutonomySubsystemHealth());
    setAutonomyState(flowGuardService.getAutonomyState());
    setIsDegradedMode(flowGuardService.isSimulatedDegradedMode());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const activeIncident = useMemo(() => {
    return incidents.find((i) => i.id === activeIncidentId) || incidents[0] || null;
  }, [incidents, activeIncidentId]);

  const handleAuthorizeAction = useCallback(
    async (incidentId: string) => {
      try {
        setIsActionPending(true);
        await flowGuardService.authorizeIncidentAction(incidentId);
        refresh();
      } catch (err) {
        console.error("Failed to authorize incident action:", err);
      } finally {
        setIsActionPending(false);
      }
    },
    [refresh]
  );

  const handleRejectAction = useCallback(
    async (incidentId: string, reason?: string) => {
      try {
        setIsActionPending(true);
        await flowGuardService.rejectIncidentAction(incidentId, reason);
        refresh();
      } catch (err) {
        console.error("Failed to reject incident action:", err);
      } finally {
        setIsActionPending(false);
      }
    },
    [refresh]
  );

  const handleToggleDegradedMode = useCallback(() => {
    const nextState = !isDegradedMode;
    flowGuardService.setSimulatedDegradedMode(nextState);
    refresh();
  }, [isDegradedMode, refresh]);

  const handleOpenDrawer = useCallback((incident: AutonomyIncident) => {
    setSelectedIncident(incident);
    setIsDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  // Filtered action history
  const filteredHistory = useMemo(() => {
    return incidents.filter((incident) => {
      // Status filter
      if (filterStatus !== "ALL") {
        if (filterStatus === "BLOCKED / ESCALATED") {
          if (incident.status !== "BLOCKED / ESCALATED" && incident.status !== "BLOCKED BY POLICY") {
            return false;
          }
        } else if (incident.status !== filterStatus) {
          return false;
        }
      }
      // Depot filter
      if (filterDepot !== "ALL" && incident.depotId !== filterDepot) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = incident.id.toLowerCase().includes(query);
        const matchesHeadline = incident.headline.toLowerCase().includes(query);
        const matchesDepot = incident.depotName.toLowerCase().includes(query);
        const matchesProblem = incident.predictedProblem.toLowerCase().includes(query);
        const matchesPolicy = incident.appliedPolicy.code.toLowerCase().includes(query);
        if (!matchesId && !matchesHeadline && !matchesDepot && !matchesProblem && !matchesPolicy) {
          return false;
        }
      }
      return true;
    });
  }, [incidents, filterStatus, filterDepot, searchQuery]);

  return {
    incidents,
    activeIncident,
    activeIncidentId,
    setActiveIncidentId,
    selectedIncident,
    isDrawerOpen,
    handleOpenDrawer,
    handleCloseDrawer,
    telemetrySources,
    policyRules,
    metrics,
    subsystemHealth,
    autonomyState,
    isDegradedMode,
    isActionPending,
    toggleDegradedMode: handleToggleDegradedMode,
    authorizeAction: handleAuthorizeAction,
    rejectAction: handleRejectAction,
    filterStatus,
    setFilterStatus,
    filterDepot,
    setFilterDepot,
    searchQuery,
    setSearchQuery,
    filteredHistory,
    refresh,
  };
}
