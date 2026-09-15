"use client";

import React from "react";
import {
  Sliders,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Info,
  Zap,
  Lock,
} from "lucide-react";
import { AutonomyCandidateIntervention } from "@/types/flowguard";

interface CandidateInterventionsTableProps {
  candidates: AutonomyCandidateIntervention[];
  selectedCandidateId: string;
  incidentId: string;
}

export const CandidateInterventionsTable: React.FC<CandidateInterventionsTableProps> = ({
  candidates,
  selectedCandidateId,
  incidentId,
}) => {
  const getControlStateBadge = (cand: AutonomyCandidateIntervention) => {
    if (cand.id === "OPT-03" || cand.feasibility === "Selected") {
      return {
        label: "AUTO-EXECUTABLE",
        bg: "bg-emerald-50 text-[#1B7A3D] border-emerald-300 font-bold",
        icon: <Zap className="w-3 h-3 text-[#1B7A3D]" />,
      };
    }
    if (cand.id === "OPT-02" || cand.feasibility === "Feasible") {
      return {
        label: "APPROVAL REQUIRED",
        bg: "bg-amber-50 text-amber-900 border-amber-300 font-semibold",
        icon: <Lock className="w-3 h-3 text-amber-700" />,
      };
    }
    if (cand.id === "OPT-04" || cand.feasibility === "Blocked by Policy") {
      return {
        label: "BLOCKED BY POLICY",
        bg: "bg-rose-50 text-rose-900 border-rose-300 font-bold",
        icon: <ShieldAlert className="w-3 h-3 text-rose-600" />,
      };
    }
    return {
      label: "NOT SAFE TO EXECUTE",
      bg: "bg-slate-100 text-slate-700 border-slate-300",
      icon: <XCircle className="w-3 h-3 text-slate-400" />,
    };
  };

  const getRiskLevel = (cand: AutonomyCandidateIntervention) => {
    if (cand.id === "OPT-03") return { text: "LOW", style: "text-emerald-700 font-bold" };
    if (cand.id === "OPT-02") return { text: "MEDIUM", style: "text-amber-800 font-semibold" };
    if (cand.id === "OPT-04") return { text: "HIGH", style: "text-rose-700 font-bold" };
    return { text: "SEVERE", style: "text-slate-600 font-medium" };
  };

  return (
    <div className="bg-white rounded-lg border border-[#E2E6EA] shadow-xs overflow-hidden select-none space-y-0">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E2E6EA] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h3 className="text-base font-bold text-[#0F1B2B] tracking-tight">
              Optimization &amp; Candidate Actions
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
              PROTOTYPE OPTIMIZATION OBJECTIVE
            </span>
          </div>
          <p className="text-xs text-[#5C6B7A] mt-0.5">
            How FlowGuard moved from prediction to action: multi-objective combinatorial solver evaluating feasible options against operational disruption and dwell constraints.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
          <span>Incident: <strong>{incidentId}</strong></span>
          <span className="text-slate-300">•</span>
          <span>Evaluated: <strong>{candidates.length} options</strong></span>
        </div>
      </div>

      {/* Candidate Actions Table (Section 14) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E2E6EA] text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <th className="py-3 px-4 w-12 text-center">Rank</th>
              <th className="py-3 px-4">Intervention Candidate</th>
              <th className="py-3 px-4">Action Type</th>
              <th className="py-3 px-4 text-right">Expected Recovery</th>
              <th className="py-3 px-4 text-center">Operational Risk</th>
              <th className="py-3 px-4 text-center">Control State</th>
              <th className="py-3 px-4 text-center">Utility Score</th>
              <th className="py-3 px-4 min-w-[240px]">Selection / Rejection Rationale</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {candidates.map((cand) => {
              const isSelected = cand.id === selectedCandidateId || cand.feasibility === "Selected";
              const controlState = getControlStateBadge(cand);
              const riskLevel = getRiskLevel(cand);

              return (
                <tr
                  key={cand.id}
                  className={`transition-colors ${
                    isSelected ? "bg-emerald-50/40 font-medium" : "hover:bg-slate-50/70"
                  }`}
                >
                  {/* Rank */}
                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                    #{cand.rank}
                  </td>

                  {/* Candidate Name */}
                  <td className="py-3 px-4 font-medium text-slate-900">
                    <div className="flex items-center gap-1.5">
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#1B7A3D] animate-pulse"></span>
                      )}
                      <span>{cand.name}</span>
                    </div>
                  </td>

                  {/* Action Type */}
                  <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                    {cand.actionType}
                  </td>

                  {/* Expected Recovery */}
                  <td className="py-3 px-4 text-right font-mono font-bold">
                    {cand.queueReductionExpectedMin > 0 ? (
                      <span className="text-[#1B7A3D]">
                        -{cand.queueReductionExpectedMin} min turnaround
                      </span>
                    ) : (
                      <span className="text-slate-400">0 min (Baseline)</span>
                    )}
                  </td>

                  {/* Operational Risk */}
                  <td className="py-3 px-4 text-center font-mono text-[11px]">
                    <span className={riskLevel.style}>{riskLevel.text}</span>
                  </td>

                  {/* Bounded Control State */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] uppercase tracking-wider border ${controlState.bg}`}
                    >
                      {controlState.icon}
                      <span>{controlState.label}</span>
                    </span>
                  </td>

                  {/* Utility Score */}
                  <td className="py-3 px-4 text-center font-mono font-bold">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        cand.objectiveScore >= 90
                          ? "bg-emerald-100 text-emerald-800 font-bold"
                          : cand.objectiveScore >= 60
                          ? "bg-blue-100 text-blue-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {cand.objectiveScore}/100
                    </span>
                  </td>

                  {/* Rationale */}
                  <td className="py-3 px-4 text-xs text-slate-600">
                    {cand.selectionRationale}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Solver Mathematical Formulation Footer (Section 35) */}
      <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E6EA] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-3">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="text-[#0F1B2B] block">
              FLOWGUARD OPTIMIZATION OBJECTIVE — PROTOTYPE WEIGHTING:
            </strong>
            <span className="font-mono text-[11px] text-slate-700 block">
              Minimize: Predicted Turnaround (0.6) + Projected Queue (0.3) + Operational Disruption (0.1) + Demurrage Exposure
            </span>
            <span className="text-[10px] text-slate-500 block">
              Subject to: Physical Bay Availability, Product Compatibility, Safety Envelopes, and Bounded Policy Invariants.
            </span>
          </div>
        </div>

        <span className="font-mono text-[11px] text-slate-500 shrink-0">
          Convergence: 84ms • Feasible Paths: 1,420
        </span>
      </div>
    </div>
  );
};
