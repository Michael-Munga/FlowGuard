"use client";

import { useState, useCallback, useMemo } from "react";
import {
  DriverTab,
  SyncState,
  DriverUpdate,
  DriverIssueReport,
  IssueCategory,
  JourneyStageConfig,
} from "./types";
import { DRIVER_JOURNEY_STAGES, INITIAL_DRIVER_UPDATES } from "./journeyStages";

export interface DriverStateReturn {
  // Navigation
  activeTab: DriverTab;
  setActiveTab: (tab: DriverTab) => void;

  // Journey Stage
  currentStageIndex: number;
  currentStage: JourneyStageConfig;
  setStageIndex: (idx: number) => void;
  advanceStage: () => void;
  resetToStart: () => void;

  // Instruction Acknowledgement
  isInstructionAcknowledged: boolean;
  instructionAcknowledgedAt: string | null;
  acknowledgeInstruction: () => void;

  // Sync & Connectivity
  syncState: SyncState;
  lastSyncTime: string;
  pendingSyncQueue: DriverIssueReport[];
  toggleOfflineSimulation: () => void;
  triggerManualSync: () => void;

  // Updates & Notifications
  updates: DriverUpdate[];
  unreadUpdatesCount: number;
  acknowledgeUpdate: (id: string) => void;

  // Issue Reports
  submittedReports: DriverIssueReport[];
  submitIssueReport: (category: IssueCategory, subReason?: string, notes?: string) => void;

  // Sheets & Modals
  isReportSheetOpen: boolean;
  openReportSheet: () => void;
  closeReportSheet: () => void;

  isSyncSheetOpen: boolean;
  openSyncSheet: () => void;
  closeSyncSheet: () => void;

  isDemoControllerOpen: boolean;
  openDemoController: () => void;
  closeDemoController: () => void;
}

export function useDriverState(): DriverStateReturn {
  const [activeTab, setActiveTab] = useState<DriverTab>("HOME");
  // Default to Stage 4 (FlowGuard Reallocated / Bay P04) or Stage 1
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(3); // Stage 4: FlowGuard Fast-Track Intervention
  const [isInstructionAcknowledged, setIsInstructionAcknowledged] = useState<boolean>(false);
  const [instructionAcknowledgedAt, setInstructionAcknowledgedAt] = useState<string | null>(null);

  // Sync state
  const [syncState, setSyncState] = useState<SyncState>("ONLINE");
  const [lastSyncTime, setLastSyncTime] = useState<string>("10:32 EAT");
  const [pendingSyncQueue, setPendingSyncQueue] = useState<DriverIssueReport[]>([]);
  const [submittedReports, setSubmittedReports] = useState<DriverIssueReport[]>([]);

  // Updates
  const [updates, setUpdates] = useState<DriverUpdate[]>(INITIAL_DRIVER_UPDATES);

  // Modals
  const [isReportSheetOpen, setIsReportSheetOpen] = useState(false);
  const [isSyncSheetOpen, setIsSyncSheetOpen] = useState(false);
  const [isDemoControllerOpen, setIsDemoControllerOpen] = useState(false);

  const currentStage = useMemo(
    () => DRIVER_JOURNEY_STAGES[currentStageIndex] || DRIVER_JOURNEY_STAGES[0],
    [currentStageIndex]
  );

  const unreadUpdatesCount = useMemo(
    () => updates.filter((u) => u.requiresAcknowledgement && !u.isAcknowledged).length,
    [updates]
  );

  // Set specific stage (e.g. from demo selector)
  const setStageIndex = useCallback((idx: number) => {
    if (idx >= 0 && idx < DRIVER_JOURNEY_STAGES.length) {
      setCurrentStageIndex(idx);
      setIsInstructionAcknowledged(false);
      setInstructionAcknowledgedAt(null);
    }
  }, []);

  const advanceStage = useCallback(() => {
    setCurrentStageIndex((prev) => {
      const next = prev < DRIVER_JOURNEY_STAGES.length - 1 ? prev + 1 : prev;
      setIsInstructionAcknowledged(false);
      setInstructionAcknowledgedAt(null);
      return next;
    });
  }, []);

  const resetToStart = useCallback(() => {
    setCurrentStageIndex(0);
    setIsInstructionAcknowledged(false);
    setInstructionAcknowledgedAt(null);
  }, []);

  const acknowledgeInstruction = useCallback(() => {
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " EAT";
    setIsInstructionAcknowledged(true);
    setInstructionAcknowledgedAt(timeNow);
  }, []);

  const acknowledgeUpdate = useCallback((id: string) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " EAT";
    setUpdates((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, isAcknowledged: true, acknowledgedAt: timeNow }
          : item
      )
    );
  }, []);

  // Offline demo toggle
  const toggleOfflineSimulation = useCallback(() => {
    setSyncState((prev) => {
      if (prev === "OFFLINE") {
        // Return online and trigger sync
        setTimeout(() => {
          setSyncState("SYNCING");
          setTimeout(() => {
            setPendingSyncQueue((queue) => {
              // Flush pending queue into submitted
              setSubmittedReports((hist) => [
                ...queue.map((item) => ({ ...item, syncStatus: "SYNCED" as const })),
                ...hist,
              ]);
              return [];
            });
            setSyncState("ONLINE");
            setLastSyncTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " EAT");
          }, 1200);
        }, 100);
        return "SYNCING";
      } else {
        return "OFFLINE";
      }
    });
  }, []);

  const triggerManualSync = useCallback(() => {
    if (syncState === "OFFLINE") return;
    setSyncState("SYNCING");
    setTimeout(() => {
      setPendingSyncQueue((queue) => {
        if (queue.length > 0) {
          setSubmittedReports((hist) => [
            ...queue.map((item) => ({ ...item, syncStatus: "SYNCED" as const })),
            ...hist,
          ]);
        }
        return [];
      });
      setSyncState("ONLINE");
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " EAT");
    }, 1000);
  }, [syncState]);

  // Submit an issue report
  const submitIssueReport = useCallback(
    (category: IssueCategory, subReason?: string, notes?: string) => {
      const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " EAT";
      const newReport: DriverIssueReport = {
        id: `REP-${Date.now().toString().slice(-4)}`,
        category,
        subReason,
        notes,
        timestamp: timeNow,
        syncStatus: syncState === "OFFLINE" ? "PENDING_SYNC" : "SYNCED",
      };

      if (syncState === "OFFLINE") {
        setPendingSyncQueue((prev) => [newReport, ...prev]);
      } else {
        setSubmittedReports((prev) => [newReport, ...prev]);
      }

      // Add corresponding driver update item to feed
      const newUpdate: DriverUpdate = {
        id: `UPD-ISSUE-${Date.now().toString().slice(-4)}`,
        type: category === "SAFETY ISSUE" ? "IMPORTANT SAFETY MESSAGE" : "INSTRUCTION UPDATE",
        title: `Report Logged: ${category}`,
        message: `${subReason ? subReason + ". " : ""}${notes ? notes : "Operational report received by KPC Terminal Dispatch."}`,
        timestamp: timeNow,
        priority: category === "SAFETY ISSUE" ? "URGENT" : "IMPORTANT",
        requiresAcknowledgement: false,
        isAcknowledged: true,
        acknowledgedAt: timeNow,
      };

      setUpdates((prev) => [newUpdate, ...prev]);
      setIsReportSheetOpen(false);
    },
    [syncState]
  );

  return {
    activeTab,
    setActiveTab,
    currentStageIndex,
    currentStage,
    setStageIndex,
    advanceStage,
    resetToStart,
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
    openReportSheet: () => setIsReportSheetOpen(true),
    closeReportSheet: () => setIsReportSheetOpen(false),
    isSyncSheetOpen,
    openSyncSheet: () => setIsSyncSheetOpen(true),
    closeSyncSheet: () => setIsSyncSheetOpen(false),
    isDemoControllerOpen,
    openDemoController: () => setIsDemoControllerOpen(true),
    closeDemoController: () => setIsDemoControllerOpen(false),
  };
}
