"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Cpu,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Lock,
  RotateCcw,
  Sliders,
  Database,
  FileCheck,
  Clock,
  HelpCircle,
} from "lucide-react";
import { RoleSwitcher } from "@/components/Navigation/RoleSwitcher";
import { DataSourceBadge } from "@/components/shared/DataSourceBadge";
import {
  AutonomyState,
  AutonomySubsystemHealth,
  AutonomyAggregateMetrics,
} from "@/types/flowguard";

interface AutonomyStatusBarProps {
  autonomyState: AutonomyState;
  subsystemHealth: AutonomySubsystemHealth | null;
  metrics: AutonomyAggregateMetrics | null;
  isDegradedMode: boolean;
  onToggleDegradedMode: () => void;
  onRefresh: () => void;
  activeSubView?: "all" | "decisions" | "history" | "health";
  onSelectSubView?: (subView: "all" | "decisions" | "history" | "health") => void;
  dataFreshnessSeconds?: number;
}

export const AutonomyStatusBar: React.FC<AutonomyStatusBarProps> = ({
  autonomyState,
  subsystemHealth,
  metrics,
  isDegradedMode,
  onToggleDegradedMode,
  onRefresh,
  activeSubView = "decisions",
  onSelectSubView,
  dataFreshnessSeconds = 4,
}) => {
  const [showSimInfo, setShowSimInfo] = useState(false);

  const getAutonomyBadge = () => {
    if (isDegradedMode) {
      return {
        bg: "bg-rose-50 text-rose-800 border-rose-300",
        dot: "bg-rose-500",
        label: "DEGRADED",
        sub: "Historical Baseline Fallback",
      };
    }
    switch (autonomyState) {
      case "AUTONOMOUS":
        return {
          bg: "bg-emerald-50 text-[#1B7A3D] border-emerald-300",
          dot: "bg-[#1B7A3D]",
          label: "ACTIVE",
          sub: "L2 Auto-Execution Enabled",
        };
      case "APPROVAL-GATED":
        return {
          bg: "bg-amber-50 text-amber-800 border-amber-300",
          dot: "bg-amber-500",
          label: "ATTENTION",
          sub: "Supervisor Sign-Off Required",
        };
      case "DEGRADED":
        return {
          bg: "bg-rose-50 text-rose-800 border-rose-300",
          dot: "bg-rose-500",
          label: "DEGRADED",
          sub: "Historical Baseline Fallback",
        };
      default:
        return {
          bg: "bg-slate-100 text-slate-700 border-slate-300",
          dot: "bg-slate-500",
          label: "ACTIVE",
          sub: "Bounded Autonomy Active",
        };
    }
  };

  const badge = getAutonomyBadge();

  return (
    <div className="bg-white border-b border-[#E2E6EA] sticky top-0 z-20 shadow-xs select-none">
      {/* 1. Top Telemetry & Control Strip */}
      <div className="px-6 py-2 border-b border-[#EDF1F5] flex flex-wrap items-center justify-between gap-2 bg-[#FAFBFC] text-xs">
        {/* Left: Organization Node & Portal Mode */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#5C6B7A]">
            <span className="w-2 h-2 rounded-full bg-[#1B7A3D]" />
            <span>KPC / EM-TECH AUTONOMOUS ENGINE</span>
            <span className="text-slate-300">•</span>
            <span className="font-bold text-[#0F1B2B]">CONTROL PLANE</span>
          </div>

          <span className="text-slate-300">|</span>

          {/* Autonomy State Pill */}
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${badge.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot} animate-pulse`} />
              <span>AUTONOMY: {badge.label}</span>
            </span>
          </div>

          {/* Data Source Mode Badge */}
          <DataSourceBadge />

          <span className="text-slate-300">|</span>

          {/* Transparent Simulated Badge */}
          <div className="relative hidden md:inline-flex items-center">
            <button
              onClick={() => setShowSimInfo(!showSimInfo)}
              className="inline-flex items-center gap-1 text-[10px] font-mono text-[#5C6B7A] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <span>SIMULATED OPERATIONAL DATA</span>
              <HelpCircle className="w-2.5 h-2.5 text-slate-400" />
            </button>

            {showSimInfo && (
              <div className="absolute left-0 top-6 z-50 w-80 p-3.5 bg-[#0B1420] text-slate-200 text-[11px] rounded-lg shadow-xl border border-slate-700 animate-in fade-in">
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800">
                  <span className="font-bold text-white uppercase text-[10px] tracking-wider">
                    Simulated Demonstration Telemetry
                  </span>
                  <button onClick={() => setShowSimInfo(false)} className="text-slate-400 hover:text-white">
                    ✕
                  </button>
                </div>
                <p className="leading-relaxed">
                  Decision states, telemetry and outcomes shown here are synthetic demonstration data representing the FlowGuard control model. They do not represent direct production access to KPC systems.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Freshness, Degraded Simulation & Role Switcher */}
        <div className="flex items-center gap-2">
          {/* Freshness counter */}
          <div className="flex items-center gap-1 text-[11px] text-[#8492A6] mr-1 hidden sm:flex">
            <Clock className="w-3 h-3" />
            <span>Updated {dataFreshnessSeconds}s ago</span>
          </div>

          {/* Degraded Mode Simulation Toggle */}
          <button
            onClick={onToggleDegradedMode}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer border ${
              isDegradedMode
                ? "bg-amber-500 text-white border-amber-600 shadow-2xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
            title="Simulate telemetry degradation on external arrival feeds to verify fail-safe fallback"
          >
            <AlertTriangle className={`w-3 h-3 ${isDegradedMode ? "text-white" : "text-amber-500"}`} />
            <span>{isDegradedMode ? "DEGRADED ACTIVE" : "SIMULATE DEGRADED"}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-white hover:bg-slate-50 border border-[#E2E6EA] text-[#5C6B7A] transition-all cursor-pointer"
            title="Refresh engine state"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Persistent Role Switcher */}
          <RoleSwitcher />
        </div>
      </div>

      {/* 2. Main Autonomous Control Header Area */}
      <div className="px-6 py-3.5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        {/* Left: Title, Subtitle, Key Operational Counts */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-[#0B1420] flex items-center justify-center text-emerald-400 shadow-xs shrink-0">
            <Sliders className="w-5 h-5" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-[#0F1B2B]">
                AUTONOMOUS CONTROL
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-[#0B1420] text-emerald-300 font-mono">
                ENGINE CONSOLE
              </span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                PROTOTYPE MODEL: {metrics?.modelVersion || "FG-TURNAROUND-SYNTH-v1.4"}
              </span>
            </div>

            {/* Subtitle & Key Decision Metrics */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-xs text-[#5C6B7A]">
              <span>Decision orchestration, bounded autonomy and closed-loop verification</span>
              <span className="text-slate-300">•</span>

              <div className="flex items-center gap-1">
                <span className="text-[#8492A6]">Active Decisions:</span>
                <strong className="text-[#0F1B2B] font-mono">1</strong>
              </div>
              <span className="text-slate-300">•</span>

              <div className="flex items-center gap-1">
                <span className="text-[#8492A6]">Executing:</span>
                <strong className="text-[#1B7A3D] font-mono font-bold">1</strong>
              </div>
              <span className="text-slate-300">•</span>

              <div className="flex items-center gap-1">
                <span className="text-[#8492A6]">Approval Required:</span>
                <strong className="text-amber-700 font-mono font-bold">1</strong>
              </div>
              <span className="text-slate-300">•</span>

              <div className="flex items-center gap-1">
                <span className="text-[#8492A6]">Verification Pending:</span>
                <strong className="text-blue-700 font-mono font-bold">1</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sub-View Navigation Tabs */}
        {onSelectSubView && (
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md border border-[#E2E6EA] text-xs self-start xl:self-center">
            <button
              onClick={() => onSelectSubView("decisions")}
              className={`px-3 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                activeSubView === "decisions" || activeSubView === "all"
                  ? "bg-white text-[#0F1B2B] shadow-2xs font-bold"
                  : "text-[#5C6B7A] hover:text-[#0F1B2B]"
              }`}
            >
              Active Decisions
            </button>
            <button
              onClick={() => onSelectSubView("history")}
              className={`px-3 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                activeSubView === "history"
                  ? "bg-white text-[#0F1B2B] shadow-2xs font-bold"
                  : "text-[#5C6B7A] hover:text-[#0F1B2B]"
              }`}
            >
              Decision History
            </button>
            <button
              onClick={() => onSelectSubView("health")}
              className={`px-3 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                activeSubView === "health"
                  ? "bg-white text-[#0F1B2B] shadow-2xs font-bold"
                  : "text-[#5C6B7A] hover:text-[#0F1B2B]"
              }`}
            >
              System &amp; Data Health
            </button>
          </div>
        )}
      </div>

      {/* Degraded Mode Alert Banner (When Activated) */}
      {isDegradedMode && (
        <div className="px-6 py-2.5 bg-amber-500/10 border-t border-amber-500/30 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">
              TELEMETRY DEGRADED: External arrival signals offline.
            </span>
            <span className="text-amber-800">
              FlowGuard operating under Historical Turnaround Baseline. Prediction confidence reduced to 74%. L2 actions downgraded to Approval-Gated.
            </span>
          </div>
          <button
            onClick={onToggleDegradedMode}
            className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline ml-4 cursor-pointer"
          >
            Restore Nominal Telemetry
          </button>
        </div>
      )}
    </div>
  );
};
