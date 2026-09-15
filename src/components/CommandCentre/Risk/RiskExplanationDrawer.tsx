"use client";

import React, { useState } from "react";
import {
  X,
  AlertTriangle,
  Zap,
  Clock,
  ShieldCheck,
  Building,
  Truck,
  CheckCircle2,
  FileCheck,
  TrendingUp,
  Sliders,
  Check,
  ShieldAlert,
  HelpCircle,
  FileText,
  Lock,
} from "lucide-react";
import { AtRiskOperation } from "@/types/flowguard";

interface RiskExplanationDrawerProps {
  operation: AtRiskOperation | null;
  isOpen: boolean;
  onClose: () => void;
  onExecuteAction: (operation: AtRiskOperation) => void;
}

export const RiskExplanationDrawer: React.FC<RiskExplanationDrawerProps> = ({
  operation,
  isOpen,
  onClose,
  onExecuteAction,
}) => {
  const [isActing, setIsActing] = useState(false);
  const [actionDone, setActionDone] = useState(false);

  if (!isOpen || !operation) return null;

  const handleAction = () => {
    setIsActing(true);
    setTimeout(() => {
      setIsActing(false);
      setActionDone(true);
      onExecuteAction(operation);
      setTimeout(() => setActionDone(false), 2500);
    }, 500);
  };

  return (
    <>
      {/* Dark Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed top-0 right-0 bottom-0 w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col border-l border-[#E2E6EA] transition-transform duration-300">
        {/* Header */}
        <div className="p-4 px-6 border-b border-[#E2E6EA] flex items-center justify-between bg-[#FAFBFC] sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-lg font-bold text-[#0F1B2B]">
                {operation.truckRegistration}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  operation.riskLevel === "CRITICAL"
                    ? "bg-rose-50 text-[#C0392B] border border-rose-200"
                    : "bg-amber-50 text-[#B7791F] border border-amber-200"
                }`}
              >
                {operation.riskLevel} RISK
              </span>
              <span className="text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                SIMULATED OPERATIONAL DATA
              </span>
            </div>
            <p className="text-xs text-[#5C6B7A] mt-0.5 font-mono">
              Order: {operation.orderNumber} • {operation.omcName} • {operation.depotName}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content: Conforms strictly to Section 15 Structure */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* 1. RISK IDENTIFIED */}
          <section className="space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-[#0F1B2B] uppercase tracking-wider text-[11px]">
              <ShieldAlert className="w-3.5 h-3.5 text-[#C0392B]" />
              <span>1. Risk Identified</span>
            </div>

            <div className="p-3.5 rounded-lg bg-rose-50/40 border border-rose-200 text-rose-950 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Risk:</span>
                  <span className="font-bold text-xs text-[#C0392B]">
                    Turnaround SLA Breach (+{operation.delayRiskMin}m)
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Scope:</span>
                  <span className="font-bold text-xs text-[#0F1B2B]">
                    {operation.depotName.split("(")[0].trim()}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Confidence:</span>
                  <span className="font-mono font-bold text-xs text-emerald-700">
                    {operation.confidencePct}% Probability
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-600">Predicted Gate-Out:</span>
                <span className="font-mono font-bold text-[#0F1B2B]">
                  {operation.predictedGateOut} (Arrival: {operation.expectedArrival})
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600">Exposure at Risk:</span>
                <span className="font-mono font-bold text-[#C0392B]">
                  KES {operation.exposureAtRiskKes.toLocaleString()}
                </span>
              </div>
            </div>
          </section>

          {/* 2. WHY FLOWGUARD BELIEVES THIS */}
          <section className="space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-[#0F1B2B] uppercase tracking-wider text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 text-[#B7791F]" />
              <span>2. Why FlowGuard Believes This</span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#FAFBFC] border border-[#E2E6EA] space-y-2.5">
              {/* Quantitative Balance Drivers */}
              <div className="grid grid-cols-3 gap-2 pb-2 border-b border-[#E2E6EA] text-center">
                <div className="p-2 rounded bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Expected Demand:</span>
                  <span className="font-mono font-bold text-sm text-blue-700">18 orders</span>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Effective Capacity:</span>
                  <span className="font-mono font-bold text-sm text-[#0F1B2B]">11 orders</span>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Queue Pressure:</span>
                  <span className="font-mono font-bold text-sm text-[#C0392B]">+7 backlog</span>
                </div>
              </div>

              {/* Primary Operational Causal Diagnosis */}
              <p className="text-[11px] text-[#0F1B2B] font-medium leading-relaxed">
                {operation.primaryCause}
              </p>

              {/* Contributing Causal Factors */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-[#5C6B7A] uppercase tracking-wider block">
                  Relevant Contributing Factors:
                </span>
                {operation.causalFactors.map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          f.category === "demand"
                            ? "bg-blue-600"
                            : f.category === "capacity"
                            ? "bg-[#C0392B]"
                            : "bg-[#B7791F]"
                        }`}
                      />
                      <span className="text-[#0F1B2B]">{f.factor}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-700 shrink-0">
                      +{f.impactScore} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 3. FLOWGUARD RESPONSE */}
          <section className="space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-[#0F1B2B] uppercase tracking-wider text-[11px]">
              <Zap className="w-3.5 h-3.5 text-[#1B7A3D]" />
              <span>3. FlowGuard Response</span>
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-200 text-emerald-950 space-y-2">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#1B7A3D] tracking-wider block">
                  Selected Operational Action:
                </span>
                <p className="text-xs font-semibold text-[#0F1B2B] mt-0.5">
                  {operation.selectedIntervention}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-emerald-200/60">
                <div>
                  <span className="text-[10px] text-slate-600 block">Control State:</span>
                  <span className="font-mono font-bold text-xs text-[#1B7A3D]">
                    {operation.actionStatus}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-600 block">Expected Result:</span>
                  <span className="font-mono font-bold text-xs text-[#1B7A3D]">
                    -34 min turnaround (-8 queue)
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-[#5C6B7A] pt-1">
                <strong>Policy Governance:</strong> {operation.policyRule}
              </div>
            </div>
          </section>

          {/* 4. CLOSED-LOOP VERIFICATION */}
          <section className="space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-[#0F1B2B] uppercase tracking-wider text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1B7A3D]" />
              <span>4. Closed-Loop Verification</span>
            </div>

            <div className="p-3 rounded-lg bg-[#FAFBFC] border border-[#E2E6EA] space-y-2">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Expected:</span>
                  <span className="font-mono font-bold text-xs text-slate-800">-34 min dwell</span>
                </div>

                <div className="p-2 rounded bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Observed:</span>
                  <span className="font-mono font-bold text-xs text-[#1B7A3D]">
                    {operation.verifiedOutcomeMin ? `-${operation.verifiedOutcomeMin} min dwell` : "-34 min verified"}
                  </span>
                </div>

                <div className="p-2 rounded bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Status:</span>
                  <span className="font-mono font-bold text-xs text-[#1B7A3D] uppercase">
                    VERIFIED
                  </span>
                </div>
              </div>

              <div className="p-2 rounded bg-emerald-50 text-[10px] text-emerald-900 leading-snug">
                Post-actuation gate telemetry confirmed loading position occupancy normalized without spillover into staging yard.
              </div>
            </div>
          </section>

          {/* 5. AUDIT REFERENCE */}
          <section className="space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-[#0F1B2B] uppercase tracking-wider text-[11px]">
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span>5. Operational Audit Record</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-700">
              <div>
                <span className="text-[10px] text-slate-500 block">Intervention ID:</span>
                <span className="font-bold text-[#0F1B2B]">INT-8801</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block">Timestamp:</span>
                <span>{operation.expectedArrival} (Dispatched)</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block">Actor:</span>
                <span>FlowGuard L2 Engine</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block">Audit Digest:</span>
                <span className="truncate block">0x7F9B...44E1 (SYNCHRONIZED)</span>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-[#E2E6EA] bg-[#FAFBFC] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded text-xs font-medium text-[#5C6B7A] hover:bg-slate-100"
          >
            Close Drawer
          </button>

          <button
            onClick={handleAction}
            disabled={isActing || actionDone}
            className="px-4 py-2 text-xs font-bold text-white bg-[#1B7A3D] hover:bg-[#145d2e] rounded-md transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-75"
          >
            {actionDone ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Action Confirmed ✓</span>
              </>
            ) : isActing ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Applying Action...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>Execute Operational Action</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
