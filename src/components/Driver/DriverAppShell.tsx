"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { AlertTriangle } from "lucide-react";
import { useDataSource } from "@/context/DataSourceContext";
import { useDriverState } from "./useDriverState";
import { DriverTopBar } from "./DriverTopBar";
import { DriverBottomNav } from "./DriverBottomNav";
import { HomeTab } from "./HomeTab";
import { CollectionTab } from "./CollectionTab";
import { UpdatesTab } from "./UpdatesTab";
import { MoreTab } from "./MoreTab";
import { IssueReportSheet } from "./IssueReportSheet";
import { OfflineSyncSheet } from "./OfflineSyncSheet";
import { DemoJourneyController } from "./DemoJourneyController";

export const DriverAppShell: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentStageIndex,
    currentStage,
    setStageIndex,
    isInstructionAcknowledged,
    instructionAcknowledgedAt,
    acknowledgeInstruction,
    syncState,
    lastSyncTime,
    pendingSyncQueue,
    toggleOfflineSimulation,
    triggerManualSync,
    updates,
    unreadUpdatesCount,
    acknowledgeUpdate,
    submittedReports,
    submitIssueReport,
    isReportSheetOpen,
    openReportSheet,
    closeReportSheet,
    isSyncSheetOpen,
    openSyncSheet,
    closeSyncSheet,
    isDemoControllerOpen,
    openDemoController,
    closeDemoController,
  } = useDriverState();

  const { dataMode, isApiConnected, isApiLoading } = useDataSource();
  const recentUpdate = updates[0];
  const scrollContainerRef = useRef<HTMLElement>(null);

  // Hash navigation handler for #journey and #updates within the inner scroll container
  const scrollToTarget = useCallback((targetId: string) => {
    const el = document.getElementById(targetId);
    const container = scrollContainerRef.current;
    if (!el || !container) return;

    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const currentScrollTop = container.scrollTop;
    const targetOffsetTop = elRect.top - containerRect.top + currentScrollTop;

    container.scrollTo({
      top: Math.max(0, targetOffsetTop - 12),
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const handleHash = () => {
      if (typeof window === "undefined") return;
      const hash = window.location.hash.toLowerCase().replace("#", "");
      if (!hash) return;

      if (hash === "journey") {
        setActiveTab("HOME");
        setTimeout(() => scrollToTarget("journey"), 80);
      } else if (hash === "updates") {
        setActiveTab("HOME");
        setTimeout(() => scrollToTarget("updates"), 80);
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [setActiveTab, scrollToTarget]);

  return (
    <div className="w-full min-h-screen sm:h-screen sm:overflow-hidden bg-[#03070C] flex flex-col items-center justify-center p-0 sm:py-4 sm:px-4 select-none">
      {/* Desktop Device Context Header (Hidden on actual mobile screens) */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-[416px] px-2 mb-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-300">FlowGuard Driver Companion</span>
        </div>
        <span className="font-mono text-[10px] text-slate-500">Mobile Simulator</span>
      </div>

      {/* Outer Phone Frame Chassis (Only styled on sm+ screens; full-bleed on mobile) */}
      <div className="w-full sm:w-[412px] sm:max-w-[412px] h-full min-h-screen sm:min-h-0 sm:h-[844px] sm:max-h-[calc(100vh-3.5rem)] flex flex-col bg-[#070D15] sm:bg-[#0E1520] sm:p-[10px] sm:rounded-[50px] sm:border-2 sm:border-[#1E2E42] sm:shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.06),0_10px_25px_rgba(0,0,0,0.5)] sm:ring-1 sm:ring-black relative">
        {/* Subtle Speaker / Earpiece Slit in Top Chassis Bezel */}
        <div className="hidden sm:block absolute top-2 left-1/2 -translate-x-1/2 w-14 h-1 bg-slate-700/80 rounded-full z-40 pointer-events-none" />

        {/* Screen Viewport Container */}
        <div className="w-full h-full min-h-screen sm:min-h-0 sm:h-full bg-[#070D15] text-white flex flex-col justify-between sm:rounded-[40px] overflow-hidden relative shadow-inner">
          {/* Mobile Top Bar */}
          <DriverTopBar
            syncState={syncState}
            lastSyncTime={lastSyncTime}
            pendingCount={pendingSyncQueue.length}
            unreadCount={unreadUpdatesCount}
            currentStageNumber={currentStageIndex + 1}
            totalStages={7}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onOpenSyncSheet={openSyncSheet}
            onOpenDemoController={openDemoController}
          />

          {/* Scrollable Main View Area (Bounded inside phone screen) */}
          <main
            ref={scrollContainerRef}
            tabIndex={0}
            aria-label="Driver operational content"
            className="p-3.5 sm:p-4 overflow-y-auto flex-1 overscroll-contain focus:outline-hidden scroll-smooth"
          >
            {dataMode === "api" && !isApiConnected && !isApiLoading && (
              <div className="mb-3 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs">
                <div className="flex items-center gap-2 font-bold text-rose-300 mb-1">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Live Operational Data Unavailable</span>
                </div>
                <p className="text-rose-300/80 leading-relaxed">
                  KPC SCADA API is currently unreachable. Real-time bay sequencing is paused.
                </p>
              </div>
            )}

            {activeTab === "HOME" && (
              <HomeTab
                currentStage={currentStage}
                isInstructionAcknowledged={isInstructionAcknowledged}
                instructionAcknowledgedAt={instructionAcknowledgedAt}
                onAcknowledgeInstruction={acknowledgeInstruction}
                syncState={syncState}
                lastSyncTime={lastSyncTime}
                recentUpdate={recentUpdate}
                onOpenReportSheet={openReportSheet}
                onSelectTab={setActiveTab}
              />
            )}

            {activeTab === "COLLECTION" && (
              <CollectionTab
                currentStage={currentStage}
                onOpenReportSheet={openReportSheet}
              />
            )}

            {activeTab === "UPDATES" && (
              <UpdatesTab
                updates={updates}
                onAcknowledgeUpdate={acknowledgeUpdate}
              />
            )}

            {activeTab === "MORE" && (
              <MoreTab
                syncState={syncState}
                lastSyncTime={lastSyncTime}
                pendingSyncQueue={pendingSyncQueue}
                submittedReports={submittedReports}
                currentStageNumber={currentStageIndex + 1}
                totalStages={7}
                onToggleOffline={toggleOfflineSimulation}
                onTriggerSync={triggerManualSync}
                onOpenReportSheet={openReportSheet}
                onOpenSyncSheet={openSyncSheet}
                onOpenDemoController={openDemoController}
              />
            )}
          </main>

          {/* Bottom Navigation Dock (Visually anchored to bottom of phone screen) */}
          <DriverBottomNav
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            unreadUpdatesCount={unreadUpdatesCount}
          />

          {/* Subtle Home Indicator Bar (Desktop simulation only) */}
          <div className="hidden sm:block absolute bottom-1 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-500/40 rounded-full z-40 pointer-events-none" />

          {/* Modal Bottom Sheets (contained inside screen viewport on desktop) */}
          <IssueReportSheet
            isOpen={isReportSheetOpen}
            onClose={closeReportSheet}
            syncState={syncState}
            onSubmitReport={submitIssueReport}
          />

          <OfflineSyncSheet
            isOpen={isSyncSheetOpen}
            onClose={closeSyncSheet}
            syncState={syncState}
            lastSyncTime={lastSyncTime}
            pendingSyncQueue={pendingSyncQueue}
            onToggleOffline={toggleOfflineSimulation}
            onTriggerSync={triggerManualSync}
          />

          <DemoJourneyController
            isOpen={isDemoControllerOpen}
            onClose={closeDemoController}
            currentIndex={currentStageIndex}
            onSelectStage={setStageIndex}
          />
        </div>
      </div>
    </div>
  );
};
