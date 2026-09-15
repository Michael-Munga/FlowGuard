"use client";

import React from "react";
import {
  X,
  Truck,
  Building,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Fuel,
  ArrowRight,
  Zap,
  Activity,
} from "lucide-react";
import { YardTruck, YardStage } from "@/types/flowguard";

interface TruckDetailDrawerProps {
  truck: YardTruck | null;
  isOpen: boolean;
  onClose: () => void;
  onAuthorizeAction?: (interventionId: string) => void;
}

export const TruckDetailDrawer: React.FC<TruckDetailDrawerProps> = ({
  truck,
  isOpen,
  onClose,
  onAuthorizeAction,
}) => {
  if (!isOpen || !truck) return null;

  const stages = [
    { key: "registered", label: "Order Registered", timestamp: "09:40 AM", isCompleted: true },
    { key: "arrival", label: "Arrival at Terminal", timestamp: truck.expectedArrival || "10:15 AM", isCompleted: true },
    { key: "gateIn", label: "Gate-In & Tare Scale", timestamp: truck.stageTimestamps.gateIn || "10:18 AM", isCompleted: true },
    {
      key: "validation",
      label: "Validation & Release",
      timestamp: truck.stageTimestamps.validation || (truck.currentStage === "Gate-In" ? "PENDING" : "10:32 AM"),
      isCompleted: truck.currentStage !== "Gate-In",
    },
    {
      key: "loading",
      label: "Gantry Loading",
      timestamp: truck.stageTimestamps.loading || (truck.currentStage === "Loading" ? "IN PROGRESS" : "PENDING"),
      isCompleted: truck.currentStage === "Ready to Exit" || truck.currentStage === "Gate-Out",
    },
    {
      key: "gateOut",
      label: "Gate-Out & Gross Scale",
      timestamp: truck.stageTimestamps.gateOut || (truck.currentStage === "Gate-Out" ? "COMPLETED" : "EST: " + truck.predictedGateOut),
      isCompleted: truck.currentStage === "Gate-Out",
    },
  ];

  // Map truck risk to clean label
  const riskLabel =
    truck.riskStatus === "RED"
      ? "CRITICAL"
      : truck.riskStatus === "AMBER"
      ? "AT RISK"
      : truck.riskStatus === "GREEN"
      ? "WATCH"
      : "NORMAL";

  const getRiskBadge = () => {
    switch (truck.riskStatus) {
      case "RED":
        return "bg-rose-100 text-rose-800 border-rose-300 font-extrabold";
      case "AMBER":
        return "bg-amber-100 text-amber-900 border-amber-300 font-bold";
      case "GREEN":
        return "bg-blue-100 text-blue-900 border-blue-300 font-semibold";
      default:
        return "bg-emerald-100 text-[#1B7A3D] border-emerald-300 font-semibold";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col border-l border-[#E2E6EA] animate-in slide-in-from-right duration-250">
        {/* 1. Header */}
        <div className="p-4 px-6 border-b border-[#E2E6EA] flex items-center justify-between bg-[#FAFBFC]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#1B7A3D]/10 text-[#1B7A3D]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[#0F1B2B] font-mono">
                  {truck.registration}
                </h3>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${getRiskBadge()}`}>
                  {riskLabel}
                </span>
              </div>
              <p className="text-xs text-[#5C6B7A]">{truck.omc}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Scrollable Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* SECTION A: COLLECTION DETAIL */}
          <div className="bg-[#FAFBFC] rounded-lg border border-[#E2E6EA] p-3.5 space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8492A6] block">
              Collection Detail
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-[#5C6B7A] block">Order ID</span>
                <span className="font-mono font-bold text-xs text-[#0F1B2B]">
                  {truck.orderNumber}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#5C6B7A] block">OMC</span>
                <span className="font-semibold text-xs text-[#0F1B2B]">
                  {truck.omc}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#5C6B7A] block">Product & Quantity</span>
                <span className="font-medium text-xs text-[#0F1B2B]">
                  {truck.product} ({(truck.quantityLitres / 1000).toFixed(0)}kL)
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#5C6B7A] block">Compartments & Bay</span>
                <span className="font-mono font-bold text-xs text-[#1B7A3D]">
                  {truck.compartmentsCount} comp • {truck.assignedPosition || "Awaiting Bay"}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION B: JOURNEY */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8492A6] block">
              Journey Progression (Gate-to-Gate)
            </span>

            <div className="p-3.5 rounded-lg border border-[#E2E6EA] bg-white space-y-3">
              {stages.map((stg, idx) => {
                const isCurrent =
                  (stg.key === "loading" && truck.currentStage === "Loading") ||
                  (stg.key === "validation" && truck.currentStage === "Validation / Release") ||
                  (stg.key === "gateIn" && truck.currentStage === "Gate-In") ||
                  (stg.key === "gateOut" && (truck.currentStage === "Ready to Exit" || truck.currentStage === "Gate-Out"));

                return (
                  <div key={idx} className="flex items-center gap-3 relative">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border text-[11px] font-mono font-bold ${
                        isCurrent
                          ? "bg-blue-600 text-white border-blue-600 ring-2 ring-blue-100"
                          : stg.isCompleted
                          ? "bg-[#1B7A3D] text-white border-[#1B7A3D]"
                          : "bg-slate-100 text-slate-400 border-slate-200"
                      }`}
                    >
                      {isCurrent ? "●" : stg.isCompleted ? "✓" : idx + 1}
                    </div>

                    <div className="flex-1 min-w-0 flex items-center justify-between">
                      <div>
                        <span
                          className={`font-semibold block ${
                            isCurrent
                              ? "text-blue-900 font-bold"
                              : stg.isCompleted
                              ? "text-[#0F1B2B]"
                              : "text-slate-400"
                          }`}
                        >
                          {stg.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] text-blue-700 font-medium">
                            Current Stage Dwell: {truck.timeInStageMin}m (exp {truck.baselineStageMin}m)
                          </span>
                        )}
                      </div>

                      <span className="font-mono text-[11px] text-[#8492A6]">
                        {stg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION C: PREDICTIONS */}
          <div className="bg-[#FAFBFC] rounded-lg border border-[#E2E6EA] p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8492A6]">
                Predictions (Simulated Model)
              </span>
              <span className="font-mono text-[10px] font-bold text-[#1B7A3D]">
                {truck.confidencePct || 88}% CONFIDENCE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[10px] text-[#5C6B7A] block">Arrival Window</span>
                <span className="font-mono font-bold text-xs text-[#0F1B2B]">
                  {truck.expectedArrival || "10:15–10:30 AM"}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#5C6B7A] block">Predicted Turnaround</span>
                <span className="font-mono font-bold text-xs text-[#0F1B2B]">
                  {truck.predictedTurnaroundMin || 71} min total{" "}
                  <span className="text-[10px] font-normal text-slate-400">
                    (Target: {truck.baselineTurnaroundMin || 65}m)
                  </span>
                </span>
              </div>

              <div className="col-span-2 pt-1 border-t border-[#EDF1F5] flex items-center justify-between">
                <span className="text-[10px] text-[#5C6B7A]">Predicted Gate-Out Window:</span>
                <span className="font-mono font-bold text-sm text-[#1B7A3D]">
                  {truck.predictedGateOut}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION D: RISK */}
          <div className="bg-rose-50/40 rounded-lg border border-rose-200 p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-rose-900 font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Risk: {riskLabel}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-rose-800 block">Primary Cause</span>
              <p className="text-[#0F1B2B] text-xs font-semibold mt-0.5">
                {truck.whyAtRisk?.cause || "Demand clustering + gantry metering variance."}
              </p>
            </div>

            {truck.whyAtRisk?.factors && (
              <div className="pt-1 border-t border-rose-200/60 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#8492A6] block">Contributing Factors</span>
                <ul className="space-y-0.5">
                  {truck.whyAtRisk.factors.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* SECTION E: FLOWGUARD RESPONSE */}
          {truck.actionDetail && (
            <div className="bg-emerald-50/40 rounded-lg border border-emerald-200 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#1B7A3D]" />
                  <span>FlowGuard Response</span>
                </div>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                  {truck.actionDetail.actionStatus}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#5C6B7A] block">Current Action</span>
                <p className="font-semibold text-xs text-[#0F1B2B] mt-0.5">
                  {truck.actionDetail.proposedAction}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-emerald-200/60">
                <div>
                  <span className="text-[10px] text-[#8492A6] block">Control State</span>
                  <span className="font-mono font-bold text-[#1B7A3D]">
                    {truck.actionDetail.approvalState === "AUTO" ? "AUTO-EXECUTED" : "APPROVAL REQUIRED"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#8492A6] block">Expected Turnaround Effect</span>
                  <span className="font-mono font-bold text-[#1B7A3D]">
                    -{truck.actionDetail.expectedImpactMin} min recovered
                  </span>
                </div>
              </div>

              {truck.actionDetail.approvalState === "REQUIRED" && (
                <button
                  onClick={() => {
                    if (truck.actionDetail?.interventionId && onAuthorizeAction) {
                      onAuthorizeAction(truck.actionDetail.interventionId);
                    }
                  }}
                  className="w-full mt-2 py-2 rounded-md text-xs font-bold text-white bg-[#1B7A3D] hover:bg-[#145d2e] shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>AUTHORIZE SUPERVISOR OVERRIDE</span>
                </button>
              )}
            </div>
          )}

          {/* SECTION F: CLOSED-LOOP VERIFICATION */}
          <div className="bg-[#FAFBFC] rounded-lg border border-[#E2E6EA] p-3.5 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8492A6] block">
              Closed-Loop Verification
            </span>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-[#5C6B7A] block">Expected</span>
                <span className="font-mono font-bold text-[#1B7A3D]">
                  -{truck.actionDetail?.expectedImpactMin || 38}m turnaround
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#5C6B7A] block">Observed</span>
                <span className="font-mono font-bold text-[#0F1B2B]">
                  -34m measured
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#5C6B7A] block">Status</span>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                  PARTIALLY VERIFIED
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Footer */}
        <div className="p-4 px-6 border-t border-[#E2E6EA] bg-[#FAFBFC] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-[#5C6B7A] hover:bg-slate-100 rounded cursor-pointer"
          >
            Close Inspector
          </button>

          <span className="text-[10px] font-mono text-[#8492A6]">
            Order Track Token: {truck.id}
          </span>
        </div>
      </div>
    </div>
  );
};
