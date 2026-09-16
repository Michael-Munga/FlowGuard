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
import { RerouteEvent, InjectEvent } from "@/services/driverChannel";

export interface DriverStateReturn {
  activeTab: DriverTab;
  setActiveTab: (tab: DriverTab) => void;

  currentStageIndex: number;
  currentStage: JourneyStageConfig;
  setStageIndex: (idx: number) => void;
  advanceStage: () => void;
  resetToStart: () => void;

  isInstructionAcknowledged: boolean;
  instructionAcknowledgedAt: string | null;
  acknowledgeInstruction: () => void;

  syncState: SyncState;
  lastSyncTime: string;
  pendingSyncQueue: DriverIssueReport[];
  toggleOfflineSimulation: () => void;
  triggerManualSync: () => void;

  updates: DriverUpdate[];
  unreadUpdatesCount: number;
  acknowledgeUpdate: (id: string) => void;

  submittedReports: DriverIssueReport[];
  submitIssueReport: (category: IssueCategory, subReason?: string, notes?: string) => void;

  isReportSheetOpen: boolean;
  openReportSheet: () => void;
  closeReportSheet: () => void;

  isSyncSheetOpen: boolean;
  openSyncSheet: () => void;
  closeSyncSheet: () => void;

  isDemoControllerOpen: boolean;
  openDemoController: () => void;
  closeDemoController: () => void;

  // NEW — repository link
  ingestReroute: (ev: RerouteEvent) => void;
  ingestInject: (ev: InjectEvent) => void;
  applyRepositoryStage: (stageIndex: number) => void;
}

export function useDriverState(): DriverStateReturn {
  const [activeTab, setActiveTab] = useState<DriverTab>("HOME");
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(3);
  const [isInstructionAcknowledged, setIsInstructionAcknowledged] = useState<boolean>(false);
  const [instructionAcknowledgedAt, setInstructionAcknowledgedAt] = useState<string | null>(null);

  const [syncState, setSyncState] = useState<SyncState>("ONLINE");
  const [lastSyncTime, setLastSyncTime] = useState<string>("10:32 EAT");
  const [pendingSyncQueue, setPendingSyncQueue] = useState<DriverIssueReport[]>([]);
  const [submittedReports, setSubmittedReports] = useState<DriverIssueReport[]>([]);
  const [updates, setUpdates] = useState<DriverUpdate[]>(INITIAL_DRIVER_UPDATES);

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
    const timeNow =
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " EAT";
    setIsInstructionAcknowledged(true);
    setInstructionAcknowledgedAt(timeNow);
  }, []);

  const acknowledgeUpdate = useCallback((id: string) => {
    const timeNow =
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " EAT";
    setUpdates((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isAcknowledged: true, acknowledgedAt: timeNow } : item
      )
    );
  }, []);

  const toggleOfflineSimulation = useCallback(() => {
    setSyncState((prev) => {
      if (prev === "OFFLINE") {
        setTimeout(() => {
          setSyncState("SYNCING");
          setTimeout(() => {
            setPendingSyncQueue((queue) => {
              setSubmittedReports((hist) => [
                ...queue.map((item) => ({ ...item, syncStatus: "SYNCED" as const })),
                ...hist,
              ]);
              return [];
            });
            setSyncState("ONLINE");
            setLastSyncTime(
              new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
                " EAT"
            );
          }, 1200);
        }, 100);
        return "SYNCING";
      }
      return "OFFLINE";
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
      setLastSyncTime(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " EAT"
      );
    }, 1000);
  }, [syncState]);

  const submitIssueReport = useCallback(
    (category: IssueCategory, subReason?: string, notes?: string) => {
      const timeNow =
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " EAT";
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

      const newUpdate: DriverUpdate = {
        id: `UPD-ISSUE-${Date.now().toString().slice(-4)}`,
        type: category === "SAFETY ISSUE" ? "IMPORTANT SAFETY MESSAGE" : "INSTRUCTION UPDATE",
        title: `Report Logged: ${category}`,
        message: `${subReason ? subReason + ". " : ""}${
          notes ? notes : "Operational report received by KPC Terminal Dispatch."
        }`,
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

  // ---------------------------------------------------------------------------
  // NEW — Repository link handlers
  // ---------------------------------------------------------------------------

  /** Called when a REROUTE event arrives from the depot console. */
  const ingestReroute = useCallback((ev: RerouteEvent) => {
    const timeShort =
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " EAT";

    const newUpdate: DriverUpdate = {
      id: `UPD-RR-${Date.now()}`,
      type: "INSTRUCTION UPDATE",
      title: `Fast-Track Reroute: ${ev.fromBay} → ${ev.toBay}`,
      message:
        `FlowGuard has reassigned your collection from Bay ${ev.fromBay} to Bay ${ev.toBay}. ` +
        `Estimated recovery ${ev.savedMinutes} minutes · ` +
        `demurrage avoided KES ${ev.savedKes.toLocaleString("en-KE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}.`,
      previousTiming: `Bay ${ev.fromBay}`,
      newTiming: `Bay ${ev.toBay}`,
      reason: ev.reason,
      timestamp: timeShort,
      priority: "IMPORTANT",
      requiresAcknowledgement: true,
      isAcknowledged: false,
    };

    setUpdates((prev) => [newUpdate, ...prev]);

    // Auto-advance to Stage 4 (FlowGuard Fast-Track Intervention)
    setCurrentStageIndex(3);
    setIsInstructionAcknowledged(false);
    setInstructionAcknowledgedAt(null);
    setActiveTab("HOME");
  }, []);

  /** Called when an INJECT event arrives from the depot console. */
  const ingestInject = useCallback((ev: InjectEvent) => {
    const timeShort =
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " EAT";

    const newUpdate: DriverUpdate = {
      id: `UPD-INJ-${Date.now()}`,
      type: "GATE UPDATE",
      title: `Collection Assigned — Bay ${ev.targetBay}`,
      message:
        `${ev.depotName} has scheduled your collection for bay ${ev.targetBay}. ` +
        `${ev.product}, ${ev.quantityLitres.toLocaleString()}L.`,
      timestamp: timeShort,
      priority: "IMPORTANT",
      requiresAcknowledgement: true,
      isAcknowledged: false,
    };

    setUpdates((prev) => [newUpdate, ...prev]);
    setCurrentStageIndex(1); // Stage 2: Arrival & Tare
    setIsInstructionAcknowledged(false);
    setInstructionAcknowledgedAt(null);
    setActiveTab("HOME");
  }, []);

  /** Called on each repository poll — reflect the true stage if it moved. */
  const applyRepositoryStage = useCallback((stageIndex: number) => {
    setCurrentStageIndex((prev) => (prev === stageIndex ? prev : stageIndex));
  }, []);

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
    ingestReroute,
    ingestInject,
    applyRepositoryStage,
  };
}