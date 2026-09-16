"use client";

import React, { useCallback } from "react";
import { useDriverState } from "./useDriverState";
import { DriverPhoneFrame } from "./DriverPhoneFrame";
import { DriverTopBar } from "./DriverTopBar";
import { DriverBottomNav } from "./DriverBottomNav";
import { HomeTab } from "./HomeTab";
import { CollectionTab } from "./CollectionTab";
import { UpdatesTab } from "./UpdatesTab";
import { NavigateTab } from "./NavigateTab";
import { MoreTab } from "./MoreTab";
import { IssueReportSheet } from "./IssueReportSheet";
import { OfflineSyncSheet } from "./OfflineSyncSheet";
import { DemoJourneyController } from "./DemoJourneyController";
import {
  useDriverRepository,
  getDriverRegistration,
} from "./useDriverRepository";

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
    ingestReroute,
    ingestInject,
    applyRepositoryStage,
  } = useDriverState();

  // Wire driver PWA to the shared repository + broadcast channel
  useDriverRepository({
    onReroute: useCallback((ev) => ingestReroute(ev), [ingestReroute]),
    onInject: useCallback((ev) => ingestInject(ev), [ingestInject]),
    onSnapshotStage: useCallback(
      (idx: number) => applyRepositoryStage(idx),
      [applyRepositoryStage]
    ),
  });

  const recentUpdate = updates[0];
  const driverReg = getDriverRegistration();

  return (
    <DriverPhoneFrame>
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
        driverRegistration={driverReg}
      />

      {/* Scrollable main view — this is the ONLY scroll container */}
      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3.5 py-3 sm:px-4">
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

        {activeTab === "NAVIGATE" && (
          <NavigateTab
            currentStage={currentStage}
            onOpenReportSheet={openReportSheet}
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
            currentStage={currentStage}
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
    </DriverPhoneFrame>
  );
};