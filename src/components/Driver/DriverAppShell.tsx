"use client";

import React from "react";
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

  const recentUpdate = updates[0];

  return (
    <div className="min-h-screen bg-[#050A10] flex justify-center items-stretch sm:py-4">
      {/* Mobile Phone Container (Targeting 360px, 390px, 412px viewport widths) */}
      <div className="w-full max-w-md bg-[#070D15] text-white flex flex-col justify-between shadow-2xl sm:rounded-3xl border-x sm:border border-slate-800 relative overflow-hidden">
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

        {/* Scrollable Main View Area */}
        <main className="p-3.5 sm:p-4 overflow-y-auto flex-1 overscroll-contain">
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

        {/* Bottom Navigation Dock */}
        <DriverBottomNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          unreadUpdatesCount={unreadUpdatesCount}
        />

        {/* Modal Bottom Sheets */}
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
  );
};
