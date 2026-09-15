"use client";

import React, { useState } from "react";
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Check,
  Activity,
} from "lucide-react";
import { AutonomousIntervention } from "@/types/flowguard";

interface ActiveInterventionsPanelProps {
  interventions: AutonomousIntervention[];
  onApproveIntervention: (id: string) => void;
}

export const ActiveInterventionsPanel: React.FC<ActiveInterventionsPanelProps> = ({
  interventions,
  onApproveIntervention,
}) => {
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    setApprovingId(id);
    setTimeout(() => {
      onApproveIntervention(id);
      setApprovingId(null);
    }, 400);
  };

  const getControlBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-[#1B7A3D] border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            VERIFIED
          </span>
        );
      case "APPROVAL REQUIRED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-[#B7791F]" />
            APPROVAL REQUIRED
          </span>
        );
      case "BLOCKED BY POLICY":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-300">
            <ShieldAlert className="w-3 h-3 text-rose-600" />
            BLOCKED BY POLICY
          </span>
        );
      case "EXECUTING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
            <Activity className="w-3 h-3 animate-spin text-blue-600" />
            EXECUTING
          </span>
        );
      case "VERIFYING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200">
            <Clock className="w-3 h-3 text-purple-600" />
            VERIFYING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-[#1B7A3D] border border-emerald-200">
            <Zap className="w-3 h-3" />
            AUTO-EXECUTED
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[#E2E6EA] shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="p-3.5 px-5 border-b border-[#E2E6EA] flex items-center justify-between bg-[#FAFBFC]">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#1B7A3D]" />
          <h2 className="text-sm font-bold text-[#0F1B2B] tracking-tight">
            Active Autonomous Interventions
          </h2>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-[#1B7A3D] font-bold border border-emerald-200">
          Autonomy by Default • Approval by Exception
        </span>
      </div>

      {/* Intervention Cards List */}
      <div className="p-4 space-y-3.5 flex-1 overflow-y-auto max-h-[520px]">
        {interventions.map((item) => {
          const isApprovalReq = item.status === "APPROVAL REQUIRED";
          const isVerified = item.status === "VERIFIED" || (item.verifiedReductionMin && item.verifiedReductionMin > 0);

          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-lg border transition-all ${
                isApprovalReq
                  ? "bg-amber-50/40 border-amber-300 ring-1 ring-amber-200"
                  : isVerified
                  ? "bg-white border-[#E2E6EA] hover:border-slate-300"
                  : "bg-[#FAFBFC] border-[#E2E6EA]"
              }`}
            >
              {/* Top Row: ID, Depot, Started Timestamp, Control State Badge */}
              <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-[#E2E6EA]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#0F1B2B] px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200">
                    {item.id}
                  </span>
                  <span className="text-xs font-bold text-[#1B7A3D]">
                    {item.depotName.split("(")[0].trim()}
                  </span>
                  <span className="text-[10px] font-mono text-[#8492A6]">
                    Started {item.timestamp}
                  </span>
                </div>

                <div>
                  {getControlBadge(item.status)}
                </div>
              </div>

              {/* Problem & Cause */}
              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-[9px] font-bold uppercase text-[#5C6B7A] tracking-wider block">
                    Predicted Problem &amp; Cause:
                  </span>
                  <p className="text-[11px] text-[#0F1B2B] font-medium leading-tight">
                    <span className="text-[#C0392B] font-bold">{item.predictedProblem}:</span> {item.trigger}
                  </p>
                </div>

                {/* Recommended / Executed Action */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase text-[#1B7A3D] tracking-wider block">
                      Autonomous Action:
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      ({item.alternativesEvaluatedCount} candidate options evaluated)
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-[#0F1B2B] bg-[#FAFBFC] p-2 rounded border border-[#E2E6EA] mt-0.5">
                    {item.actionTaken}
                  </p>
                </div>

                {/* Closed-Loop Verification Section (Section 13: Expected vs Observed) */}
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 mt-2 space-y-1">
                  <span className="text-[9px] font-bold uppercase text-slate-600 tracking-wider block">
                    Closed-Loop Verification:
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Expected Result:</span>
                      <span className="font-mono font-bold text-slate-800">
                        -{item.expectedReductionMin} min dwell (-4 queue)
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] block">Observed Result:</span>
                      <span className="font-mono font-bold text-[#1B7A3D]">
                        {item.verifiedReductionMin ? `-${item.verifiedReductionMin} min dwell (-3 queue)` : "Measuring SCADA delta..."}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px]">
                    <span className="text-[#8492A6]">Verification Status:</span>
                    <span
                      className={`font-bold uppercase font-mono px-1.5 py-0.2 rounded text-[9px] ${
                        item.verifiedReductionMin
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {item.verifiedReductionMin ? "VERIFIED (100% SLA PASS)" : "PARTIAL / MONITORING"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Policy & Protected Exposure */}
              <div className="mt-2.5 pt-2 border-t border-[#E2E6EA] flex items-center justify-between text-[10px] text-[#5C6B7A]">
                <span className="font-mono text-[9px] text-[#8492A6] truncate max-w-[200px]">
                  {item.policyRule}
                </span>

                <span className="font-mono font-bold text-[#1B7A3D]">
                  Exposure Protected: KES {(item.exposureProtectedKes / 1000).toFixed(0)}k
                </span>
              </div>

              {/* Approval Button for L3 High-Risk Exception Actions */}
              {isApprovalReq && (
                <div className="mt-2.5 pt-2 border-t border-amber-200 flex items-center justify-between">
                  <span className="text-[10px] text-amber-900 font-medium">
                    Shift Supervisor sign-off required for multi-compartment bay re-allocation
                  </span>

                  <button
                    onClick={() => handleApprove(item.id)}
                    disabled={approvingId === item.id}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-[#B7791F] hover:bg-amber-700 rounded transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-75"
                  >
                    {approvingId === item.id ? (
                      <span>Authorizing...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Authorize Shift Action</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
