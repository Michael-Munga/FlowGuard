"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  OmcId,
  OmcProfile,
  OmcCollectionOrder,
  OmcNotification,
  OmcHourlyOutlook,
  OmcKpiSummary,
  SystemHealth,
} from "@/types/flowguard";
import { flowGuardService } from "@/services/flowguardService";

export function useOmcCollectionData(initialOmcId: OmcId = "vivo") {
  const [activeOmcId, setActiveOmcId] = useState<OmcId>(initialOmcId);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>("LO-NBO-8821");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [filterStage, setFilterStage] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Live and sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [dataFreshnessSeconds, setDataFreshnessSeconds] = useState(4);
  const [tick, setTick] = useState(0);

  // Read data from singleton repository
  const allOmcs = useMemo(() => flowGuardService.getOmcList(), []);
  const omcProfile = useMemo(
    () => flowGuardService.getOmcProfile(activeOmcId) || allOmcs[0],
    [activeOmcId, allOmcs, tick]
  );
  const orders = useMemo(
    () => flowGuardService.getOmcOrders(activeOmcId),
    [activeOmcId, tick]
  );
  const kpis = useMemo(
    () => flowGuardService.getOmcKpis(activeOmcId),
    [activeOmcId, tick]
  );
  const notifications = useMemo(
    () => flowGuardService.getOmcNotifications(activeOmcId),
    [activeOmcId, tick]
  );
  const outlooks = useMemo(
    () => flowGuardService.getOmcHourlyOutlook(activeOmcId),
    [activeOmcId, tick]
  );
  const health = useMemo(
    () => flowGuardService.getSystemHealth(),
    [tick]
  );

  // Selected Order
  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) || orders[0] || null,
    [orders, selectedOrderId]
  );

  // Filter & Urgency Sorting
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const matchesSearch =
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.truckRegistration.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.depotName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.driverName.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (filterStage === "ALL") return true;
        if (filterStage === "AT_RISK")
          return (
            order.status === "AT RISK" ||
            order.status === "DEVELOPING RISK" ||
            order.status === "DELAYED"
          );
        if (filterStage === "LOADING") return order.status === "LOADING";
        if (filterStage === "IN_PROCESS")
          return (
            order.currentStage === "GATE_IN" ||
            order.currentStage === "VALIDATION_RELEASE" ||
            order.currentStage === "GANTRY_LOADING"
          );
        if (filterStage === "COMPLETED") return order.status === "COMPLETED" || order.status === "READY FOR EXIT";

        return true;
      })
      .sort((a, b) => {
        // Priority 1: Category rank (1: At-Risk, 2: Active inside, 3: Upcoming, 4: Completed)
        const getCategoryRank = (order: OmcCollectionOrder) => {
          if (
            order.status === "AT RISK" ||
            order.status === "DELAYED" ||
            order.status === "DEVELOPING RISK" ||
            order.riskSeverity === "CRITICAL"
          ) {
            return 1; // Priority 1: At-Risk collections
          }
          if (
            order.currentStage === "GANTRY_LOADING" ||
            order.currentStage === "VALIDATION_RELEASE" ||
            order.currentStage === "GATE_IN"
          ) {
            return 2; // Priority 2: Active collections inside terminal
          }
          if (order.currentStage === "ORDER_PLACED" && order.status !== "COMPLETED") {
            return 3; // Priority 3: Upcoming collections
          }
          return 4; // Priority 4: Completed collections
        };

        const catA = getCategoryRank(a);
        const catB = getCategoryRank(b);

        if (catA !== catB) {
          return catA - catB; // Lower category number = higher priority
        }

        // Within same category:
        // First, risk severity
        const severityRank: Record<string, number> = {
          CRITICAL: 3,
          ELEVATED: 2,
          NOMINAL: 1,
        };
        const sevA = severityRank[a.riskSeverity] || 0;
        const sevB = severityRank[b.riskSeverity] || 0;
        if (sevB !== sevA) return sevB - sevA;

        // Second, turnaround delay delta (highest delay first)
        if (b.turnaroundDeltaMin !== a.turnaroundDeltaMin) {
          return b.turnaroundDeltaMin - a.turnaroundDeltaMin;
        }

        // Third, financial exposure at risk
        const expA = a.exposure?.potentialKes || 0;
        const expB = b.exposure?.potentialKes || 0;
        if (expB !== expA) return expB - expA;

        // Fourth, predicted total turnaround
        return b.predictedTurnaroundMin - a.predictedTurnaroundMin;
      });
  }, [orders, searchQuery, filterStage]);

  // Actions
  const handleOpenDrawer = (order: OmcCollectionOrder) => {
    setSelectedOrderId(order.id);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleAcknowledgeNotification = async (notificationId: string) => {
    await flowGuardService.acknowledgeNotification(notificationId);
    setTick((prev) => prev + 1);
  };

  const handleAcknowledgeOrder = async (orderId: string) => {
    await flowGuardService.acknowledgeOrderCommunication(orderId);
    setTick((prev) => prev + 1);
  };

  const refresh = useCallback(() => {
    setIsSyncing(true);
    setTimeout(() => {
      setDataFreshnessSeconds(1);
      setTick((prev) => prev + 1);
      setIsSyncing(false);
    }, 400);
  }, []);

  const toggleLiveStream = useCallback(() => {
    setIsLiveActive((prev) => !prev);
  }, []);

  // Live simulation ticker
  useEffect(() => {
    if (!isLiveActive) return;

    const interval = setInterval(() => {
      setDataFreshnessSeconds((prev) => (prev >= 20 ? 2 : prev + 2));
      setTick((prev) => prev + 1);
    }, 4000);

    return () => clearInterval(interval);
  }, [isLiveActive]);

  return {
    activeOmcId,
    setActiveOmcId,
    omcProfile,
    allOmcs,
    orders,
    filteredOrders,
    selectedOrder,
    isDrawerOpen,
    openOrderDrawer: handleOpenDrawer,
    closeOrderDrawer: handleCloseDrawer,
    filterStage,
    setFilterStage,
    searchQuery,
    setSearchQuery,
    kpis,
    notifications,
    outlooks,
    health,
    isSyncing,
    dataFreshnessSeconds,
    isLiveActive,
    refresh,
    toggleLiveStream,
    acknowledgeNotification: handleAcknowledgeNotification,
    acknowledgeOrder: handleAcknowledgeOrder,
  };
}
