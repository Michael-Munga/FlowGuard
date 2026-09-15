"use client";

import React from "react";
import {
  AlertOctagon,
  TrendingDown,
  Gauge,
  Activity,
  Layers,
  ArrowRight,
  Info,
  Clock,
  Zap,
} from "lucide-react";
import { DepotBottleneckDiagnosis, PrimaryBottleneck } from "@/types/flowguard";

interface BottleneckDiagnosisHeroProps {
  bottleneck: DepotBottleneckDiagnosis;
}

export const BottleneckDiagnosisHero: React.FC<BottleneckDiagnosisHeroProps> = ({
  bottleneck,
}) => {
  const isNominal =
    bottleneck.currentBottleneck === "Product/loading readiness" ||
    bottleneck.currentBottleneck === "Validation/release";

  return (
    <div className="bg-white rounded-lg border border-[#E2E6EA] overflow-hidden shadow-xs">
      {/* Top Banner Header */}
      <div
        className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 ${
          isNominal
            ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
            : "bg-rose-50/70 border-rose-200 text-rose-950"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`p-1.5 rounded-md ${
              isNominal ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C6B7A]">
                Causal Bottleneck Diagnosis
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white border font-bold">
                CONFIDENCE: 94.6%
              </span>
            </div>
            <h2 className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
              <span>CURRENT BOTTLENECK:</span>
              <span className={isNominal ? "text-emerald-700" : "text-rose-700 font-extrabold"}>
                {bottleneck.currentBottleneck.toUpperCase()}
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded border ${
              isNominal
                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                : "bg-rose-100 text-rose-800 border-rose-300 font-bold"
            }`}
          >
            {isNominal ? "THROUGHPUT HEADROOM NOMINAL" : "PROCESSING SATURATION IMMINENT"}
          </span>
        </div>
      </div>

      {/* Main Diagnostic Body */}
      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Causal Headline, Impact & Structured Operational Fields (~55%) */}
        <div className="lg:col-span-7 space-y-3.5">
          <div>
            <h3 className="text-base font-bold text-[#0F1B2B] leading-snug">
              {bottleneck.headline}
            </h3>
            <p className="text-xs text-[#5C6B7A] leading-relaxed mt-1">
              {bottleneck.explanation}
            </p>
          </div>

          {/* Structured Operational Diagnosis Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {/* Primary Cause */}
            <div className="p-3 rounded-md bg-[#FAFBFC] border border-[#E2E6EA]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8492A6] block">
                Primary Operational Cause
              </span>
              <span className="font-semibold text-xs text-[#0F1B2B] block mt-1">
                {bottleneck.primaryCause || "Expected collection demand rising faster than effective capacity."}
              </span>
            </div>

            {/* Current Impact */}
            <div className="p-3 rounded-md bg-[#FAFBFC] border border-[#E2E6EA]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8492A6] block">
                Current Impact on Turnaround
              </span>
              <span className="font-bold text-xs text-rose-700 block mt-1 font-mono">
                {bottleneck.currentImpact || "+18 min predicted turnaround elongation"}
              </span>
            </div>

            {/* Forecast Horizon */}
            <div className="p-3 rounded-md bg-[#FAFBFC] border border-[#E2E6EA]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8492A6] block">
                Forecast Risk Horizon
              </span>
              <span className="font-semibold text-xs text-[#0F1B2B] block mt-1">
                {bottleneck.forecastHorizon || "Next 45–60 min arrival clustering window"}
              </span>
            </div>

            {/* FlowGuard Response */}
            <div className="p-3 rounded-md bg-emerald-50/50 border border-emerald-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B7A3D] block">
                FlowGuard Autonomous Response
              </span>
              <span className="font-bold text-xs text-emerald-900 block mt-1">
                {bottleneck.flowGuardResponse || "Dual-arm re-sequencing action active"}
              </span>
            </div>
          </div>

          <div className="pt-1 flex items-center gap-1.5 text-[11px] text-[#8492A6]">
            <Info className="w-3.5 h-3.5 text-[#1B7A3D] shrink-0" />
            <span>
              Diagnostic generated from simulated operational telemetry modeled on KPC loading, gate and equipment signals.
            </span>
          </div>
        </div>

        {/* Right Column: FlowGuard Risk Contribution Model (~45%) */}
        <div className="lg:col-span-5 bg-[#FAFBFC] p-4 rounded-lg border border-[#E2E6EA] space-y-3">
          <div className="flex items-center justify-between border-b border-[#EDF1F5] pb-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C6B7A] block">
                FlowGuard Risk Contribution Model
              </span>
              <span className="text-[9px] text-[#8492A6]">
                Simulated factor weights behind current pressure
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#1B7A3D] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              ESTIMATED
            </span>
          </div>

          <div className="space-y-2.5">
            {bottleneck.contributions.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0F1B2B] truncate max-w-[180px]">
                    {item.factor}
                  </span>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${
                        item.impactLevel === "High"
                          ? "bg-rose-50 text-rose-800 border-rose-200"
                          : item.impactLevel === "Medium"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-emerald-50 text-[#1B7A3D] border-emerald-200"
                      }`}
                    >
                      {item.impactLevel}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-[#0F1B2B] w-8 text-right">
                      {item.scorePct}%
                    </span>
                  </div>
                </div>

                {/* Contribution visual progress bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.impactLevel === "High"
                        ? "bg-rose-500"
                        : item.impactLevel === "Medium"
                        ? "bg-amber-500"
                        : "bg-[#1B7A3D]"
                    }`}
                    style={{ width: `${item.scorePct}%` }}
                  />
                </div>

                <p className="text-[10px] text-[#8492A6] truncate">
                  {item.statusText}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
