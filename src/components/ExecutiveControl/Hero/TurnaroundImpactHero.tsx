"use client";

import React from "react";
import {
  TrendingDown,
  Clock,
  ShieldCheck,
  Award,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BarChart3,
  Calendar,
} from "lucide-react";
import { ExecutiveKpiSummary, TurnaroundTrendPoint } from "@/types/flowguard";

interface TurnaroundImpactHeroProps {
  kpis: ExecutiveKpiSummary | null;
  trend: TurnaroundTrendPoint[];
}

export const TurnaroundImpactHero: React.FC<TurnaroundImpactHeroProps> = ({ kpis, trend }) => {
  // Dynamic scaling for trend points
  const points = trend && trend.length > 0 ? trend : [
    { period: "Baseline", turnaroundMin: 87 },
    { period: "Week 1", turnaroundMin: 82 },
    { period: "Week 2", turnaroundMin: 74 },
    { period: "Week 3", turnaroundMin: 64 },
    { period: "Current", turnaroundMin: 56 },
  ];

  // SVG coordinate calculations
  // Chart width 460, height 180
  // X range: 50 to 415
  // Y range: min 40m -> y=145, max 95m -> y=25
  const getY = (val: number) => {
    const clamped = Math.max(40, Math.min(95, val));
    return 25 + ((95 - clamped) / (95 - 40)) * (145 - 25);
  };

  const getX = (idx: number, total: number) => {
    if (total <= 1) return 232;
    return 50 + (idx / (total - 1)) * (415 - 50);
  };

  const targetY = getY(60);

  const polylinePoints = points
    .map((p, idx) => `${getX(idx, points.length)},${getY(p.turnaroundMin)}`)
    .join(" ");

  const polygonPoints = `${getX(0, points.length)},145 ${polylinePoints} ${getX(
    points.length - 1,
    points.length
  )},145`;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Left Column: Hero Before vs After Outcome Card (~55%) */}
      <div className="xl:col-span-7 bg-white rounded-lg border border-[#E2E6EA] shadow-xs p-6 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0F1B2B] tracking-tight">
                  FlowGuard Operational Outcome: Before vs After
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                  VERIFIED IMPACT
                </span>
              </div>
              <p className="text-xs text-[#5C6B7A] mt-0.5">
                Aggregate gate-to-gate road tanker turnaround dwell across the KPC terminal network
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Benchmark</span>
              <span className="text-xs font-mono font-bold text-slate-800">5 Depots Consolidated</span>
            </div>
          </div>

          {/* 3-Pillar Before / After / Delta Visual */}
          <div className="grid grid-cols-3 gap-3 my-4">
            {/* 1. Baseline */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block mb-1">
                  WITHOUT FLOWGUARD
                </span>
                <span className="text-xs font-semibold text-slate-600 block">
                  Historical Baseline
                </span>
              </div>

              <div className="my-3">
                <span className="text-4xl font-bold font-mono text-slate-700 tracking-tight">
                  {kpis?.baselineTurnaroundMin || 87}
                </span>
                <span className="text-sm font-semibold text-slate-500 ml-1">min</span>
              </div>

              <span className="text-[10px] text-slate-500 font-mono">
                Standard unmitigated dwell
              </span>
            </div>

            {/* 2. FlowGuard Current */}
            <div className="p-4 rounded-lg bg-emerald-50/50 border-2 border-emerald-500/40 flex flex-col justify-between relative overflow-hidden shadow-2xs">
              <div className="absolute top-0 right-0 px-2 py-0.5 bg-emerald-500 text-white font-mono text-[9px] font-bold rounded-bl uppercase">
                ACTIVE
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 font-mono block mb-1">
                  WITH FLOWGUARD
                </span>
                <span className="text-xs font-semibold text-emerald-950 block">
                  Current Turnaround
                </span>
              </div>

              <div className="my-3">
                <span className="text-4xl font-bold font-mono text-emerald-700 tracking-tight">
                  {kpis?.currentTurnaroundMin || 56}
                </span>
                <span className="text-sm font-semibold text-emerald-600 ml-1">min</span>
              </div>

              <span className="text-[10px] text-emerald-700 font-mono font-medium">
                Closed-loop verified
              </span>
            </div>

            {/* 3. Net Improvement */}
            <div className="p-4 rounded-lg bg-[#0B1420] text-white flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono block mb-1">
                  NET RECOVERY
                </span>
                <span className="text-xs font-semibold text-slate-300 block">
                  Time Saved / Tanker
                </span>
              </div>

              <div className="my-3">
                <span className="text-4xl font-bold font-mono text-emerald-400 tracking-tight">
                  -{kpis?.turnaroundRecoveredMin || 31}
                </span>
                <span className="text-sm font-semibold text-emerald-300 ml-1">min</span>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-300 font-mono">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>{kpis?.turnaroundImprovementPct || -35.6}% FASTER</span>
              </div>
            </div>
          </div>
        </div>

        {/* Impact Sub-Footer Callouts */}
        <div className="pt-4 mt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded bg-slate-50 border border-slate-200/70">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Exposure Protected</span>
            <span className="text-sm font-bold font-mono text-emerald-700">
              KES {((kpis?.totalExposureProtectedKes || 14820000) / 1000000).toFixed(2)}M
            </span>
          </div>

          <div className="p-2.5 rounded bg-slate-50 border border-slate-200/70">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Realized Savings</span>
            <span className="text-sm font-bold font-mono text-slate-900">
              KES {((kpis?.realizedSavingsKes || 11350000) / 1000000).toFixed(2)}M
            </span>
          </div>

          <div className="p-2.5 rounded bg-slate-50 border border-slate-200/70">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Interventions Verified</span>
            <span className="text-sm font-bold font-mono text-emerald-700">
              {kpis?.interventionsVerifiedSuccess || 46} of {kpis?.autonomousInterventionsTotal || 50}
            </span>
          </div>

          <div className="p-2.5 rounded bg-slate-50 border border-slate-200/70">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Capacity Unlocked</span>
            <span className="text-sm font-bold font-mono text-slate-900">
              +{kpis?.capacityRecoveredTruckSlots || 182} slots
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Sustained Turnaround Trend Line Chart (~45%) */}
      <div className="xl:col-span-5 bg-white rounded-lg border border-[#E2E6EA] shadow-xs p-6 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0F1B2B] tracking-tight">
                  Sustained Turnaround Trajectory
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                  TREND ANALYSIS
                </span>
              </div>
              <p className="text-xs text-[#5C6B7A] mt-0.5">
                Dwell compression over reporting window relative to historical baseline
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">KPC Target</span>
              <span className="text-xs font-mono font-bold text-amber-600">60m SLA</span>
            </div>
          </div>

          {/* Dynamic SVG Line Chart */}
          <div className="relative w-full my-2">
            <svg viewBox="0 0 460 180" className="w-full h-auto overflow-visible">
              <defs>
                <linearGradient id="turnaroundGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="45" y1="25" x2="425" y2="25" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="45" y1="65" x2="425" y2="65" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="45" y1={targetY} x2="425" y2={targetY} stroke="#F1F5F9" strokeWidth="1" />
              <line x1="45" y1="145" x2="425" y2="145" stroke="#E2E8F0" strokeWidth="1.5" />

              {/* Y-axis Labels */}
              <text x="35" y="29" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">90m</text>
              <text x="35" y="69" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">75m</text>
              <text x="35" y={targetY + 4} textAnchor="end" className="text-[10px] fill-amber-600 font-mono font-bold">60m</text>
              <text x="35" y="149" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">45m</text>

              {/* Target 60m Benchmark Line (Dashed) */}
              <line
                x1="45"
                y1={targetY}
                x2="425"
                y2={targetY}
                stroke="#D97706"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <text x="428" y={targetY + 3} textAnchor="start" className="text-[9px] fill-amber-700 font-mono font-bold">
                Target 60m
              </text>

              {/* Area Under the Line */}
              <polygon
                points={polygonPoints}
                fill="url(#turnaroundGradient)"
              />

              {/* Trend Polyline */}
              <polyline
                fill="none"
                stroke="#059669"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylinePoints}
              />

              {/* Dynamic Data Points */}
              {points.map((p, idx) => {
                const cx = getX(idx, points.length);
                const cy = getY(p.turnaroundMin);
                const isLast = idx === points.length - 1;

                return (
                  <g key={idx}>
                    {isLast && (
                      <circle cx={cx} cy={cy} r="8" fill="#10B981" opacity="0.2" className="animate-ping" />
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isLast ? "5.5" : "4.5"}
                      fill="#FFFFFF"
                      stroke={isLast ? "#059669" : idx === 0 ? "#475569" : "#2563EB"}
                      strokeWidth={isLast ? "3" : "2.5"}
                    />
                    <text
                      x={cx}
                      y={cy - 9}
                      textAnchor="middle"
                      className={`text-[11px] font-bold font-mono ${
                        isLast ? "fill-emerald-700" : idx === 0 ? "fill-slate-700" : "fill-blue-700"
                      }`}
                    >
                      {p.turnaroundMin}m
                    </text>
                    <text
                      x={cx}
                      y="165"
                      textAnchor="middle"
                      className={`text-[10px] font-mono truncate ${
                        isLast ? "font-bold fill-emerald-700" : "font-medium fill-slate-500"
                      }`}
                    >
                      {p.period.split(" ")[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Stepped Deltas Breakdown */}
          <div className="grid grid-cols-5 gap-1.5 mt-3 pt-3 border-t border-slate-100 text-center">
            {points.map((p, idx) => (
              <div
                key={idx}
                className={`p-1.5 rounded border ${
                  idx === points.length - 1
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-slate-50 border-slate-100"
                }`}
              >
                <span className="text-[9px] text-slate-500 font-mono block truncate">
                  {p.period.split("(")[0].trim()}
                </span>
                <span
                  className={`text-xs font-bold font-mono ${
                    idx === points.length - 1 ? "text-emerald-800" : "text-slate-800"
                  }`}
                >
                  {p.turnaroundMin}m
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Insight */}
        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Target SLA: <strong className="text-amber-700 font-mono font-semibold">60 min</strong></span>
          <span className="text-emerald-700 font-semibold font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Currently {60 - (kpis?.currentTurnaroundMin || 56)}m below 60m target SLA</span>
          </span>
        </div>
      </div>
    </div>
  );
};
