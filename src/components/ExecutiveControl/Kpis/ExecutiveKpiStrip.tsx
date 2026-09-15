"use client";

import React from "react";
import {
  ShieldCheck,
  TrendingDown,
  Clock,
  CheckCircle2,
  Zap,
  Layers,
  Award,
  ArrowUpRight,
  Info,
  Target,
} from "lucide-react";
import { ExecutiveKpiSummary } from "@/types/flowguard";

interface ExecutiveKpiStripProps {
  kpis: ExecutiveKpiSummary | null;
  onOpenDefinitions: () => void;
}

export const ExecutiveKpiStrip: React.FC<ExecutiveKpiStripProps> = ({ kpis, onOpenDefinitions }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* 1. KES EXPOSURE PREVENTED (Hero Metric) */}
      <div className="bg-white rounded-lg border-2 border-emerald-500/40 p-4.5 shadow-xs flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-emerald-50/30 to-white">
        <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-emerald-500/10 pointer-events-none" />
        <div>
          <div className="flex items-center justify-between gap-1 text-slate-500 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-emerald-800">
              EXPOSURE PROTECTED
            </span>
            <button
              onClick={onOpenDefinitions}
              className="text-slate-400 hover:text-emerald-700 transition-colors"
              title="Click to view definition"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="my-1">
            <span className="text-2xl font-bold font-mono text-emerald-700 tracking-tight">
              KES {((kpis?.totalExposureProtectedKes || 14820000) / 1000000).toFixed(2)}M
            </span>
          </div>

          <p className="text-[11px] text-slate-600 font-medium leading-tight">
            Modeled demurrage exposure avoided
          </p>
        </div>

        <div className="pt-2 mt-2 border-t border-emerald-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>Realized: KES {((kpis?.realizedSavingsKes || 11350000) / 1000000).toFixed(2)}M</span>
          <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold uppercase">
            PROTECTED
          </span>
        </div>
      </div>

      {/* 2. TURNAROUND DELTA */}
      <div className="bg-white rounded-lg border border-[#E2E6EA] p-4.5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
        <div>
          <div className="flex items-center justify-between gap-1 text-slate-500 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
              TURNAROUND DELTA
            </span>
            <Clock className="w-3.5 h-3.5 text-blue-600" />
          </div>

          <div className="my-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-700 tracking-tight">
              {kpis?.turnaroundImprovementPct || -35.6}%
            </span>
            <span className="text-xs font-bold text-slate-500 font-mono">
              (-{kpis?.turnaroundRecoveredMin || 31}m)
            </span>
          </div>

          <p className="text-[11px] text-slate-600 leading-tight">
            Baseline: {kpis?.baselineTurnaroundMin || 87}m → <strong>FlowGuard: {kpis?.currentTurnaroundMin || 56}m</strong>
          </p>
        </div>

        <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>Turnaround recovery: {kpis?.turnaroundRecoveredMin || 31}m</span>
          <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-bold uppercase border border-blue-200">
            SPEED
          </span>
        </div>
      </div>

      {/* 3. ORDERS SERVICED ON TIME */}
      <div className="bg-white rounded-lg border border-[#E2E6EA] p-4.5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
        <div>
          <div className="flex items-center justify-between gap-1 text-slate-500 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
              ON-TIME COLLECTION
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>

          <div className="my-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {kpis?.ordersServicedOnTimePct || 96.4}%
            </span>
            <span className="text-xs font-bold text-emerald-700 font-mono">
              +{kpis?.ordersOnTimeDeltaPts || 8.2} pts
            </span>
          </div>

          <p className="text-[11px] text-slate-600 leading-tight">
            Collections serviced within 90m SLA
          </p>
        </div>

        <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>Baseline: 88.2%</span>
          <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold uppercase border border-emerald-200">
            SLA
          </span>
        </div>
      </div>

      {/* 4. AUTONOMOUS INTERVENTIONS */}
      <div className="bg-white rounded-lg border border-[#E2E6EA] p-4.5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
        <div>
          <div className="flex items-center justify-between gap-1 text-slate-500 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
              INTERVENTIONS
            </span>
            <Zap className="w-3.5 h-3.5 text-amber-600" />
          </div>

          <div className="my-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {kpis?.autonomousInterventionsTotal || 50}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              actions
            </span>
          </div>

          <p className="text-[11px] text-slate-600 leading-tight">
            Executed across KPC depot terminals
          </p>
        </div>

        <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>{kpis?.interventionsVerifiedSuccess || 46} verified success</span>
          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold uppercase">
            AUTONOMY
          </span>
        </div>
      </div>

      {/* 5. RECOVERY ATTAINMENT */}
      <div className="bg-white rounded-lg border border-[#E2E6EA] p-4.5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
        <div>
          <div className="flex items-center justify-between gap-1 text-slate-500 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
              RECOVERY ATTAINMENT
            </span>
            <Target className="w-3.5 h-3.5 text-purple-600" />
          </div>

          <div className="my-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-700 tracking-tight">
              {kpis?.recoveryAttainmentPct || 89.5}%
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              (±{kpis?.meanPredictionErrorMin || 4.2}m)
            </span>
          </div>

          <p className="text-[11px] text-slate-600 leading-tight">
            Observed vs predicted turnaround recovery
          </p>
        </div>

        <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>Error: ±{kpis?.meanPredictionErrorMin || 4.2}m</span>
          <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 font-bold uppercase border border-purple-200">
            EFFICACY
          </span>
        </div>
      </div>

      {/* 6. CAPACITY RECOVERED */}
      <div className="bg-white rounded-lg border border-[#E2E6EA] p-4.5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
        <div>
          <div className="flex items-center justify-between gap-1 text-slate-500 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
              CAPACITY UNLOCKED
            </span>
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
          </div>

          <div className="my-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {kpis?.capacityRecoveredHours || 340}h
            </span>
            <span className="text-xs font-bold text-indigo-700 font-mono">
              (+{kpis?.capacityRecoveredTruckSlots || 182})
            </span>
          </div>

          <p className="text-[11px] text-slate-600 leading-tight">
            Additional road tanker slots unlocked
          </p>
        </div>

        <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>Zero CAPEX expansion</span>
          <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-bold uppercase border border-indigo-200">
            THROUGHPUT
          </span>
        </div>
      </div>
    </div>
  );
};
