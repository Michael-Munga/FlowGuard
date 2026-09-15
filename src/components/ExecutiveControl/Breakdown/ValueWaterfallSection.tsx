"use client";

import React from "react";
import {
  DollarSign,
  TrendingUp,
  PieChart,
  BarChart3,
  AlertTriangle,
  Lightbulb,
  Building,
  Layers,
} from "lucide-react";
import { ValueWaterfallItem, BottleneckImpactSummary } from "@/types/flowguard";

interface ValueWaterfallSectionProps {
  waterfall: ValueWaterfallItem[];
  bottlenecks: BottleneckImpactSummary[];
  totalProtectedKes: number;
}

export const ValueWaterfallSection: React.FC<ValueWaterfallSectionProps> = ({
  waterfall,
  bottlenecks,
  totalProtectedKes,
}) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* 1. Value Waterfall / Impact Breakdown (~60%) */}
      <div className="xl:col-span-7 bg-white rounded-lg border border-[#E2E6EA] shadow-xs p-6 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0F1B2B] tracking-tight">
                  Value Protection Breakdown (Where Value Originates)
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                  KES {(totalProtectedKes / 1000000).toFixed(2)}M TOTAL
                </span>
              </div>
              <p className="text-xs text-[#5C6B7A] mt-0.5">
                Distribution of prevented demurrage exposure across operational problem clusters
              </p>
            </div>

            <span className="text-xs font-mono text-slate-500 font-semibold">
              50 Interventions
            </span>
          </div>

          {/* Value Contributors Horizontal Bar Chart */}
          <div className="space-y-4 my-2">
            {waterfall.map((item, idx) => {
              const barColors = [
                "bg-emerald-600",
                "bg-blue-600",
                "bg-indigo-600",
                "bg-purple-600",
              ];
              const barColor = barColors[idx % barColors.length];

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-lg bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {item.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                        {item.interventionsCount} actions
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono shrink-0">
                      <span className="text-xs font-bold text-slate-900">
                        KES {(item.amountKes / 1000000).toFixed(2)}M
                      </span>
                      <span className="text-[11px] font-bold px-1.5 py-0.2 rounded bg-white text-emerald-800 border border-emerald-200 w-14 text-center">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Proportional Horizontal Bar */}
                  <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden flex shadow-inner">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-700`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-600 leading-snug">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Derived from verified closed-loop telemetry audits</span>
          <span className="font-mono text-emerald-700 font-semibold">
            Nairobi accounts for 43.3% (KES 6.42M) of network protected value
          </span>
        </div>
      </div>

      {/* 2. Bottleneck Frequency & Impact Guidance (~40%) */}
      <div className="xl:col-span-5 bg-white rounded-lg border border-[#E2E6EA] shadow-xs p-6 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0F1B2B] tracking-tight">
                  Recurring Bottleneck Impact
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                  ROOT CAUSES
                </span>
              </div>
              <p className="text-xs text-[#5C6B7A] mt-0.5">
                Frequency and dwell recovered by operational failure type
              </p>
            </div>

            <span className="text-[10px] font-mono text-slate-500 uppercase">
              CAPEX Priority
            </span>
          </div>

          {/* Bottleneck Stack */}
          <div className="space-y-2.5 my-2">
            {bottlenecks.map((b, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-3 ${
                  b.isTopBottleneck
                    ? "bg-amber-50/50 border-amber-300 ring-1 ring-amber-400/30"
                    : "bg-slate-50/50 border-slate-200"
                }`}
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {b.isTopBottleneck && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 uppercase font-mono">
                        TOP DRIVER
                      </span>
                    )}
                    <span className="font-bold text-slate-900 truncate">{b.bottleneck}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono block">
                    {b.interventionsCount} interventions • -{b.turnaroundDwellSavedMin}m dwell
                  </span>
                </div>

                <div className="text-right font-mono flex-shrink-0">
                  <span className="font-bold text-slate-900 block">
                    KES {(b.exposureProtectedKes / 1000000).toFixed(2)}M
                  </span>
                  <span className="text-[10px] text-slate-500">{b.percentageOfTotal}% share</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Takeaway Card */}
        <div className="pt-3 mt-3 border-t border-slate-100 flex items-start gap-2 bg-amber-50/40 p-3 rounded-lg border border-amber-200/80">
          <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-[11px] text-amber-950 leading-relaxed">
            <strong>Modeled strategic priority:</strong> <strong>Capacity pressure</strong> represents 48.0% of operational interventions. Strategic priority should focus on dual-hose manifold automation and smart tare scale ingress balancing before adding physical gantry bays.
          </div>
        </div>
      </div>
    </div>
  );
};
