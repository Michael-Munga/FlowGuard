"use client";

import React, { useState } from "react";
import {
  Clock,
  TrendingUp,
  AlertTriangle,
  Zap,
  CheckCircle2,
  HelpCircle,
  X,
  Layers,
  ChevronRight,
  Info,
} from "lucide-react";
import { FuturePressurePoint, TimelinePressureStage } from "@/types/flowguard";

interface FuturePressureTimelineProps {
  timeline: FuturePressurePoint[];
  depotName?: string;
}

export const FuturePressureTimeline: React.FC<FuturePressureTimelineProps> = ({
  timeline,
  depotName = "Nairobi Terminal (PS10) Operational Bottleneck",
}) => {
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  const getStageColor = (stage: TimelinePressureStage) => {
    switch (stage) {
      case "DEMAND_SURGE":
        return {
          badge: "bg-blue-50 text-blue-700 border-blue-200",
          bar: "bg-blue-600",
          ring: "border-blue-400 bg-blue-50/10",
        };
      case "CAPACITY_SHORTFALL":
        return {
          badge: "bg-rose-50 text-[#C0392B] border-rose-200",
          bar: "bg-[#C0392B]",
          ring: "border-rose-500 ring-2 ring-rose-200 bg-rose-50/20",
        };
      case "INTERVENTION_ACTIVE":
        return {
          badge: "bg-amber-50 text-[#B7791F] border-amber-200",
          bar: "bg-[#B7791F]",
          ring: "border-amber-400 bg-amber-50/20",
        };
      case "STABILIZING":
        return {
          badge: "bg-emerald-50 text-[#1B7A3D] border-emerald-200",
          bar: "bg-[#1B7A3D]",
          ring: "border-emerald-400 bg-emerald-50/10",
        };
      default:
        return {
          badge: "bg-slate-50 text-slate-700 border-slate-200",
          bar: "bg-slate-500",
          ring: "border-slate-300 bg-slate-50/40",
        };
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[#E2E6EA] p-4 px-5 shadow-xs">
      {/* Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#E2E6EA] pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1B7A3D]" />
            <h3 className="text-sm font-bold text-[#0F1B2B] tracking-tight">
              Network Pressure &amp; Demand Horizon (120-Minute Predictive Lookahead)
            </h3>
            <span className="text-[10px] px-2 py-0.2 rounded bg-rose-50 text-[#C0392B] border border-rose-200 font-bold uppercase">
              Focus: {depotName}
            </span>
          </div>
          <p className="text-[11px] text-[#5C6B7A] mt-0.5">
            <strong className="text-[#0F1B2B]">Core Principle:</strong> Don&apos;t manage the queue after trucks arrive. Predict the queue before it forms by comparing expected demand against effective processing capacity across rolling 30-min windows.
          </p>
        </div>

        {/* Legend & Explain Capacity Model Button */}
        <div className="flex flex-wrap items-center gap-4 text-[10px] text-[#5C6B7A]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#C0392B]" />
            <span className="font-semibold text-[#0F1B2B]">A. Expected Demand</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-400 border border-slate-600 border-dashed" />
            <span className="font-semibold text-[#0F1B2B]">B. Effective Processing Cap</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" />
            <span className="font-semibold text-[#B7791F]">C. Projected Backlog</span>
          </div>

          <button
            onClick={() => setShowFormulaModal(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[#0F1B2B] font-semibold border border-slate-300 transition-colors shadow-2xs"
            title="Inspect FlowGuard capacity math formulation"
          >
            <HelpCircle className="w-3 h-3 text-[#1B7A3D]" />
            <span>Explain Capacity Math</span>
          </button>
        </div>
      </div>

      {/* 5-Block Control Room Forecast Horizon (Now, +30m, +60m, +90m, +120m) */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5">
        {timeline.map((pt, idx) => {
          const colors = getStageColor(pt.stage);
          const maxScale = 20; // scale limit for visual representation
          const demandWidthPct = Math.min(100, (pt.expectedDemandTrucks / maxScale) * 100);
          const capacityWidthPct = Math.min(100, (pt.estimatedProcessingCapacity / maxScale) * 100);
          const isShortfall = pt.projectedBacklogTrucks > 0;
          const isPressureWindow = pt.timeOffsetMin === 30 || pt.timeOffsetMin === 60;

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-lg border transition-all flex flex-col justify-between relative ${colors.ring} ${
                isPressureWindow ? "ring-2 ring-rose-400/80 shadow-xs" : ""
              }`}
            >
              {/* Pressure Window Callout Tag */}
              {isPressureWindow && (
                <div className="absolute -top-2.5 left-3 px-1.5 py-0.2 rounded bg-[#C0392B] text-white font-mono text-[8px] font-extrabold uppercase tracking-wider shadow-xs">
                  CRITICAL PRESSURE WINDOW
                </div>
              )}

              {/* Header: Time label & Stage */}
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#E2E6EA]">
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-sm font-bold text-[#0F1B2B]">
                      {pt.timeLabel}
                    </span>
                    <span className="text-[10px] text-[#8492A6]">
                      ({pt.timeOffsetMin === 0 ? "current" : `+${pt.timeOffsetMin}m`})
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase border ${colors.badge}`}
                  >
                    {pt.stageLabel}
                  </span>
                </div>

                {/* Core Demand vs Effective Processing Capacity Comparison */}
                <div className="mt-3 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#5C6B7A]">A. Expected Demand:</span>
                    <span className="font-mono font-bold text-[#0F1B2B]">
                      {pt.expectedDemandTrucks} orders
                    </span>
                  </div>

                  {/* Dual Bar Graphic */}
                  <div className="h-6 w-full bg-slate-200 rounded overflow-hidden relative flex items-center p-1">
                    {/* Processing Capacity Threshold Guideline */}
                    <div
                      className="absolute top-0 bottom-0 border-r-2 border-slate-800 border-dashed z-10"
                      style={{ width: `${capacityWidthPct}%` }}
                      title={`Effective capacity: ${pt.estimatedProcessingCapacity} orders / 30m window`}
                    />

                    {/* Demand Fill Bar */}
                    <div
                      className={`h-full rounded-xs transition-all duration-500 ${
                        pt.stage === "STABILIZING"
                          ? "bg-[#1B7A3D]"
                          : isShortfall
                          ? "bg-[#C0392B]"
                          : "bg-blue-600"
                      }`}
                      style={{ width: `${demandWidthPct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#5C6B7A]">
                    <span>B. Effective Cap: {pt.estimatedProcessingCapacity}</span>
                    <span
                      className={`font-mono font-bold ${
                        pt.projectedBacklogTrucks > 0 ? "text-[#C0392B]" : "text-[#1B7A3D]"
                      }`}
                    >
                      {pt.projectedBacklogTrucks > 0
                        ? `C. Backlog: +${pt.projectedBacklogTrucks}`
                        : "C. Backlog: 0 (Balanced)"}
                    </span>
                  </div>
                </div>

                {/* Dwell / Wait & Physical Bay Context */}
                <div className="mt-2.5 pt-2 border-t border-[#E2E6EA] text-[10px] text-[#5C6B7A] space-y-1">
                  <div className="flex justify-between">
                    <span>Usable Gantry Bays:</span>
                    <span className="font-mono font-semibold text-[#0F1B2B]">
                      {pt.usableLoadingBays} bays usable
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Predicted Dwell / Wait:</span>
                    <span
                      className={`font-mono font-bold ${
                        pt.projectedWaitMin > 60 ? "text-[#C0392B]" : "text-[#0F1B2B]"
                      }`}
                    >
                      {pt.projectedWaitMin} min
                    </span>
                  </div>
                </div>
              </div>

              {/* Operational Annotation */}
              <div className="mt-3 pt-2 border-t border-[#E2E6EA] text-[10px] text-[#5C6B7A] leading-snug">
                {pt.annotation}
              </div>
            </div>
          );
        })}
      </div>

      {/* Explainable Capacity Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E2E6EA] max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 px-6 border-b border-[#E2E6EA] flex items-center justify-between bg-[#FAFBFC]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#1B7A3D] text-white flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0F1B2B]">
                    FlowGuard Capacity Model
                  </h4>
                  <span className="text-[10px] text-[#5C6B7A]">
                    Simulated Operational Capacity Formulation
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowFormulaModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-900 text-emerald-400 font-mono text-xs leading-relaxed border border-slate-800">
                <span className="text-slate-400 block mb-1 text-[10px] uppercase font-bold">
                  Capacity Formulation (Rolling 30-Min Window):
                </span>
                Effective Capacity = (Usable Positions × Available Operating Time) ÷ Expected Loading Duration × Performance Factor - Current Occupancy Constraints
              </div>

              <div className="space-y-2 text-slate-700 leading-relaxed">
                <p>
                  <strong>Why does capacity change dynamically?</strong> Rather than treating a 8-bay terminal as a constant 8-truck queue handler, FlowGuard models real-world throughput restrictions:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-[11px] text-[#5C6B7A]">
                  <li>
                    <strong className="text-[#0F1B2B]">Usable Loading Positions:</strong> Subtracts out-of-service bays, scheduled maintenance, and seal verification holds (currently 5 usable of 8 physical bays).
                  </li>
                  <li>
                    <strong className="text-[#0F1B2B]">Loading Duration:</strong> Account for multi-compartment vs single-compartment road tanker volumes (38,000L AGO requires ~22 min pumping + 8 min coupling/scale).
                  </li>
                  <li>
                    <strong className="text-[#0F1B2B]">Performance Factor:</strong> Tracks real-time metering delivery rates from SCADA (secondary line currently operating at 86% of nominal rate).
                  </li>
                  <li>
                    <strong className="text-[#0F1B2B]">Occupancy Constraints:</strong> Slow egress or gross scale queues delay bay clearing even if pumping is finished.
                  </li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 text-[11px]">
                <strong className="font-semibold block mb-0.5">Control Plane Impact:</strong>
                At +60m, expected demand (18 orders) exceeds effective capacity (8 orders), creating a +10 backlog. At +90m, FlowGuard reallocates dual-arm capacity, expanding effective capacity to 12 orders and clearing the bottleneck.
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 px-6 border-t border-[#E2E6EA] bg-[#FAFBFC] flex justify-end">
              <button
                onClick={() => setShowFormulaModal(false)}
                className="px-4 py-1.5 rounded-md bg-[#1B7A3D] text-white text-xs font-semibold hover:bg-[#156331] transition-colors"
              >
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
