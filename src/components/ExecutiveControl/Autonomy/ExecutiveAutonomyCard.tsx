"use client";

import React from "react";
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  Filter,
  Sliders,
  Award,
  ChevronRight,
} from "lucide-react";
import { AutonomyFunnel } from "@/types/flowguard";

interface ExecutiveAutonomyCardProps {
  funnel: AutonomyFunnel | null;
}

export const ExecutiveAutonomyCard: React.FC<ExecutiveAutonomyCardProps> = ({ funnel }) => {
  const funnelSteps = [
    {
      stage: "SENSE",
      label: "Telemetry Ingestion",
      count: funnel?.signalsEvaluated || 10420,
      unit: "signals",
      description: "Continuous sensor streams, orders & gate events",
      badge: "Raw Input",
      badgeColor: "bg-slate-200 text-slate-700",
      bgColor: "bg-slate-50 border-slate-300",
      textColor: "text-slate-900",
      conversion: "100%",
    },
    {
      stage: "IDENTIFY",
      label: "Risk Prediction",
      count: funnel?.risksIdentified || 324,
      unit: "risks",
      description: "Predicted dwell & gantry queue bottlenecks",
      badge: "3.1% Filter",
      badgeColor: "bg-amber-100 text-amber-800",
      bgColor: "bg-amber-50/50 border-amber-200",
      textColor: "text-amber-900",
      conversion: "3.1%",
    },
    {
      stage: "EVALUATE",
      label: "Intervention Solving",
      count: funnel?.candidateInterventionsEvaluated || 87,
      unit: "candidates",
      description: "Combinatorial MILP optimization runs",
      badge: "26.9% Search",
      badgeColor: "bg-blue-100 text-blue-800",
      bgColor: "bg-blue-50/50 border-blue-200",
      textColor: "text-blue-900",
      conversion: "26.9%",
    },
    {
      stage: "ACT",
      label: "Bounded Actuation",
      count: funnel?.actionsExecuted || 50,
      unit: "executed",
      description: "42 Auto-Executed (L2) + 8 Approval-Gated (L3)",
      badge: "57.5% Policy",
      badgeColor: "bg-indigo-100 text-indigo-800",
      bgColor: "bg-indigo-50/50 border-indigo-200",
      textColor: "text-indigo-900",
      conversion: "57.5%",
    },
    {
      stage: "VERIFY",
      label: "Outcome Attainment",
      count: funnel?.actionsVerifiedSuccess || 46,
      unit: "verified",
      description: "Closed-loop validated within target SLA",
      badge: "92.0% Efficacy",
      badgeColor: "bg-emerald-100 text-emerald-800 font-bold",
      bgColor: "bg-emerald-50/60 border-emerald-300",
      textColor: "text-emerald-900",
      conversion: "92.0%",
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-[#E2E6EA] shadow-xs p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#0F1B2B] tracking-tight">
              Autonomous Intelligence Pipeline &amp; Governance
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
              92.0% VERIFICATION EFFICACY
            </span>
          </div>
          <p className="text-xs text-[#5C6B7A] mt-0.5">
            Sequential conversion funnel from raw field telemetry to closed-loop verified outcomes under deterministic policy guardrails
          </p>
        </div>

        <span className="text-xs text-emerald-700 font-mono font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>0 safety breaches in prototype simulation</span>
        </span>
      </div>

      {/* Funnel Pipeline Visual (SENSE -> IDENTIFY -> EVALUATE -> ACT -> VERIFY) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {funnelSteps.map((step, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-lg border flex flex-col justify-between relative transition-all hover:shadow-xs ${step.bgColor}`}
          >
            <div>
              {/* Step Stage & Conversion Badge */}
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="text-[11px] font-mono font-bold tracking-wider text-slate-800 uppercase flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-white text-[9px] flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <span>{step.stage}</span>
                </span>
                <span
                  className={`text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded ${step.badgeColor}`}
                >
                  {step.badge}
                </span>
              </div>

              {/* Step Big Number */}
              <div className="my-1.5">
                <span className={`text-2xl font-bold font-mono tracking-tight block ${step.textColor}`}>
                  {step.count.toLocaleString()}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase font-mono">
                  {step.label}
                </span>
              </div>
            </div>

            {/* Step Description */}
            <div className="pt-2 border-t border-slate-200/60 mt-1">
              <p className="text-[10px] text-slate-600 leading-tight">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Governance & Controlled Autonomy Breakdown */}
      <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase text-slate-500 block font-semibold">
            Actions Executed
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-bold font-mono text-slate-900">
              {funnel?.actionsExecuted || 50}
            </span>
            <span className="text-[10px] text-slate-500">total</span>
          </div>
          <span className="text-[11px] text-slate-600">42 Auto-Executed L2 + 8 Approval-Gated L3</span>
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase text-amber-700 block font-semibold">
            Approval-Gated (L3)
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-bold font-mono text-amber-900">
              {funnel?.actionsApprovalGated || 8}
            </span>
            <span className="text-[10px] text-slate-500">actions</span>
          </div>
          <span className="text-[11px] text-slate-600">Electronic supervisor sign-off enforced</span>
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase text-rose-700 block font-semibold">
            Blocked by Policy
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-bold font-mono text-rose-900">
              {funnel?.actionsBlockedPolicy || 6}
            </span>
            <span className="text-[10px] text-slate-500">actions</span>
          </div>
          <span className="text-[11px] text-slate-600">Safety &amp; product purity invariants strictly held</span>
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase text-slate-700 block font-semibold">
            Fail-Safe Handover
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-bold font-mono text-slate-900">
              {funnel?.actionsFailedSafely || 2}
            </span>
            <span className="text-[10px] text-slate-500">events</span>
          </div>
          <span className="text-[11px] text-slate-600">Physical interlocks held; manual handover</span>
        </div>
      </div>

      {/* Autonomy Philosophy Footer Callout */}
      <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          <strong>Executive Autonomy Principle (0 safety breaches in prototype simulation):</strong> Unconstrained autonomy is an operational risk. FlowGuard delivers <strong>controlled bounded autonomy</strong>: routine optimization is automated (L2), high-risk or multi-product shifts mandate human authorization (L3), and safety invariants unconditionally veto unsafe actuations.
        </div>
      </div>
    </div>
  );
};
