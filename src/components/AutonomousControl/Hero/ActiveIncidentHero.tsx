"use client";

import React from "react";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingDown,
  Lock,
  Zap,
  Check,
  X,
  FileText,
  Activity,
  Sliders,
  Radio,
  Info,
  HelpCircle,
} from "lucide-react";
import { AutonomyIncident } from "@/types/flowguard";

interface ActiveIncidentHeroProps {
  incidents: AutonomyIncident[];
  activeIncident: AutonomyIncident | null;
  onSelectIncident: (id: string) => void;
  onAuthorizeAction: (id: string) => void;
  onRejectAction: (id: string, reason?: string) => void;
  onOpenDrawer: (incident: AutonomyIncident) => void;
  isActionPending: boolean;
}

export const ActiveIncidentHero: React.FC<ActiveIncidentHeroProps> = ({
  incidents,
  activeIncident,
  onSelectIncident,
  onAuthorizeAction,
  onRejectAction,
  onOpenDrawer,
  isActionPending,
}) => {
  if (!activeIncident) return null;

  // Map incident to decision ID label (e.g. DEC-0142 for INT-8801)
  const getDecisionId = (id: string) => {
    switch (id) {
      case "INT-8801":
        return "DEC-0142";
      case "INT-8802":
        return "DEC-0139";
      case "INT-8803":
        return "DEC-0138";
      case "INT-8804":
        return "DEC-0136";
      case "INT-8805":
        return "DEC-0135";
      default:
        return `DEC-${id.replace("INT-", "")}`;
    }
  };

  const decisionId = getDecisionId(activeIncident.id);

  const getStatusBadge = (status: AutonomyIncident["status"]) => {
    switch (status) {
      case "VERIFIED":
        return {
          bg: "bg-emerald-50 text-[#1B7A3D] border-emerald-300 font-bold",
          label: "VERIFIED (PARTIAL RECOVERY)",
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#1B7A3D]" />,
        };
      case "APPROVAL REQUIRED":
        return {
          bg: "bg-amber-100 text-amber-900 border-amber-300 font-bold animate-pulse",
          label: "SUPERVISOR APPROVAL REQUIRED",
          icon: <Lock className="w-3.5 h-3.5 text-amber-800" />,
        };
      case "BLOCKED BY POLICY":
        return {
          bg: "bg-rose-100 text-rose-900 border-rose-300 font-bold",
          label: "BLOCKED BY POLICY GATE",
          icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />,
        };
      case "BLOCKED / ESCALATED":
        return {
          bg: "bg-amber-100 text-amber-950 border-amber-300 font-bold",
          label: "NO SAFE ACTION / ESCALATED",
          icon: <ShieldAlert className="w-3.5 h-3.5 text-amber-800" />,
        };
      case "FAILED":
        return {
          bg: "bg-slate-100 text-slate-800 border-slate-300 font-bold",
          label: "ACTUATION FAULT (SAFE HANDOVER)",
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />,
        };
      case "AUTO-EXECUTED":
        return {
          bg: "bg-blue-50 text-blue-800 border-blue-200 font-bold",
          label: "AUTO-EXECUTED",
          icon: <Zap className="w-3.5 h-3.5 text-blue-700" />,
        };
    }
  };

  const statusBadge = getStatusBadge(activeIncident.status);

  // Derive Control-Loop Narrative Story (Section 9)
  const getDecisionSummaryStory = () => {
    if (activeIncident.id === "INT-8801") {
      return {
        problem: "Projected collection processing pressure at Nairobi Terminal.",
        cause: "Expected demand (18 orders in 90 min) temporarily exceeds effective processing capacity (11 orders).",
        prediction: "Turnaround predicted to cross 114m (+49m above baseline SLA) with 92.4% model confidence.",
        optimization: "Four candidate interventions evaluated against operational disruption and dwell constraints.",
        decision: "Option OPT-03 (Dual-Arm Fast-Track + Re-sequencing) selected based on policy POL-042.",
        execution: "Auto-executed via Operational Actuation Interface (ack latency: 142 ms).",
        verification: "Observed improvement measured at -34 min vs -38 min target (Recovery Attainment: 89.5%).",
      };
    }
    if (activeIncident.id === "INT-8802") {
      return {
        problem: "Flow rate degradation on Nakuru Gantry Bay P02 (-18.2% velocity).",
        cause: "Physical flow meter drift detected on secondary PMS manifold.",
        prediction: "Turnaround delay projected to accumulate +34 min across 5 waiting tankers.",
        optimization: "Three candidate options evaluated: Maintain queue, Divert to Bay P01, or Re-calibrate.",
        decision: "Bay divert selected; requires human supervisor sign-off under FlowGuard Rule POL-019.",
        execution: "Execution held pending human controller signature.",
        verification: "Verification armed; awaiting electronic authorization.",
      };
    }
    if (activeIncident.id === "INT-8804") {
      return {
        problem: "Aviation Fuel manifold safety interlock conflict at Kisumu Terminal.",
        cause: "Automated routing request lacked physical laboratory chemist certification.",
        prediction: "Contamination risk evaluated; potential severe product degradation.",
        optimization: "Autonomous valve actuation rejected; manual lab sampling required.",
        decision: "Blocked by Policy POL-088. Safety interlock XV-2801 locked in closed position.",
        execution: "Actuation strictly prevented by deterministic safety guardrail.",
        verification: "Safety envelope preserved: 0 contamination incidents.",
      };
    }
    if (activeIncident.id === "INT-8805") {
      return {
        problem: "Smart Gate RFID transponder read timeout on Eldoret weighbridge entry.",
        cause: "Optical transponder failure on vehicle KDD 884M at ingress gate.",
        prediction: "Ingress blockage projected to cause roadside staging spillover within 8 minutes.",
        optimization: "Retry failed; automated barrier held in safe closed position.",
        decision: "Fault detected. Initiated immediate safe handover to manual Gate Marshal.",
        execution: "Actuation halted gracefully. Manual handover completed in 14.2 seconds.",
        verification: "Safe handover verified: barrier secure, zero vehicle damage.",
      };
    }
    return {
      problem: "Multi-product staging deadlock at Mombasa Terminal (KOT).",
      cause: "High-density mixed AGO/PMS/IK arrival cluster with no compatible bay permutations.",
      prediction: "Deadlock predicted to paralyze gantry turnover for 3 hours.",
      optimization: "All autonomous permutations violate minimum safety separation rules.",
      decision: "No safe autonomous intervention available. Bounded autonomy guardrail active.",
      execution: "Actuation suspended; full decision dossier escalated to Terminal Superintendent.",
      verification: "Controlled escalation confirmed: human shift controller in active command.",
    };
  };

  const story = getDecisionSummaryStory();

  return (
    <div className="bg-white rounded-lg border border-[#E2E6EA] shadow-xs overflow-hidden select-none space-y-0">
      {/* Scenario Quick Selector Bar */}
      <div className="px-6 py-2.5 bg-[#F8FAFC] border-b border-[#E2E6EA] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Select Decision Scenario:
          </span>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            (Switch between distinct autonomous control archetypes)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {incidents.map((inc) => {
            const isSelected = inc.id === activeIncident.id;
            const incDecisionId = getDecisionId(inc.id);

            return (
              <button
                key={inc.id}
                onClick={() => onSelectIncident(inc.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-all border cursor-pointer ${
                  isSelected
                    ? "bg-[#0B1420] text-white border-[#0B1420] font-semibold shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                }`}
              >
                <span className="font-mono font-bold text-[11px]">{incDecisionId}</span>
                <span className="truncate max-w-[100px]">{inc.depotName.split(" ")[0]}</span>
                <span
                  className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                    inc.status === "APPROVAL REQUIRED"
                      ? "bg-amber-500 text-white"
                      : inc.status === "VERIFIED"
                      ? "bg-[#1B7A3D] text-white"
                      : inc.status === "BLOCKED BY POLICY"
                      ? "bg-rose-600 text-white"
                      : inc.status === "BLOCKED / ESCALATED"
                      ? "bg-amber-700 text-white"
                      : "bg-slate-600 text-white"
                  }`}
                >
                  {inc.status === "APPROVAL REQUIRED"
                    ? "Approval"
                    : inc.status === "VERIFIED"
                    ? "Verified"
                    : inc.status === "BLOCKED BY POLICY"
                    ? "Blocked"
                    : inc.status === "BLOCKED / ESCALATED"
                    ? "Escalated"
                    : "Fault"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Incident Hero Body */}
      <div className="p-6 space-y-5">
        {/* Incident Metadata Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
              <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded bg-[#0B1420] text-emerald-300">
                ACTIVE DECISION: {decisionId}
              </span>
              <span className="text-xs font-mono text-[#5C6B7A]">
                Ref: {activeIncident.id}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-[#5C6B7A] font-mono">
                Detected: {activeIncident.timestamp} EAT
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-bold text-[#0F1B2B]">
                {activeIncident.depotName}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                TIER: {activeIncident.autonomyLevel}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-[#0F1B2B] tracking-tight">
              {activeIncident.headline}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md border text-xs font-bold uppercase tracking-wider ${statusBadge.bg}`}
            >
              {statusBadge.icon}
              <span>{statusBadge.label}</span>
            </div>

            <button
              type="button"
              onClick={() => onOpenDrawer(activeIncident)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Forensic Audit</span>
            </button>
          </div>
        </div>

        {/* 4 Structured Information Quadrants (Section 8) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Telemetry Trigger & Signal */}
          <div className="bg-[#F8FAFC] rounded-lg p-4 border border-[#E2E6EA] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                <Radio className="w-3.5 h-3.5 text-[#1B7A3D]" />
                <span>1. Telemetry Trigger</span>
              </div>
              <p className="text-xs font-medium text-slate-800 leading-relaxed mb-3">
                {activeIncident.telemetryTrigger}
              </p>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-slate-200/70">
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Primary Causal Factors:
              </span>
              {activeIncident.causalFactors.slice(0, 2).map((factor, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 truncate pr-2">{factor.factor}</span>
                  <span className="font-mono font-bold text-slate-800">{factor.impactScore}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Predicted Risk & Consequence */}
          <div className="bg-[#F8FAFC] rounded-lg p-4 border border-[#E2E6EA] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>2. Predicted Risk</span>
              </div>
              <p className="text-xs font-medium text-slate-800 leading-relaxed mb-3">
                {activeIncident.predictedProblem}
              </p>
            </div>
            <div className="space-y-1 pt-2 border-t border-slate-200/70">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Demurrage Exposure:</span>
                <span className="font-mono font-bold text-rose-700">
                  KES {(activeIncident.verification.exposureProtectedKes || 1850000).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Target Reduction:</span>
                <span className="font-mono font-bold text-[#1B7A3D]">
                  -{activeIncident.verification.targetReductionMin} min dwell
                </span>
              </div>
            </div>
          </div>

          {/* 3. Selected Autonomous Action */}
          <div className="bg-[#F8FAFC] rounded-lg p-4 border border-[#E2E6EA] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                <Zap className="w-3.5 h-3.5 text-blue-600" />
                <span>3. Selected Action</span>
              </div>
              <p className="text-xs font-semibold text-slate-900 leading-relaxed mb-2">
                {activeIncident.candidates.find((c) => c.id === activeIncident.selectedCandidateId)?.name ||
                  "Re-sequence upcoming orders & enable dual-arm loading"}
              </p>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-slate-200/70">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Policy Code:</span>
                <span className="font-mono font-bold text-slate-800">
                  {activeIncident.appliedPolicy.code}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Orders Affected:</span>
                <span className="font-mono font-bold text-slate-800">
                  {activeIncident.actuationDetails.affectedOrders.length} orders
                </span>
              </div>
            </div>
          </div>

          {/* 4. Verification & Outcome */}
          <div className="bg-[#F8FAFC] rounded-lg p-4 border border-[#E2E6EA] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1B7A3D]" />
                <span>4. Outcome &amp; Recovery</span>
              </div>
              <div className="mb-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-[#1B7A3D]">
                    {activeIncident.verification.verifiedReductionMin !== undefined
                      ? `-${activeIncident.verification.verifiedReductionMin}m`
                      : `-${activeIncident.verification.targetReductionMin}m`}
                  </span>
                  <span className="text-xs text-slate-500">
                    {activeIncident.verification.status === "VERIFIED"
                      ? "measured recovery"
                      : "target reduction"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Recovery Attainment:{" "}
                  <strong className="text-[#1B7A3D] font-mono">
                    {activeIncident.verification.recoveryAttainmentPct || activeIncident.verification.accuracyPct || 89.5}%
                  </strong>
                  {activeIncident.verification.varianceMin !== undefined && (
                    <span className="text-slate-500 ml-1 font-mono text-[10px]">
                      (Variance: {activeIncident.verification.varianceMin}m)
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Exposure Protected:{" "}
                  <strong className="text-slate-900 font-mono">
                    KES {activeIncident.verification.exposureProtectedKes.toLocaleString()}
                  </strong>
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/70 text-[11px] flex items-center justify-between">
              <span className="text-slate-500">Verification State:</span>
              <span
                className={`font-mono font-bold ${
                  activeIncident.verification.status === "VERIFIED"
                    ? "text-[#1B7A3D]"
                    : activeIncident.verification.status === "PENDING_VERIFICATION"
                    ? "text-amber-700"
                    : activeIncident.verification.status === "ESCALATED" || activeIncident.verification.status === "BLOCKED"
                    ? "text-amber-800"
                    : "text-slate-700"
                }`}
              >
                {activeIncident.verification.status}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 9: Complete Decision Summary Narrative (Control-Loop Story) */}
        <div className="bg-[#FAFBFC] rounded-lg border border-[#E2E6EA] p-4 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 font-mono">
              <Sliders className="w-3.5 h-3.5 text-[#1B7A3D]" />
              DECISION LIFECYCLE SUMMARY (CONTROL-LOOP STORY)
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              AUDIT TRAIL: {activeIncident.id}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-2 text-xs">
            <div className="bg-white p-2.5 rounded border border-slate-200">
              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">
                01 PROBLEM
              </span>
              <p className="text-slate-800 leading-snug">{story.problem}</p>
            </div>

            <div className="bg-white p-2.5 rounded border border-slate-200">
              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">
                02 CAUSE
              </span>
              <p className="text-slate-800 leading-snug">{story.cause}</p>
            </div>

            <div className="bg-white p-2.5 rounded border border-slate-200">
              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">
                03 PREDICTION
              </span>
              <p className="text-slate-800 leading-snug">{story.prediction}</p>
            </div>

            <div className="bg-white p-2.5 rounded border border-slate-200">
              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">
                04 OPTIMIZE
              </span>
              <p className="text-slate-800 leading-snug">{story.optimization}</p>
            </div>

            <div className="bg-white p-2.5 rounded border border-slate-200">
              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">
                05 DECISION
              </span>
              <p className="text-slate-800 leading-snug">{story.decision}</p>
            </div>

            <div className="bg-white p-2.5 rounded border border-slate-200">
              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">
                06 EXECUTION
              </span>
              <p className="text-slate-800 leading-snug">{story.execution}</p>
            </div>

            <div className="bg-white p-2.5 rounded border border-emerald-200 bg-emerald-50/30">
              <span className="text-[9px] font-bold text-[#1B7A3D] uppercase block mb-1">
                07 VERIFICATION
              </span>
              <p className="text-[#0F1B2B] leading-snug font-medium">{story.verification}</p>
            </div>
          </div>
        </div>

        {/* Interactive Supervisor Control Ribbon (When Approval Required) */}
        {activeIncident.status === "APPROVAL REQUIRED" && (
          <div className="p-4 rounded-lg bg-amber-500/10 border-2 border-amber-500/40 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm animate-pulse">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-950">
                  Supervisor Authorization Required to Execute Bay Divert
                </h4>
                <p className="text-xs text-amber-900 mt-0.5">
                  FlowGuard Rule <strong>{activeIncident.appliedPolicy.code}</strong>: Loading bay flow drift &gt; 15% requires human controller sign-off prior to physical gantry divert.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onAuthorizeAction(activeIncident.id)}
                disabled={isActionPending}
                className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#1B7A3D] text-white font-bold text-xs tracking-wide shadow-md hover:bg-[#156331] transition-all disabled:opacity-50 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>{isActionPending ? "AUTHORIZING..." : "AUTHORIZE ACTION"}</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenDrawer(activeIncident)}
                className="px-3 py-2 rounded-md bg-white border border-amber-300 text-amber-900 text-xs font-semibold hover:bg-amber-50 transition-all cursor-pointer"
              >
                Review Forensic Data
              </button>

              <button
                type="button"
                onClick={() => onRejectAction(activeIncident.id, "Shift Controller operational preference")}
                disabled={isActionPending}
                className="px-3 py-2 rounded-md bg-white border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-50 transition-all cursor-pointer"
              >
                Reject
              </button>
            </div>
          </div>
        )}

        {/* Notice Ribbons for specific states */}
        {activeIncident.status === "VERIFIED" && (
          <div className="px-4 py-2.5 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1B7A3D] flex-shrink-0" />
              <span className="font-semibold">
                Autonomous Intervention Verified &amp; Closed:
              </span>
              <span>
                Field telemetry confirmed -{activeIncident.verification.verifiedReductionMin} min dwell recovery across {activeIncident.actuationDetails.affectedOrders.length} orders (Recovery Attainment: {activeIncident.verification.recoveryAttainmentPct || 89.5}%). Realized savings: KES {(activeIncident.verification.realizedSavingsKes || 1210000).toLocaleString()}.
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#1B7A3D] font-bold uppercase hidden md:inline">
              Hash: {activeIncident.auditHash.substring(0, 16)}...
            </span>
          </div>
        )}

        {activeIncident.status === "BLOCKED BY POLICY" && (
          <div className="px-4 py-2.5 rounded-md bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-900">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span className="font-semibold">
                Safety Interlock Engaged:
              </span>
              <span>
                Rule {activeIncident.appliedPolicy.code} strictly prohibits automated actuation for aviation fuel manifolds without physical lab chemist certification. Field interlock valve XV-2801 locked in closed safe position.
              </span>
            </div>
            <span className="font-mono text-[10px] text-rose-700 font-bold uppercase">
              Safety Boundary Active
            </span>
          </div>
        )}

        {activeIncident.status === "BLOCKED / ESCALATED" && (
          <div className="px-4 py-2.5 rounded-md bg-amber-50 border border-amber-300 flex items-center justify-between text-xs text-amber-950">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span className="font-semibold">
                Bounded Autonomy Guardrail Active:
              </span>
              <span>
                No compliant autonomous intervention available under current operating constraints. All options violate safety envelopes. FlowGuard safely halted actuation and escalated decision dossier to Terminal Superintendent.
              </span>
            </div>
            <span className="font-mono text-[10px] text-amber-800 font-bold uppercase">
              Human Escalation Required
            </span>
          </div>
        )}

        {activeIncident.status === "FAILED" && (
          <div className="px-4 py-2.5 rounded-md bg-slate-100 border border-slate-300 flex items-center justify-between text-xs text-slate-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span className="font-semibold">
                Actuation Failed Safely (Failure &ne; System Collapse):
              </span>
              <span>
                Transponder optical read timed out on vehicle KDD 884M. Barrier remained locked for safety; anomaly successfully handed over to manual Gate Marshal within 14.2 seconds.
              </span>
            </div>
            <span className="font-mono text-[10px] text-slate-600 font-bold uppercase">
              Safe Handover Verified
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
