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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isApiMode = process.env.NEXT_PUBLIC_FLOWGUARD_DATA_MODE === "api";
  const hasSyncFromApi = typeof (flowGuardService as any).syncFromApi === "function";

  // Initial API sync
  useEffect(() => {
    if (isApiMode && hasSyncFromApi) {
      setIsLoading(true);
      (flowGuardService as any)
        .syncFromApi()
        .then((ok: boolean) => {
          if (ok) {
            setErrorMessage(null);
          } else {
            setErrorMessage("Failed to sync OMC collection data from backend");
          }
          setTick((prev) => prev + 1);
        })
        .catch((err: any) => {
          setErrorMessage(err?.message || "Backend unreachable");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isApiMode, hasSyncFromApi]);

  // Read data from singleton repository
  const allOmcs = useMemo(() => flowGuardService.getOmcList(), [tick]);
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
        const getCategoryRank = (order: OmcCollectionOrder) => {
          if (
            order.status === "AT RISK" ||
            order.status === "DELAYED" ||
            order.status === "DEVELOPING RISK" ||
            order.riskSeverity === "CRITICAL"
          ) {
            return 1;
          }
          if (
            order.status === "LOADING" ||
            order.currentStage === "GANTRY_LOADING" ||
            order.currentStage === "VALIDATION_RELEASE" ||
            order.currentStage === "GATE_IN"
          ) {
            return 2;
          }
          if (order.status === "COMPLETED" || order.status === "READY FOR EXIT") {
            return 4;
          }
          return 3;
        };

        const rankA = getCategoryRank(a);
        const rankB = getCategoryRank(b);

        if (rankA !== rankB) return rankA - rankB;

        const severityRank: Record<string, number> = {
          CRITICAL: 3,
          ELEVATED: 2,
          NOMINAL: 1,
        };
        const sevA = severityRank[a.riskSeverity] || 0;
        const sevB = severityRank[b.riskSeverity] || 0;
        if (sevB !== sevA) return sevB - sevA;

        if (b.turnaroundDeltaMin !== a.turnaroundDeltaMin) {
          return b.turnaroundDeltaMin - a.turnaroundDeltaMin;
        }

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

  const refresh = useCallback(async () => {
    setIsSyncing(true);
    if (isApiMode && hasSyncFromApi) {
      try {
        await (flowGuardService as any).syncFromApi();
      } catch (err: any) {
        setErrorMessage(err?.message || "Refresh failed");
      }
    }
    setDataFreshnessSeconds(1);
    setTick((prev) => prev + 1);
    setIsSyncing(false);
  }, [isApiMode, hasSyncFromApi]);

  const toggleLiveStream = useCallback(() => {
    setIsLiveActive((prev) => !prev);
  }, []);

  // Live simulation or API polling ticker
  useEffect(() => {
    if (!isLiveActive) return;

    if (isApiMode && hasSyncFromApi) {
      const interval = setInterval(async () => {
        try {
          await (flowGuardService as any).syncFromApi();
          setTick((prev) => prev + 1);
        } catch {
          // Keep last cached values
        }
      }, 30_000);
      return () => clearInterval(interval);
    } else {
      const interval = setInterval(() => {
        setDataFreshnessSeconds((prev) => (prev >= 20 ? 2 : prev + 2));
        setTick((prev) => prev + 1);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isLiveActive, isApiMode, hasSyncFromApi]);

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
    isLoading,
    errorMessage,
    dataFreshnessSeconds,
    isLiveActive,
    refresh,
    toggleLiveStream,
    acknowledgeNotification: handleAcknowledgeNotification,
    acknowledgeOrder: handleAcknowledgeOrder,
  };
}
