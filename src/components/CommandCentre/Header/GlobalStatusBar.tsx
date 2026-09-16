"use client";

import React from "react";
import {
  RotateCw,
  Cpu,
  Radio,
  Clock,
  AlertTriangle,
  Zap,
  Shield,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { SystemHealth } from "@/types/flowguard";
import { RoleSwitcher } from "@/components/Navigation/RoleSwitcher";
import { DataSourceBadge } from "@/components/shared/DataSourceBadge";

interface GlobalStatusBarProps {
  health: SystemHealth;
  approvalRequiredCount: number;
  isSyncing: boolean;
  onRefresh: () => void;
  onToggleDegradedMode: () => void;
  isLiveActive: boolean;
  onToggleLive: () => void;
}

export const GlobalStatusBar: React.FC<GlobalStatusBarProps> = ({
  health,
  approvalRequiredCount,
  isSyncing,
  onRefresh,
  onToggleDegradedMode,
  isLiveActive,
  onToggleLive,
}) => {
  const getSystemState = () => {
    if (health.degradedModeActive) {
      return {
        label: "DEGRADED MODE",
        bg: "bg-amber-50 text-[#B7791F] border-amber-200",
        dot: "bg-[#B7791F]",
      };
    }
    if (approvalRequiredCount > 0) {
      return {
        label: "ATTENTION",
        bg: "bg-amber-50 text-amber-800 border-amber-300",
        dot: "bg-amber-600",
      };
    }
    return {
      label: "NORMAL",
      bg: "bg-emerald-50 text-[#1B7A3D] border-emerald-200",
      dot: "bg-[#1B7A3D]",
    };
  };

  const state = getSystemState();

  return (
    <header className="bg-white border-b border-[#E2E6EA] px-6 py-3 sticky top-0 z-20 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Degraded Mode Safety Alert Banner if active */}
      {health.degradedModeActive && (
        <div className="mb-2 p-2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-950 flex items-center justify-between text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="font-semibold">
              SCADA DEGRADED DIAGNOSTIC MODE:
            </span>
            <span className="text-amber-900">
              External arrival signal unavailable. Using historical velocity baseline model.
            </span>
          </div>
          <button
            onClick={onToggleDegradedMode}
            className="text-[10px] font-bold uppercase tracking-wider text-amber-900 underline hover:text-amber-950"
          >
            Re-engage Primary Telemetry
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Title, Subtitle, State & Compact Simulated Label */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg font-bold text-[#0F1B2B] tracking-tight">
                NETWORK COMMAND CENTRE
              </h1>

              {/* Current System State (NORMAL / ATTENTION / DEGRADED MODE) */}
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${state.bg}`}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${state.dot}`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-1.5 w-1.5 ${state.dot}`}
                  />
                </span>
                <span>{state.label}</span>
              </div>

              {/* Data Source Connection Badge */}
              <DataSourceBadge />
            </div>

            <p className="text-[11px] text-[#5C6B7A] mt-0.5">
              Network-wide operational prediction, risk detection and autonomous intervention.
            </p>
          </div>
        </div>

        {/* Middle: Autonomy State & Synchronization Freshness */}
        <div className="hidden xl:flex items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FAFBFC] border border-[#E2E6EA]">
            <Zap className="w-3.5 h-3.5 text-[#1B7A3D]" />
            <span className="text-[11px] font-semibold text-[#0F1B2B]">
              AUTONOMY: ENGAGED
            </span>
            <span className="text-[10px] text-[#1B7A3D] font-bold px-1.5 py-0.2 bg-emerald-50 rounded border border-emerald-200">
              L2 AUTO-EXECUTE
            </span>
          </div>

          {approvalRequiredCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-900 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-[#B7791F]" />
              <span className="text-[11px] font-bold">
                Approval Required: {approvalRequiredCount}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FAFBFC] border border-[#E2E6EA] text-[#5C6B7A]">
            <Radio className="w-3.5 h-3.5 text-[#1B7A3D]" />
            <span className="text-[11px] font-medium text-[#0F1B2B]">Sync:</span>
            <span className="font-mono text-[10px] text-[#1B7A3D] font-bold">
              {health.dataFreshnessSeconds}s ago
            </span>
          </div>
        </div>

        {/* Right: Controls, Toggles & Persistent Role Switcher */}
        <div className="flex items-center gap-2">
          {/* Degraded Mode Diagnostic Toggle */}
          <button
            onClick={onToggleDegradedMode}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all border ${
              health.degradedModeActive
                ? "bg-amber-100 text-amber-900 border-amber-300"
                : "bg-white text-[#5C6B7A] border-[#E2E6EA] hover:bg-slate-50"
            }`}
            title="Simulate external signal outage & fallback to historical velocity"
          >
            {health.degradedModeActive ? "Exit Degraded" : "Simulate Degraded"}
          </button>

          {/* Live Simulation Stream Pause/Resume Toggle */}
          <button
            onClick={onToggleLive}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all flex items-center gap-1.5 border ${
              isLiveActive
                ? "bg-emerald-50 text-[#1B7A3D] border-emerald-200"
                : "bg-slate-100 text-slate-600 border-slate-300"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isLiveActive ? "bg-[#1B7A3D]" : "bg-slate-400"}`} />
            <span>{isLiveActive ? "Stream Active" : "Stream Paused"}</span>
          </button>

          {/* Manual Telemetry Sync */}
          <button
            onClick={onRefresh}
            className={`p-1.5 rounded border border-[#E2E6EA] bg-white text-[#5C6B7A] hover:text-[#0F1B2B] hover:bg-slate-50 transition-colors shadow-2xs ${
              isSyncing ? "animate-spin text-[#1B7A3D]" : ""
            }`}
            title="Sync SCADA Telemetry Now"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Persistent Role Switcher */}
          <RoleSwitcher />
        </div>
      </div>
    </header>
  );
};
