"use client";

import React, { useState } from "react";
import {
  Layers,
  Fuel,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Gauge,
  HelpCircle,
  Info,
  TrendingDown,
  ShieldCheck,
} from "lucide-react";
import { DepotCapacityState, LoadingPosition, PositionStatus } from "@/types/flowguard";

interface CapacityBoardProps {
  capacityState: DepotCapacityState;
}

export const CapacityBoard: React.FC<CapacityBoardProps> = ({ capacityState }) => {
  const [selectedPosition, setSelectedPosition] = useState<LoadingPosition | null>(null);
  const [showCalculationModel, setShowCalculationModel] = useState(false);

  const getStatusBadge = (status: PositionStatus | string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-emerald-50 text-[#1B7A3D] border-emerald-200";
      case "LOADING":
      case "OCCUPIED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "COMING AVAILABLE":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "DEGRADED":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "RESTRICTED":
      case "INCOMPATIBLE":
        return "bg-orange-50 text-orange-800 border-orange-200";
      case "MAINTENANCE":
      case "UNAVAILABLE":
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  const calc = capacityState.calculationModel;
  const nominalRatePerHour = (capacityState.totalPhysicalPositions * 2.5).toFixed(1); // Theoretical 20.0
  const effectiveRatePerHour = (
    (calc?.effectiveThroughputTrucks || 11) *
    (60 / (calc?.timeWindowMin || 90))
  ).toFixed(1); // Realistic 15.8
  const capacityReductionDelta = (
    parseFloat(nominalRatePerHour) - parseFloat(effectiveRatePerHour)
  ).toFixed(1);

  return (
    <div className="bg-white rounded-lg border border-[#E2E6EA] p-5 shadow-xs space-y-4 select-none">
      {/* Header & Strategic Effective Capacity Hero */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-[#EDF1F5] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#1B7A3D]" />
            <h3 className="font-bold text-sm text-[#0F1B2B]">
              Loading Capacity & Gantry Bay Allocation
            </h3>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border">
              SIMULATED TERMINAL CAPACITY
            </span>
          </div>
          <p className="text-xs text-[#5C6B7A] mt-0.5">
            Nominal theoretical gantry capacity vs operational effective throughput across operating window
          </p>
        </div>

        {/* Strategic Capacity Callout */}
        <div className="bg-[#FAFBFC] border border-[#E2E6EA] px-3.5 py-2 rounded-lg flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-[#1B7A3D]/10 text-[#1B7A3D]">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C6B7A] block">
                FlowGuard Capacity Model — Simulated
              </span>
              <button
                type="button"
                onClick={() => setShowCalculationModel(!showCalculationModel)}
                className="text-[10px] font-semibold text-[#1B7A3D] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <HelpCircle className="w-3 h-3" />
                <span>{showCalculationModel ? "Hide Formula" : "Why Effective Capacity?"}</span>
              </button>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-bold font-mono text-[#0F1B2B]">
                {effectiveRatePerHour} trucks/hr Effective
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                (Nominal: {nominalRatePerHour} trucks/hr)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Mathematical Capacity Calculation Model */}
      {showCalculationModel && calc && (
        <div className="p-4 rounded-lg bg-emerald-50/40 border border-emerald-200 text-xs space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#1B7A3D]" />
              <span className="font-bold text-[#0F1B2B]">
                FlowGuard Capacity Model — Mathematical Derivation
              </span>
            </div>
            <button
              onClick={() => setShowCalculationModel(false)}
              className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-2.5 rounded border border-emerald-100">
              <span className="text-[10px] uppercase font-bold text-[#8492A6] block">
                Usable Positions
              </span>
              <span className="text-sm font-bold font-mono text-[#0F1B2B]">
                {calc.usablePositions} bays
              </span>
              <span className="text-[10px] text-[#5C6B7A] block">
                of {capacityState.totalPhysicalPositions} installed
              </span>
            </div>

            <div className="bg-white p-2.5 rounded border border-emerald-100">
              <span className="text-[10px] uppercase font-bold text-[#8492A6] block">
                Available Time
              </span>
              <span className="text-sm font-bold font-mono text-[#0F1B2B]">
                {calc.timeWindowMin} min
              </span>
              <span className="text-[10px] text-[#5C6B7A] block">Operating horizon</span>
            </div>

            <div className="bg-white p-2.5 rounded border border-emerald-100">
              <span className="text-[10px] uppercase font-bold text-[#8492A6] block">
                Expected Loading Dwell
              </span>
              <span className="text-sm font-bold font-mono text-[#0F1B2B]">
                {calc.avgLoadingDurationMin} min / tanker
              </span>
              <span className="text-[10px] text-[#5C6B7A] block">Avg fill & tare transfer</span>
            </div>

            <div className="bg-white p-2.5 rounded border border-emerald-100">
              <span className="text-[10px] uppercase font-bold text-[#8492A6] block">
                Performance Factor
              </span>
              <span className="text-sm font-bold font-mono text-[#1B7A3D]">
                {calc.performanceRatePct}%
              </span>
              <span className="text-[10px] text-[#5C6B7A] block">Meter rate vs 100% baseline</span>
            </div>
          </div>

          <div className="bg-white p-2.5 rounded border border-emerald-100 text-[11px] text-[#0F1B2B] font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold text-[#1B7A3D]">Formula: </span>
              <span>{calc.formulaExplanation}</span>
            </div>
            <span className="font-bold text-[#1B7A3D] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
              = {effectiveRatePerHour} trucks/hr Effective Capacity
            </span>
          </div>

          <div className="p-2.5 bg-white rounded border border-emerald-100 text-[11px] text-[#5C6B7A] space-y-1">
            <span className="font-bold text-[#0F1B2B] block">Why is effective capacity lower than nominal?</span>
            <ul className="space-y-0.5 list-disc list-inside text-[10px]">
              <li>Occupied loading positions in active filling cycles ({capacityState.usableNow} currently usable).</li>
              <li>Equipment degradation or flow rate impairment (-{capacityReductionDelta} trucks/hr throughput drag).</li>
              <li>Product manifold compatibility restrictions (loading positions are not interchangeable).</li>
            </ul>
          </div>
        </div>
      )}

      {/* Summary KPI Cards: Nominal vs Effective vs Reduction vs Occupancy */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="p-2.5 rounded-md bg-[#FAFBFC] border border-[#E2E6EA]">
          <span className="text-[10px] uppercase font-bold text-[#8492A6] block">
            Nominal Capacity
          </span>
          <span className="text-lg font-bold font-mono text-[#0F1B2B]">
            {nominalRatePerHour} <span className="text-xs font-normal">tr/hr</span>
          </span>
          <span className="text-[10px] text-[#5C6B7A] block">Theoretical 100% max</span>
        </div>

        <div className="p-2.5 rounded-md bg-emerald-50/50 border border-emerald-200">
          <span className="text-[10px] uppercase font-bold text-[#1B7A3D] block">
            Effective Capacity
          </span>
          <span className="text-lg font-bold font-mono text-[#1B7A3D]">
            {effectiveRatePerHour} <span className="text-xs font-normal">tr/hr</span>
          </span>
          <span className="text-[10px] text-emerald-800 block">Operational reality</span>
        </div>

        <div className="p-2.5 rounded-md bg-rose-50/50 border border-rose-200">
          <span className="text-[10px] uppercase font-bold text-rose-800 block">
            Constraint Impact
          </span>
          <span className="text-lg font-bold font-mono text-rose-800">
            -{capacityReductionDelta} <span className="text-xs font-normal">tr/hr</span>
          </span>
          <span className="text-[10px] text-rose-900 block truncate">Throughput reduction</span>
        </div>

        <div className="p-2.5 rounded-md bg-blue-50/50 border border-blue-200">
          <span className="text-[10px] uppercase font-bold text-blue-800 block">
            Current Occupancy
          </span>
          <span className="text-lg font-bold font-mono text-blue-800">
            {capacityState.usableNow} / {capacityState.totalPhysicalPositions}
          </span>
          <span className="text-[10px] text-blue-900 block">Bays currently active</span>
        </div>

        <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-700 block">
            Unavailable / Offline
          </span>
          <span className="text-lg font-bold font-mono text-slate-800">
            {capacityState.offlineUnavailable}
          </span>
          <span className="text-[10px] text-slate-600 block truncate">
            {capacityState.reasons.unavailableReason || "None"}
          </span>
        </div>
      </div>

      {/* Loading Position Grid (P01 to P08) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[11px] uppercase tracking-wider text-[#5C6B7A]">
            Active Loading Position Grid ({capacityState.positions.length} Gantries)
          </span>
          <span className="text-[10px] text-[#8492A6]">
            Positions are product-specific • Click bay to inspect telemetry
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {capacityState.positions.map((pos) => {
            const isSelected = selectedPosition?.id === pos.id;

            return (
              <button
                key={pos.id}
                onClick={() => setSelectedPosition(isSelected ? null : pos)}
                className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all hover:shadow-xs cursor-pointer ${
                  isSelected
                    ? "border-[#1B7A3D] ring-2 ring-[#1B7A3D]/20 bg-emerald-50/30"
                    : pos.status === "LOADING"
                    ? "bg-blue-50/20 border-blue-200 hover:border-blue-400"
                    : pos.status === "DEGRADED"
                    ? "bg-amber-50/30 border-amber-300 hover:border-amber-400"
                    : pos.status === "MAINTENANCE" || pos.status === "UNAVAILABLE"
                    ? "bg-slate-50/70 border-slate-200 hover:border-slate-300"
                    : "bg-[#FAFBFC] border-[#E2E6EA] hover:border-emerald-300"
                }`}
              >
                {/* Bay Header */}
                <div className="flex items-center justify-between w-full mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-sm text-[#0F1B2B]">
                      {pos.code}
                    </span>
                    <span className="text-[10px] font-medium text-[#8492A6]">
                      Position
                    </span>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${getStatusBadge(
                      pos.status
                    )}`}
                  >
                    {pos.status}
                  </span>
                </div>

                {/* Compatibility */}
                <div className="text-[11px] text-[#5C6B7A] font-medium truncate mb-1">
                  {pos.productCompatibility}
                </div>

                {/* Active Tanker or Status Note */}
                <div className="mt-1 min-h-[36px] flex flex-col justify-center">
                  {pos.activeTruckReg ? (
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-[#0F1B2B]">
                          {pos.activeTruckReg}
                        </span>
                        <span className="text-[10px] font-medium text-blue-700">
                          {pos.estimatedFreeInMin ? `Free in ${pos.estimatedFreeInMin}m` : "Active"}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#5C6B7A] truncate block">
                        {pos.activeOmc}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-[#8492A6] italic">
                      {pos.status === "AVAILABLE"
                        ? "Compatible & ready for fill"
                        : pos.status === "DEGRADED"
                        ? "Flow velocity impaired"
                        : "Gantry locked offline"}
                    </span>
                  )}
                </div>

                {/* Telemetry Note Footer */}
                <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-[#8492A6]">
                  <span className="truncate pr-1">{pos.telemetryNote}</span>
                  {pos.flowRateLpm && (
                    <span className="font-mono font-bold text-[#0F1B2B] shrink-0">
                      {pos.flowRateLpm} L/m
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expanded Position Telemetry Panel (if selected) */}
      {selectedPosition && (
        <div className="p-3.5 rounded-lg bg-[#FAFBFC] border border-[#1B7A3D]/40 text-xs space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-[#E2E6EA] pb-2">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-[#0F1B2B]">
                {selectedPosition.code} Telemetry Inspector
              </span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${getStatusBadge(
                  selectedPosition.status
                )}`}
              >
                {selectedPosition.status}
              </span>
            </div>
            <button
              onClick={() => setSelectedPosition(null)}
              className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8492A6] block">
                Product & Manifold Compatibility
              </span>
              <span className="font-medium text-[#0F1B2B]">
                {selectedPosition.productCompatibility}
              </span>
              <span className="text-[10px] text-[#8492A6] block mt-0.5">
                Positions are not universally interchangeable
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[#8492A6] block">
                Loading Performance Telemetry
              </span>
              <span className="text-[#0F1B2B]">
                {selectedPosition.telemetryNote}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[#8492A6] block">
                Measured Flow Rate vs Baseline
              </span>
              <span className="font-mono font-bold text-[#0F1B2B]">
                {selectedPosition.flowRateLpm
                  ? `${selectedPosition.flowRateLpm} L/min (${Math.round(
                      (selectedPosition.flowRateLpm / selectedPosition.baselineFlowRateLpm) * 100
                    )}% of baseline)`
                  : "0 L/min (Position Inactive)"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
