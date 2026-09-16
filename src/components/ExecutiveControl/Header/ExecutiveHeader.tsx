"use client";

import React from "react";
import {
  TrendingUp,
  Calendar,
  HelpCircle,
  RotateCw,
  Award,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { RoleSwitcher } from "@/components/Navigation/RoleSwitcher";
import { ExecutiveKpiSummary, ExecutiveTimePeriod } from "@/types/flowguard";

interface ExecutiveHeaderProps {
  kpis: ExecutiveKpiSummary | null;
  timePeriod: ExecutiveTimePeriod;
  onTimePeriodChange: (period: ExecutiveTimePeriod) => void;
  onOpenDefinitions: () => void;
  onRefresh: () => void;
  pageTitle?: string;
}

export const ExecutiveHeader: React.FC<ExecutiveHeaderProps> = ({
  kpis,
  timePeriod,
  onTimePeriodChange,
  onOpenDefinitions,
  onRefresh,
  pageTitle,
}) => {
  const periods: { id: ExecutiveTimePeriod; label: string; sub: string }[] = [
    { id: "TODAY", label: "Today", sub: "15 Sep" },
    { id: "7_DAYS", label: "7 Days", sub: "09–15 Sep" },
    { id: "30_DAYS", label: "30 Days", sub: "Month" },
  ];

  return (
    <div className="bg-white border-b border-[#E2E6EA] p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1B7A3D] text-white flex items-center justify-center shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-[#0F1B2B] tracking-tight">
                  {pageTitle ?? "Executive Control Plane"}
                </h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>FLOWGUARD: OPERATIONAL</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                  BOARDROOM VIEW
                </span>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                  SIMULATED OPERATIONAL DATA
                </span>
              </div>
              <p className="text-xs text-[#5C6B7A] mt-0.5 flex items-center gap-2">
                <span>
                  Verified turnaround compression, demurrage exposure mitigation &amp; capital
                  deployment ROI
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-[11px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>09:41 EAT • Live Closed-Loop Ingestion</span>
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 px-2 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Period:</span>
            </span>
            {periods.map((p) => {
              const isActive = timePeriod === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onTimePeriodChange(p.id)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all flex items-center gap-1 ${
                    isActive
                      ? "bg-white text-[#0F1B2B] shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>{p.label}</span>
                  <span
                    className={`text-[10px] font-mono ${
                      isActive ? "text-emerald-700 font-bold" : "text-slate-400"
                    }`}
                  >
                    ({p.sub})
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={onOpenDefinitions}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-all"
            title="Inspect executive metric definitions and formulas"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Metric Standards</span>
          </button>

          <button
            onClick={onRefresh}
            className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
            title="Refresh executive data"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <RoleSwitcher />
        </div>
      </div>

      <div className="rounded-lg bg-gradient-to-r from-[#0B1420] via-[#0F1B2B] to-[#152234] p-4 text-white flex flex-wrap items-center justify-between gap-4 shadow-sm border border-[#1C2C42]">
        <div className="space-y-1 max-w-3xl">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300">
              BOARDROOM OUTCOME SYNTHESIS
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-[10px] text-slate-300 font-mono">
              {kpis?.simulationPeriodLabel || "Last 30 Days • Consolidated Benchmark"}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-100 leading-snug">
            {kpis?.executiveNarrative ||
              "FlowGuard reduced modeled average depot turnaround by 35.6%, protected KES 14.82M in exposure, and successfully verified 46 of 50 autonomous interventions."}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-3.5 py-2 rounded-lg flex flex-col items-end text-right">
          <span className="text-[9px] uppercase font-mono tracking-wider text-emerald-300 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>STAGE-GATE RECOMMENDATION</span>
          </span>
          <span className="text-xs font-bold text-white mt-0.5">
            {kpis?.recommendation.headline || "PROCEED TO CONTROLLED MULTI-DEPOT PILOT"}
          </span>
        </div>
      </div>
    </div>
  );
};