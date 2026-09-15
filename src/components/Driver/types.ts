/**
 * FlowGuard Driver Mobile Application — Domain Types
 * 
 * Field-facing mobile experience for KPC road tanker collection drivers.
 * Scope ends at GATE-OUT. No downstream retail/fleet tracking.
 */

export type DriverTab = "HOME" | "COLLECTION" | "UPDATES" | "MORE";

export type SyncState = "ONLINE" | "SYNCING" | "OFFLINE" | "SYNC COMPLETE" | "SYNC ERROR";

export type UpdatePriority = "URGENT" | "IMPORTANT" | "INFO";

export type UpdateType =
  | "INSTRUCTION UPDATE"
  | "ARRIVAL UPDATE"
  | "GATE UPDATE"
  | "LOADING UPDATE"
  | "PREDICTED GATE-OUT CHANGE"
  | "COLLECTION COMPLETE"
  | "IMPORTANT SAFETY MESSAGE";

export interface DriverUpdate {
  id: string;
  type: UpdateType;
  title: string;
  message: string;
  previousTiming?: string;
  newTiming?: string;
  reason?: string;
  timestamp: string;
  priority: UpdatePriority;
  requiresAcknowledgement: boolean;
  isAcknowledged: boolean;
  acknowledgedAt?: string;
}

export type IssueCategory =
  | "I'M DELAYED"
  | "CAN'T ACCESS GATE"
  | "INSTRUCTION UNCLEAR"
  | "DOCUMENT / VEHICLE ISSUE"
  | "SAFETY ISSUE"
  | "OTHER";

export interface DriverIssueReport {
  id: string;
  category: IssueCategory;
  subReason?: string;
  notes?: string;
  timestamp: string;
  syncStatus: "SYNCED" | "PENDING_SYNC";
}

export type JourneyStageKey =
  | "EN_ROUTE"
  | "GATE_IN"
  | "AT_RISK"
  | "REALLOCATED"
  | "LOADING"
  | "GATE_OUT_READY"
  | "COMPLETED";

export interface JourneyStageConfig {
  key: JourneyStageKey;
  stepNumber: number;
  stageName: string;
  subStatus: string;
  collectionStatus: "EXPECTED" | "AT GATE" | "AT RISK" | "OPTIMIZED" | "LOADING" | "GATE-OUT READY" | "COMPLETED";
  statusBadgeColor: "emerald" | "amber" | "blue" | "slate" | "purple";
  
  // Next Action Hero Content
  nextActionTitle: string;
  nextActionSubtitle: string;
  nextActionLocation: string;
  nextActionGuidance: string;
  requiresAcknowledgement: boolean;

  // Timings
  predictedArrivalWindow: string;
  arrivalConfidencePct: number;
  expectedTurnaroundMin: number;
  turnaroundNote: string;
  predictedGateOutWindow: string;
  gateOutConfidencePct: number;
  isRecovering: boolean;
  recoveryNote?: string;

  // Journey Tracker States
  // 6 visual steps: 1. Confirmed, 2. Arrival, 3. Gate-in, 4. Validation, 5. Loading, 6. Gate-out
  steps: {
    index: number;
    title: string;
    status: "COMPLETED" | "CURRENT" | "UPCOMING";
    timestamp?: string;
  }[];
}
