import {
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
  Depot,
  AutonomyIncident,
  AutonomyAggregateMetrics,
} from "@/types/flowguard";

/**
 * =====================================================================
 * SYNTHETIC EXECUTIVE CONTROL PLANE DATA SERVICE
 * =====================================================================
 * Aggregates high-level business, financial, operational, and autonomy
 * outcomes directly from the shared FlowGuard operational universe.
 * Supports dynamic reporting period switching (TODAY, 7 DAYS, 30 DAYS).
 */

export function calculateExecutiveKpis(
  depots: Depot[],
  incidents: AutonomyIncident[],
  metrics: AutonomyAggregateMetrics | null,
  period: ExecutiveTimePeriod = "30_DAYS"
): ExecutiveKpiSummary {
  if (period === "TODAY") {
    return {
      totalExposureProtectedKes: 1420000,
      realizedSavingsKes: 1100000,
      exposureAtRiskKes: 420000,
      projectedExposureTotalKes: 1840000,
      baselineTurnaroundMin: 87,
      currentTurnaroundMin: 53,
      turnaroundImprovementPct: -39.1,
      turnaroundRecoveredMin: 34,
      ordersServicedOnTimePct: 98.1,
      ordersOnTimeDeltaPts: 9.9,
      autonomousInterventionsTotal: 6,
      interventionsVerifiedSuccess: 6,
      interventionSuccessRatePct: 100.0,
      recoveryAttainmentPct: 94.4,
      meanPredictionErrorMin: 3.2,
      capacityRecoveredHours: 18,
      capacityRecoveredTruckSlots: 14,
      simulationPeriodLabel: "Today • 15 Sep 2026 (Live Operating Day)",
      executiveNarrative:
        "FlowGuard reduced today's road tanker turnaround by 39% (-34 min, from 87m to 53m), protected KES 1.42M in demurrage exposure across 6 autonomous interventions with 0 safety invariant breaches.",
      recommendation: {
        headline: "PROCEED TO CONTROLLED MULTI-DEPOT PILOT",
        action: "Authorize phased pilot deployment across Nairobi (PS10), Nakuru (PS25), and Eldoret (PS27) operational corridors.",
        justifications: [
          "Today's dwell reduced by 34 minutes with 98.1% on-time collection SLA adherence (+9.9 pts vs baseline).",
          "100% autonomous intervention verification rate across 6 actions with 0 safety breaches in live simulation.",
          "KES 1.42M in modeled operational exposure prevented today, demonstrating high sensitivity to peak morning surges.",
          "Deterministic policy guardrails guaranteed zero unauthorized cross-product or multi-position reallocations.",
        ],
      },
    };
  }

  if (period === "7_DAYS") {
    return {
      totalExposureProtectedKes: 6850000,
      realizedSavingsKes: 5200000,
      exposureAtRiskKes: 1850000,
      projectedExposureTotalKes: 8700000,
      baselineTurnaroundMin: 87,
      currentTurnaroundMin: 55,
      turnaroundImprovementPct: -36.8,
      turnaroundRecoveredMin: 32,
      ordersServicedOnTimePct: 96.8,
      ordersOnTimeDeltaPts: 8.6,
      autonomousInterventionsTotal: 28,
      interventionsVerifiedSuccess: 26,
      interventionSuccessRatePct: 92.9,
      recoveryAttainmentPct: 91.4,
      meanPredictionErrorMin: 3.8,
      capacityRecoveredHours: 142,
      capacityRecoveredTruckSlots: 78,
      simulationPeriodLabel: "Last 7 Days • 09–15 Sep 2026 (Rolling Multi-Depot Window)",
      executiveNarrative:
        "FlowGuard compressed average depot turnaround across the network to 55 minutes (-36.8%), protected KES 6.85M in modeled demurrage exposure, and verified 26 autonomous actions over the past 7 days.",
      recommendation: {
        headline: "PROCEED TO CONTROLLED MULTI-DEPOT PILOT",
        action: "Authorize phased pilot deployment across Nairobi (PS10), Nakuru (PS25), and Eldoret (PS27) operational corridors.",
        justifications: [
          "7-day average road tanker dwell reduced by 32 minutes with 96.8% on-time collection SLA adherence.",
          "92.9% autonomous intervention verification rate across 28 actions with 0 safety breaches.",
          "KES 6.85M in operational exposure prevented, mitigating recurring demurrage across Nairobi and Nakuru corridors.",
          "Closed-loop telemetry verification confirms model convergence with ±3.8m mean prediction error.",
        ],
      },
    };
  }

  // Default: '30_DAYS'
  const totalExposureProtectedKes = metrics?.totalExposureProtectedKes || 14820000;
  const realizedSavingsKes = 11350000;
  const exposureAtRiskKes = 4850000;
  const projectedExposureTotalKes = totalExposureProtectedKes + exposureAtRiskKes;

  const baselineTurnaroundMin = 87;
  const currentTurnaroundMin = 56;
  const turnaroundRecoveredMin = baselineTurnaroundMin - currentTurnaroundMin; // 31 min
  const turnaroundImprovementPct = -35.6; // 35.6% reduction

  const ordersServicedOnTimePct = 96.4;
  const ordersOnTimeDeltaPts = 8.2;

  const autonomousInterventionsTotal = metrics?.interventionsExecutedTotal || 50;
  const interventionsVerifiedSuccess = metrics?.interventionsVerifiedSuccess || 46;
  const interventionSuccessRatePct = metrics?.successRatePct || 92.0;

  const capacityRecoveredHours = 340;
  const capacityRecoveredTruckSlots = 182;

  return {
    totalExposureProtectedKes,
    realizedSavingsKes,
    exposureAtRiskKes,
    projectedExposureTotalKes,
    baselineTurnaroundMin,
    currentTurnaroundMin,
    turnaroundImprovementPct,
    turnaroundRecoveredMin,
    ordersServicedOnTimePct,
    ordersOnTimeDeltaPts,
    autonomousInterventionsTotal,
    interventionsVerifiedSuccess,
    interventionSuccessRatePct,
    recoveryAttainmentPct: 89.5,
    meanPredictionErrorMin: 4.2,
    capacityRecoveredHours,
    capacityRecoveredTruckSlots,
    simulationPeriodLabel: "Last 30 Days • 16 Aug–15 Sep 2026 (Consolidated Benchmark)",
    executiveNarrative:
      "FlowGuard reduced modeled average depot turnaround by 35.6% (from 87m to 56m), protected KES 14.82M in demurrage exposure, and successfully verified 46 of 50 autonomous interventions across the KPC terminal network.",
    recommendation: {
      headline: "PROCEED TO CONTROLLED MULTI-DEPOT PILOT",
      action: "Authorize phased pilot deployment across Nairobi (PS10), Nakuru (PS25), and Eldoret (PS27) operational corridors.",
      justifications: [
        "Average road tanker dwell reduced by 31 minutes with 96.4% on-time collection SLA adherence (+8.2 pts vs baseline).",
        "92.0% autonomous intervention verification rate across 50 actions with 0 safety breaches in prototype simulation.",
        "KES 14.82M in modeled operational exposure prevented, establishing an estimated 27.5× Year 1 ROI under expected volumes.",
        "Deterministic policy guardrails guarantee human approval is strictly enforced for cross-product and multi-position reallocations.",
      ],
    },
  };
}

export function initTurnaroundTrend(period: ExecutiveTimePeriod = "30_DAYS"): TurnaroundTrendPoint[] {
  if (period === "TODAY") {
    return [
      { period: "06:00 (Ingress Surge)", turnaroundMin: 84, baselineMin: 87, targetMin: 60, deltaMin: -3, improvementPct: -3.4 },
      { period: "08:00 (Peak Queue)", turnaroundMin: 76, baselineMin: 87, targetMin: 60, deltaMin: -11, improvementPct: -12.6 },
      { period: "10:00 (INT-8801 Executed)", turnaroundMin: 62, baselineMin: 87, targetMin: 60, deltaMin: -25, improvementPct: -28.7 },
      { period: "12:00 (Midday Nominal)", turnaroundMin: 55, baselineMin: 87, targetMin: 60, deltaMin: -32, improvementPct: -36.8 },
      { period: "Current (Optimized Flow)", turnaroundMin: 53, baselineMin: 87, targetMin: 60, deltaMin: -34, improvementPct: -39.1 },
    ];
  }

  if (period === "7_DAYS") {
    return [
      { period: "Day 1 (Mon)", turnaroundMin: 78, baselineMin: 87, targetMin: 60, deltaMin: -9, improvementPct: -10.3 },
      { period: "Day 2 (Tue)", turnaroundMin: 71, baselineMin: 87, targetMin: 60, deltaMin: -16, improvementPct: -18.4 },
      { period: "Day 3 (Wed)", turnaroundMin: 65, baselineMin: 87, targetMin: 60, deltaMin: -22, improvementPct: -25.3 },
      { period: "Day 5 (Fri)", turnaroundMin: 59, baselineMin: 87, targetMin: 60, deltaMin: -28, improvementPct: -32.2 },
      { period: "Day 7 (Current)", turnaroundMin: 55, baselineMin: 87, targetMin: 60, deltaMin: -32, improvementPct: -36.8 },
    ];
  }

  return [
    {
      period: "Historical Baseline",
      turnaroundMin: 87,
      baselineMin: 87,
      targetMin: 60,
      deltaMin: 0,
      improvementPct: 0,
    },
    {
      period: "Week 1 (Pilot Start)",
      turnaroundMin: 82,
      baselineMin: 87,
      targetMin: 60,
      deltaMin: -5,
      improvementPct: -5.7,
    },
    {
      period: "Week 2 (Sequencing Active)",
      turnaroundMin: 74,
      baselineMin: 87,
      targetMin: 60,
      deltaMin: -13,
      improvementPct: -14.9,
    },
    {
      period: "Week 3 (Dual-Arm Fast-Track)",
      turnaroundMin: 64,
      baselineMin: 87,
      targetMin: 60,
      deltaMin: -23,
      improvementPct: -26.4,
    },
    {
      period: "Current (Full Bounded Autonomy)",
      turnaroundMin: 56,
      baselineMin: 87,
      targetMin: 60,
      deltaMin: -31,
      improvementPct: -35.6,
    },
  ];
}

export function initDepotExecutivePerformance(
  depots: Depot[],
  period: ExecutiveTimePeriod = "30_DAYS"
): DepotExecutivePerformance[] {
  if (period === "TODAY") {
    return [
      {
        depotId: "nairobi",
        depotName: "Nairobi Terminal (PS10)",
        code: "PS10",
        region: "Central / Capital",
        baselineTurnaroundMin: 87,
        currentTurnaroundMin: 52,
        turnaroundImprovementPct: -40.2,
        turnaroundRecoveredMin: 35,
        interventionsCount: 3,
        exposureProtectedKes: 850000,
        realizedSavingsKes: 680000,
        currentStatus: "OPTIMIZED",
        topBottleneck: "Morning Ingress Cluster",
        volumeProcessedPct: 44,
      },
      {
        depotId: "nakuru",
        depotName: "Nakuru Depot (PS25)",
        code: "PS25",
        region: "Rift Valley",
        baselineTurnaroundMin: 71,
        currentTurnaroundMin: 55,
        turnaroundImprovementPct: -22.5,
        turnaroundRecoveredMin: 16,
        interventionsCount: 1,
        exposureProtectedKes: 280000,
        realizedSavingsKes: 220000,
        currentStatus: "EQUIPMENT MONITORING",
        topBottleneck: "Coriolis Meter Drift (Bay P02)",
        volumeProcessedPct: 22,
      },
      {
        depotId: "eldoret",
        depotName: "Eldoret Depot (PS27)",
        code: "PS27",
        region: "North Rift",
        baselineTurnaroundMin: 64,
        currentTurnaroundMin: 52,
        turnaroundImprovementPct: -18.8,
        turnaroundRecoveredMin: 12,
        interventionsCount: 1,
        exposureProtectedKes: 190000,
        realizedSavingsKes: 140000,
        currentStatus: "GATE BALANCED",
        topBottleneck: "Tare Scale Ingress Surge",
        volumeProcessedPct: 20,
      },
      {
        depotId: "mombasa",
        depotName: "Mombasa Terminal (KOT / PS1)",
        code: "KOT-PS1",
        region: "Coast",
        baselineTurnaroundMin: 52,
        currentTurnaroundMin: 50,
        turnaroundImprovementPct: -3.8,
        turnaroundRecoveredMin: 2,
        interventionsCount: 1,
        exposureProtectedKes: 70000,
        realizedSavingsKes: 40000,
        currentStatus: "NOMINAL FLOW",
        topBottleneck: "Marine Manifold Line Balance",
        volumeProcessedPct: 9,
      },
      {
        depotId: "kisumu",
        depotName: "Kisumu Depot & Jetty (PS28)",
        code: "PS28",
        region: "Lake Basin",
        baselineTurnaroundMin: 48,
        currentTurnaroundMin: 47,
        turnaroundImprovementPct: -2.1,
        turnaroundRecoveredMin: 1,
        interventionsCount: 0,
        exposureProtectedKes: 30000,
        realizedSavingsKes: 20000,
        currentStatus: "STEADY REGIONAL",
        topBottleneck: "Regional Export Allocation",
        volumeProcessedPct: 5,
      },
    ];
  }

  if (period === "7_DAYS") {
    return [
      {
        depotId: "nairobi",
        depotName: "Nairobi Terminal (PS10)",
        code: "PS10",
        region: "Central / Capital",
        baselineTurnaroundMin: 87,
        currentTurnaroundMin: 54,
        turnaroundImprovementPct: -37.9,
        turnaroundRecoveredMin: 33,
        interventionsCount: 12,
        exposureProtectedKes: 3120000,
        realizedSavingsKes: 2450000,
        currentStatus: "OPTIMIZED",
        topBottleneck: "Peak Demand Spikes",
        volumeProcessedPct: 43,
      },
      {
        depotId: "nakuru",
        depotName: "Nakuru Depot (PS25)",
        code: "PS25",
        region: "Rift Valley",
        baselineTurnaroundMin: 71,
        currentTurnaroundMin: 57,
        turnaroundImprovementPct: -19.7,
        turnaroundRecoveredMin: 14,
        interventionsCount: 7,
        exposureProtectedKes: 1750000,
        realizedSavingsKes: 1300000,
        currentStatus: "EQUIPMENT MONITORING",
        topBottleneck: "Coriolis Thermal Drift",
        volumeProcessedPct: 22,
      },
      {
        depotId: "eldoret",
        depotName: "Eldoret Depot (PS27)",
        code: "PS27",
        region: "North Rift",
        baselineTurnaroundMin: 64,
        currentTurnaroundMin: 53,
        turnaroundImprovementPct: -17.2,
        turnaroundRecoveredMin: 11,
        interventionsCount: 5,
        exposureProtectedKes: 1250000,
        realizedSavingsKes: 950000,
        currentStatus: "GATE BALANCED",
        topBottleneck: "Transit Corridor Surges",
        volumeProcessedPct: 20,
      },
      {
        depotId: "mombasa",
        depotName: "Mombasa Terminal (KOT / PS1)",
        code: "KOT-PS1",
        region: "Coast",
        baselineTurnaroundMin: 52,
        currentTurnaroundMin: 49,
        turnaroundImprovementPct: -5.8,
        turnaroundRecoveredMin: 3,
        interventionsCount: 2,
        exposureProtectedKes: 450000,
        realizedSavingsKes: 320000,
        currentStatus: "NOMINAL FLOW",
        topBottleneck: "Line Pressure Balancing",
        volumeProcessedPct: 10,
      },
      {
        depotId: "kisumu",
        depotName: "Kisumu Depot & Jetty (PS28)",
        code: "PS28",
        region: "Lake Basin",
        baselineTurnaroundMin: 48,
        currentTurnaroundMin: 46,
        turnaroundImprovementPct: -4.2,
        turnaroundRecoveredMin: 2,
        interventionsCount: 2,
        exposureProtectedKes: 280000,
        realizedSavingsKes: 180000,
        currentStatus: "STEADY REGIONAL",
        topBottleneck: "Regional Dispatch Sync",
        volumeProcessedPct: 5,
      },
    ];
  }

  return [
    {
      depotId: "nairobi",
      depotName: "Nairobi Terminal (PS10)",
      code: "PS10",
      region: "Central / Capital",
      baselineTurnaroundMin: 87,
      currentTurnaroundMin: 56,
      turnaroundImprovementPct: -35.6,
      turnaroundRecoveredMin: 31,
      interventionsCount: 22,
      exposureProtectedKes: 6420000,
      realizedSavingsKes: 4950000,
      currentStatus: "OPTIMIZED",
      topBottleneck: "Loading Capacity Pressure",
      volumeProcessedPct: 42,
    },
    {
      depotId: "nakuru",
      depotName: "Nakuru Depot (PS25)",
      code: "PS25",
      region: "Rift Valley",
      baselineTurnaroundMin: 71,
      currentTurnaroundMin: 58,
      turnaroundImprovementPct: -18.3,
      turnaroundRecoveredMin: 13,
      interventionsCount: 12,
      exposureProtectedKes: 3850000,
      realizedSavingsKes: 2900000,
      currentStatus: "EQUIPMENT MONITORING",
      topBottleneck: "Coriolis Meter Drift",
      volumeProcessedPct: 22,
    },
    {
      depotId: "eldoret",
      depotName: "Eldoret Depot (PS27)",
      code: "PS27",
      region: "North Rift",
      baselineTurnaroundMin: 64,
      currentTurnaroundMin: 53,
      turnaroundImprovementPct: -17.2,
      turnaroundRecoveredMin: 11,
      interventionsCount: 10,
      exposureProtectedKes: 2950000,
      realizedSavingsKes: 2250000,
      currentStatus: "GATE BALANCED",
      topBottleneck: "Tare Scale Ingress Surge",
      volumeProcessedPct: 20,
    },
    {
      depotId: "mombasa",
      depotName: "Mombasa Terminal (KOT / PS1)",
      code: "KOT-PS1",
      region: "Coast",
      baselineTurnaroundMin: 52,
      currentTurnaroundMin: 49,
      turnaroundImprovementPct: -5.8,
      turnaroundRecoveredMin: 3,
      interventionsCount: 3,
      exposureProtectedKes: 950000,
      realizedSavingsKes: 800000,
      currentStatus: "NOMINAL FLOW",
      topBottleneck: "Marine Manifold Line Balance",
      volumeProcessedPct: 10,
    },
    {
      depotId: "kisumu",
      depotName: "Kisumu Depot & Jetty (PS28)",
      code: "PS28",
      region: "Lake Basin",
      baselineTurnaroundMin: 48,
      currentTurnaroundMin: 46,
      turnaroundImprovementPct: -4.2,
      turnaroundRecoveredMin: 2,
      interventionsCount: 3,
      exposureProtectedKes: 650000,
      realizedSavingsKes: 450000,
      currentStatus: "STEADY REGIONAL",
      topBottleneck: "Regional Export Allocation",
      volumeProcessedPct: 6,
    },
  ];
}

export function initValueWaterfall(period: ExecutiveTimePeriod = "30_DAYS"): ValueWaterfallItem[] {
  if (period === "TODAY") {
    return [
      {
        id: "VW-01",
        category: "Nairobi Capacity Pressure Mitigation",
        amountKes: 850000,
        percentage: 59.9,
        interventionsCount: 3,
        primaryDepotId: "nairobi",
        description: "Dual-hose fast track (INT-8801) on Bay P03 and queue re-sequencing for 6 morning collection orders.",
      },
      {
        id: "VW-02",
        category: "Nakuru Meter Drift & Auxiliary Diversion",
        amountKes: 280000,
        percentage: 19.7,
        interventionsCount: 1,
        primaryDepotId: "nakuru",
        description: "Auxiliary bay divert engaged to circumvent Bay P02 Coriolis meter drift without gantry stalling.",
      },
      {
        id: "VW-03",
        category: "Eldoret Tare Scale & Gate Load-Balancing",
        amountKes: 190000,
        percentage: 13.4,
        interventionsCount: 1,
        primaryDepotId: "eldoret",
        description: "Pre-validated electronic manifest lane activation clearing morning transit entry backlog.",
      },
      {
        id: "VW-04",
        category: "Mombasa & Kisumu Regional Balancing",
        amountKes: 100000,
        percentage: 7.0,
        interventionsCount: 1,
        primaryDepotId: "mombasa",
        description: "Line pressure coordination maintaining uninterrupted gantry loading velocity.",
      },
    ];
  }

  if (period === "7_DAYS") {
    return [
      {
        id: "VW-01",
        category: "Nairobi Capacity Pressure Mitigation",
        amountKes: 3120000,
        percentage: 45.5,
        interventionsCount: 12,
        primaryDepotId: "nairobi",
        description: "Dynamic bay allocation and fast-track dual-hose loading resolving peak morning collection clusters.",
      },
      {
        id: "VW-02",
        category: "Nakuru Meter Drift & Auxiliary Diversion",
        amountKes: 1750000,
        percentage: 25.5,
        interventionsCount: 7,
        primaryDepotId: "nakuru",
        description: "Proactive routing to backup bays during temperature calibration variance.",
      },
      {
        id: "VW-03",
        category: "Eldoret Tare Scale & Gate Load-Balancing",
        amountKes: 1250000,
        percentage: 18.2,
        interventionsCount: 5,
        primaryDepotId: "eldoret",
        description: "Dual-scale dynamic balancing reducing physical weighbridge queuing dwell.",
      },
      {
        id: "VW-04",
        category: "Mombasa & Kisumu Regional Balancing",
        amountKes: 730000,
        percentage: 10.7,
        interventionsCount: 4,
        primaryDepotId: "mombasa",
        description: "Manifold pressure regulation and regional export order scheduling dampening surges.",
      },
    ];
  }

  return [
    {
      id: "VW-01",
      category: "Nairobi Capacity Pressure Mitigation",
      amountKes: 6420000,
      percentage: 43.3,
      interventionsCount: 22,
      primaryDepotId: "nairobi",
      description: "Dual-hose fast track allocation and queue re-sequencing resolving peak morning collection clusters.",
    },
    {
      id: "VW-02",
      category: "Nakuru Meter Drift & Auxiliary Diversion",
      amountKes: 3850000,
      percentage: 26.0,
      interventionsCount: 12,
      primaryDepotId: "nakuru",
      description: "Autonomous routing to auxiliary gantries preventing cascade demurrage during Coriolis calibration drift.",
    },
    {
      id: "VW-03",
      category: "Eldoret Tare Scale & Gate Load-Balancing",
      amountKes: 2950000,
      percentage: 19.9,
      interventionsCount: 10,
      primaryDepotId: "eldoret",
      description: "Dynamic smart gate lane switching for pre-validated electronic manifests, clearing entry choke points.",
    },
    {
      id: "VW-04",
      category: "Mombasa & Kisumu Regional Dispatch Balancing",
      amountKes: 1600000,
      percentage: 10.8,
      interventionsCount: 6,
      primaryDepotId: "mombasa",
      description: "Line pressure coordination and regional export order scheduling dampening terminal congestion surges.",
    },
  ];
}

export function initBottleneckImpact(period: ExecutiveTimePeriod = "30_DAYS"): BottleneckImpactSummary[] {
  if (period === "TODAY") {
    return [
      { bottleneck: "Capacity Pressure", interventionsCount: 3, turnaroundDwellSavedMin: 105, exposureProtectedKes: 850000, percentageOfTotal: 59.9, isTopBottleneck: true },
      { bottleneck: "Equipment Degradation", interventionsCount: 1, turnaroundDwellSavedMin: 45, exposureProtectedKes: 280000, percentageOfTotal: 19.7, isTopBottleneck: false },
      { bottleneck: "Gate / Scale Ingress Surge", interventionsCount: 1, turnaroundDwellSavedMin: 35, exposureProtectedKes: 190000, percentageOfTotal: 13.4, isTopBottleneck: false },
      { bottleneck: "Loading Performance Variance", interventionsCount: 1, turnaroundDwellSavedMin: 20, exposureProtectedKes: 100000, percentageOfTotal: 7.0, isTopBottleneck: false },
    ];
  }

  if (period === "7_DAYS") {
    return [
      { bottleneck: "Capacity Pressure", interventionsCount: 13, turnaroundDwellSavedMin: 380, exposureProtectedKes: 3120000, percentageOfTotal: 45.5, isTopBottleneck: true },
      { bottleneck: "Equipment Degradation", interventionsCount: 7, turnaroundDwellSavedMin: 210, exposureProtectedKes: 1750000, percentageOfTotal: 25.5, isTopBottleneck: false },
      { bottleneck: "Gate / Scale Ingress Surge", interventionsCount: 5, turnaroundDwellSavedMin: 140, exposureProtectedKes: 1250000, percentageOfTotal: 18.2, isTopBottleneck: false },
      { bottleneck: "Loading Performance Variance", interventionsCount: 3, turnaroundDwellSavedMin: 80, exposureProtectedKes: 730000, percentageOfTotal: 10.7, isTopBottleneck: false },
    ];
  }

  return [
    {
      bottleneck: "Capacity Pressure",
      interventionsCount: 24,
      turnaroundDwellSavedMin: 680,
      exposureProtectedKes: 7120000,
      percentageOfTotal: 48.0,
      isTopBottleneck: true,
    },
    {
      bottleneck: "Equipment Degradation",
      interventionsCount: 13,
      turnaroundDwellSavedMin: 390,
      exposureProtectedKes: 4100000,
      percentageOfTotal: 27.7,
      isTopBottleneck: false,
    },
    {
      bottleneck: "Gate / Scale Ingress Surge",
      interventionsCount: 9,
      turnaroundDwellSavedMin: 245,
      exposureProtectedKes: 2680000,
      percentageOfTotal: 18.1,
      isTopBottleneck: false,
    },
    {
      bottleneck: "Loading Performance Variance",
      interventionsCount: 3,
      turnaroundDwellSavedMin: 75,
      exposureProtectedKes: 680000,
      percentageOfTotal: 4.6,
      isTopBottleneck: false,
    },
    {
      bottleneck: "Validation & Customs Clearance",
      interventionsCount: 1,
      turnaroundDwellSavedMin: 30,
      exposureProtectedKes: 240000,
      percentageOfTotal: 1.6,
      isTopBottleneck: false,
    },
  ];
}

export function initAutonomyFunnel(period: ExecutiveTimePeriod = "30_DAYS"): AutonomyFunnel {
  if (period === "TODAY") {
    return {
      signalsEvaluated: 1240,
      risksIdentified: 18,
      candidateInterventionsEvaluated: 9,
      actionsExecuted: 6,
      actionsVerifiedSuccess: 6,
      actionsApprovalGated: 1,
      actionsBlockedPolicy: 0,
      actionsFailedSafely: 0,
    };
  }

  if (period === "7_DAYS") {
    return {
      signalsEvaluated: 4820,
      risksIdentified: 112,
      candidateInterventionsEvaluated: 44,
      actionsExecuted: 28,
      actionsVerifiedSuccess: 26,
      actionsApprovalGated: 4,
      actionsBlockedPolicy: 2,
      actionsFailedSafely: 1,
    };
  }

  return {
    signalsEvaluated: 10420,
    risksIdentified: 324,
    candidateInterventionsEvaluated: 87,
    actionsExecuted: 50,
    actionsVerifiedSuccess: 46,
    actionsApprovalGated: 8,
    actionsBlockedPolicy: 6,
    actionsFailedSafely: 2,
  };
}

export function initExecutiveRiskSummary(period: ExecutiveTimePeriod = "30_DAYS"): ExecutiveRiskSummary {
  if (period === "TODAY") {
    return {
      projectedExposureTotalKes: 1840000,
      exposureProtectedKes: 1420000,
      remainingAtRiskKes: 420000,
      protectionRatePct: 77.2,
      topRisks: [
        {
          rank: 1,
          depotId: "nairobi",
          depotName: "Nairobi Terminal (PS10)",
          bottleneckCategory: "Ingress Peak Cluster",
          ordersExposedCount: 4,
          potentialExposureKes: 220000,
          mitigationStatus: "Dual-Arm Fast Track Active",
        },
        {
          rank: 2,
          depotId: "nakuru",
          depotName: "Nakuru Depot (PS25)",
          bottleneckCategory: "Coriolis Drift",
          ordersExposedCount: 2,
          potentialExposureKes: 120000,
          mitigationStatus: "Auxiliary Bay Divert Active",
        },
        {
          rank: 3,
          depotId: "eldoret",
          depotName: "Eldoret Depot (PS27)",
          bottleneckCategory: "Tare Scale Surge",
          ordersExposedCount: 2,
          potentialExposureKes: 80000,
          mitigationStatus: "Secondary Scale Online",
        },
      ],
    };
  }

  if (period === "7_DAYS") {
    return {
      projectedExposureTotalKes: 8700000,
      exposureProtectedKes: 6850000,
      remainingAtRiskKes: 1850000,
      protectionRatePct: 78.7,
      topRisks: [
        {
          rank: 1,
          depotId: "nairobi",
          depotName: "Nairobi Terminal (PS10)",
          bottleneckCategory: "Capacity Pressure",
          ordersExposedCount: 8,
          potentialExposureKes: 980000,
          mitigationStatus: "Dual-Arm Fast Track Active",
        },
        {
          rank: 2,
          depotId: "nakuru",
          depotName: "Nakuru Depot (PS25)",
          bottleneckCategory: "Equipment Degradation",
          ordersExposedCount: 4,
          potentialExposureKes: 520000,
          mitigationStatus: "Auxiliary Bay Divert Active",
        },
        {
          rank: 3,
          depotId: "eldoret",
          depotName: "Eldoret Depot (PS27)",
          bottleneckCategory: "Gate Processing Ingress",
          ordersExposedCount: 3,
          potentialExposureKes: 350000,
          mitigationStatus: "Electronic Manifest Lane Engaged",
        },
      ],
    };
  }

  return {
    projectedExposureTotalKes: 19670000,
    exposureProtectedKes: 14820000,
    remainingAtRiskKes: 4850000,
    protectionRatePct: 75.3,
    topRisks: [
      {
        rank: 1,
        depotId: "nairobi",
        depotName: "Nairobi Terminal (PS10)",
        bottleneckCategory: "Capacity Pressure",
        ordersExposedCount: 12,
        potentialExposureKes: 2450000,
        mitigationStatus: "Dual-Arm Fast Track Active",
      },
      {
        rank: 2,
        depotId: "nakuru",
        depotName: "Nakuru Depot (PS25)",
        bottleneckCategory: "Equipment Degradation",
        ordersExposedCount: 5,
        potentialExposureKes: 1480000,
        mitigationStatus: "Auxiliary Bay Divert Active",
      },
      {
        rank: 3,
        depotId: "eldoret",
        depotName: "Eldoret Depot (PS27)",
        bottleneckCategory: "Gate Processing Ingress",
        ordersExposedCount: 4,
        potentialExposureKes: 920000,
        mitigationStatus: "Secondary Tare Scale Active",
      },
    ],
  };
}

export function initRoiScenarios(): Record<RoiScenarioName, RoiModelScenario> {
  return {
    Conservative: {
      scenarioName: "Conservative",
      implementationInvestmentKes: 20000000, // KES 20M upfront CAPEX
      annualProtectedValueKes: 280000000, // KES 280M
      annualOperatingCostKes: 14000000, // KES 14M OPEX
      netFirstYearBenefitKes: 246000000, // KES 246M
      paybackMonths: 4.3,
      firstYearRoiMultiplier: 13.3,
      assumptions: [
        "Adoption restricted to Nairobi (PS10) and Nakuru (PS25) only.",
        "Turnaround recovery modeled at 20% (18m average dwell reduction).",
        "Demurrage liability mitigation factored at baseline commercial penalty rates.",
        "Includes standard enterprise software maintenance & cloud infrastructure overhead.",
      ],
    },
    Expected: {
      scenarioName: "Expected",
      implementationInvestmentKes: 20000000, // KES 20M upfront CAPEX
      annualProtectedValueKes: 550000000, // KES 550M
      annualOperatingCostKes: 12000000, // KES 12M OPEX
      netFirstYearBenefitKes: 518000000, // KES 518M
      paybackMonths: 2.8,
      firstYearRoiMultiplier: 27.5,
      assumptions: [
        "Full 5-depot network deployment (Nairobi, Nakuru, Eldoret, Kisumu, Mombasa).",
        "Turnaround recovery verified at 35.6% (31m average dwell reduction).",
        "Intervention success rate maintained above 90% under bounded L2/L3 autonomy.",
        "Demonstrates 27.5× Year 1 ROI modeled directly on annual KPC throughput volumes (7.3B litres).",
      ],
    },
    Upside: {
      scenarioName: "Upside",
      implementationInvestmentKes: 20000000, // KES 20M upfront CAPEX
      annualProtectedValueKes: 760000000, // KES 760M
      annualOperatingCostKes: 10000000, // KES 10M OPEX
      netFirstYearBenefitKes: 730000000, // KES 730M
      paybackMonths: 1.8,
      firstYearRoiMultiplier: 38.0,
      assumptions: [
        "Cross-depot optimization active with real-time transit corridor coordination.",
        "Peak hour demurrage elimination and +182 monthly tanker loading slots unlocked.",
        "OMC pre-allocation adherence reaches 98% via Driver Mobile PWA acknowledgment.",
        "Regional export corridor transit clearance expedited by 45 minutes per tanker.",
      ],
    },
  };
}

/**
 * Production Readiness & Connection Architecture:
 * Replaces outdated roadmap percentages with explicit operational capabilities (ACTIVE)
 * and authorized KPC production system connection adapters (CONNECTED IN SIMULATION).
 */
export function initDeploymentReadiness(): DeploymentReadinessCategory[] {
  return [
    {
      id: "CAP-01",
      dimension: "Prediction Engine",
      status: "Demonstrated in simulation",
      statusLabel: "ACTIVE",
      readinessLevel: "Operational",
      notes: "FG-TURNAROUND-SYNTH-v1.4 calibrated. Mean prediction error: ±4.2m turnaround dwell in closed-loop simulation.",
      productionRoadmap: "Connect to live historical SAP LE and weighbridge data lake upon production ingress authorization.",
    },
    {
      id: "CAP-02",
      dimension: "Optimization Solver (MILP)",
      status: "Demonstrated in simulation",
      statusLabel: "ACTIVE",
      readinessLevel: "Operational",
      notes: "Multi-objective mathematical solver converges in sub-100ms across delay, demurrage penalty, and disruption objectives.",
      productionRoadmap: "Containerized deployment on high-availability cluster with redundant fallback solver.",
    },
    {
      id: "CAP-03",
      dimension: "Bounded Autonomy & Safety Invariants",
      status: "Demonstrated in simulation",
      statusLabel: "ACTIVE",
      readinessLevel: "Operational",
      notes: "Tiered autonomy (L1 Advisory, L2 Auto-Executable, L3 Approval-Gated). Zero safety invariant breaches recorded in simulation.",
      productionRoadmap: "Terminal Operations Standard Operating Procedure (SOP) electronic sign-off matrix mapped to SAP roles.",
    },
    {
      id: "CAP-04",
      dimension: "ERP / Loading Orders Interface",
      status: "Demonstrated in simulation",
      statusLabel: "CONNECTED IN SIMULATION",
      readinessLevel: "Adapter Ready",
      notes: "Standard SAP SD/LE schema parsed: loading order numbers, OMC allocations, product specifications, and pre-allocated quantities.",
      productionRoadmap: "Direct RFC / BAPI & OData connector activation with read-only staging shadow mode.",
    },
    {
      id: "CAP-05",
      dimension: "Weighbridge & Gate Telemetry",
      status: "Demonstrated in simulation",
      statusLabel: "CONNECTED IN SIMULATION",
      readinessLevel: "Adapter Ready",
      notes: "Event stream for tare weight, gross scale timestamps, RFID badge swipe, and electronic manifest validation.",
      productionRoadmap: "Deploy MQTT / REST edge webhooks to Avery Berkel weighbridge terminals across all 5 depots.",
    },
    {
      id: "CAP-06",
      dimension: "Loading Gantry & Coriolis Mass-Flow",
      status: "Demonstrated in simulation",
      statusLabel: "CONNECTED IN SIMULATION",
      readinessLevel: "Adapter Ready",
      notes: "Real-time flow telemetry: instantaneous flow rate (L/min), batch progress %, density, temperature, and arm interlock state.",
      productionRoadmap: "Read-only Modbus TCP / OPC-UA polling from FMC Smith / Emerson Micro Motion meters via terminal DCS.",
    },
    {
      id: "CAP-07",
      dimension: "Driver & OMC Visibility Channels",
      status: "Demonstrated in simulation",
      statusLabel: "ACTIVE",
      readinessLevel: "Operational",
      notes: "Real-time mobile PWA for tanker drivers and live dispatch tracking board for OMC logistics coordinators.",
      productionRoadmap: "Integrate Safaricom / Africa's Talking SMS fallback for drivers operating legacy feature phones.",
    },
  ];
}

export function initExecutiveTrustHealth(): ExecutiveTrustHealth {
  return {
    systemState: "OPERATIONAL",
    predictionEngine: "HEALTHY",
    optimizationSolver: "HEALTHY",
    autonomyMode: "BOUNDED L2/L3",
    auditIntegrity: "SYNCHRONIZED",
    meanTurnaroundErrorMin: 4.2,
    solverConvergenceLatencyMs: 84,
  };
}

export function initExecutiveAlerts(): ExecutiveAlert[] {
  return [
    {
      id: "ALERT-01",
      timestamp: "10:07 AM",
      type: "SUCCESS",
      title: "Nairobi Capacity Pressure Stabilized",
      message: "Autonomous re-sequencing (INT-8801) verified: 34 minutes of dwell recovered for 6 TotalEnergies & Vivo tankers.",
      depotId: "nairobi",
    },
    {
      id: "ALERT-02",
      timestamp: "09:55 AM",
      type: "WARNING",
      title: "Nakuru Meter Drift Monitoring Active",
      message: "Coriolis metering thermal variance active on Bay P02. Auxiliary divert engaged; technician scheduled for 14:00.",
      depotId: "nakuru",
    },
    {
      id: "ALERT-03",
      timestamp: "09:40 AM",
      type: "INFO",
      title: "Autonomous Decision Funnel at 92% SLA Target",
      message: "46 of 50 autonomous actions successfully verified within target turnaround envelope across current simulation.",
    },
    {
      id: "ALERT-04",
      timestamp: "09:15 AM",
      type: "ACTION_REQUIRED",
      title: "Eldoret Secondary Tare Scale Auto-Activated",
      message: "Transit corridor arrival surge detected; electronic manifest lane engaged under Rule POL-012.",
      depotId: "eldoret",
    },
  ];
}
