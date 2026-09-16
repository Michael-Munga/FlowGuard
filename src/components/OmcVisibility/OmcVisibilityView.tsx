"use client";

import React, { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/CommandCentre/Shell/AppSidebar";
import { OmcContextBar } from "./Header/OmcContextBar";
import { OmcKpiStrip } from "./Kpis/OmcKpiStrip";
import { CollectionsAtRiskCard } from "./Attention/CollectionsAtRiskCard";
import { TodayCollectionOutlook } from "./Outlook/TodayCollectionOutlook";
import { OmcOrderBoard } from "./Orders/OmcOrderBoard";
import { OrderJourneyDrawer } from "./Orders/OrderJourneyDrawer";
import { OmcNotificationCenter } from "./Notifications/OmcNotificationCenter";
import { OmcOverviewTiles } from "./Overview/OmcOverviewTiles";
import { OmcReportsWorkspace } from "./Reports/OmcReportsWorkspace";
import { useOmcCollectionData } from "@/hooks/useOmcCollectionData";
import { useRole } from "@/context/RoleContext";
import { OmcId } from "@/types/flowguard";
import { Lock, Briefcase } from "lucide-react";

export type OmcSubView =
  | "all"
  | "overview"
  | "orders"
  | "outlook"
  | "notifications"
  | "reports";

interface OmcVisibilityViewProps {
  initialOmcId?: OmcId;
  subView?: OmcSubView;
  onNavigateDashboard?: (id: string) => void;
}

export const OmcVisibilityView: React.FC<OmcVisibilityViewProps> = ({
  initialOmcId = "vivo",
  subView = "all",
  onNavigateDashboard,
}) => {
  const router = useRouter();
  const { selectedOmcId, setSelectedOmcId } = useRole();

  const effectiveOmcId = (selectedOmcId as OmcId) || initialOmcId;

  const {
    activeOmcId,
    setActiveOmcId,
    omcProfile,
    allOmcs,
    orders,
    filteredOrders,
    selectedOrder,
    isDrawerOpen,
    openOrderDrawer,
    closeOrderDrawer,
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
    acknowledgeNotification,
    acknowledgeOrder,
  } = useOmcCollectionData(effectiveOmcId);

  const handleSelectOmc = useCallback(
    (omcId: OmcId) => {
      setActiveOmcId(omcId);
      setSelectedOmcId(omcId);
    },
    [setActiveOmcId, setSelectedOmcId]
  );

  const handleSelectSubView = useCallback(
    (view: OmcSubView) => {
      if (view === "overview") {
        router.push("/omc/overview");
      } else if (view === "orders" || view === "all") {
        router.push("/omc/orders");
      } else if (view === "outlook") {
        router.push("/omc/outlook");
      } else if (view === "notifications") {
        router.push("/omc/notifications");
      } else if (view === "reports") {
        router.push("/omc/reports");
      }
    },
    [router]
  );

  const handleSelectOrderById = useCallback(
    (orderId: string) => {
      const target = orders.find((o) => o.id === orderId);
      if (target) {
        openOrderDrawer(target);
      }
    },
    [orders, openOrderDrawer]
  );

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-[#0F1B2B] flex flex-col antialiased">
      <AppSidebar
        activeDashboard="omc-collection"
        onSelectDashboard={onNavigateDashboard}
        activeInterventionsCount={1}
      />

      <div className="ml-[240px] flex-1 flex flex-col min-w-0">
        <OmcContextBar
          omcProfile={omcProfile}
          allOmcs={allOmcs}
          onSelectOmc={handleSelectOmc}
          health={health}
          isSyncing={isSyncing}
          onRefresh={refresh}
          isLiveActive={isLiveActive}
          onToggleLive={toggleLiveStream}
          dataFreshnessSeconds={dataFreshnessSeconds}
          activeSubView={subView}
          onSelectSubView={handleSelectSubView}
        />

        <main className="flex-1 flex flex-col space-y-4 py-4 pb-8">
          {/* KPI strip hidden on reports for a calmer workspace */}
          {subView !== "reports" && <OmcKpiStrip summary={kpis} />}

          {/* Overview */}
          {subView === "overview" && (
            <>
              <div className="px-6">
                <OmcOverviewTiles
                  profile={omcProfile}
                  kpis={kpis}
                  orders={orders}
                  notifications={notifications}
                />
              </div>
              <div className="px-6">
                <CollectionsAtRiskCard
                  orders={orders}
                  onSelectOrder={openOrderDrawer}
                />
              </div>
            </>
          )}

          {/* Collections at risk — also shown on all / orders / outlook */}
          {subView !== "overview" && subView !== "reports" &&
            (subView === "all" || subView === "orders" || subView === "outlook") && (
              <div className="px-6">
                <CollectionsAtRiskCard
                  orders={orders}
                  onSelectOrder={openOrderDrawer}
                />
              </div>
            )}

          {/* Sub-view content */}
          <div className="px-6">
            {subView === "orders" && (
              <div className="w-full">
                <OmcOrderBoard
                  orders={filteredOrders}
                  onSelectOrder={openOrderDrawer}
                  selectedOrderId={selectedOrder?.id}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  filterStage={filterStage}
                  onFilterChange={setFilterStage}
                  omcName={omcProfile.shortName}
                />
              </div>
            )}

            {subView === "outlook" && (
              <div className="w-full space-y-4">
                <TodayCollectionOutlook
                  outlooks={outlooks}
                  omcName={omcProfile.shortName}
                />
              </div>
            )}

            {subView === "notifications" && (
              <div className="w-full space-y-4">
                <OmcNotificationCenter
                  notifications={notifications}
                  onAcknowledge={acknowledgeNotification}
                  onSelectOrder={handleSelectOrderById}
                  omcName={omcProfile.shortName}
                />
              </div>
            )}

            {subView === "reports" && (
              <OmcReportsWorkspace
                profile={omcProfile}
                orders={orders}
                kpis={kpis}
                notifications={notifications}
                outlooks={outlooks}
              />
            )}

            {subView === "all" && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
                <div className="xl:col-span-8">
                  <OmcOrderBoard
                    orders={filteredOrders}
                    onSelectOrder={openOrderDrawer}
                    selectedOrderId={selectedOrder?.id}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    filterStage={filterStage}
                    onFilterChange={setFilterStage}
                    omcName={omcProfile.shortName}
                  />
                </div>
                <div className="xl:col-span-4 space-y-4">
                  <TodayCollectionOutlook
                    outlooks={outlooks}
                    omcName={omcProfile.shortName}
                  />
                  <OmcNotificationCenter
                    notifications={notifications}
                    onAcknowledge={acknowledgeNotification}
                    onSelectOrder={handleSelectOrderById}
                    omcName={omcProfile.shortName}
                  />
                </div>
              </div>
            )}
          </div>
        </main>

        <footer className="bg-white border-t border-[#E2E6EA] px-6 py-2.5 text-[11px] text-[#5C6B7A] flex flex-wrap items-center justify-between gap-y-2 select-none">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1B7A3D]" />
              <span className="font-semibold text-[#0F1B2B]">OMC Account Context:</span>
              <span className="font-mono text-[#0F1B2B]">
                {omcProfile.name} ({omcProfile.accountCode})
              </span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1B7A3D]" />
              <span className="font-semibold text-[#0F1B2B]">Data Isolation:</span>
              <span>Scope restricted to {omcProfile.shortName}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[10px]">
            <span className="text-[#8492A6] uppercase tracking-wider hidden lg:inline">
              KENYA PIPELINE COMPANY LTD © FLOWGUARD CUSTOMER CONTROL PLANE
            </span>
            <span className="text-slate-300 hidden lg:inline">|</span>
            <div className="flex items-center gap-1 text-[#0F1B2B] font-mono font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              <Lock className="w-2.5 h-2.5 text-[#1B7A3D]" />
              <span>PORTAL: {omcProfile.id.toUpperCase()}</span>
            </div>
          </div>
        </footer>
      </div>

      <OrderJourneyDrawer
        order={selectedOrder}
        isOpen={isDrawerOpen}
        onClose={closeOrderDrawer}
        onAcknowledgeOrder={acknowledgeOrder}
      />
    </div>
  );
};