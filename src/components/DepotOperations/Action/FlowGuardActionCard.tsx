"use client";

import React, { useState } from "react";
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Zap,
  TrendingDown,
  Layers,
  ChevronDown,
  ChevronUp,
  FileText,
  UserCheck,
  Activity,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { AutonomousIntervention } from "@/types/flowguard";

interface FlowGuardActionCardProps {
  intervention?: AutonomousIntervention;
  onApprove?: (id: string) => void;
  onExecute?: (id: string) => void;
  depotName: string;
}

export const FlowGuardActionCard: React.FC<FlowGuardActionCardProps> = ({
  intervention,
  onApprove,
  onExecute,
  depotName,
}) => {
  const [isAlternativesOpen, setIsAlternativesOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  if (!intervention) {
    return (
      <div className="bg-white rounded-lg border border-[#E2E6EA] p-5 shadow-xs flex flex-col justify-between h-full">
        <div className="flex items-center justify-between border-b border-[#EDF1F5] pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#1B7A3D]" />
            <h3 className="font-bold text-sm text-[#0F1B2B]">
              FLOWGUARD ACTION — AUTONOMOUS CONTROL
            </h3>
          </div>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-[#1B7A3D] border border-emerald-200">
            SYSTEM NOMINAL
          </span>
        </div>

        <div className="py-6 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#1B7A3D] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-[#0F1B2B]">
            No Corrective Interventions Required
          </h4>
          <p className="text-xs text-[#5C6B7A] max-w-sm mx-auto">
            Operational turnaround velocity at {depotName} is tracking within nominal SLA thresholds. FlowGuard is continuously evaluating gantry flow signals and gate queues.
          </p>
        </div>

        <div className="text-[11px] text-[#8492A6] bg-[#FAFBFC] p-2.5 rounded border border-[#EDF1F5] flex items-center justify-between">
          <span className="font-semibold text-[#1B7A3D]">Autonomy: L2 Bounded Active</span>
          <span className="font-mono">Cycle: 0.8s</span>
        </div>
      </div>
    );
  }

  const isApprovalRequired = intervention.status === "APPROVAL REQUIRED";
  const isVerified = intervention.status === "VERIFIED";

  const handleAuthorize = async () => {
    if (!onApprove) return;
    setIsApproving(true);
    try {
      await onApprove(intervention.id);
    } finally {
      setIsApproving(false);
    }
  };

  // Standard Candidate Interventions from synthetic optimization model
  const candidates = [
    {
      action: "Re-sequence eligible collection flow & allocate dual-arm loading",
      score: 94.2,
      impact: "-38 min turnaround",
      controlState: isApprovalRequired ? "APPROVAL REQUIRED" : "AUTO-EXECUTED",
      status: "SELECTED",
      reason: "Maximizes PMS flow velocity and resolves 4 imminent SLA breaches.",
    },
    {
      action: "Adjust dispatch recommendations & hold low-priority collection flow",
      score: 78.5,
      impact: "-19 min turnaround",
      controlState: "BLOCKED BY POLICY",
      status: "REJECTED",
      reason: "Incurs KES 340k unnecessary OMC staging demurrage penalty.",
    },
    {
      action: "Rebalance eligible loading demand to adjacent secondary gantry",
      score: 64.0,
      impact: "-11 min turnaround",
      controlState: "NOT SAFE TO EXECUTE",
      status: "REJECTED",
      reason: "Target gantry has degraded flow rate (-14% below calibrated threshold).",
    },
    {
      action: "Maintain current FIFO queue (No FlowGuard action)",
      score: 22.0,
      impact: "+42 min turnaround",
      controlState: "UNBOUNDED",
      status: "REJECTED",
      reason: "Guaranteed SLA threshold breach across 7 downstream collections.",
    },
  ];

  return (
    <div
      className={`rounded-lg border shadow-xs overflow-hidden transition-all flex flex-col justify-between ${
        isApprovalRequired
          ? "bg-amber-50/20 border-amber-300"
          : isVerified
          ? "bg-emerald-50/20 border-emerald-300"
          : "bg-white border-[#E2E6EA]"
      }`}
    >
      {/* Top Banner Header */}
      <div
        className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 ${
          isApprovalRequired
            ? "bg-amber-100/70 border-amber-200 text-amber-950"
            : isVerified
            ? "bg-emerald-100/70 border-emerald-200 text-emerald-950"
            : "bg-slate-100/70 border-slate-200 text-slate-900"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`p-1.5 rounded-md ${
              isApprovalRequired
                ? "bg-amber-600 text-white"
                : isVerified
                ? "bg-[#1B7A3D] text-white"
                : "bg-blue-600 text-white"
            }`}
          >
            {isApprovalRequired ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C6B7A]">
                FLOWGUARD ACTION
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white border font-bold">
                {intervention.id}
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#0F1B2B] flex items-center gap-2">
              <span>{isApprovalRequired ? "SUPERVISOR APPROVAL PENDING" : "ACTIVE AUTONOMOUS INTERVENTION"}</span>
              <span className="text-xs font-normal text-[#5C6B7A]">
                • Triggered at {intervention.timestamp}
              </span>
            </h3>
          </div>
        </div>

        {/* Control State Badge */}
        <span
          className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded border ${
            isApprovalRequired
              ? "bg-amber-100 text-amber-900 border-amber-300 animate-pulse font-extrabold"
              : isVerified
              ? "bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold"
              : "bg-blue-100 text-blue-900 border-blue-300 font-extrabold"
          }`}
        >
          {intervention.status}
        </span>
      </div>

      {/* Main Action Content - Structured Operational Fields */}
      <div className="p-5 space-y-4">
        {/* Bounded Autonomy Rule Banner */}
        <div className="px-3.5 py-2 rounded-md bg-slate-100/80 border border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1B7A3D]" />
            <span className="font-bold text-[#0F1B2B] uppercase tracking-wide text-[10px]">
              OPERATIONAL GOVERNANCE:
            </span>
            <span className="text-[#5C6B7A] text-[11px] font-medium">
              AUTONOMY BY DEFAULT. HUMAN APPROVAL BY EXCEPTION.
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#8492A6]">
            {isApprovalRequired ? "High-Impact Threshold Triggered" : "Within L2 Auto-Execute Authority"}
          </span>
        </div>

        {/* Step 1 & 2: Problem & Telemetry Cause */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* PROBLEM */}
          <div className="p-3 rounded-lg bg-rose-50/50 border border-rose-200 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                PROBLEM
              </span>
              <p className="font-bold text-xs text-[#0F1B2B] mt-1.5 leading-snug">
                {intervention.predictedProblem}
              </p>
            </div>
            <span className="text-[10px] text-rose-700 mt-2 font-medium">
              SLA breach projected in 45m without intervention
            </span>
          </div>

          {/* CAUSE */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C6B7A] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                CAUSE
              </span>
              <p className="text-xs text-[#5C6B7A] mt-1.5 leading-relaxed font-medium">
                {intervention.trigger}
              </p>
            </div>
            <span className="text-[10px] font-mono text-[#8492A6] mt-2">
              Multi-source telemetry trigger
            </span>
          </div>
        </div>

        {/* Step 3 & 4: Action (Hero) & Control State */}
        <div className="p-4 rounded-lg bg-emerald-50/40 border-2 border-[#1B7A3D]/40 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B7A3D] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#1B7A3D]" />
              ACTION SELECTED
            </span>

            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#5C6B7A]">
                CONTROL STATE:
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${
                  isApprovalRequired
                    ? "bg-amber-100 text-amber-900 border-amber-300 animate-pulse"
                    : isVerified
                    ? "bg-emerald-100 text-[#1B7A3D] border-emerald-300"
                    : "bg-blue-100 text-blue-900 border-blue-300"
                }`}
              >
                {intervention.status}
              </span>
            </div>
          </div>

          <p className="font-bold text-sm text-[#0F1B2B] leading-snug">
            {intervention.actionTaken}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-200/60 text-[10px] text-[#5C6B7A]">
            <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200 text-[#0F1B2B]">
              Policy Rule: {intervention.policyRule}
            </span>
            <span className="font-semibold text-emerald-800">
              Evaluated {intervention.alternativesEvaluatedCount} optimization candidates
            </span>
          </div>
        </div>

        {/* Step 5 & 6: Expected Outcome vs Closed-Loop Verification */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs px-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C6B7A]">
              EXPECTED OUTCOME
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B7A3D]">
              CLOSED-LOOP VERIFICATION
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-[#FAFBFC] border border-[#E2E6EA] flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8492A6] block">
                  Turnaround Recovery
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-mono text-base font-bold text-[#1B7A3D]">
                    -{intervention.expectedReductionMin}m
                  </span>
                  {intervention.verifiedReductionMin ? (
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                      Observed: -{intervention.verifiedReductionMin}m
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono">
                      (Pending run)
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-[#5C6B7A] mt-1">
                Status: {intervention.verifiedReductionMin ? "PARTIALLY VERIFIED" : "VERIFYING TELEMETRY"}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#FAFBFC] border border-[#E2E6EA] flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8492A6] block">
                  Exposure Protected
                </span>
                <span className="font-mono text-base font-bold text-[#0F1B2B] block mt-0.5">
                  KES {(intervention.exposureProtectedKes / 1000000).toFixed(2)}M
                </span>
              </div>
              <span className="text-[10px] text-[#5C6B7A] mt-1">Modeled demurrage risk avoided</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#FAFBFC] border border-[#E2E6EA] flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8492A6] block">
                  Affected Orders
                </span>
                <span className="font-mono text-base font-bold text-[#0F1B2B] block mt-0.5">
                  {intervention.affectedOrdersCount} Tankers
                </span>
              </div>
              <span className="text-[10px] text-[#5C6B7A] mt-1">Re-prioritized in sequence</span>
            </div>
          </div>
        </div>

        {/* Supervisor Approval Action Bar (When Approval Required) */}
        {isApprovalRequired && (
          <div className="p-4 rounded-lg bg-amber-50 border-2 border-amber-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-md bg-amber-200 text-amber-900 shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs text-amber-950 block">
                  Supervisor Authorization Required
                </span>
                <span className="text-[11px] text-amber-900 leading-tight block mt-0.5">
                  Policy requires explicit confirmation to re-sequence queue and allocate dual-arm loading.
                </span>
              </div>
            </div>

            {/* Strict Hierarchy: Primary AUTHORIZE, Secondary REVIEW */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleAuthorize}
                disabled={isApproving}
                className="px-4 py-2 rounded-md text-xs font-bold text-white bg-[#1B7A3D] hover:bg-[#145d2e] shadow-md transition-all flex items-center gap-1.5 ring-2 ring-[#1B7A3D]/40 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isApproving ? "Authorizing..." : "AUTHORIZE ACTION"}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAlternativesOpen(!isAlternativesOpen)}
                className="px-3 py-2 rounded-md text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs transition-all cursor-pointer"
              >
                {isAlternativesOpen ? "HIDE OPTIONS" : "REVIEW CANDIDATES"}
              </button>
            </div>
          </div>
        )}

        {/* Candidate Interventions Optimization Accordion Toggle */}
        <div className="border-t border-[#EDF1F5] pt-3">
          <button
            onClick={() => setIsAlternativesOpen(!isAlternativesOpen)}
            className="w-full flex items-center justify-between text-xs text-[#5C6B7A] hover:text-[#0F1B2B] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#1B7A3D]" />
              <span className="font-semibold">
                Candidate Interventions ({candidates.length} options evaluated by solver)
              </span>
            </div>
            {isAlternativesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {isAlternativesOpen && (
            <div className="mt-3 space-y-2 animate-in fade-in duration-150">
              <table className="w-full text-left text-xs border border-[#E2E6EA] rounded-md overflow-hidden">
                <thead className="bg-[#FAFBFC] border-b border-[#E2E6EA] text-[10px] font-bold uppercase text-[#5C6B7A]">
                  <tr>
                    <th className="p-2">Candidate Action</th>
                    <th className="p-2">Impact</th>
                    <th className="p-2">Control State</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDF1F5]">
                  {candidates.map((c, idx) => (
                    <tr key={idx} className={c.status === "SELECTED" ? "bg-emerald-50/50" : ""}>
                      <td className="p-2 font-medium text-[#0F1B2B]">
                        <div>{c.action}</div>
                        <span className="text-[10px] text-[#8492A6]">{c.reason}</span>
                      </td>
                      <td className="p-2 font-mono font-bold text-[#1B7A3D] shrink-0">
                        {c.impact}
                      </td>
                      <td className="p-2">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${
                            c.controlState === "AUTO-EXECUTED"
                              ? "bg-emerald-50 text-[#1B7A3D] border-emerald-200"
                              : c.controlState === "APPROVAL REQUIRED"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : c.controlState === "BLOCKED BY POLICY"
                              ? "bg-slate-100 text-slate-700 border-slate-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {c.controlState}
                        </span>
                      </td>
                      <td className="p-2 font-mono font-bold">
                        <span
                          className={
                            c.status === "SELECTED" ? "text-[#1B7A3D]" : "text-slate-400"
                          }
                        >
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
