"use client";

import React, { useState } from "react";
import {
  X,
  Truck as TruckIcon,
  AlertTriangle,
  FileCheck2,
  Zap,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  XCircle,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { Truck, RiskStatus } from "@/types/dashboard";

interface TruckDetailDrawerProps {
  truck: Truck | null;
  isOpen: boolean;
  onClose: () => void;
  onExecuteIntervention: (truck: Truck) => void;
  onMarkResolved: (truck: Truck) => void;
}

export const TruckDetailDrawer: React.FC<TruckDetailDrawerProps> = ({
  truck,
  isOpen,
  onClose,
  onExecuteIntervention,
  onMarkResolved,
}) => {
  const [executing, setExecuting] = useState(false);
  const [executed, setExecuted] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [showInspectorModal, setShowInspectorModal] = useState(false);

  if (!isOpen || !truck) return null;

  const handleExecute = () => {
    setExecuting(true);
    setTimeout(() => {
      setExecuting(false);
      setExecuted(true);
      onExecuteIntervention(truck);
      setTimeout(() => {
        setExecuted(false);
      }, 3500);
    }, 600);
  };

  const handleResolve = () => {
    setResolved(true);
    onMarkResolved(truck);
    setTimeout(() => {
      setResolved(false);
    }, 1500);
  };

  // Status Badge
  const renderStatusBadge = (status: RiskStatus) => {
    switch (status) {
      case "ON TRACK":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-emerald-50 text-[#1B7A3D] border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-[#1B7A3D]" />
            ON TRACK
          </span>
        );
      case "AT RISK":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-amber-50 text-[#B7791F] border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-[#B7791F]" />
            AT RISK
          </span>
        );
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-rose-50 text-[#C0392B] border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-[#C0392B]" />
            CRITICAL
          </span>
        );
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return "text-[#C0392B]";
    if (score >= 50) return "text-[#B7791F]";
    return "text-[#1B7A3D]";
  };

  // Format dwell
  const formatDwell = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  return (
    <>
      {/* Dark Overlay backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col border-l border-[#E2E6EA] transition-transform duration-300 ease-in-out">
        {/* Drawer Header */}
        <div className="p-4 px-6 border-b border-[#E2E6EA] flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold font-mono text-[#0F1B2B] tracking-tight">
              {truck.registration}
            </h2>
            {renderStatusBadge(truck.status)}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#5C6B7A] hover:text-[#0F1B2B] hover:bg-slate-100 transition-colors"
            title="Close Drawer (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SECTION 1: TRUCK DETAILS */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5C6B7A]">
              <TruckIcon className="w-3.5 h-3.5 text-[#1B7A3D]" />
              <span>Truck Details</span>
            </div>

            <div className="grid grid-cols-2 gap-3.5 p-4 rounded-lg bg-[#FAFBFC] border border-[#E2E6EA]">
              <div>
                <span className="text-[11px] font-medium text-[#8492A6] block">
                  Depot
                </span>
                <span className="text-xs font-bold text-[#0F1B2B] block mt-0.5">
                  {truck.depot}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-medium text-[#8492A6] block">
                  OMC
                </span>
                <span className="text-xs font-bold text-[#0F1B2B] block mt-0.5">
                  {truck.omc}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-medium text-[#8492A6] block">
                  Product
                </span>
                <span className="text-xs font-bold text-[#0F1B2B] block mt-0.5">
                  {truck.product}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-medium text-[#8492A6] block">
                  Driver
                </span>
                <span className="text-xs font-bold text-[#0F1B2B] block mt-0.5">
                  {truck.driverName}{" "}
                  <span className="font-normal text-[#5C6B7A]">({truck.driverId})</span>
                </span>
              </div>

              <div>
                <span className="text-[11px] font-medium text-[#8492A6] block">
                  Loading Bay
                </span>
                <span className="text-xs font-bold text-[#0F1B2B] block mt-0.5">
                  {truck.bay}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-medium text-[#8492A6] block">
                  Arrival Time
                </span>
                <span className="text-xs font-bold text-[#0F1B2B] block mt-0.5">
                  {truck.arrivalTime}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-medium text-[#8492A6] block">
                  Current Dwell
                </span>
                <span className="text-xs font-bold text-[#0F1B2B] block mt-0.5 font-mono">
                  {formatDwell(truck.dwellMinutes)}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-medium text-[#8492A6] block">
                  Predicted Departure
                </span>
                <span className="text-xs font-bold text-[#0F1B2B] block mt-0.5 font-mono">
                  {truck.predictedDeparture}{" "}
                  {truck.delayNotice && (
                    <span className="text-[10px] text-[#B7791F] font-medium">
                      ({truck.delayNotice})
                    </span>
                  )}
                </span>
              </div>
            </div>
          </section>

          {/* SECTION 2: RISK SCORE */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5C6B7A]">
              <AlertTriangle className="w-3.5 h-3.5 text-[#B7791F]" />
              <span>Risk Score</span>
            </div>

            <div className="p-4 rounded-lg bg-[#FAFBFC] border border-[#E2E6EA] space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span
                    className={`text-3xl font-extrabold font-mono tracking-tight ${getRiskScoreColor(
                      truck.riskScore
                    )}`}
                  >
                    {truck.riskScore}
                  </span>
                  <span className="text-base text-[#8492A6] font-medium"> / 100</span>
                </div>
                <span className="text-xs font-semibold text-[#5C6B7A]">
                  Severity Index
                </span>
              </div>

              <p className="text-xs text-[#5C6B7A] leading-snug">
                {truck.riskSummary}
              </p>

              {/* Multi-segment / Gradient bar with position indicator */}
              <div className="space-y-1">
                <div className="relative h-2 w-full rounded-full bg-linear-to-r from-[#1B7A3D] via-[#B7791F] to-[#C0392B]">
                  {/* Position marker */}
                  <div
                    className="absolute -top-1 w-4 h-4 bg-white border-2 border-[#0F1B2B] rounded-full shadow-md -translate-x-1/2"
                    style={{ left: `${Math.min(98, Math.max(2, truck.riskScore))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#8492A6] font-mono pt-1">
                  <span>0 (Nominal)</span>
                  <span>50 (At Risk)</span>
                  <span>100 (Critical SLA Breach)</span>
                </div>
              </div>

              {/* Breakdown List of Contributing Factors */}
              <div className="pt-2 border-t border-[#E2E6EA] space-y-2">
                <span className="text-[11px] font-semibold uppercase text-[#5C6B7A] tracking-wider block">
                  Contributing Factors:
                </span>
                <div className="space-y-1.5">
                  {truck.riskFactors.map((factor, idx) => {
                    const dot =
                      factor.severity === "high"
                        ? "bg-[#C0392B]"
                        : factor.severity === "medium"
                        ? "bg-[#B7791F]"
                        : "bg-[#1B7A3D]";
                    const ptsColor =
                      factor.severity === "high"
                        ? "text-[#C0392B]"
                        : factor.severity === "medium"
                        ? "text-[#B7791F]"
                        : "text-[#1B7A3D]";

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-0.5"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${dot}`} />
                          <span className="text-[#0F1B2B]">{factor.label}</span>
                        </div>
                        <span className={`font-mono font-bold ${ptsColor}`}>
                          +{factor.points} pts
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: DOCUMENT CHECKLIST */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5C6B7A]">
              <FileCheck2 className="w-3.5 h-3.5 text-[#1B7A3D]" />
              <span>Document Checklist</span>
            </div>

            <div className="p-3 rounded-lg bg-[#FAFBFC] border border-[#E2E6EA] divide-y divide-[#E2E6EA]">
              {truck.documents.map((doc) => {
                let icon = <CheckCircle2 className="w-4 h-4 text-[#1B7A3D]" />;
                let badge = (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-[#1B7A3D] border border-emerald-200">
                    Complete
                  </span>
                );

                if (doc.status === "pending") {
                  icon = <AlertCircle className="w-4 h-4 text-[#B7791F]" />;
                  badge = (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-[#B7791F] border border-amber-200">
                      Pending
                    </span>
                  );
                } else if (doc.status === "missing") {
                  icon = <XCircle className="w-4 h-4 text-[#C0392B]" />;
                  badge = (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-50 text-[#C0392B] border border-rose-200">
                      Missing
                    </span>
                  );
                }

                return (
                  <div
                    key={doc.id}
                    className="py-2.5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      {icon}
                      <span className="font-medium text-[#0F1B2B] truncate">
                        {doc.name}
                      </span>
                    </div>
                    {badge}
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION 4: RECOMMENDED ACTION */}
          <section className="space-y-3">
            <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-200 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                <Zap className="w-4 h-4 text-[#B7791F]" />
                <span>Recommended Action</span>
              </div>

              <p className="text-xs text-[#0F1B2B] font-medium leading-relaxed">
                {truck.recommendedAction}
              </p>

              <div className="flex items-center gap-2.5 pt-1">
                {/* Red/Primary Execute Intervention */}
                <button
                  onClick={handleExecute}
                  disabled={executing || executed}
                  className="flex-1 px-3 py-2 text-xs font-bold text-white bg-[#C0392B] hover:bg-[#a93226] active:scale-98 rounded-md transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-85"
                >
                  {executed ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      <span>Intervention Sent ✓</span>
                    </>
                  ) : executing ? (
                    <>
                      <span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                      <span>Dispatching...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      <span>Execute Intervention</span>
                    </>
                  )}
                </button>

                {/* Secondary Dismiss */}
                <button
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-medium text-[#5C6B7A] bg-white border border-[#E2E6EA] hover:bg-slate-50 rounded-md transition-colors shadow-2xs"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 px-6 border-t border-[#E2E6EA] bg-[#FAFBFC] flex items-center justify-between">
          <button
            onClick={() => setShowInspectorModal(true)}
            className="text-xs font-semibold text-[#1B7A3D] hover:underline flex items-center gap-1"
          >
            <span>View Full Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleResolve}
            disabled={resolved || truck.status === "ON TRACK"}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1B7A3D] hover:bg-[#145d2e] rounded-md transition-all shadow-2xs disabled:opacity-50 flex items-center gap-1"
          >
            {resolved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Resolved ✓</span>
              </>
            ) : (
              <span>Mark Resolved</span>
            )}
          </button>
        </div>
      </aside>

      {/* Modal: Full Telemetry Details if "View Full Details" clicked */}
      {showInspectorModal && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E2E6EA] max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E6EA] pb-3">
              <div className="flex items-center gap-2">
                <TruckIcon className="w-5 h-5 text-[#1B7A3D]" />
                <h3 className="font-bold text-base text-[#0F1B2B]">
                  Full SCADA Telemetry Profile: {truck.registration}
                </h3>
              </div>
              <button
                onClick={() => setShowInspectorModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-[#5C6B7A] space-y-2">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="font-semibold text-slate-800">SCADA RTU Node:</span> NBO-RTU-882B
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="font-semibold text-slate-800">Gantry Flow Sensor:</span> Coriolis MicroMotion Elite (Mass Flow: 1,820 kg/min)
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="font-semibold text-slate-800">KRA Electronic Cargo Seal:</span> ECTS-KE-992102 (Signal Strength: -68 dBm, Tamper: None)
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="font-semibold text-slate-800">TSA Demurrage SLA Expiry:</span> 16:30 EAT (2h 10m remaining)
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowInspectorModal(false)}
                className="px-4 py-1.5 text-xs font-medium bg-slate-900 text-white rounded hover:bg-slate-800"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
