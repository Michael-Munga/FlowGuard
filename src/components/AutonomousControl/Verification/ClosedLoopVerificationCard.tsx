"use client";

import React from "react";
import {
  CheckCircle2,
  TrendingDown,
  ShieldCheck,
  Activity,
  AlertCircle,
  BarChart3,
  Award,
  Zap,
  Clock,
  ArrowRight,
  Info,
} from "lucide-react";
import { AutonomyAggregateMetrics, DecisionVerification } from "@/types/flowguard";

interface ClosedLoopVerificationCardProps {
  metrics: AutonomyAggregateMetrics | null;
  activeVerification: DecisionVerification;
  activeIncidentId: string;
}

export const ClosedLoopVerificationCard: React.FC<ClosedLoopVerificationCardProps> = ({
  metrics,
  activeVerification,
  activeIncidentId,
}) => {
  // Execution lifecycle timestamps (Section 18)
  const executionLifecycle = [
    { time: "10:02:45", stage: "AUTHORIZED", status: "COMPLETED", detail: "Policy POL-042 evaluation passed; zero safety conflict" },
    { time: "10:02:47", stage: "EXECUTING", status: "COMPLETED", detail: "Operational Actuation payload dispatched to Gantry Gateway" },
    { time: "10:02:48", stage: "EXECUTED", status: "COMPLETED", detail: "Dual-arm mode confirmed on Bays P01 & P03 (142 ms ack latency)" },
    { time: "10:03:00", stage: "VERIFYING", status: "COMPLETED", detail: "Telemetric verification audit initialized against departure scale" },
    { time: "10:48:15", stage: "VERIFIED", status: "COMPLETED", detail: "Gross scale telemetry confirmed -34m dwell reduction" },
  ];

  const attainmentPct =
    activeVerification.recoveryAttainmentPct ||
    activeVerification.accuracyPct ||
    89.5;

  return (
    <div className="bg-white rounded-lg border border-[#E2E6EA] shadow-xs p-6 space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#1B7A3D]" />
            <h3 className="text-base font-bold text-[#0F1B2B] tracking-tight">
              Execution Lifecycle &amp; Closed-Loop Verification
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-[#1B7A3D] border border-emerald-200 uppercase">
              CLOSED-LOOP AUDIT
            </span>
          </div>
          <p className="text-xs text-[#5C6B7A] mt-0.5">
            Continuous telemetry audit comparing predicted turnaround recovery against physical gross scale gate-out measurements
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span>Last Measured: <strong>{activeVerification.measuredAt || "10:48:15 EAT"}</strong></span>
        </div>
      </div>

      {/* SECTION 18: Execution Lifecycle Timeline */}
      <div className="bg-[#FAFBFC] rounded-lg border border-[#E2E6EA] p-4 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#0F1B2B] uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#1B7A3D]" />
            ACTION EXECUTION LIFECYCLE (ACTUATION DISPATCH)
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
              EXECUTION: SUCCESS
            </span>
            <span className="text-[10px] font-mono text-blue-800 bg-blue-100 px-2 py-0.5 rounded font-bold">
              VERIFICATION: {activeVerification.status}
            </span>
          </div>
        </div>

        {/* 5-Step Execution Track */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 pt-2">
          {executionLifecycle.map((step, idx) => (
            <div key={idx} className="bg-white p-2.5 rounded border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-[#1B7A3D]">
                  {step.stage}
                </span>
                <span className="font-mono text-[9px] text-slate-400">{step.time}</span>
              </div>
              <p className="text-[10px] text-slate-600 leading-tight">
                {step.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Section 45: Distinction between Execution Success and Operational Outcome */}
        <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
          <span>
            <strong className="text-slate-700">Governance Rule:</strong> Action Execution Success (&ldquo;Actuation dispatched and acknowledged&rdquo;) is distinct from Operational Outcome Verification (&ldquo;Turnaround reduction physically observed on weighbridge scale&rdquo;).
          </span>
        </div>
      </div>

      {/* SECTION 19: Expected vs Observed Comparison Grid */}
      <div className="p-4 rounded-lg bg-emerald-50/40 border border-emerald-200/80 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#1B7A3D]" />
            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
              Incident {activeIncidentId} Expected vs Observed Verification Spotlight
            </h4>
          </div>
          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
            STATE: {activeVerification.status}
          </span>
        </div>

        {/* 4-column comparison cards (Section 19) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Dwell Recovery */}
          <div className="bg-white p-3 rounded-lg border border-emerald-200">
            <span className="text-[10px] text-slate-500 uppercase block font-medium">
              Turnaround Recovery
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono font-bold text-[#1B7A3D] text-lg">
                -{activeVerification.verifiedReductionMin || 34}m
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                (Expected: -{activeVerification.targetReductionMin}m)
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Measured vs simulated counterfactual
            </span>
          </div>

          {/* Turnaround Time */}
          <div className="bg-white p-3 rounded-lg border border-emerald-200">
            <span className="text-[10px] text-slate-500 uppercase block font-medium">
              Observed Turnaround
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono font-bold text-slate-900 text-lg">
                68 min
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                (Target: 65m)
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Variance: +3m vs baseline SLA
            </span>
          </div>

          {/* Recovery Attainment (Section 44) */}
          <div className="bg-white p-3 rounded-lg border border-emerald-200">
            <span className="text-[10px] text-[#1B7A3D] uppercase block font-bold">
              Recovery Attainment
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono font-extrabold text-[#1B7A3D] text-lg">
                {attainmentPct}%
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                (34m / 38m)
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Describing action outcome, not model accuracy
            </span>
          </div>

          {/* Financial Demurrage Protected */}
          <div className="bg-white p-3 rounded-lg border border-emerald-200">
            <span className="text-[10px] text-slate-500 uppercase block font-medium">
              Exposure Protected
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono font-bold text-slate-900 text-lg">
                KES {(activeVerification.exposureProtectedKes / 1000).toFixed(0)}k
              </span>
              <span className="text-[#1B7A3D] font-mono text-[11px]">
                (KES {(activeVerification.realizedSavingsKes ? (activeVerification.realizedSavingsKes / 1000).toFixed(0) : 1210)}k realized)
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Calculated against TSA demurrage tolerance
            </span>
          </div>
        </div>

        {/* Verification Method & Tamper-Evident Digest */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 pt-2 border-t border-emerald-200/60 font-mono gap-2">
          <span>
            <strong>Telemetry Method:</strong> {activeVerification.verificationMethod}
          </span>
          <span className="text-[10px] bg-white text-slate-700 px-2 py-0.5 rounded border border-emerald-200">
            Tamper-Evident Operational Accountability (SHA-256)
          </span>
        </div>
      </div>

      {/* Aggregate Closed-Loop Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E6EA] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Verified Actions
            </span>
            <Award className="w-3.5 h-3.5 text-[#1B7A3D]" />
          </div>
          <span className="text-2xl font-bold font-mono text-[#1B7A3D]">
            {metrics?.interventionsVerifiedSuccess || 46} / {metrics?.interventionsExecutedTotal || 50}
          </span>
          <span className="text-[10px] text-slate-500 mt-1">
            Success rate: <strong>{metrics?.successRatePct || 92}%</strong>
          </span>
        </div>

        {/* Metric 2 */}
        <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E6EA] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Mean Prediction Error
            </span>
            <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <span className="text-2xl font-bold font-mono text-slate-800">
            &plusmn;{metrics?.meanTurnaroundErrorMin || 11.2}m
          </span>
          <span className="text-[10px] text-slate-500 mt-1">
            Arrival error: &plusmn;{metrics?.meanArrivalErrorMin || 8.4}m
          </span>
        </div>

        {/* Metric 3 */}
        <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E6EA] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Total Protected
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#1B7A3D]" />
          </div>
          <span className="text-2xl font-bold font-mono text-[#1B7A3D]">
            KES {((metrics?.totalExposureProtectedKes || 14820000) / 1000000).toFixed(2)}M
          </span>
          <span className="text-[10px] text-slate-500 mt-1">
            Cumulative across 5 depots
          </span>
        </div>

        {/* Metric 4 */}
        <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E6EA] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Model Calibration
            </span>
            <Activity className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <span className="text-2xl font-bold font-mono text-slate-800">
            {metrics?.calibrationAccuracyPct || 94.2}%
          </span>
          <span className="text-[10px] text-slate-500 mt-1">
            Drift check: {metrics?.lastDriftCheck || "4m ago"}
          </span>
        </div>
      </div>
    </div>
  );
};
