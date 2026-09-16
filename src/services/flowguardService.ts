// src/services/flowguardService.ts

import {
  Depot,
  DepotId,
  FuturePressurePoint,
  AtRiskOperation,
  AutonomousIntervention,
  OperationalEvent,
  NetworkKpis,
  SystemHealth,
  YardTruck,
  DepotCapacityState,
  DepotEquipmentState,
  DepotBottleneckDiagnosis,
  DepotForecast,
  DepotKpiSummary,
  OmcId,
  OmcProfile,
  OmcCollectionOrder,
  OmcNotification,
  OmcHourlyOutlook,
  OmcKpiSummary,
  AutonomyIncident,
  AutonomyPolicyRule,
  TelemetryDataSource,
  AutonomyAggregateMetrics,
  AutonomySubsystemHealth,
  AutonomyState,
  ExecutiveKpiSummary,
  ExecutiveTimePeriod,
  TurnaroundTrendPoint,
  DepotExecutivePerformance,
  ValueWaterfallItem,
  BottleneckImpactSummary,
  AutonomyFunnel,
  ExecutiveRiskSummary,
  RoiModelScenario,
  RoiScenarioName,
  DeploymentReadinessCategory,
  ExecutiveTrustHealth,
  ExecutiveAlert,
  CausalFactor,
} from "@/types/flowguard";

import {
  initAllYardTrucks,
  initAllCapacityStates,
  initAllEquipmentStates,
  initAllBottlenecks,
  initAllDepotForecasts,
} from "./syntheticDepotData";

import {
  initAllOmcProfiles,
  initAllOmcOrders,
  initAllOmcNotifications,
  initAllOmcOutlooks,
  calculateOmcKpiSummary,
} from "./syntheticOmcData";

import {
  initAllAutonomyIncidents,
  initAllTelemetryDataSources,
  initPolicyRules,
  initAutonomyMetrics,
  initSubsystemHealth,
} from "./syntheticAutonomyData";

import {
  calculateExecutiveKpis,
  initTurnaroundTrend,
  initDepotExecutivePerformance,
  initValueWaterfall,
  initBottleneckImpact,
  initAutonomyFunnel,
  initExecutiveRiskSummary,
  initRoiScenarios,
  initDeploymentReadiness,
  initExecutiveTrustHealth,
  initExecutiveAlerts,
} from "./syntheticExecutiveData";

export interface IFlowGuardRepository {
  getNetworkKpis(): NetworkKpis;
  getDepots(): Depot[];
  getDepotById(id: DepotId): Depot | undefined;
  getFuturePressureTimeline(): FuturePressurePoint[];
  getAtRiskOperations(): AtRiskOperation[];
  getActiveInterventions(): AutonomousIntervention[];
  getRecentEvents(): OperationalEvent[];
  getSystemHealth(): SystemHealth;
  executeIntervention(interventionId: string): Promise<AutonomousIntervention>;
  approveIntervention(interventionId: string): Promise<AutonomousIntervention>;
  toggleDegradedMode(): boolean;
  stepSimulation(): void;
  // Dashboard 2: Depot Operations extensions
  getDepotYardTrucks(depotId: DepotId): YardTruck[];
  getDepotCapacityState(depotId: DepotId): DepotCapacityState;
  getDepotEquipmentState(depotId: DepotId): DepotEquipmentState;
  getDepotBottleneck(depotId: DepotId): DepotBottleneckDiagnosis;
  getDepotForecast(depotId: DepotId): DepotForecast;
  getDepotKpiSummary(depotId: DepotId): DepotKpiSummary;
  getDepotIntervention(depotId: DepotId): AutonomousIntervention | undefined;
  getDepotEvents(depotId: DepotId): OperationalEvent[];
  // Dashboard 3: OMC Collection Visibility extensions
  getOmcList(): OmcProfile[];
  getOmcProfile(omcId: OmcId): OmcProfile | undefined;
  getOmcOrders(omcId: OmcId): OmcCollectionOrder[];
  getOmcKpis(omcId: OmcId): OmcKpiSummary;
  getOmcNotifications(omcId: OmcId): OmcNotification[];
  getOmcHourlyOutlook(omcId: OmcId): OmcHourlyOutlook[];
  acknowledgeNotification(notificationId: string): Promise<boolean>;
  acknowledgeOrderCommunication(orderId: string): Promise<boolean>;
  // Dashboard 4: Autonomous Control extensions
  getAutonomyIncidents(): AutonomyIncident[];
  getAutonomyIncidentById(id: string): AutonomyIncident | undefined;
  getTelemetryDataSources(): TelemetryDataSource[];
  getPolicyRules(): AutonomyPolicyRule[];
  getAutonomyMetrics(): AutonomyAggregateMetrics;
  getAutonomySubsystemHealth(): AutonomySubsystemHealth;
  getAutonomyState(): AutonomyState;
  authorizeIncidentAction(incidentId: string): Promise<AutonomyIncident>;
  rejectIncidentAction(incidentId: string, reason?: string): Promise<AutonomyIncident>;
  setSimulatedDegradedMode(active: boolean): void;
  isSimulatedDegradedMode(): boolean;
  // Dashboard 5: Executive Control Plane extensions
  getExecutiveKpis(period?: ExecutiveTimePeriod): ExecutiveKpiSummary;
  getTurnaroundTrend(period?: ExecutiveTimePeriod): TurnaroundTrendPoint[];
  getDepotExecutivePerformance(period?: ExecutiveTimePeriod): DepotExecutivePerformance[];
  getValueWaterfall(period?: ExecutiveTimePeriod): ValueWaterfallItem[];
  getBottleneckImpact(period?: ExecutiveTimePeriod): BottleneckImpactSummary[];
  getAutonomyFunnel(period?: ExecutiveTimePeriod): AutonomyFunnel;
  getExecutiveRiskSummary(period?: ExecutiveTimePeriod): ExecutiveRiskSummary;
  getRoiSummary(scenario?: RoiScenarioName): RoiModelScenario;
  getRoiScenarios(): Record<RoiScenarioName, RoiModelScenario>;
  getDeploymentReadiness(): DeploymentReadinessCategory[];
  getExecutiveTrustHealth(): ExecutiveTrustHealth;
  getExecutiveAlerts(): ExecutiveAlert[];
}

export class SyntheticFlowGuardRepository implements IFlowGuardRepository {
  private depots: Depot[];
  private timeline: FuturePressurePoint[];
  private atRiskOps: AtRiskOperation[];
  private interventions: AutonomousIntervention[];
  private events: OperationalEvent[];
  private health: SystemHealth;
  private secondsSinceSync: number = 2;

  // Depot Operations storage
  private yardTrucks: Record<DepotId, YardTruck[]>;
  private capacityStates: Record<DepotId, DepotCapacityState>;
  private equipmentStates: Record<DepotId, DepotEquipmentState>;
  private bottlenecks: Record<DepotId, DepotBottleneckDiagnosis>;
  private depotForecasts: Record<DepotId, DepotForecast>;

  // OMC Collection Visibility storage
  private omcProfiles: Record<OmcId, OmcProfile>;
  private omcOrders: Record<OmcId, OmcCollectionOrder[]>;
  private omcNotifications: Record<OmcId, OmcNotification[]>;
  private omcOutlooks: Record<OmcId, OmcHourlyOutlook[]>;

  // Dashboard 4: Autonomous Control storage
  private autonomyIncidents: AutonomyIncident[];
  private telemetrySources: TelemetryDataSource[];
  private policyRules: AutonomyPolicyRule[];
  private autonomyMetrics: AutonomyAggregateMetrics;
  private subsystemHealth: AutonomySubsystemHealth;
  private autonomyState: AutonomyState;
  private simulatedDegradedMode: boolean = false;

  // ─── LIVE SIMULATOR STATE ───────────────────────────────────────────
  private tickCounter: number = 0;
  private demurragePreventedKes: number = 0;
  private simulationStartedAt: number = Date.now();
  private arrivalsPendingByDepot: Record<DepotId, number> = {
    nairobi: 12,
    nakuru: 6,
    eldoret: 9,
    mombasa: 4,
    kisumu: 2,
  };

  constructor() {
    this.depots = this.initDepots();
    this.timeline = this.initTimeline();
    this.atRiskOps = this.initAtRiskOperations();
    this.interventions = this.initInterventions();
    this.events = this.initEvents();
    this.yardTrucks = initAllYardTrucks();
    this.capacityStates = initAllCapacityStates();
    this.equipmentStates = initAllEquipmentStates();
    this.bottlenecks = initAllBottlenecks();
    this.depotForecasts = initAllDepotForecasts();
    this.omcProfiles = initAllOmcProfiles();
    this.omcOrders = initAllOmcOrders();
    this.omcNotifications = initAllOmcNotifications();
    this.omcOutlooks = initAllOmcOutlooks();
    this.autonomyIncidents = initAllAutonomyIncidents();
    this.telemetrySources = initAllTelemetryDataSources();
    this.policyRules = initPolicyRules();
    this.autonomyMetrics = initAutonomyMetrics();
    this.subsystemHealth = initSubsystemHealth();
    this.autonomyState = "AUTONOMOUS";
    this.health = {
      status: "NOMINAL",
      predictionEngineStatus: "OPERATIONAL",
      eventStreamStatus: "HEALTHY",
      dataFreshnessSeconds: 2,
      autonomousModeEnabled: true,
      autoExecuteEnabled: true,
      degradedModeActive: false,
      activeModelVersion: "FG-TURNAROUND-SYNTH-v1.4",
    };
  }

  // =========================================================================
  // SEED DATA
  // =========================================================================

  private initDepots(): Depot[] {
    return [
      {
        id: "nairobi",
        name: "Nairobi Terminal (PS10)",
        code: "PS10",
        region: "Central",
        state: "CAPACITY PRESSURE",
        riskLevel: "CRITICAL",
        trucksInside: 16,
        expectedDemandNext90Min: 18,
        totalPhysicalPositions: 8,
        usableLoadingPositions: 5,
        degradedPositions: 3,
        estimatedProcessingCapacity90Min: 11,
        currentQueue: 7,
        predictedPeakQueue: 13,
        predictedTurnaroundMin: 114,
        baselineTurnaroundMin: 65,
        primaryBottleneck: "Loading capacity",
        bottleneckDetail:
          "3 loading positions unavailable (metering performance degraded, valve servicing). Demand exceeds processing capacity by 7 orders.",
        interventionStatus: "ACTIVE INTERVENTION",
        activeInterventionCount: 2,
        exposureAtRiskKes: 1850000,
        exposureProtectedKes: 2420000,
        loadingPerformanceRatePct: 86,
      },
      {
        id: "nakuru",
        name: "Nakuru Depot (PS25)",
        code: "PS25",
        region: "Rift Valley",
        state: "EQUIPMENT RISK",
        riskLevel: "HIGH",
        trucksInside: 8,
        expectedDemandNext90Min: 9,
        totalPhysicalPositions: 4,
        usableLoadingPositions: 3,
        degradedPositions: 1,
        estimatedProcessingCapacity90Min: 7,
        currentQueue: 3,
        predictedPeakQueue: 6,
        predictedTurnaroundMin: 88,
        baselineTurnaroundMin: 58,
        primaryBottleneck: "Equipment",
        bottleneckDetail:
          "Loading position unavailable — metering performance degraded (-18% flow rate). Secondary line calibration in progress.",
        interventionStatus: "ACTIVE INTERVENTION",
        activeInterventionCount: 1,
        exposureAtRiskKes: 680000,
        exposureProtectedKes: 890000,
        loadingPerformanceRatePct: 82,
      },
      {
        id: "eldoret",
        name: "Eldoret Depot (PS27)",
        code: "PS27",
        region: "North Rift",
        state: "HIGH DEMAND",
        riskLevel: "MEDIUM",
        trucksInside: 10,
        expectedDemandNext90Min: 14,
        totalPhysicalPositions: 6,
        usableLoadingPositions: 5,
        degradedPositions: 1,
        estimatedProcessingCapacity90Min: 11,
        currentQueue: 4,
        predictedPeakQueue: 7,
        predictedTurnaroundMin: 74,
        baselineTurnaroundMin: 55,
        primaryBottleneck: "Gate processing",
        bottleneckDetail:
          "Transit demand surge from regional transport corridor. Gate ingress verification queue forming before tare scale.",
        interventionStatus: "ACTIVE INTERVENTION",
        activeInterventionCount: 1,
        exposureAtRiskKes: 520000,
        exposureProtectedKes: 410000,
        loadingPerformanceRatePct: 94,
      },
      {
        id: "mombasa",
        name: "Mombasa Terminal (KOT / PS1)",
        code: "KOT-PS1",
        region: "Coast",
        state: "NORMAL",
        riskLevel: "LOW",
        trucksInside: 12,
        expectedDemandNext90Min: 8,
        totalPhysicalPositions: 6,
        usableLoadingPositions: 6,
        degradedPositions: 0,
        estimatedProcessingCapacity90Min: 12,
        currentQueue: 2,
        predictedPeakQueue: 3,
        predictedTurnaroundMin: 52,
        baselineTurnaroundMin: 50,
        primaryBottleneck: "Product/loading readiness",
        bottleneckDetail:
          "Marine offloading and terminal transit loading operating at nominal velocity across all gantry arms.",
        interventionStatus: "NONE",
        activeInterventionCount: 0,
        exposureAtRiskKes: 110000,
        exposureProtectedKes: 950000,
        loadingPerformanceRatePct: 99,
      },
      {
        id: "kisumu",
        name: "Kisumu Depot (PS28)",
        code: "PS28",
        region: "Western / Lake",
        state: "NORMAL",
        riskLevel: "LOW",
        trucksInside: 6,
        expectedDemandNext90Min: 6,
        totalPhysicalPositions: 4,
        usableLoadingPositions: 4,
        degradedPositions: 0,
        estimatedProcessingCapacity90Min: 8,
        currentQueue: 1,
        predictedPeakQueue: 2,
        predictedTurnaroundMin: 48,
        baselineTurnaroundMin: 45,
        primaryBottleneck: "Validation/release",
        bottleneckDetail:
          "Regional collection orders processing within SLA targets. Dispatch velocity steady.",
        interventionStatus: "NONE",
        activeInterventionCount: 0,
        exposureAtRiskKes: 80000,
        exposureProtectedKes: 530000,
        loadingPerformanceRatePct: 100,
      },
    ];
  }

  private initTimeline(): FuturePressurePoint[] {
    return [
      {
        timeOffsetMin: 0,
        timeLabel: "NOW",
        expectedDemandTrucks: 7,
        estimatedProcessingCapacity: 6,
        projectedBacklogTrucks: 1,
        projectedWaitMin: 45,
        usableLoadingBays: 5,
        stage: "NORMAL",
        stageLabel: "Current State",
        annotation:
          "Baseline demand: 7 orders in yard, 6 estimated processing capacity across 5 usable bays.",
        depotId: "nairobi",
      },
      {
        timeOffsetMin: 30,
        timeLabel: "+30m",
        expectedDemandTrucks: 14,
        estimatedProcessingCapacity: 8,
        projectedBacklogTrucks: 6,
        projectedWaitMin: 68,
        usableLoadingBays: 5,
        stage: "DEMAND_SURGE",
        stageLabel: "Demand Surge",
        annotation:
          "14 orders forecast in same 30m window. Processing capacity constrained at 8 orders (+6 backlog).",
        depotId: "nairobi",
      },
      {
        timeOffsetMin: 60,
        timeLabel: "+60m",
        expectedDemandTrucks: 18,
        estimatedProcessingCapacity: 8,
        projectedBacklogTrucks: 10,
        projectedWaitMin: 98,
        usableLoadingBays: 5,
        stage: "CAPACITY_SHORTFALL",
        stageLabel: "Capacity Shortfall",
        annotation:
          "Peak bottleneck: Demand exceeds processing capacity by 10 orders. Turnaround climbs to 98m.",
        depotId: "nairobi",
      },
      {
        timeOffsetMin: 90,
        timeLabel: "+90m",
        expectedDemandTrucks: 10,
        estimatedProcessingCapacity: 12,
        projectedBacklogTrucks: 3,
        projectedWaitMin: 55,
        usableLoadingBays: 7,
        stage: "INTERVENTION_ACTIVE",
        stageLabel: "Intervention Active",
        annotation:
          "FlowGuard re-sequences 6 upcoming orders & adjusts processing priority. Capacity expands to 12 orders.",
        depotId: "nairobi",
      },
      {
        timeOffsetMin: 120,
        timeLabel: "+120m",
        expectedDemandTrucks: 6,
        estimatedProcessingCapacity: 10,
        projectedBacklogTrucks: 0,
        projectedWaitMin: 38,
        usableLoadingBays: 7,
        stage: "STABILIZING",
        stageLabel: "Stabilized Horizon",
        annotation:
          "Backlog eliminated. Turnaround normalized to 52 min (-34m vs unmitigated peak).",
        depotId: "nairobi",
      },
    ];
  }

  private initAtRiskOperations(): AtRiskOperation[] {
    return [
      {
        id: "RISK-01",
        orderNumber: "LO-NBO-8821",
        truckRegistration: "KDA 123X",
        omcName: "Rubis Energy Kenya",
        depotId: "nairobi",
        depotName: "Nairobi Terminal (PS10)",
        product: "PMS (Super Unleaded) - 34,000L",
        quantityLitres: 34000,
        expectedArrival: "10:15 AM",
        predictedTurnaroundMin: 118,
        baselineTurnaroundMin: 65,
        delayRiskMin: 53,
        exposureAtRiskKes: 680000,
        exposureProtectedKes: 580000,
        riskLevel: "CRITICAL",
        primaryCause:
          "Demand surge (14 orders in 45m) + 3 loading positions unavailable + loading rate -14%",
        causalFactors: [
          { factor: "14 collection orders forecast in same 45-min window", impactScore: 38, category: "demand" },
          { factor: "Compatible PMS loading position offline for metering recalibration", impactScore: 32, category: "capacity" },
          { factor: "Loading performance 14% below baseline at secondary gantry", impactScore: 21, category: "equipment" },
          { factor: "Electronic transit documentation clearance verification hold", impactScore: 9, category: "validation" },
        ],
        candidateInterventions: [
          {
            name: "Candidate A: No action (Allow queue to form)",
            predictedTurnaroundMin: 118,
            exposureKes: 680000,
            status: "Feasible",
            rationale: "Exceeds 60m threshold; generates substantial demurrage exposure.",
          },
          {
            name: "Candidate B: Re-sequence queue priority only",
            predictedTurnaroundMin: 85,
            exposureKes: 320000,
            status: "Feasible",
            rationale: "Reduces wait but does not resolve compatible position shortfall.",
          },
          {
            name: "Candidate C: Re-sequence upcoming orders and adjust internal processing priority",
            predictedTurnaroundMin: 68,
            exposureKes: 100000,
            status: "Selected",
            rationale:
              "Selected: Produces lowest predicted turnaround while remaining within autonomy policy.",
          },
        ],
        selectedIntervention:
          "Re-sequence upcoming orders and adjust internal processing priority to auxiliary position",
        proposedAction:
          "Re-sequence upcoming orders and adjust internal processing priority to auxiliary position.",
        actionStatus: "AUTO-EXECUTED",
        policyRule: "Policy: Autonomous re-sequencing permitted for dwell spikes under 60 min",
        predictedGateOut: "11:45 AM",
        confidencePct: 92,
        verifiedOutcomeMin: 34,
      },
      {
        id: "RISK-02",
        orderNumber: "LO-NBO-9914",
        truckRegistration: "KDD 441L",
        omcName: "TotalEnergies Marketing",
        depotId: "nairobi",
        depotName: "Nairobi Terminal (PS10)",
        product: "AGO (Automotive Gas Oil) - 40,000L",
        quantityLitres: 40000,
        expectedArrival: "10:25 AM",
        predictedTurnaroundMin: 105,
        baselineTurnaroundMin: 65,
        delayRiskMin: 40,
        exposureAtRiskKes: 520000,
        exposureProtectedKes: 440000,
        riskLevel: "CRITICAL",
        primaryCause:
          "Inflow surge exceeding gantry intake capacity + SLA threshold breach in 35m",
        causalFactors: [
          { factor: "Multi-compartment AGO order scheduled during peak intake", impactScore: 42, category: "demand" },
          { factor: "Electronic seal integrity verification backlog at gate", impactScore: 28, category: "gate" },
          { factor: "Secondary pump loading performance variance", impactScore: 16, category: "equipment" },
        ],
        candidateInterventions: [
          {
            name: "Candidate A: No action",
            predictedTurnaroundMin: 105,
            exposureKes: 520000,
            status: "Feasible",
            rationale: "Imminent demurrage threshold breach in 35 min.",
          },
          {
            name: "Candidate B: Dual-hose bay allocation and fast-track clearance pass",
            predictedTurnaroundMin: 62,
            exposureKes: 80000,
            status: "Selected",
            rationale:
              "Selected: Recovers 43m. Requires supervisor approval under high-value policy.",
          },
        ],
        selectedIntervention: "Dual-hose bay allocation and fast-track clearance pass",
        proposedAction:
          "Allocate dual-hose gantry position and issue pre-approved fast-track clearance pass.",
        actionStatus: "APPROVAL REQUIRED",
        policyRule:
          "Policy: Dual-position bay reassignments require shift controller sign-off",
        predictedGateOut: "12:10 PM",
        confidencePct: 88,
      },
      {
        id: "RISK-03",
        orderNumber: "LO-NKR-4412",
        truckRegistration: "KDB 918Q",
        omcName: "Lake Oil Kenya",
        depotId: "nakuru",
        depotName: "Nakuru Depot (PS25)",
        product: "PMS (Super Unleaded) - 36,000L",
        quantityLitres: 36000,
        expectedArrival: "10:40 AM",
        predictedTurnaroundMin: 92,
        baselineTurnaroundMin: 58,
        delayRiskMin: 34,
        exposureAtRiskKes: 390000,
        exposureProtectedKes: 320000,
        riskLevel: "HIGH",
        primaryCause:
          "Loading position unavailable — metering performance degraded (-18% flow rate)",
        causalFactors: [
          { factor: "Flow meter temperature sensor calibration drift on primary bay", impactScore: 46, category: "equipment" },
          { factor: "Cargo transit verification document delay", impactScore: 22, category: "validation" },
        ],
        candidateInterventions: [
          {
            name: "Candidate A: Retain on degraded bay",
            predictedTurnaroundMin: 92,
            exposureKes: 390000,
            status: "Feasible",
            rationale: "Severe slow-fill bottleneck.",
          },
          {
            name: "Candidate B: Autonomous bay divert to auxiliary position",
            predictedTurnaroundMin: 64,
            exposureKes: 70000,
            status: "Selected",
            rationale:
              "Selected: Completely avoids degraded meter while technician service ticket dispatches.",
          },
        ],
        selectedIntervention: "Autonomous bay divert to auxiliary position",
        proposedAction:
          "Reroute tanker to auxiliary loading position and dispatch calibration technician.",
        actionStatus: "AUTO-EXECUTED",
        policyRule:
          "Policy: Autonomous bay divert authorized upon flow variance exceeding 12%",
        predictedGateOut: "12:12 PM",
        confidencePct: 91,
        verifiedOutcomeMin: 26,
      },
      {
        id: "RISK-04",
        orderNumber: "LO-ELD-3310",
        truckRegistration: "KCP 320P",
        omcName: "Ola Energy Kenya",
        depotId: "eldoret",
        depotName: "Eldoret Depot (PS27)",
        product: "AGO (Automotive Gas Oil) - 32,000L",
        quantityLitres: 32000,
        expectedArrival: "10:55 AM",
        predictedTurnaroundMin: 78,
        baselineTurnaroundMin: 55,
        delayRiskMin: 23,
        exposureAtRiskKes: 280000,
        exposureProtectedKes: 220000,
        riskLevel: "MEDIUM",
        primaryCause: "Gate ingress verification queue: 5 road tankers arrived simultaneously",
        causalFactors: [
          { factor: "Batch arrival cluster at Eldoret main gate tare scale", impactScore: 35, category: "gate" },
          { factor: "Driver electronic authorization terminal queue", impactScore: 20, category: "validation" },
        ],
        candidateInterventions: [
          {
            name: "Candidate A: Single gate line",
            predictedTurnaroundMin: 78,
            exposureKes: 280000,
            status: "Feasible",
            rationale: "Creates compounding queue for later arrivals.",
          },
          {
            name: "Candidate B: Activate overflow gate lane for pre-validated electronic manifests",
            predictedTurnaroundMin: 58,
            exposureKes: 60000,
            status: "Selected",
            rationale:
              "Selected: Relieves gate pressure immediately within automated policy limit.",
          },
        ],
        selectedIntervention:
          "Activate overflow gate lane for pre-validated electronic manifests",
        proposedAction:
          "Activate secondary scale lane for pre-validated electronic manifests.",
        actionStatus: "AUTO-SCHEDULED",
        policyRule: "Policy: Automated gate lane switching on queue > 4 trucks",
        predictedGateOut: "12:13 PM",
        confidencePct: 86,
      },
    ];
  }

  private initInterventions(): AutonomousIntervention[] {
    return [
      {
        id: "INT-8801",
        timestamp: "10:02:46",
        depotId: "nairobi",
        depotName: "Nairobi Terminal (PS10)",
        trigger:
          "Demand surge (+14 orders) + 3 positions unavailable causing 53m predicted queue surge",
        predictedProblem:
          "Turnaround predicted to cross 114m (+49m above baseline), generating KES 1.85M demurrage exposure",
        actionTaken:
          "Re-sequenced 6 upcoming orders and adjusted internal processing priority to auxiliary position",
        alternativesEvaluatedCount: 3,
        status: "VERIFIED",
        policyRule: "Policy: Autonomous re-sequencing permitted for dwell spikes under 60 min",
        expectedReductionMin: 38,
        verifiedReductionMin: 34,
        exposureProtectedKes: 1420000,
        realizedSavingsKes: 1210000,
        affectedOrdersCount: 6,
      },
      {
        id: "INT-8802",
        timestamp: "10:05:12",
        depotId: "nairobi",
        depotName: "Nairobi Terminal (PS10)",
        trigger:
          "Order LO-NBO-9914 (TotalEnergies) imminent SLA threshold breach in 35 min",
        predictedProblem:
          "Demurrage penalty activation at 10:50 AM with single-arm gantry delay",
        actionTaken:
          "Allocated dual-hose position and issued pre-approved fast-track weighbridge clearance token",
        alternativesEvaluatedCount: 2,
        status: "APPROVAL REQUIRED",
        policyRule:
          "Policy: Dual-position bay reassignments require shift controller sign-off",
        expectedReductionMin: 26,
        exposureProtectedKes: 520000,
        affectedOrdersCount: 1,
        requiresSupervisorApproval: true,
      },
      {
        id: "INT-8803",
        timestamp: "09:48:30",
        depotId: "nakuru",
        depotName: "Nakuru Depot (PS25)",
        trigger:
          "Loading position unavailable — metering performance degraded (-18% flow rate detected by SCADA)",
        predictedProblem:
          "Nakuru turnaround predicted to climb from 58m to 92m (+34m delay)",
        actionTaken:
          "Autonomous bay divert: rerouted KDB 918Q to auxiliary position and triggered technician service ticket",
        alternativesEvaluatedCount: 2,
        status: "AUTO-EXECUTED",
        policyRule:
          "Policy: Autonomous bay divert authorized upon flow variance exceeding 12%",
        expectedReductionMin: 28,
        verifiedReductionMin: 26,
        exposureProtectedKes: 390000,
        realizedSavingsKes: 350000,
        affectedOrdersCount: 2,
      },
      {
        id: "INT-8804",
        timestamp: "09:35:10",
        depotId: "eldoret",
        depotName: "Eldoret Depot (PS27)",
        trigger: "Ingress gate queue buildup: 5 road tankers within 10 min window",
        predictedProblem: "Gate bottleneck extending wait time by 23 min before tare weighing",
        actionTaken:
          "Autonomous gate load-balancer opened secondary scale lane for pre-validated electronic manifests",
        alternativesEvaluatedCount: 2,
        status: "VERIFIED",
        policyRule: "Policy: Automated gate lane switching on queue > 4 trucks",
        expectedReductionMin: 18,
        verifiedReductionMin: 19,
        exposureProtectedKes: 280000,
        realizedSavingsKes: 250000,
        affectedOrdersCount: 5,
      },
    ];
  }

  private initEvents(): OperationalEvent[] {
    return [
      {
        id: "EVT-100",
        timestamp: "10:07:18",
        depotId: "nairobi",
        depotName: "Nairobi Terminal (PS10)",
        eventType: "ACTION_VERIFIED",
        description:
          "Autonomous intervention INT-8801 verified: actual queue decreased by 34 minutes (expected 38m).",
        severity: "info",
      },
      {
        id: "EVT-099",
        timestamp: "10:05:12",
        depotId: "nairobi",
        depotName: "Nairobi Terminal (PS10)",
        eventType: "INTERVENTION_TRIGGERED",
        description:
          "Supervisor approval requested: Dual-position bay allocation for LO-NBO-9914 (POL-NBO-OVERRIDE-L3).",
        severity: "warning",
        associatedTruck: "KDD 441L",
      },
      {
        id: "EVT-098",
        timestamp: "10:02:46",
        depotId: "nairobi",
        depotName: "Nairobi Terminal (PS10)",
        eventType: "ACTION_EXECUTED",
        description:
          "FlowGuard executed autonomous re-sequencing for 6 upcoming orders and adjusted internal processing priority.",
        severity: "info",
      },
      {
        id: "EVT-097",
        timestamp: "10:00:15",
        depotId: "nairobi",
        depotName: "Nairobi Terminal (PS10)",
        eventType: "ORDER_FORECAST",
        description:
          "Demand surge forecast: 18 orders vs 11 estimated processing capacity in 10:30–11:30 horizon.",
        severity: "warning",
      },
      {
        id: "EVT-096",
        timestamp: "09:54:20",
        depotId: "nakuru",
        depotName: "Nakuru Depot (PS25)",
        eventType: "EQUIPMENT_DEGRADATION",
        description:
          "SCADA telemetry: Loading position unavailable — metering performance degraded (-18.2% flow rate).",
        severity: "warning",
      },
      {
        id: "EVT-095",
        timestamp: "09:42:10",
        depotId: "mombasa",
        depotName: "Mombasa Terminal (KOT / PS1)",
        eventType: "LOADING_COMPLETED",
        description:
          "Truck KCA 889J (Vivo Energy) gate-out complete. Turnaround time: 48m (nominal).",
        severity: "info",
        associatedTruck: "KCA 889J",
      },
    ];
  }

  // =========================================================================
  // DASHBOARD 1: NETWORK COMMAND CENTRE
  // =========================================================================

  public getNetworkKpis(): NetworkKpis {
    const totalExpected = this.depots.reduce((acc, d) => acc + d.expectedDemandNext90Min, 0);
    const totalInside = this.depots.reduce((acc, d) => acc + d.trucksInside, 0);
    const totalAtRisk = this.atRiskOps.length;
    const avgTurnaround = Math.round(
      this.depots.reduce((acc, d) => acc + d.predictedTurnaroundMin, 0) / this.depots.length
    );
    const baselineAvg = Math.round(
      this.depots.reduce((acc, d) => acc + d.baselineTurnaroundMin, 0) / this.depots.length
    );
    const activeInterventions = this.interventions.filter(
      (i) =>
        i.status === "AUTO-EXECUTED" ||
        i.status === "APPROVAL REQUIRED" ||
        i.status === "VERIFIED"
    ).length;
    const approvalRequired = this.interventions.filter(
      (i) => i.status === "APPROVAL REQUIRED"
    ).length;
    const exposureAtRisk = this.depots.reduce((acc, d) => acc + d.exposureAtRiskKes, 0);
    const exposureProtected = this.depots.reduce((acc, d) => acc + d.exposureProtectedKes, 0);
    const realizedSavings = 2150000;

    const totalProcessingCapacity = this.depots.reduce(
      (acc, d) => acc + d.estimatedProcessingCapacity90Min,
      0
    );
    const pressureRatio =
      totalProcessingCapacity > 0 ? totalExpected / totalProcessingCapacity : 1;
    const pressurePct = Math.min(100, Math.round(pressureRatio * 70));
    const pressureLevel =
      pressurePct >= 85 ? "CRITICAL"
      : pressurePct >= 70 ? "HIGH"
      : pressurePct >= 50 ? "ELEVATED"
      : "OPTIMAL";

    return {
      expectedCollectionDemandNearTerm: totalExpected,
      trucksInsideTotal: totalInside,
      atRiskCount: totalAtRisk,
      avgPredictedTurnaroundMin: avgTurnaround,
      baselineTurnaroundMin: baselineAvg,
      activeInterventionsCount: activeInterventions,
      approvalRequiredCount: approvalRequired,
      exposureAtRiskKes: exposureAtRisk,
      exposureProtectedKes: exposureProtected,
      realizedSavingsKes: realizedSavings,
      networkCapacityPressurePct: pressurePct,
      networkCapacityPressureLevel: pressureLevel,
      autonomyMode: this.health.degradedModeActive
        ? "DEGRADED"
        : this.health.autonomousModeEnabled
        ? "FULL AUTONOMY"
        : "APPROVAL GATED",
    };
  }

  public getDepots(): Depot[] {
    const severityRank: Record<string, number> = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };
    return [...this.depots].sort(
      (a, b) => severityRank[b.riskLevel] - severityRank[a.riskLevel]
    );
  }

  public getDepotById(id: DepotId): Depot | undefined {
    return this.depots.find((d) => d.id === id);
  }

  public getFuturePressureTimeline(): FuturePressurePoint[] {
    return [...this.timeline];
  }

  public getAtRiskOperations(): AtRiskOperation[] {
    return [...this.atRiskOps];
  }

  public getActiveInterventions(): AutonomousIntervention[] {
    return [...this.interventions];
  }

  public getRecentEvents(): OperationalEvent[] {
    return [...this.events];
  }

  public getSystemHealth(): SystemHealth {
    return {
      ...this.health,
      dataFreshnessSeconds: this.secondsSinceSync,
    };
  }

  public async executeIntervention(
    interventionId: string
  ): Promise<AutonomousIntervention> {
    const item = this.interventions.find((i) => i.id === interventionId);
    if (!item) throw new Error(`Intervention ${interventionId} not found`);

    item.status = "AUTO-EXECUTED";
    item.requiresSupervisorApproval = false;

    // Feed the live demurrage ticker
    if (item.realizedSavingsKes) {
      this.demurragePreventedKes += item.realizedSavingsKes;
    } else {
      this.demurragePreventedKes += Math.round(item.exposureProtectedKes * 0.85);
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    this.events.unshift({
      id: `EVT-${Date.now()}`,
      timestamp: timeStr,
      depotId: item.depotId,
      depotName: item.depotName,
      eventType: "ACTION_EXECUTED",
      description: `Manual override executed: ${item.actionTaken}.`,
      severity: "info",
    });

    return item;
  }

  public async approveIntervention(
    interventionId: string
  ): Promise<AutonomousIntervention> {
    const item = this.interventions.find((i) => i.id === interventionId);
    if (!item) throw new Error(`Intervention ${interventionId} not found`);

    item.status = "AUTO-EXECUTED";
    item.requiresSupervisorApproval = false;

    // Feed the live demurrage ticker
    if (item.realizedSavingsKes) {
      this.demurragePreventedKes += item.realizedSavingsKes;
    } else {
      this.demurragePreventedKes += Math.round(item.exposureProtectedKes * 0.85);
    }

    const nbo = this.depots.find((d) => d.id === "nairobi");
    if (nbo) {
      nbo.predictedTurnaroundMin = Math.max(70, nbo.predictedTurnaroundMin - 15);
      nbo.exposureProtectedKes += item.exposureProtectedKes;
      nbo.exposureAtRiskKes = Math.max(
        0,
        nbo.exposureAtRiskKes - item.exposureProtectedKes
      );
      nbo.interventionStatus = "ACTIVE INTERVENTION";
    }

    // Cross-dashboard: yard truck state
    if (item.id === "INT-8802" && this.yardTrucks.nairobi) {
      const targetTruck = this.yardTrucks.nairobi.find(
        (t) => t.registration === "KDD 441L"
      );
      if (targetTruck) {
        targetTruck.riskStatus = "GREEN";
        targetTruck.riskLabel = "Authorized: Fast-track dual-hose active";
        targetTruck.flowGuardStatus = "EXECUTED";
        targetTruck.dwellDeltaMin = 0;
        if (targetTruck.actionDetail) {
          targetTruck.actionDetail.actionStatus = "AUTO-EXECUTED";
          targetTruck.actionDetail.approvalState = "VERIFIED";
        }
      }
    }

    // Cross-dashboard: OMC order state
    if (this.omcOrders && this.omcOrders.vivo) {
      const vivoOrder = this.omcOrders.vivo.find(
        (o) => o.id === "LO-NBO-8821" || o.truckRegistration === "KDD 412X"
      );
      if (vivoOrder && vivoOrder.flowGuardAction) {
        vivoOrder.flowGuardAction.status = "EXECUTED";
        vivoOrder.status = "LOADING";
        vivoOrder.riskSeverity = "NOMINAL";
        vivoOrder.predictedGateOut = "11:02 AM";
      }
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    this.events.unshift({
      id: `EVT-${Date.now()}`,
      timestamp: timeStr,
      depotId: item.depotId,
      depotName: item.depotName,
      eventType: "ACTION_EXECUTED",
      description: `Shift controller authorized action for ${item.depotName}: ${item.actionTaken}.`,
      severity: "info",
    });

    return item;
  }

  public toggleDegradedMode(): boolean {
    this.health.degradedModeActive = !this.health.degradedModeActive;
    if (this.health.degradedModeActive) {
      this.health.status = "DEGRADED";
      this.health.fallbackDataSource =
        "Historical Time-of-Day Velocity Baseline (Offline Cache)";
      this.health.autonomousModeEnabled = false;
      this.health.autoExecuteEnabled = false;
    } else {
      this.health.status = "NOMINAL";
      this.health.fallbackDataSource = undefined;
      this.health.autonomousModeEnabled = true;
      this.health.autoExecuteEnabled = true;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    this.events.unshift({
      id: `EVT-${Date.now()}`,
      timestamp: timeStr,
      depotId: "nairobi",
      depotName: "KPC SCADA Core",
      eventType: "DEGRADED_MODE_SWITCH",
      description: this.health.degradedModeActive
        ? "DEGRADED MODE ENGAGED: Primary telemetry stream offline. Switched to historical velocity fallback model."
        : "SCADA TELEMETRY RESTORED: Primary SCADA link active. Autonomous control loop re-engaged.",
      severity: this.health.degradedModeActive ? "warning" : "info",
    });

    return this.health.degradedModeActive;
  }

  // =========================================================================
  // LIVE SIMULATOR
  // =========================================================================

  public stepSimulation(): void {
    this.tickCounter += 1;
    this.secondsSinceSync = (this.secondsSinceSync + 1) % 6;
    if (!this.simulatedDegradedMode) {
      this.advanceEveryYardTruck();
      this.maybeAdmitNewArrivals();
      this.driftFlowRates();
      this.ageInterventions();
      this.recomputeKpis();
    }
  }

  private advanceEveryYardTruck(): void {
    for (const depotId of Object.keys(this.yardTrucks) as DepotId[]) {
      const trucks = this.yardTrucks[depotId] || [];
      const cap = this.capacityStates[depotId];
      for (const t of trucks) {
        if (t.currentStage === "Gate-Out") continue;

        t.timeInStageMin += 1;

        const limits: Record<string, number> = {
          "Gate-In": 8,
          "Validation / Release": 14,
          Loading: 28,
          "Ready to Exit": 6,
        };
        const target = limits[t.currentStage] ?? 20;
        const advanceProb = Math.min(0.9, t.timeInStageMin / target);

        if (Math.random() < advanceProb / 12) {
          this.advanceTruckStage(depotId, t, cap);
        }

        const stageBaseline =
          t.currentStage === "Gate-In" ? 10
          : t.currentStage === "Validation / Release" ? 15
          : t.currentStage === "Loading" ? 18
          : 6;
        t.baselineStageMin = stageBaseline;
        t.dwellDeltaMin = t.timeInStageMin - stageBaseline;

        if (t.dwellDeltaMin >= 12) {
          t.riskStatus = "RED";
          t.riskLabel = `Critical delay (+${t.dwellDeltaMin}m above SLA)`;
        } else if (t.dwellDeltaMin >= 5) {
          t.riskStatus = "AMBER";
          t.riskLabel = `Elevated dwell (+${t.dwellDeltaMin}m)`;
        } else if (t.dwellDeltaMin <= 0) {
          t.riskStatus = "GREEN";
          t.riskLabel = "On Track (Nominal)";
        }
      }
    }
  }

  private advanceTruckStage(
    depotId: DepotId,
    t: YardTruck,
    cap: DepotCapacityState | undefined
  ): void {
    const now = new Date();
    const ts = now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const seq: YardTruck["currentStage"][] = [
      "Gate-In",
      "Validation / Release",
      "Loading",
      "Ready to Exit",
      "Gate-Out",
    ];
    const idx = seq.indexOf(t.currentStage);
    const next = seq[Math.min(idx + 1, seq.length - 1)];

    if (next === "Loading") {
      const freeBay = cap?.positions.find((p) => p.status === "AVAILABLE");
      if (!freeBay) return;
      freeBay.status = "LOADING";
      freeBay.activeTruckReg = t.registration;
      freeBay.activeOmc = t.omc;
      freeBay.activeOrder = t.orderNumber;
      freeBay.currentLoadingDurationMin = 0;
      freeBay.estimatedFreeInMin = 28;
      t.assignedPosition = freeBay.code;
    }

    if (t.currentStage === "Loading" && t.assignedPosition && cap) {
      const bay = cap.positions.find((p) => p.code === t.assignedPosition);
      if (bay) {
        bay.status = "AVAILABLE";
        bay.activeTruckReg = undefined;
        bay.activeOmc = undefined;
        bay.activeOrder = undefined;
        bay.currentLoadingDurationMin = undefined;
        bay.estimatedFreeInMin = undefined;
      }
    }

    const stageTsKey = ({
      "Gate-In": "gateIn",
      "Validation / Release": "validation",
      Loading: "loading",
      "Ready to Exit": "readyToExit",
      "Gate-Out": "gateOut",
    } as const)[next];

    t.currentStage = next;
    t.timeInStageMin = 0;
    t.stageTimestamps = { ...t.stageTimestamps, [stageTsKey]: ts };
    t.flowGuardStatus =
      next === "Gate-Out" ? "COMPLETED"
      : next === "Loading" ? "LOADING"
      : "NOMINAL";
    t.nextAction =
      next === "Validation / Release" ? "Await customs / seal release"
      : next === "Loading" ? "Fill compartments"
      : next === "Ready to Exit" ? "Weighbridge outbound"
      : next === "Gate-Out" ? "Depart facility"
      : "Await scale assignment";

    this.events.unshift({
      id: `EVT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: ts,
      depotId,
      depotName: this.depots.find((d) => d.id === depotId)?.name ?? depotId,
      eventType:
        next === "Loading" ? "LOADING_STARTED"
        : next === "Gate-Out" ? "LOADING_COMPLETED"
        : next === "Gate-In" ? "GATE_IN"
        : "ACTION_EXECUTED",
      description: `${t.registration} (${t.omc}) advanced to ${next}${
        t.assignedPosition ? ` · Bay ${t.assignedPosition}` : ""
      }`,
      severity: "info",
      associatedTruck: t.registration,
    });

    if (next === "Gate-Out") {
      const saved =
        Math.max(0, t.baselineTurnaroundMin - t.predictedTurnaroundMin) * 250;
      this.demurragePreventedKes += Math.max(saved, 5000);
    }
  }

  private maybeAdmitNewArrivals(): void {
    if (this.tickCounter % 45 !== 0) return;
    const omcs: OmcId[] = [
      "vivo",
      "totalenergies",
      "rubis",
      "lakeoil",
      "ola",
      "hass",
    ];
    const products = [
      "PMS (Super Unleaded)",
      "AGO (Automotive Gas Oil)",
      "DPK (Dual Purpose Kerosene)",
    ];

    for (const depotId of Object.keys(this.arrivalsPendingByDepot) as DepotId[]) {
      const pending = this.arrivalsPendingByDepot[depotId];
      if (pending <= 0) continue;
      this.arrivalsPendingByDepot[depotId] -= 1;

      const i = this.yardTrucks[depotId]?.length ?? 0;
      const omc = omcs[i % omcs.length];
      const product = products[i % products.length];
      const reg = `KD${String.fromCharCode(65 + (i % 26))} ${100 + i * 7}X`;
      const now = new Date();
      const ts = now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const truck: YardTruck = {
        id: `TRK-${depotId.toUpperCase()}-${i + 1}`,
        registration: reg,
        omc:
          omc === "vivo" ? "Vivo Energy Kenya"
          : omc === "totalenergies" ? "TotalEnergies Marketing"
          : omc === "rubis" ? "Rubis Energy Kenya"
          : omc === "lakeoil" ? "Lake Oil Kenya"
          : omc === "ola" ? "Ola Energy Kenya"
          : "Hass Petroleum",
        orderNumber: `LO-${depotId.slice(0, 3).toUpperCase()}-${1000 + i}`,
        product,
        quantityLitres: 32000 + (i % 4) * 2000,
        compartmentsCount: 3,
        currentStage: "Gate-In",
        assignedPosition: undefined,
        timeInStageMin: 0,
        baselineStageMin: 10,
        dwellDeltaMin: -10,
        predictedGateOut: `${now.getHours()}:${(now.getMinutes() + 60) % 60}`,
        riskStatus: "GREEN",
        riskLabel: "On Track (Nominal)",
        nextAction: "Await scale assignment",
        flowGuardStatus: "MONITORED",
        depotId,
        expectedArrival: ts,
        predictedTurnaroundMin: 62,
        baselineTurnaroundMin: 58,
        confidencePct: 88,
        stageTimestamps: { gateIn: ts },
      };

      this.yardTrucks[depotId] = [...(this.yardTrucks[depotId] ?? []), truck];

      const depot = this.depots.find((d) => d.id === depotId);
      if (depot) depot.trucksInside = this.yardTrucks[depotId].length;

      this.events.unshift({
        id: `EVT-ARR-${Date.now()}`,
        timestamp: ts,
        depotId,
        depotName: depot?.name ?? depotId,
        eventType: "TRUCK_ARRIVAL",
        description: `${reg} (${truck.omc}) arrived — ${
          truck.product.split(" ")[0]
        } ${truck.quantityLitres.toLocaleString()}L`,
        severity: "info",
        associatedTruck: reg,
      });
    }
  }

  private driftFlowRates(): void {
    if (this.tickCounter % 8 !== 0) return;
    for (const depotId of Object.keys(this.capacityStates) as DepotId[]) {
      const cap = this.capacityStates[depotId];
      if (!cap) continue;
      for (const p of cap.positions) {
        if (p.status === "DEGRADED" && p.flowRateLpm) {
          p.flowRateLpm = Math.max(
            p.baselineFlowRateLpm * 0.7,
            p.flowRateLpm - 15 + Math.random() * 20
          );
          p.telemetryNote = `Flow rate ${Math.round(
            p.flowRateLpm
          )} L/min — recovery monitoring`;
        }
      }
    }
  }

  private ageInterventions(): void {
    if (this.tickCounter % 30 !== 0) return;
    for (const iv of this.interventions) {
      if (iv.status !== "APPROVAL REQUIRED") continue;
      const now = new Date();
      const ts = now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      this.events.unshift({
        id: `EVT-ESC-${Date.now()}-${iv.id}`,
        timestamp: ts,
        depotId: iv.depotId,
        depotName: iv.depotName,
        eventType: "INTERVENTION_TRIGGERED",
        description: `ESCALATION: ${iv.id} has been pending approval for >30s. Shift controller notified.`,
        severity: "warning",
      });
    }
  }

  private recomputeKpis(): void {
    for (const depot of this.depots) {
      const trucks = this.yardTrucks[depot.id] ?? [];
      depot.trucksInside = trucks.length;
      const active = trucks.filter((t) => t.currentStage !== "Gate-Out");
      const avg = active.length
        ? Math.round(
            active.reduce(
              (s, t) => s + (t.predictedTurnaroundMin ?? depot.predictedTurnaroundMin),
              0
            ) / active.length
          )
        : depot.predictedTurnaroundMin;
      depot.predictedTurnaroundMin = avg;
      depot.currentQueue = trucks.filter(
        (t) =>
          t.currentStage === "Gate-In" || t.currentStage === "Validation / Release"
      ).length;
    }
  }

  // =========================================================================
  // CRISIS INJECTION + DEMO UTILITIES
  // =========================================================================

  public forceCrisis(): void {
    const now = new Date();
    const ts = now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const nbo = this.depots.find((d) => d.id === "nairobi");
    if (nbo) {
      nbo.usableLoadingPositions = Math.max(2, nbo.usableLoadingPositions - 1);
      nbo.degradedPositions = Math.min(4, nbo.degradedPositions + 1);
      nbo.currentQueue = 11;
      nbo.predictedPeakQueue = 15;
      nbo.predictedTurnaroundMin = 128;
      nbo.riskLevel = "CRITICAL";
      nbo.state = "CAPACITY PRESSURE";
      nbo.estimatedProcessingCapacity90Min = 9;
      nbo.loadingPerformanceRatePct = 71;
      nbo.primaryBottleneck = "Loading capacity";
      nbo.bottleneckDetail =
        "CRISIS INJECTED: 4 loading positions unavailable. Demand exceeds processing capacity by 9 orders.";
      nbo.interventionStatus = "ACTIVE INTERVENTION";
      nbo.activeInterventionCount += 1;
      nbo.exposureAtRiskKes += 1450000;
    }

    const cap = this.capacityStates.nairobi;
    if (cap) {
      cap.usableNow = Math.max(2, cap.usableNow - 1);
      cap.degraded += 1;
      cap.offlineUnavailable += 1;
      cap.reasons.unavailableReason =
        "Bay P04: COMPRESSOR OVERHEAT — emergency lockout engaged";
      const p04 = cap.positions.find((p) => p.code === "P04");
      if (p04) {
        p04.status = "MAINTENANCE";
        p04.activeTruckReg = undefined;
        p04.activeOmc = undefined;
        p04.activeOrder = undefined;
        p04.telemetryNote =
          "OFFLINE: Compressor overheat lockout — maintenance dispatch engaged";
        p04.flowRateLpm = 0;
      }
      cap.effectiveProcessingCapacityLabel = `${cap.usableNow} usable bays — CRISIS`;
    }

    const eq = this.equipmentStates.nairobi;
    if (eq) {
      eq.metering.status = "DEGRADED";
      eq.metering.detail =
        "Bay P04 compressor overheat lockout • Bay P04 offline until manual reset";
      eq.loadingPerformanceRatePct = 71;
      eq.loadingPerformanceDeltaLabel = "29% below baseline (crisis injected)";
      eq.averageFlowRateLpm = 1180;
    }

    const ris = this.atRiskOps.find((r) => r.orderNumber === "LO-NBO-8821");
    if (ris) {
      ris.riskLevel = "CRITICAL";
      ris.predictedTurnaroundMin = 128;
      ris.delayRiskMin = 63;
      ris.exposureAtRiskKes = 890000;
      ris.primaryCause =
        "CRISIS: 4 loading positions offline (P04 compressor lockout) + queue at 11";
      ris.actionStatus = "APPROVAL REQUIRED";
      const newFactor: CausalFactor = {
        factor: "Bay P04 compressor overheat lockout",
        impactScore: 44,
        category: "equipment",
      };
      ris.causalFactors = [newFactor, ...ris.causalFactors];
    }

    if (this.yardTrucks.nairobi) {
      const newRegs = [
        { reg: "KDP 781M", omc: "Rubis Energy Kenya", order: "LO-NBO-CR01" },
        {
          reg: "KDR 552X",
          omc: "TotalEnergies Marketing",
          order: "LO-NBO-CR02",
        },
      ];
      newRegs.forEach((d, i) => {
        const nowMin = now.getMinutes().toString().padStart(2, "0");
        const gateIn = `${now
          .getHours()
          .toString()
          .padStart(2, "0")}:${nowMin}`;
        this.yardTrucks.nairobi.push({
          id: `TRK-NBO-CR${i + 1}`,
          registration: d.reg,
          omc: d.omc,
          orderNumber: d.order,
          product: "PMS (Super Unleaded)",
          quantityLitres: 36000,
          compartmentsCount: 3,
          currentStage: "Gate-In",
          assignedPosition: undefined,
          timeInStageMin: 1,
          baselineStageMin: 10,
          dwellDeltaMin: -9,
          predictedGateOut: `${now.getHours()}:${(now.getMinutes() + 85) % 60}`,
          riskStatus: "AMBER",
          riskLabel: "Crisis arrival — gate queue forming",
          nextAction: "Await scale assignment",
          flowGuardStatus: "MONITORED",
          depotId: "nairobi",
          predictedTurnaroundMin: 118,
          baselineTurnaroundMin: 65,
          confidencePct: 84,
          stageTimestamps: { gateIn },
        });
      });
      if (nbo) nbo.trucksInside = this.yardTrucks.nairobi.length;
    }

    this.events.unshift({
      id: `EVT-CRISIS-${Date.now()}`,
      timestamp: ts,
      depotId: "nairobi",
      depotName: "Nairobi Terminal (PS10)",
      eventType: "EQUIPMENT_DEGRADATION",
      description:
        "CRISIS INJECTED: Nairobi P04 compressor overheat lockout. Effective capacity reduced to 4 bays. Queue at 11.",
      severity: "critical",
    });
    this.events.unshift({
      id: `EVT-CRISIS2-${Date.now()}`,
      timestamp: ts,
      depotId: "nairobi",
      depotName: "Nairobi Terminal (PS10)",
      eventType: "RISK_PREDICTION",
      description:
        "LO-NBO-8821 escalated to CRITICAL — 128m projected turnaround vs 65m baseline (+63m).",
      severity: "critical",
      associatedTruck: "KDA 123X",
    });
  }

  public getDemurragePreventedKes(): number {
    return this.demurragePreventedKes;
  }

  public getSimulationUptimeSeconds(): number {
    return Math.round((Date.now() - this.simulationStartedAt) / 1000);
  }

  // =========================================================================
  // DASHBOARD 2: DEPOT OPERATIONS
  // =========================================================================

  public getDepotYardTrucks(depotId: DepotId): YardTruck[] {
    const list = this.yardTrucks[depotId];
    return list ? [...list] : [];
  }

  public getDepotCapacityState(depotId: DepotId): DepotCapacityState {
    return this.capacityStates[depotId] || this.capacityStates.nairobi;
  }

  public getDepotEquipmentState(depotId: DepotId): DepotEquipmentState {
    return this.equipmentStates[depotId] || this.equipmentStates.nairobi;
  }

  public getDepotBottleneck(depotId: DepotId): DepotBottleneckDiagnosis {
    return this.bottlenecks[depotId] || this.bottlenecks.nairobi;
  }

  public getDepotForecast(depotId: DepotId): DepotForecast {
    return this.depotForecasts[depotId] || this.depotForecasts.nairobi;
  }

  public getDepotKpiSummary(depotId: DepotId): DepotKpiSummary {
    const depot = this.getDepotById(depotId) || this.depots[0];
    const trucks = this.getDepotYardTrucks(depotId);
    const inQueue = trucks.filter(
      (t) =>
        t.currentStage === "Gate-In" || t.currentStage === "Validation / Release"
    ).length;
    const currentlyLoading = trucks.filter(
      (t) => t.currentStage === "Loading"
    ).length;
    const atRiskCount = trucks.filter(
      (t) => t.riskStatus === "RED" || t.riskStatus === "AMBER"
    ).length;
    const capacity = this.getDepotCapacityState(depotId);

    const activeTrucks = trucks.filter((t) => t.currentStage !== "Gate-Out");
    const avgDwell =
      activeTrucks.length > 0
        ? Math.round(
            activeTrucks.reduce((sum, t) => sum + t.timeInStageMin, 0) /
              activeTrucks.length
          )
        : 18;

    const baselineDwell = 18;
    const dwellDelta = avgDwell - baselineDwell;

    return {
      trucksInside: depot.trucksInside,
      inQueue,
      currentlyLoading,
      averageDwellMin: avgDwell,
      baselineDwellMin: baselineDwell,
      dwellDeltaMin: dwellDelta,
      atRiskCount,
      usablePositions: capacity.usableNow,
      totalPositions: capacity.totalPhysicalPositions,
      degradedPositions: capacity.degraded,
      unavailablePositions: capacity.offlineUnavailable,
      effectiveCapacity90Min: depot.estimatedProcessingCapacity90Min,
      expectedDemand90Min: depot.expectedDemandNext90Min,
    };
  }

  public getDepotIntervention(
    depotId: DepotId
  ): AutonomousIntervention | undefined {
    return this.interventions.find((i) => i.depotId === depotId);
  }

  public getDepotEvents(depotId: DepotId): OperationalEvent[] {
    return this.events.filter((e) => e.depotId === depotId);
  }

  // =========================================================================
  // DASHBOARD 3: OMC COLLECTION VISIBILITY
  // =========================================================================

  public getOmcList(): OmcProfile[] {
    return Object.values(this.omcProfiles);
  }

  public getOmcProfile(omcId: OmcId): OmcProfile | undefined {
    return this.omcProfiles[omcId];
  }

  public getOmcOrders(omcId: OmcId): OmcCollectionOrder[] {
    return this.omcOrders[omcId] || [];
  }

  public getOmcKpis(omcId: OmcId): OmcKpiSummary {
    const orders = this.getOmcOrders(omcId);
    return calculateOmcKpiSummary(omcId, orders);
  }

  public getOmcNotifications(omcId: OmcId): OmcNotification[] {
    return this.omcNotifications[omcId] || [];
  }

  public getOmcHourlyOutlook(omcId: OmcId): OmcHourlyOutlook[] {
    return this.omcOutlooks[omcId] || [];
  }

  public async acknowledgeNotification(notificationId: string): Promise<boolean> {
    for (const omcId of Object.keys(this.omcNotifications) as OmcId[]) {
      const notif = this.omcNotifications[omcId].find(
        (n) => n.id === notificationId
      );
      if (notif) {
        notif.isAcknowledged = true;
        const now = new Date();
        notif.acknowledgedAt = now.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        });
        return true;
      }
    }
    return false;
  }

  public async acknowledgeOrderCommunication(orderId: string): Promise<boolean> {
    for (const omcId of Object.keys(this.omcOrders) as OmcId[]) {
      const order = this.omcOrders[omcId].find((o) => o.id === orderId);
      if (order) {
        order.communicationStatus.acknowledged = true;
        const now = new Date();
        order.communicationStatus.acknowledgedAt = now.toLocaleTimeString(
          "en-GB",
          { hour: "2-digit", minute: "2-digit" }
        );
        return true;
      }
    }
    return false;
  }

  // =========================================================================
  // DASHBOARD 4: AUTONOMOUS CONTROL
  // =========================================================================

  public getAutonomyIncidents(): AutonomyIncident[] {
    return [...this.autonomyIncidents];
  }

  public getAutonomyIncidentById(id: string): AutonomyIncident | undefined {
    return this.autonomyIncidents.find((i) => i.id === id);
  }

  public getTelemetryDataSources(): TelemetryDataSource[] {
    return [...this.telemetrySources];
  }

  public getPolicyRules(): AutonomyPolicyRule[] {
    return [...this.policyRules];
  }

  public getAutonomyMetrics(): AutonomyAggregateMetrics {
    return { ...this.autonomyMetrics };
  }

  public getAutonomySubsystemHealth(): AutonomySubsystemHealth {
    return { ...this.subsystemHealth };
  }

  public getAutonomyState(): AutonomyState {
    return this.autonomyState;
  }

  public isSimulatedDegradedMode(): boolean {
    return this.simulatedDegradedMode;
  }

  public setSimulatedDegradedMode(active: boolean): void {
    this.simulatedDegradedMode = active;
    const extSource = this.telemetrySources.find((s) => s.id === "SRC-07");
    if (extSource) {
      if (active) {
        extSource.status = "DEGRADED";
        extSource.healthPct = 42.5;
        extSource.isFallbackActive = true;
        extSource.lastSync = "48s ago (DROPPED)";
      } else {
        extSource.status = "HEALTHY";
        extSource.healthPct = 99.2;
        extSource.isFallbackActive = false;
        extSource.lastSync = "8s ago";
      }
    }

    if (active) {
      this.subsystemHealth.predictionEngine = "DEGRADED";
      this.autonomyState = "APPROVAL-GATED";
      this.autonomyMetrics.calibrationAccuracyPct = 74.0;
      this.health.degradedModeActive = true;
      this.health.status = "DEGRADED";
      this.health.predictionEngineStatus = "DEGRADED";
      this.health.fallbackDataSource = "Historical Velocity & Gate Baseline";
    } else {
      this.subsystemHealth.predictionEngine = "OPERATIONAL";
      this.autonomyState = "AUTONOMOUS";
      this.autonomyMetrics.calibrationAccuracyPct = 94.2;
      this.health.degradedModeActive = false;
      this.health.status = "NOMINAL";
      this.health.predictionEngineStatus = "OPERATIONAL";
      this.health.fallbackDataSource = undefined;
    }
  }

  public async authorizeIncidentAction(
    incidentId: string
  ): Promise<AutonomyIncident> {
    const incident = this.autonomyIncidents.find((i) => i.id === incidentId);
    if (!incident) {
      throw new Error(`Autonomy incident ${incidentId} not found`);
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    incident.status = "VERIFIED";
    incident.actuationDetails.actuationStatus = "CONFIRMED";
    incident.verification.status = "VERIFIED";
    incident.verification.verifiedReductionMin =
      incident.verification.targetReductionMin;
    incident.verification.varianceMin = 0;
    incident.verification.realizedSavingsKes = Math.round(
      incident.verification.exposureProtectedKes * 0.92
    );
    incident.verification.accuracyPct = 96.5;
    incident.verification.measuredAt = timeStr;
    incident.operatorNotes = `Authorized by Shift Controller at ${timeStr}. Field actuation verified.`;

    this.demurragePreventedKes += incident.verification.realizedSavingsKes ?? 0;

    const execStep = incident.timelineSteps.find((s) => s.stage === "EXECUTE");
    if (execStep) {
      execStep.status = "COMPLETED";
      execStep.summary = `Actuation executed upon supervisor authorization at ${timeStr}`;
    }
    const verifyStep = incident.timelineSteps.find((s) => s.stage === "VERIFY");
    if (verifyStep) {
      verifyStep.status = "COMPLETED";
      verifyStep.summary = `Verified ${incident.verification.verifiedReductionMin} min dwell recovery; field telemetry stabilized`;
      verifyStep.metrics = [
        {
          label: "Verified Recovery",
          value: `-${incident.verification.verifiedReductionMin} min`,
          isHighlight: true,
        },
        { label: "Status", value: "CONFIRMED" },
      ];
    }

    const matchedIntervention = this.interventions.find((i) => i.id === incidentId);
    if (matchedIntervention) {
      matchedIntervention.status = "VERIFIED";
      matchedIntervention.verifiedReductionMin =
        matchedIntervention.expectedReductionMin;
      matchedIntervention.realizedSavingsKes = Math.round(
        matchedIntervention.exposureProtectedKes * 0.9
      );
      matchedIntervention.requiresSupervisorApproval = false;
    }

    if (incident.depotId === "nakuru" && this.yardTrucks["nakuru"]) {
      const targetTruck = this.yardTrucks["nakuru"].find(
        (t) => t.orderNumber === "LO-NAK-9914"
      );
      if (targetTruck) {
        targetTruck.assignedPosition = "P03";
        targetTruck.flowGuardStatus = "Action Verified — Diverted to Bay P03";
        targetTruck.riskStatus = "GREEN";
        targetTruck.predictedTurnaroundMin = 46;
        targetTruck.dwellDeltaMin = -2;
      }
    }

    this.events.unshift({
      id: `EV-${Date.now()}`,
      timestamp: timeStr,
      depotId: incident.depotId,
      depotName: incident.depotName,
      eventType: "ACTION_VERIFIED",
      description: `Autonomous intervention ${incident.id} authorized & verified: ${incident.headline} (-${incident.verification.verifiedReductionMin}m dwell)`,
      severity: "info",
    });

    return incident;
  }

  public async rejectIncidentAction(
    incidentId: string,
    reason?: string
  ): Promise<AutonomyIncident> {
    const incident = this.autonomyIncidents.find((i) => i.id === incidentId);
    if (!incident) {
      throw new Error(`Autonomy incident ${incidentId} not found`);
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    incident.status = "BLOCKED BY POLICY";
    incident.actuationDetails.actuationStatus = "BLOCKED";
    incident.operatorNotes = `Rejected by operator at ${timeStr}. Reason: ${
      reason || "Manual operational preference"
    }`;

    const execStep = incident.timelineSteps.find((s) => s.stage === "EXECUTE");
    if (execStep) {
      execStep.status = "BLOCKED";
      execStep.summary = `Action rejected by operator: ${
        reason || "Held at manual baseline"
      }`;
    }

    const matchedIntervention = this.interventions.find((i) => i.id === incidentId);
    if (matchedIntervention) {
      matchedIntervention.status = "BLOCKED BY POLICY";
    }

    return incident;
  }

  // =========================================================================
  // DASHBOARD 5: EXECUTIVE CONTROL PLANE
  // =========================================================================

  public getExecutiveKpis(
    period: ExecutiveTimePeriod = "30_DAYS"
  ): ExecutiveKpiSummary {
    return calculateExecutiveKpis(
      this.depots,
      this.autonomyIncidents,
      this.autonomyMetrics,
      period
    );
  }

  public getTurnaroundTrend(
    period: ExecutiveTimePeriod = "30_DAYS"
  ): TurnaroundTrendPoint[] {
    return initTurnaroundTrend(period);
  }

  public getDepotExecutivePerformance(
    period: ExecutiveTimePeriod = "30_DAYS"
  ): DepotExecutivePerformance[] {
    return initDepotExecutivePerformance(this.depots, period);
  }

  public getValueWaterfall(
    period: ExecutiveTimePeriod = "30_DAYS"
  ): ValueWaterfallItem[] {
    return initValueWaterfall(period);
  }

  public getBottleneckImpact(
    period: ExecutiveTimePeriod = "30_DAYS"
  ): BottleneckImpactSummary[] {
    return initBottleneckImpact(period);
  }

  public getAutonomyFunnel(period: ExecutiveTimePeriod = "30_DAYS"): AutonomyFunnel {
    return initAutonomyFunnel(period);
  }

  public getExecutiveRiskSummary(
    period: ExecutiveTimePeriod = "30_DAYS"
  ): ExecutiveRiskSummary {
    return initExecutiveRiskSummary(period);
  }

  public getRoiSummary(scenario: RoiScenarioName = "Expected"): RoiModelScenario {
    const scenarios = initRoiScenarios();
    return scenarios[scenario] || scenarios.Expected;
  }

  public getRoiScenarios(): Record<RoiScenarioName, RoiModelScenario> {
    return initRoiScenarios();
  }

  public getDeploymentReadiness(): DeploymentReadinessCategory[] {
    return initDeploymentReadiness();
  }

  public getExecutiveTrustHealth(): ExecutiveTrustHealth {
    return initExecutiveTrustHealth();
  }

  public getExecutiveAlerts(): ExecutiveAlert[] {
    return initExecutiveAlerts();
  }
}

export const flowGuardService = new SyntheticFlowGuardRepository();