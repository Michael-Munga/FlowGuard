"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import {
  X,
  Building,
  TrendingDown,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ArrowRight,
  Cpu,
  Layers,
  Fuel,
} from "lucide-react";
import { DepotExecutivePerformance } from "@/types/flowguard";

interface DepotPerformanceDrawerProps {
  depot: DepotExecutivePerformance | null;
  onClose: () => void;
}

export const DepotPerformanceDrawer: React.FC<DepotPerformanceDrawerProps> = ({
  depot,
  onClose,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!depot) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      clearTimeout(timer);
    };
  }, [depot, onClose]);

  if (!depot) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="depot-drawer-title"
    >
      <div
        className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 bg-[#0B1420] text-white flex items-center justify-between border-b border-[#1C2C42] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1B7A3D] text-white flex items-center justify-center font-bold font-mono">
              {depot.code}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="depot-drawer-title" className="text-base font-bold text-white tracking-tight">
                  {depot.depotName}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                  {depot.currentStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {depot.region} Region • {depot.volumeProcessedPct}% of KPC Network Volume
              </p>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={`Close ${depot.depotName} performance drawer`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* 1. Core Turnaround Dwell Outcome Strip */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
              Gate-to-Gate Turnaround Dwell Performance
            </span>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 rounded bg-white border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 font-mono block">Baseline</span>
                <span className="text-xl font-bold font-mono text-slate-700">
                  {depot.baselineTurnaroundMin}m
                </span>
              </div>

              <div className="p-2.5 rounded bg-white border border-emerald-300 shadow-2xs">
                <span className="text-[10px] text-emerald-800 font-mono block font-bold">FlowGuard</span>
                <span className="text-xl font-bold font-mono text-emerald-700">
                  {depot.currentTurnaroundMin}m
                </span>
              </div>

              <div className="p-2.5 rounded bg-[#0B1420] text-white shadow-2xs">
                <span className="text-[10px] text-emerald-400 font-mono block font-bold">Saved / Truck</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  -{depot.turnaroundRecoveredMin}m
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1">
              <span>Improvement relative to baseline:</span>
              <strong className="text-emerald-700 font-mono font-bold">
                {depot.turnaroundImprovementPct}% Faster
              </strong>
            </div>
          </div>

          {/* 2. Financial Value Protection Accounting */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Demurrage &amp; Exposure Accounting</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] uppercase font-mono text-emerald-800 font-bold block mb-1">
                  Modeled Exposure Protected
                </span>
                <span className="text-xl font-bold font-mono text-emerald-700 block">
                  KES {(depot.exposureProtectedKes / 1000000).toFixed(2)}M
                </span>
                <span className="text-[10px] text-emerald-800 mt-1 block">
                  Averted demurrage penalties
                </span>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <span className="text-[10px] uppercase font-mono text-blue-800 font-bold block mb-1">
                  Realized Value / Savings
                </span>
                <span className="text-xl font-bold font-mono text-blue-700 block">
                  KES {(depot.realizedSavingsKes / 1000000).toFixed(2)}M
                </span>
                <span className="text-[10px] text-blue-800 mt-1 block">
                  Observed gate-out verified
                </span>
              </div>
            </div>
          </div>

          {/* 3. Primary Bottleneck Analysis */}
          <div className="p-4 rounded-lg bg-amber-50/60 border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Primary Operating Bottleneck: {depot.topBottleneck}</span>
            </div>
            <p className="text-[11px] text-amber-950 leading-relaxed">
              FlowGuard continuously scans queue variance, loading position telemetry, and weighbridge ingress.
              When pressure is detected, autonomous sequencing re-orders queue priorities and routes eligible multi-compartment tankers to dual-arm positions.
            </p>
          </div>

          {/* 4. Autonomous Interventions Executed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>Autonomous Interventions at {depot.code}</span>
              </h4>
              <span className="font-mono text-[11px] font-bold text-slate-700">
                {depot.interventionsCount} Actions Recorded
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-[11px]">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <span className="font-bold text-slate-800">Queue Sequencing &amp; Dual-Hose Fast Track</span>
                <span className="text-emerald-700 font-bold font-mono">VERIFIED SUCCESS</span>
              </div>
              <p className="text-slate-600 leading-snug">
                Proactive reallocation diverted delayed customer orders before demurrage grace limits expired.
                Zero safety invariant breaches or unauthorized cross-product reallocations occurred.
              </p>
            </div>
          </div>

          {/* 5. Deterministic Guardrails Check */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
              Deterministic Safety Invariants Verified
            </span>
            <div className="space-y-1 text-[11px] text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Product integrity locked (PMS / AGO segregated arms)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Overfill &amp; ATG high-high alarms hard-interlocked</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Human supervisor sign-off enforced for L3 actions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <Link
            href={`/depot/live?depot=${depot.depotId}`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#1B7A3D] text-white text-xs font-semibold hover:bg-[#146030] transition-colors shadow-2xs"
          >
            <span>Open {depot.code} Terminal Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${depot.depotName} performance drawer`}
            className="px-4 py-2 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
