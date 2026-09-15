"use client";

import React, { useState } from "react";
import {
  Clock,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Activity,
  Zap,
  HelpCircle,
  Hourglass,
  CheckCircle2,
} from "lucide-react";
import { DepotForecast } from "@/types/flowguard";

interface Next90MinutesForecastProps {
  forecast: DepotForecast;
  depotName: string;
}

export const Next90MinutesForecast: React.FC<Next90MinutesForecastProps> = ({
  forecast,
  depotName,
}) => {
  const [showFormula, setShowFormula] = useState(false);

  const getStageColor = (state: string) => {
    switch (state) {
      case "CAPACITY SHORTFALL":
      case "CRITICAL PRESSURE":
        return {
          bg: "bg-rose-50 border-rose-200 text-rose-900",
          badge: "bg-rose-100 text-rose-800 border-rose-300 font-bold",
          bar: "bg-rose-500",
        };
      case "DEMAND SURGE":
      case "WATCH":
        return {
          bg: "bg-amber-50 border-amber-200 text-amber-900",
          badge: "bg-amber-100 text-amber-800 border-amber-300 font-semibold",
          bar: "bg-amber-500",
        };
      case "STABILIZING":
      case "RECOVERING":
        return {
          bg: "bg-emerald-50 border-emerald-200 text-emerald-900",
          badge: "bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold",
          bar: "bg-[#1B7A3D]",
        };
      case "OPTIMAL":
      case "NORMAL":
      default:
        return {
          bg: "bg-[#FAFBFC] border-[#E2E6EA] text-[#0F1B2B]",
          badge: "bg-slate-100 text-slate-700 border-slate-200",
          bar: "bg-slate-400",
        };
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[#E2E6EA] p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#EDF1F5] pb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#1B7A3D]" />
          <div>
            <h3 className="font-bold text-sm text-[#0F1B2B]">
              Predictive Pressure Horizon — Next 90 Minutes
            </h3>
            <span className="text-xs text-[#5C6B7A]">
              Expected Demand vs Effective Processing Capacity • {depotName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setShowFormula(!showFormula)}
            className="text-[11px] text-[#1B7A3D] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3 h-3" />
            <span>{showFormula ? "Hide Capacity Logic" : "Why Effective Capacity?"}</span>
          </button>

          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#1B7A3D] font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <Zap className="w-3 h-3 text-[#1B7A3D]" />
            FLOWGUARD PREDICTIVE MODEL (SIMULATED)
          </span>
        </div>
      </div>

      {/* Explanatory Callout if toggled */}
      {showFormula && (
        <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-md text-xs text-[#0F1B2B] space-y-1 animate-in fade-in">
          <div className="font-bold text-emerald-950 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1B7A3D]" />
            <span>Demand vs Usable Processing Capacity Relationship</span>
          </div>
          <p className="text-[#5C6B7A] text-[11px] leading-relaxed">
            Capacity is not a static count of physical bays. Effective capacity accounts for usable gantry arms, measured Coriolis meter flow rates, occupancy exchange turnover, and manifold product compatibilities. When expected arrival demand exceeds this effective processing throughput, queue pressure forms.
          </p>
        </div>
      )}

      {/* Forecast Point Horizon Grid: NOW -> +30m -> +60m -> +90m */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {forecast.points.map((pt, idx) => {
          const colors = getStageColor(pt.operationalState);
          const hasBacklog = pt.projectedBacklog > 0;

          return (
            <div
              key={idx}
              className={`p-4 rounded-lg border flex flex-col justify-between transition-all ${colors.bg}`}
            >
              {/* Point Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-base text-[#0F1B2B]">
                    {pt.offsetLabel}
                  </span>
                  <span className="text-[10px] text-[#8492A6]">
                    {idx === 0 ? "(Current)" : `(+${idx * 30} min)`}
                  </span>
                </div>

                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${colors.badge}`}
                >
                  {pt.operationalState}
                </span>
              </div>

              {/* Demand vs Capacity Comparison */}
              <div className="space-y-1.5 my-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#5C6B7A]">Expected Demand:</span>
                  <span className="font-mono font-bold text-[#0F1B2B]">
                    {pt.expectedDemand} orders
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#5C6B7A]">Effective Capacity:</span>
                  <span className="font-mono font-bold text-[#1B7A3D]">
                    {pt.effectiveCapacity} orders
                  </span>
                </div>

                {/* Backlog Metric */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/50">
                  <span className="text-[#5C6B7A]">Projected Pressure:</span>
                  <span
                    className={`font-mono font-bold ${
                      hasBacklog ? "text-rose-700" : "text-emerald-700"
                    }`}
                  >
                    {hasBacklog ? `+${pt.projectedBacklog} backlog` : "0 (Clear)"}
                  </span>
                </div>
              </div>

              {/* Dwell / Wait Time */}
              <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#8492A6] block">
                    Predicted Turnaround
                  </span>
                  <span className="font-mono font-bold text-base text-[#0F1B2B]">
                    {pt.expectedWaitMin}m
                  </span>
                </div>

                {/* Unmitigated vs Mitigated Delta */}
                {pt.unmitigatedWaitMin > pt.expectedWaitMin && (
                  <div className="text-right">
                    <span className="text-[9px] line-through text-slate-400 block font-mono">
                      {pt.unmitigatedWaitMin}m unmitigated
                    </span>
                    <span className="text-[10px] font-bold text-[#1B7A3D] font-mono">
                      -{pt.unmitigatedWaitMin - pt.expectedWaitMin}m stabilized
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Recommendation with Decision Window & Urgency Banner */}
      <div className="p-3.5 rounded-lg bg-[#FAFBFC] border border-[#E2E6EA] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-md bg-[#1B7A3D] text-white shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#0F1B2B] text-xs">
                Forward Action Recommendation: Re-sequence Staging Inflow
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                HIGH URGENCY
              </span>
            </div>
            <p className="text-[#5C6B7A] text-[11px] leading-relaxed mt-0.5">
              Demand is projected to exceed usable capacity at +60m. FlowGuard optimization stabilizes turnaround back to baseline SLA by +90m.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <div className="bg-white px-3 py-1.5 rounded border border-[#E2E6EA] flex items-center gap-1.5">
            <Hourglass className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <div>
              <span className="text-[9px] uppercase font-bold text-[#8492A6] block leading-none">
                Decision Window
              </span>
              <span className="font-mono font-bold text-xs text-[#0F1B2B]">
                09 min remaining
              </span>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-[9px] uppercase font-bold text-[#8492A6] block">
              Confidence
            </span>
            <span className="font-mono font-bold text-[#1B7A3D]">
              91.4%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
