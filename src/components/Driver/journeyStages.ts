import { JourneyStageConfig, DriverUpdate } from "./types";

export const DRIVER_JOURNEY_STAGES: JourneyStageConfig[] = [
  // STAGE 1: EN ROUTE
  {
    key: "EN_ROUTE",
    stepNumber: 1,
    stageName: "1. En Route to Depot",
    subStatus: "Approaching Outer Perimeter",
    collectionStatus: "EXPECTED",
    statusBadgeColor: "blue",

    nextActionTitle: "PROCEED TO KPC NAIROBI GATE",
    nextActionSubtitle: "Arrive within your predicted collection window.",
    nextActionLocation: "North Ingress Gate • Outer Queue Lane 2",
    nextActionGuidance: "Have your electronic gate-pass (LO-NBO-8821) ready for transponder scan.",
    requiresAcknowledgement: true,

    predictedArrivalWindow: "10:15–10:30",
    arrivalConfidencePct: 88,
    expectedTurnaroundMin: 61,
    turnaroundNote: "Current depot conditions nominal",
    predictedGateOutWindow: "11:16–11:31",
    gateOutConfidencePct: 86,
    isRecovering: false,

    steps: [
      { index: 1, title: "Collection Confirmed", status: "COMPLETED", timestamp: "08:15 EAT" },
      { index: 2, title: "Arrival", status: "CURRENT", timestamp: "ETA 10:20" },
      { index: 3, title: "Gate-in", status: "UPCOMING" },
      { index: 4, title: "Validation", status: "UPCOMING" },
      { index: 5, title: "Loading", status: "UPCOMING" },
      { index: 6, title: "Gate-out", status: "UPCOMING" },
    ],
  },

  // STAGE 2: GATE IN / TARE SCALE
  {
    key: "GATE_IN",
    stepNumber: 2,
    stageName: "2. Arrival & Tare Weighbridge",
    subStatus: "Outer Gate Cleared",
    collectionStatus: "AT GATE",
    statusBadgeColor: "blue",

    nextActionTitle: "PROCEED TO TARE WEIGHBRIDGE SCALE 1",
    nextActionSubtitle: "Record unladen vehicle tare weight before bay ingress.",
    nextActionLocation: "Tare Scale #1 • North Weighbridge Platform",
    nextActionGuidance: "Stop on platform sensors, engine off. Transponder RFID will verify unladen mass.",
    requiresAcknowledgement: true,

    predictedArrivalWindow: "10:18 (Arrived)",
    arrivalConfidencePct: 100,
    expectedTurnaroundMin: 64,
    turnaroundNote: "Weighbridge queue: 2 vehicles ahead",
    predictedGateOutWindow: "11:22–11:37",
    gateOutConfidencePct: 87,
    isRecovering: false,

    steps: [
      { index: 1, title: "Collection Confirmed", status: "COMPLETED", timestamp: "08:15 EAT" },
      { index: 2, title: "Arrival", status: "COMPLETED", timestamp: "10:18 EAT" },
      { index: 3, title: "Gate-in", status: "CURRENT", timestamp: "In Progress" },
      { index: 4, title: "Validation", status: "UPCOMING" },
      { index: 5, title: "Loading", status: "UPCOMING" },
      { index: 6, title: "Gate-out", status: "UPCOMING" },
    ],
  },

  // STAGE 3: AT RISK / CONGESTION
  {
    key: "AT_RISK",
    stepNumber: 3,
    stageName: "3. Yard Staging / Delay Risk",
    subStatus: "Standard Gantry Queue Elevated",
    collectionStatus: "AT RISK",
    statusBadgeColor: "amber",

    nextActionTitle: "HOLD IN STAGING AREA 2 — ADJUSTMENT IN PROGRESS",
    nextActionSubtitle: "Your collection may take longer than previously expected.",
    nextActionLocation: "Staging Bay B04 • Awaiting Bay Assignment",
    nextActionGuidance: "Standard Bay P01 queue is congested. FlowGuard is actively computing a deconfliction route.",
    requiresAcknowledgement: true,

    predictedArrivalWindow: "10:18 (Arrived)",
    arrivalConfidencePct: 100,
    expectedTurnaroundMin: 85,
    turnaroundNote: "Bay queue backlog: +21m dwell projection",
    predictedGateOutWindow: "11:45–12:00",
    gateOutConfidencePct: 81,
    isRecovering: false,

    steps: [
      { index: 1, title: "Collection Confirmed", status: "COMPLETED", timestamp: "08:15 EAT" },
      { index: 2, title: "Arrival", status: "COMPLETED", timestamp: "10:18 EAT" },
      { index: 3, title: "Gate-in", status: "COMPLETED", timestamp: "10:24 EAT" },
      { index: 4, title: "Validation", status: "CURRENT", timestamp: "Staging Wait" },
      { index: 5, title: "Loading", status: "UPCOMING" },
      { index: 6, title: "Gate-out", status: "UPCOMING" },
    ],
  },

  // STAGE 4: REALLOCATED / FLOWGUARD INTERVENTION (Matches DEC-0142 / INT-8801)
  {
    key: "REALLOCATED",
    stepNumber: 4,
    stageName: "4. FlowGuard Fast-Track Intervention",
    subStatus: "Reallocated to High-Velocity Bay P04",
    collectionStatus: "OPTIMIZED",
    statusBadgeColor: "emerald",

    nextActionTitle: "PROCEED TO LOADING POSITION BAY P04",
    nextActionSubtitle: "Autonomous fast-track routing active. Dual-arm bay assigned.",
    nextActionLocation: "Gantry Bay P04 • Dual-Arm High-Velocity Rack",
    nextActionGuidance: "Follow green gantry lane markings to Bay P04. Position tanker compartments 1–3 under loading arms.",
    requiresAcknowledgement: true,

    predictedArrivalWindow: "10:18 (Arrived)",
    arrivalConfidencePct: 100,
    expectedTurnaroundMin: 56,
    turnaroundNote: "FlowGuard autonomous sequencing active",
    predictedGateOutWindow: "11:02–11:14",
    gateOutConfidencePct: 93,
    isRecovering: true,
    recoveryNote: "Predicted gate-out improved by 24 min (averted congestion delay)",

    steps: [
      { index: 1, title: "Collection Confirmed", status: "COMPLETED", timestamp: "08:15 EAT" },
      { index: 2, title: "Arrival", status: "COMPLETED", timestamp: "10:18 EAT" },
      { index: 3, title: "Gate-in", status: "COMPLETED", timestamp: "10:24 EAT" },
      { index: 4, title: "Validation", status: "COMPLETED", timestamp: "10:31 EAT" },
      { index: 5, title: "Loading", status: "CURRENT", timestamp: "Assigned P04" },
      { index: 6, title: "Gate-out", status: "UPCOMING" },
    ],
  },

  // STAGE 5: GANTRY LOADING IN PROGRESS
  {
    key: "LOADING",
    stepNumber: 5,
    stageName: "5. Active Gantry Loading",
    subStatus: "36,000L AGO Loading (Arms 1 & 2)",
    collectionStatus: "LOADING",
    statusBadgeColor: "emerald",

    nextActionTitle: "CONNECT EARTH CLAMP & MONITOR DUAL-ARM FILLING",
    nextActionSubtitle: "Loading underway on Bay P04. Estimated 14 minutes remaining.",
    nextActionLocation: "Bay P04 Loading Rack • Coriolis Mass-Flow Meter Active",
    nextActionGuidance: "Ensure safety earth bonding clamp remains attached. Verify overfill optical probe connection.",
    requiresAcknowledgement: false,

    predictedArrivalWindow: "10:18 (Arrived)",
    arrivalConfidencePct: 100,
    expectedTurnaroundMin: 52,
    turnaroundNote: "Pumping at 2,400 L/min via dual Coriolis arms",
    predictedGateOutWindow: "10:58–11:08",
    gateOutConfidencePct: 95,
    isRecovering: true,
    recoveryNote: "Loading velocity nominal • FlowGuard verification on track",

    steps: [
      { index: 1, title: "Collection Confirmed", status: "COMPLETED", timestamp: "08:15 EAT" },
      { index: 2, title: "Arrival", status: "COMPLETED", timestamp: "10:18 EAT" },
      { index: 3, title: "Gate-in", status: "COMPLETED", timestamp: "10:24 EAT" },
      { index: 4, title: "Validation", status: "COMPLETED", timestamp: "10:31 EAT" },
      { index: 5, title: "Loading", status: "CURRENT", timestamp: "Filling (68%)" },
      { index: 6, title: "Gate-out", status: "UPCOMING" },
    ],
  },

  // STAGE 6: GATE-OUT READY
  {
    key: "GATE_OUT_READY",
    stepNumber: 6,
    stageName: "6. Gross Weighbridge & Exit Seal",
    subStatus: "Loading Complete (36,000L AGO Verified)",
    collectionStatus: "GATE-OUT READY",
    statusBadgeColor: "purple",

    nextActionTitle: "PROCEED TO GROSS SCALE & SECURITY EXIT",
    nextActionSubtitle: "Gantry loading completed. Proceed to exit platform for seal verification.",
    nextActionLocation: "Gross Weighbridge Platform 2 • South Exit Security Post",
    nextActionGuidance: "Stop on gross scale for final electronic manifest tare-delta check, then receive security bolt seals.",
    requiresAcknowledgement: true,

    predictedArrivalWindow: "10:18 (Arrived)",
    arrivalConfidencePct: 100,
    expectedTurnaroundMin: 49,
    turnaroundNote: "Loading finished • Gross scale ready",
    predictedGateOutWindow: "11:00–11:05",
    gateOutConfidencePct: 98,
    isRecovering: true,
    recoveryNote: "Total turnaround 49 min (saved 12 min vs baseline)",

    steps: [
      { index: 1, title: "Collection Confirmed", status: "COMPLETED", timestamp: "08:15 EAT" },
      { index: 2, title: "Arrival", status: "COMPLETED", timestamp: "10:18 EAT" },
      { index: 3, title: "Gate-in", status: "COMPLETED", timestamp: "10:24 EAT" },
      { index: 4, title: "Validation", status: "COMPLETED", timestamp: "10:31 EAT" },
      { index: 5, title: "Loading", status: "COMPLETED", timestamp: "10:52 EAT" },
      { index: 6, title: "Gate-out", status: "CURRENT", timestamp: "Gross Scale" },
    ],
  },

  // STAGE 7: COMPLETED
  {
    key: "COMPLETED",
    stepNumber: 7,
    stageName: "7. Collection Complete",
    subStatus: "Gate-Out Verified at 11:02 EAT",
    collectionStatus: "COMPLETED",
    statusBadgeColor: "emerald",

    nextActionTitle: "COLLECTION COMPLETED — EXIT TERMINAL SAFELY",
    nextActionSubtitle: "Manifest closed and KRA RECTS security seals verified.",
    nextActionLocation: "Terminal Outer Security Barrier • Clear for Road Ingress",
    nextActionGuidance: "Thank you for adhering to KPC safety protocols. All KPC gate-to-gate collection processes complete.",
    requiresAcknowledgement: false,

    predictedArrivalWindow: "10:18 (Arrived)",
    arrivalConfidencePct: 100,
    expectedTurnaroundMin: 44,
    turnaroundNote: "Observed Gate-to-Gate: 44 minutes",
    predictedGateOutWindow: "11:02 (Actual Gate-Out)",
    gateOutConfidencePct: 100,
    isRecovering: true,
    recoveryNote: "Verified: FlowGuard intervention recovered 17 min of dwell",

    steps: [
      { index: 1, title: "Collection Confirmed", status: "COMPLETED", timestamp: "08:15 EAT" },
      { index: 2, title: "Arrival", status: "COMPLETED", timestamp: "10:18 EAT" },
      { index: 3, title: "Gate-in", status: "COMPLETED", timestamp: "10:24 EAT" },
      { index: 4, title: "Validation", status: "COMPLETED", timestamp: "10:31 EAT" },
      { index: 5, title: "Loading", status: "COMPLETED", timestamp: "10:52 EAT" },
      { index: 6, title: "Gate-out", status: "COMPLETED", timestamp: "11:02 EAT" },
    ],
  },
];

export const INITIAL_DRIVER_UPDATES: DriverUpdate[] = [
  {
    id: "UPD-DRV-001",
    type: "INSTRUCTION UPDATE",
    title: "Fast-Track Loading Position Assigned: Bay P04",
    message: "FlowGuard autonomous deconfliction has reassigned your collection from congested Bay P01 to dual-arm Bay P04. Tare weighbridge cleared.",
    previousTiming: "Bay P01 (Queue: 3 tankers)",
    newTiming: "Bay P04 (Immediate ingress)",
    reason: "Queue deconfliction to protect TSA collection SLA window.",
    timestamp: "10:31 EAT",
    priority: "IMPORTANT",
    requiresAcknowledgement: true,
    isAcknowledged: false,
  },
  {
    id: "UPD-DRV-002",
    type: "PREDICTED GATE-OUT CHANGE",
    title: "Predicted Gate-Out Improved (-24 min)",
    message: "Your estimated terminal gate-out has improved from 11:45 AM to 11:02–11:14 AM following FlowGuard autonomous position sequencing.",
    previousTiming: "11:45–12:00",
    newTiming: "11:02–11:14",
    reason: "High-velocity dual Coriolis arm allocated.",
    timestamp: "10:32 EAT",
    priority: "INFO",
    requiresAcknowledgement: false,
    isAcknowledged: true,
    acknowledgedAt: "10:33 EAT",
  },
  {
    id: "UPD-DRV-003",
    type: "IMPORTANT SAFETY MESSAGE",
    title: "Mandatory Terminal Safety Advisory",
    message: "Terminal maximum speed limit is strictly 15 km/h. Earth bonding clamp must be attached before arm connection. Mobile phone use on loading rack is prohibited.",
    timestamp: "09:00 EAT",
    priority: "URGENT",
    requiresAcknowledgement: true,
    isAcknowledged: true,
    acknowledgedAt: "09:12 EAT",
  },
  {
    id: "UPD-DRV-004",
    type: "GATE UPDATE",
    title: "Smart Gate RFID Ingress Verified",
    message: "Vehicle transponder KDD 412X scanned at North Ingress Gate. Manifest LO-NBO-8821 matched with KPC SAP LE scheduling.",
    timestamp: "10:18 EAT",
    priority: "INFO",
    requiresAcknowledgement: false,
    isAcknowledged: true,
    acknowledgedAt: "10:19 EAT",
  },
];
