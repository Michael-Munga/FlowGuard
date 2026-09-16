/**
 * KPC FlowGuard — Core Operational Data Contracts (Refined)
 * 
 * Conforms strictly to FLOWGUARD_PROJECT_CONTEXT.md and the Refinement Pass specification:
 * - Expected Demand vs Estimated Processing Capacity (not raw truck vs bay count)
 * - Candidate intervention evaluation table for explainable optimization
 * - Precise financial exposure terminology (At Risk vs Protected vs Realized)
 * - Autonomy states (Auto-Executed, Approval Required, Blocked, Failed, Verified)
 */

export type DepotId = 'mombasa' | 'nairobi' | 'nakuru' | 'kisumu' | 'eldoret';

export type OperationalState = 
  | 'NORMAL'
  | 'CAPACITY PRESSURE'
  | 'EQUIPMENT RISK'
  | 'HIGH DEMAND'
  | 'DEGRADED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type PrimaryBottleneck = 
  | 'Loading capacity'
  | 'Gate processing'
  | 'Loading performance'
  | 'Equipment'
  | 'Product/loading readiness'
  | 'Validation/release'
  | 'Process exception';

export interface Depot {
  id: DepotId;
  name: string;
  code: string;
  region: string;
  state: OperationalState;
  riskLevel: RiskLevel;
  trucksInside: number;
  expectedDemandNext90Min: number; // in orders / trucks
  totalPhysicalPositions: number;
  usableLoadingPositions: number;
  degradedPositions: number;
  estimatedProcessingCapacity90Min: number; // realistic order throughput capacity
  currentQueue: number;
  predictedPeakQueue: number;
  predictedTurnaroundMin: number;
  baselineTurnaroundMin: number;
  primaryBottleneck: PrimaryBottleneck;
  bottleneckDetail: string;
  interventionStatus: 'NONE' | 'ACTIVE INTERVENTION' | 'APPROVAL REQUIRED';
  activeInterventionCount: number;
  exposureAtRiskKes: number;
  exposureProtectedKes: number;
  loadingPerformanceRatePct: number; // 100% = baseline, 86% = 14% below baseline
}

export type TimelinePressureStage = 
  | 'NORMAL'
  | 'DEMAND_SURGE'
  | 'CAPACITY_SHORTFALL'
  | 'INTERVENTION_ACTIVE'
  | 'STABILIZING';

export interface FuturePressurePoint {
  timeOffsetMin: number;          // 0, 30, 60, 90, 120
  timeLabel: string;              // 'NOW', '+30m', '+60m', '+90m', '+120m'
  expectedDemandTrucks: number;    // expected orders/trucks in this 30m window
  estimatedProcessingCapacity: number; // realistically processable trucks in window
  projectedBacklogTrucks: number; // net backlog delta
  projectedWaitMin: number;       // expected dwell / wait
  stage: TimelinePressureStage;
  stageLabel: string;
  annotation: string;
  depotId: DepotId;
  usableLoadingBays: number;      // physical driver
}

export type ActionStatus = 
  | 'AUTO-SCHEDULED'
  | 'AUTO-EXECUTED'
  | 'APPROVAL REQUIRED'
  | 'VERIFIED'
  | 'BLOCKED BY POLICY'
  | 'FAILED'
  | 'MONITORING';

export interface CausalFactor {
  factor: string;
  impactScore: number;
  category: 'demand' | 'capacity' | 'equipment' | 'gate' | 'validation';
}

export interface CandidateIntervention {
  name: string;
  predictedTurnaroundMin: number;
  exposureKes: number;
  status: 'Feasible' | 'Selected' | 'Rejected' | 'Blocked by Policy';
  rationale?: string;
}

export interface AtRiskOperation {
  id: string;
  orderNumber: string;
  truckRegistration: string;
  omcName: string;
  depotId: DepotId;
  depotName: string;
  product: string;
  quantityLitres: number;
  expectedArrival: string;
  predictedTurnaroundMin: number;
  baselineTurnaroundMin: number;
  delayRiskMin: number;
  exposureAtRiskKes: number;
  exposureProtectedKes?: number;
  riskLevel: RiskLevel;
  primaryCause: string;
  causalFactors: CausalFactor[];
  candidateInterventions: CandidateIntervention[];
  selectedIntervention: string;
  proposedAction: string;
  actionStatus: ActionStatus;
  policyRule: string;
  predictedGateOut: string;
  confidencePct: number;
  verifiedOutcomeMin?: number;
}

export interface AutonomousIntervention {
  id: string;
  timestamp: string;
  depotId: DepotId;
  depotName: string;
  trigger: string;
  predictedProblem: string;
  actionTaken: string;
  alternativesEvaluatedCount: number;
  status: 'AUTO-EXECUTED' | 'APPROVAL REQUIRED' | 'VERIFIED' | 'BLOCKED BY POLICY' | 'FAILED';
  policyRule: string;
  expectedReductionMin: number;
  verifiedReductionMin?: number;
  exposureProtectedKes: number;
  realizedSavingsKes?: number;
  affectedOrdersCount: number;
  requiresSupervisorApproval?: boolean;
}

export type OperationalEventType =
  | 'ORDER_FORECAST'
  | 'TRUCK_ARRIVAL'
  | 'GATE_IN'
  | 'LOADING_STARTED'
  | 'LOADING_COMPLETED'
  | 'CAPACITY_CHANGE'
  | 'EQUIPMENT_DEGRADATION'
  | 'RISK_PREDICTION'
  | 'INTERVENTION_TRIGGERED'
  | 'ACTION_EXECUTED'
  | 'ACTION_VERIFIED'
  | 'DATA_SOURCE_DEGRADED'
  | 'DEGRADED_MODE_SWITCH';

export interface OperationalEvent {
  id: string;
  timestamp: string;
  depotId: DepotId;
  depotName: string;
  eventType: OperationalEventType;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  associatedTruck?: string;
}

export interface NetworkKpis {
  expectedCollectionDemandNearTerm: number; // e.g. 55 orders / trucks expected
  trucksInsideTotal: number;
  atRiskCount: number;
  avgPredictedTurnaroundMin: number;
  baselineTurnaroundMin: number;
  activeInterventionsCount: number;
  approvalRequiredCount: number;
  exposureAtRiskKes: number;
  exposureProtectedKes: number;
  realizedSavingsKes: number;
  networkCapacityPressurePct: number; // e.g. 78%
  networkCapacityPressureLevel: 'OPTIMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  autonomyMode: 'FULL AUTONOMY' | 'APPROVAL GATED' | 'DEGRADED';
  loadingTrucksCount?: number;
  queueTrucksCount?: number;
  severityCounts?: {
    critical?: number;
    high?: number;
    medium?: number;
    low?: number;
  };
  autoExecutedCount?: number;
}

export interface SystemHealth {
  status: 'NOMINAL' | 'DEGRADED' | 'SYNCING';
  predictionEngineStatus: 'OPERATIONAL' | 'DEGRADED' | 'CALIBRATING';
  eventStreamStatus: 'HEALTHY' | 'OFFLINE';
  dataFreshnessSeconds: number;
  autonomousModeEnabled: boolean;
  autoExecuteEnabled: boolean;
  degradedModeActive: boolean;
  fallbackDataSource?: string;
  activeModelVersion: string;
}

/**
 * =====================================================================
 * DASHBOARD 2: DEPOT OPERATIONS DOMAIN CONTRACTS
 * =====================================================================
 */

export type YardStage = 
  | 'Gate-In'
  | 'Validation / Release'
  | 'Loading'
  | 'Ready to Exit'
  | 'Gate-Out';

export type TruckRiskStatus = 'GREEN' | 'AMBER' | 'RED' | 'NEUTRAL';

export interface StageTimestamps {
  gateIn?: string;
  validation?: string;
  loading?: string;
  readyToExit?: string;
  gateOut?: string;
}

export interface YardTruck {
  id: string;
  registration: string;
  omc: string;
  orderNumber: string;
  product: string;
  quantityLitres: number;
  compartmentsCount: number;
  currentStage: YardStage;
  timeInStageMin: number;
  baselineStageMin: number;
  dwellDeltaMin: number; // positive = above baseline, negative/zero = on track
  predictedGateOut: string;
  riskStatus: TruckRiskStatus;
  riskLabel: string;
  nextAction: string;
  flowGuardStatus: string;
  depotId: DepotId;
  assignedPosition?: string;
  // Detail drawer fields
  expectedArrival?: string;
  predictedLoadingStart?: string;
  predictedTurnaroundMin: number;
  baselineTurnaroundMin: number;
  confidencePct: number;
  whyAtRisk?: {
    cause: string;
    factors: string[];
  };
  actionDetail?: {
    interventionId?: string;
    proposedAction: string;
    actionStatus: ActionStatus;
    expectedImpactMin: number;
    approvalState: 'AUTO' | 'REQUIRED' | 'VERIFIED' | 'NONE';
  };
  stageTimestamps: StageTimestamps;
}

export type PositionStatus = 'AVAILABLE' | 'LOADING' | 'DEGRADED' | 'MAINTENANCE' | 'UNAVAILABLE';

export interface LoadingPosition {
  id: string;
  code: string; // 'P01', 'P02', ...
  depotId: DepotId;
  status: PositionStatus;
  activeTruckReg?: string;
  activeOmc?: string;
  activeOrder?: string;
  productCompatibility: string; // e.g. "PMS (Super Unleaded) / Dual-Arm"
  currentLoadingDurationMin?: number;
  estimatedFreeInMin?: number;
  telemetryNote: string; // e.g. "Flow rate 1,620 L/min - Nominal"
  flowRateLpm?: number;
  baselineFlowRateLpm: number;
}

export interface CapacityCalculationModel {
  usablePositions: number;
  timeWindowMin: number; // e.g. 90
  avgLoadingDurationMin: number; // e.g. 34 min
  performanceRatePct: number; // e.g. 82%
  effectiveThroughputTrucks: number; // e.g. 7
  formulaExplanation: string; // e.g. "(90m window / 34m avg loading) × 3 usable bays × 82% performance = 7 trucks"
}

export interface DepotCapacityState {
  depotId: DepotId;
  totalPhysicalPositions: number;
  usableNow: number;
  degraded: number;
  offlineUnavailable: number;
  reasons: {
    degradedReason?: string;
    unavailableReason?: string;
  };
  effectiveProcessingCapacityLabel: string; // e.g. "11 trucks / next 90 min"
  effectiveCapacityExplanation: string; // e.g. "5 usable positions + 86% loading performance + 48m avg turnaround"
  calculationModel: CapacityCalculationModel;
  positions: LoadingPosition[];
}


export interface EquipmentItem {
  name: string;
  status: 'NORMAL' | 'DEGRADED' | 'QUEUED' | 'HEALTHY' | 'READY' | 'MAINTENANCE';
  detail: string;
  lastChecked: string;
}

export interface DepotEquipmentState {
  depotId: DepotId;
  loadingSystem: EquipmentItem;
  metering: EquipmentItem;
  gateSystem: EquipmentItem;
  scada: EquipmentItem;
  productReadiness: EquipmentItem;
  loadingPerformanceRatePct: number; // e.g. 86
  loadingPerformanceDeltaLabel: string; // e.g. "14% slower than expected"
  averageFlowRateLpm: number;
  baselineFlowRateLpm: number;
}

export interface BottleneckContribution {
  factor: string;
  impactLevel: 'High' | 'Medium' | 'Low' | 'Nominal';
  scorePct: number;
  statusText: string;
}

export interface DepotBottleneckDiagnosis {
  depotId: DepotId;
  currentBottleneck: PrimaryBottleneck;
  headline: string;
  explanation: string;
  contributions: BottleneckContribution[];
  primaryCause?: string;
  currentImpact?: string;
  forecastHorizon?: string;
  flowGuardResponse?: string;
}

export interface DepotForecastPoint {
  offsetLabel: 'NOW' | '+30m' | '+60m' | '+90m';
  expectedDemand: number;
  effectiveCapacity: number;
  projectedBacklog: number;
  expectedWaitMin: number;
  operationalState: 'NORMAL' | 'DEMAND SURGE' | 'CAPACITY SHORTFALL' | 'STABILIZING' | 'OPTIMAL';
  unmitigatedBacklog: number;
  unmitigatedWaitMin: number;
}

export interface DepotForecast {
  depotId: DepotId;
  points: DepotForecastPoint[];
  stabilizationNote: string;
}

export interface DepotKpiSummary {
  trucksInside: number;
  inQueue: number;
  currentlyLoading: number;
  averageDwellMin: number;
  baselineDwellMin: number;
  dwellDeltaMin: number;
  atRiskCount: number;
  usablePositions: number;
  totalPositions: number;
  degradedPositions: number;
  unavailablePositions: number;
  effectiveCapacity90Min: number;
  expectedDemand90Min: number;
}

// ============================================================================
// DASHBOARD 3: OMC COLLECTION VISIBILITY DOMAIN MODEL
// ============================================================================

export type OmcId =
  | 'vivo'
  | 'totalenergies'
  | 'rubis'
  | 'lakeoil'
  | 'ola'
  | 'hass';

export interface OmcProfile {
  id: OmcId;
  name: string;
  shortName: string;
  accountCode: string;
  activeOrdersCount: number;
  atRiskCount: number;
  onTrackCount: number;
  primaryDepot: DepotId;
  contactEmail: string;
  contactPhone: string;
}

export type OmcCollectionStatus =
  | 'ON TRACK'
  | 'DEVELOPING RISK'
  | 'AT RISK'
  | 'DELAYED'
  | 'LOADING'
  | 'READY FOR EXIT'
  | 'COMPLETED';

export type OmcJourneyStageId =
  | 'ORDER_PLACED'
  | 'GATE_IN'
  | 'VALIDATION_RELEASE'
  | 'GANTRY_LOADING'
  | 'GATE_OUT';

export type OmcStageStatus =
  | 'COMPLETED'
  | 'ACTIVE'
  | 'PREDICTED'
  | 'DELAYED'
  | 'PENDING';

export interface OmcStageDetail {
  stageId: OmcJourneyStageId;
  stageName: string;
  status: OmcStageStatus;
  timestamp?: string;
  expectedDurationMin: number;
  actualOrPredictedDurationMin: number;
  note?: string;
  customsReleaseStatus?: 'RELEASED' | 'INSPECTION_HOLD' | 'PRE_CLEARED' | 'NOT_APPLICABLE';
}

export interface OmcWhyAtRisk {
  headline: string;
  causeSummary: string;
  causalContributions: {
    factor: string;
    detail: string;
    impactLevel: 'High' | 'Medium' | 'Low';
  }[];
}

export interface OmcFlowGuardAssessment {
  summary: string;
  confidencePct: number;
  modelVersion: string;
}

export interface OmcFlowGuardAction {
  actionName: string;
  timestamp: string;
  expectedImpactMin: number;
  status: 'EXECUTED' | 'SUPERVISOR_AUTHORIZED' | 'PENDING';
  beforeGateOut: string;
  afterGateOut: string;
  rationale: string;
}

export interface OmcExposure {
  potentialKes: number;
  protectedKes: number;
  realizedKes?: number;
}

export interface OmcCommunicationStatus {
  notified: boolean;
  acknowledged: boolean;
  notifiedAt?: string;
  acknowledgedAt?: string;
}

export interface OmcCollectionOrder {
  id: string;
  omcId: OmcId;
  omcName: string;
  truckRegistration: string;
  transporterName: string;
  driverName: string;
  depotId: DepotId;
  depotName: string;
  product: string;
  quantityLitres: number;
  compartmentsCount: number;
  currentStage: OmcJourneyStageId;
  currentStageLabel: string;
  status: OmcCollectionStatus;
  orderPlacementTime: string;
  expectedArrival: string;
  gateInTime?: string;
  predictedGateOut: string;
  gateOutConfidencePct: number;
  predictedTurnaroundMin: number;
  baselineTurnaroundMin: number;
  turnaroundDeltaMin: number;
  riskSeverity: 'CRITICAL' | 'ELEVATED' | 'NOMINAL';
  lastUpdate: string;
  assignedBay?: string;
  journey: OmcStageDetail[];
  whyAtRisk?: OmcWhyAtRisk;
  flowGuardAssessment?: OmcFlowGuardAssessment;
  flowGuardAction?: OmcFlowGuardAction;
  exposure?: OmcExposure;
  communicationStatus: OmcCommunicationStatus;
}

export interface OmcKpiSummary {
  activeOrdersCount: number;
  trucksInKpcProcess: number;
  atRiskCount: number;
  predictedAvgTurnaroundMin: number;
  baselineAvgTurnaroundMin: number;
  turnaroundDeltaMin: number;
  gateOutsCompletedToday: number;
  expectedGateOutsRemaining: number;
  expectedGateOutsToday: number;
  exposureAtRiskKes: number;
  exposureProtectedKes: number;
  realizedSavingsKes: number;
}

export interface OmcHourlyOutlook {
  timeWindow: string;
  expectedOrdersCount: number;
  congestionLevel: 'NORMAL' | 'CAPACITY_PRESSURE' | 'STABILIZING';
  turnaroundCondition?: string;
  note: string;
}

export type OmcNotificationType =
  | 'PREDICTION_UPDATE'
  | 'CAPACITY_ADVISORY'
  | 'INTERVENTION_EXECUTED'
  | 'DELAY_WARNING'
  | 'COLLECTION_COMPLETED';

export interface OmcNotification {
  id: string;
  omcId: OmcId;
  orderId?: string;
  truckRegistration?: string;
  depotName: string;
  type: OmcNotificationType;
  title: string;
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  requiresAcknowledgement: boolean;
  isAcknowledged: boolean;
  acknowledgedAt?: string;
}

// ============================================================================
// DASHBOARD 4: AUTONOMOUS CONTROL DOMAIN MODEL
// ============================================================================

export type AutonomyState =
  | 'AUTONOMOUS'
  | 'APPROVAL-GATED'
  | 'DEGRADED'
  | 'DISABLED';

export type SubsystemOperationalStatus =
  | 'OPERATIONAL'
  | 'DEGRADED'
  | 'CALIBRATING'
  | 'CONSTRAINED'
  | 'ACTIVE'
  | 'AUDIT_ONLY'
  | 'BYPASSED'
  | 'ARMED'
  | 'STANDBY'
  | 'STREAMING'
  | 'OFFLINE'
  | 'IMMUTABLE_SYNCED';

export interface AutonomySubsystemHealth {
  predictionEngine: 'OPERATIONAL' | 'DEGRADED' | 'CALIBRATING';
  optimizationEngine: 'OPERATIONAL' | 'DEGRADED' | 'CONSTRAINED';
  policyGate: 'ACTIVE' | 'AUDIT_ONLY' | 'BYPASSED';
  actionExecutor: 'ARMED' | 'STANDBY' | 'DISARMED';
  eventStream: 'STREAMING' | 'BACKLOGGED' | 'OFFLINE';
  auditLogger: 'IMMUTABLE_SYNCED' | 'PENDING_BLOCK';
}

export type TelemetrySystemCategory =
  | 'SCADA'
  | 'ERP'
  | 'METERING'
  | 'GATE'
  | 'TANK_FARM'
  | 'HISTORICAL'
  | 'TELEMATICS';

export interface TelemetryDataSource {
  id: string;
  name: string;
  systemCategory: TelemetrySystemCategory;
  sourceSystem: string;
  status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
  latencyMs: number;
  lastSync: string;
  sampleRate: string;
  healthPct: number;
  fallbackMechanism: string;
  isFallbackActive: boolean;
  recordRatePerMin: number;
  protocol: string;
}

export type DecisionStepStage =
  | 'SIGNAL'
  | 'PREDICT'
  | 'DIAGNOSE'
  | 'OPTIMIZE'
  | 'DECIDE'
  | 'EXECUTE'
  | 'VERIFY'
  | 'LOG';

export interface StepMetric {
  label: string;
  value: string;
  isHighlight?: boolean;
}

export interface StepPayloadEntry {
  key: string;
  value: string;
  type?: 'text' | 'number' | 'code' | 'badge';
}

export interface DecisionTimelineStep {
  stage: DecisionStepStage;
  label: string;
  subLabel: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'BLOCKED' | 'PENDING' | 'FAILED';
  timestamp: string;
  summary: string;
  metrics: StepMetric[];
  payloadEntries?: StepPayloadEntry[];
  technicalDetail: string;
}

export interface AutonomyCandidateIntervention {
  id: string;
  rank: number;
  name: string;
  actionType: string;
  predictedTurnaroundMin: number;
  exposureKes: number;
  disruptionScore: 'None' | 'Low' | 'Moderate' | 'High' | 'Severe';
  feasibility: 'Feasible' | 'Selected' | 'Rejected' | 'Blocked by Policy';
  objectiveScore: number; // e.g. 94/100
  selectionRationale: string;
  queueReductionExpectedMin: number;
  ordersAffected: number;
}

export type PolicyAutonomyLevel =
  | 'L1 — ADVISORY'
  | 'L2 — AUTO-EXECUTABLE'
  | 'L3 — HUMAN APPROVAL'
  | 'L1 - Informational'
  | 'L2 - Auto-Executable'
  | 'L3 - Approval Required';

export interface AutonomyPolicyRule {
  id: string;
  code: string; // e.g. "POL-042"
  name: string;
  category: 'Capacity' | 'Equipment' | 'Gate' | 'Safety' | 'Quality';
  autonomyLevel: PolicyAutonomyLevel;
  condition: string;
  actionAuthorized: string;
  safetyInvariant: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'EVALUATING';
  lastEvaluated: string;
  evaluationPass: boolean;
}

export interface ActuationDetails {
  dispatchTarget: string;
  commandType: string;
  affectedOrders: string[];
  dispatchedAt: string;
  ackLatencyMs: number;
  actuationStatus: 'CONFIRMED' | 'SUPERVISOR_PENDING' | 'BLOCKED' | 'FAILED' | 'ESCALATED';
  targetDevice: string;
}

export interface DecisionVerification {
  targetReductionMin: number;
  verifiedReductionMin?: number;
  varianceMin?: number;
  exposureProtectedKes: number;
  realizedSavingsKes?: number;
  recoveryAttainmentPct?: number;
  accuracyPct?: number;
  status:
    | 'VERIFIED'
    | 'PENDING_VERIFICATION'
    | 'VARIANCE_EXCEEDED'
    | 'FAILED'
    | 'BLOCKED'
    | 'ESCALATED'
    | 'PARTIAL'
    | 'IN PROGRESS'
    | 'INCONCLUSIVE';
  measuredAt?: string;
  verificationMethod: string;
}

export interface AutonomyIncident {
  id: string;
  timestamp: string;
  depotId: DepotId;
  depotName: string;
  headline: string;
  status: 'AUTO-EXECUTED' | 'APPROVAL REQUIRED' | 'VERIFIED' | 'BLOCKED BY POLICY' | 'FAILED' | 'BLOCKED / ESCALATED';
  autonomyLevel: 'L1' | 'L2' | 'L3';
  predictedProblem: string;
  telemetryTrigger: string;
  causalFactors: CausalFactor[];
  timelineSteps: DecisionTimelineStep[];
  candidates: AutonomyCandidateIntervention[];
  selectedCandidateId: string;
  appliedPolicy: AutonomyPolicyRule;
  actuationDetails: ActuationDetails;
  verification: DecisionVerification;
  auditHash: string;
  operatorNotes?: string;
}

export interface AutonomyAggregateMetrics {
  modelVersion: string;
  calibrationAccuracyPct: number;
  successRatePct: number;
  interventionsExecutedTotal: number;
  interventionsVerifiedSuccess: number;
  meanArrivalErrorMin: number;
  meanTurnaroundErrorMin: number;
  totalExposureProtectedKes: number;
  activeRulesCount: number;
  unauthorizedInterventionsCount: number;
  lastDriftCheck: string;
  autonomyDistribution?: {
    L1_ADVISORY: number;
    L2_AUTO_EXECUTABLE: number;
    L3_APPROVAL_REQUIRED: number;
  };
}

/**
 * =====================================================================
 * DASHBOARD 5: EXECUTIVE CONTROL PLANE DOMAIN CONTRACTS
 * =====================================================================
 */

export interface ExecutiveRecommendation {
  headline: string;
  action: string;
  justifications: string[];
}

export type ExecutiveTimePeriod = 'TODAY' | '7_DAYS' | '30_DAYS';

export interface ExecutiveKpiSummary {
  totalExposureProtectedKes: number;
  realizedSavingsKes: number;
  exposureAtRiskKes: number;
  projectedExposureTotalKes: number;
  baselineTurnaroundMin: number;
  currentTurnaroundMin: number;
  turnaroundImprovementPct: number;
  turnaroundRecoveredMin: number;
  ordersServicedOnTimePct: number;
  ordersOnTimeDeltaPts: number;
  autonomousInterventionsTotal: number;
  interventionsVerifiedSuccess: number;
  interventionSuccessRatePct: number;
  recoveryAttainmentPct?: number;
  meanPredictionErrorMin?: number;
  capacityRecoveredHours: number;
  capacityRecoveredTruckSlots: number;
  simulationPeriodLabel: string;
  executiveNarrative: string;
  recommendation: ExecutiveRecommendation;
}

export interface TurnaroundTrendPoint {
  period: string;
  turnaroundMin: number;
  baselineMin: number;
  targetMin: number;
  deltaMin: number;
  improvementPct: number;
}

export interface DepotExecutivePerformance {
  depotId: DepotId;
  depotName: string;
  code: string;
  region: string;
  baselineTurnaroundMin: number;
  currentTurnaroundMin: number;
  turnaroundImprovementPct: number;
  turnaroundRecoveredMin: number;
  interventionsCount: number;
  exposureProtectedKes: number;
  realizedSavingsKes: number;
  currentStatus: string;
  topBottleneck: string;
  volumeProcessedPct: number;
}

export interface ValueWaterfallItem {
  id: string;
  category: string;
  amountKes: number;
  percentage: number;
  interventionsCount: number;
  primaryDepotId: DepotId;
  description: string;
}

export interface BottleneckImpactSummary {
  bottleneck: string;
  interventionsCount: number;
  turnaroundDwellSavedMin: number;
  exposureProtectedKes: number;
  percentageOfTotal: number;
  isTopBottleneck: boolean;
}

export interface AutonomyFunnel {
  signalsEvaluated: number;
  risksIdentified: number;
  candidateInterventionsEvaluated: number;
  actionsExecuted: number;
  actionsVerifiedSuccess: number;
  actionsApprovalGated: number;
  actionsBlockedPolicy: number;
  actionsFailedSafely: number;
}

export interface ExecutiveTopRisk {
  rank: number;
  depotId: DepotId;
  depotName: string;
  bottleneckCategory: string;
  ordersExposedCount: number;
  potentialExposureKes: number;
  mitigationStatus: string;
}

export interface ExecutiveRiskSummary {
  projectedExposureTotalKes: number;
  exposureProtectedKes: number;
  remainingAtRiskKes: number;
  protectionRatePct: number;
  topRisks: ExecutiveTopRisk[];
}

export type RoiScenarioName = 'Conservative' | 'Expected' | 'Upside';

export interface RoiModelScenario {
  scenarioName: RoiScenarioName;
  implementationInvestmentKes: number;
  annualProtectedValueKes: number;
  annualOperatingCostKes: number;
  netFirstYearBenefitKes: number;
  paybackMonths: number;
  firstYearRoiMultiplier: number;
  assumptions: string[];
}

export type PrototypeReadinessStatus =
  | 'Demonstrated'
  | 'Demonstrated in simulation'
  | 'Synthetic'
  | 'Prototype'
  | 'Not connected';

export interface DeploymentReadinessCategory {
  id: string;
  dimension: string;
  status: PrototypeReadinessStatus | 'READY_PROTOTYPE' | 'OPERATIONAL_PROTOTYPE' | 'SIMULATED' | 'NOT_CONNECTED';
  statusLabel: string;
  readinessLevel: string;
  notes: string;
  productionRoadmap: string;
}

export interface ExecutiveTrustHealth {
  systemState: 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE';
  predictionEngine: 'HEALTHY' | 'CALIBRATING' | 'DEGRADED';
  optimizationSolver: 'HEALTHY' | 'CONVERGING' | 'OFFLINE';
  autonomyMode: 'BOUNDED L2/L3' | 'APPROVAL GATED' | 'SIMULATED';
  auditIntegrity: 'SYNCHRONIZED' | 'HEALTHY' | 'SHA-256 VERIFIED' | 'OUT_OF_SYNC';
  meanTurnaroundErrorMin: number;
  solverConvergenceLatencyMs: number;
}

export interface ExecutiveAlert {
  id: string;
  timestamp: string;
  type: 'SUCCESS' | 'WARNING' | 'INFO' | 'ACTION_REQUIRED';
  title: string;
  message: string;
  depotId?: DepotId;
}


