"use client";

import React, { useState } from "react";
import Link from "next/navigation";
import {
  Building,
  Radio,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Sliders,
  ChevronDown,
  Gauge,
  Layers,
  HelpCircle,
  Truck,
  Activity,
} from "lucide-react";
import { Depot, DepotId, SystemHealth } from "@/types/flowguard";
import { RoleSwitcher } from "@/components/Navigation/RoleSwitcher";

interface DepotContextBarProps {
  depot: Depot;
  allDepots: Depot[];
  onSelectDepot: (depotId: DepotId) => void;
  health: SystemHealth;
  isSyncing: boolean;
  onRefresh: () => void;
  onToggleDegradedMode: () => void;
  isLiveActive: boolean;
  onToggleLive: () => void;
  activeSubView?: "all" | "live" | "capacity" | "forecast";
  onSelectSubView?: (subView: "all" | "live" | "capacity" | "forecast") => void;
}

export const DepotContextBar: React.FC<DepotContextBarProps> = ({
  depot,
  allDepots,
  onSelectDepot,
  health,
  isSyncing,
  onRefresh,
  onToggleDegradedMode,
  isLiveActive,
  onToggleLive,
  activeSubView = "all",
  onSelectSubView,
}) => {
  const [showSimInfo, setShowSimInfo] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isCritical = depot.riskLevel === "CRITICAL";
  const isHigh = depot.riskLevel === "HIGH";
  const isMedium = depot.riskLevel === "MEDIUM";

  // Map risk level to explicit operational state
  const operationalStateLabel = isCritical
    ? "CRITICAL"
    : isHigh
    ? "AT RISK"
    : isMedium
    ? "WATCH"
    : "NORMAL";

  const getOperationalStatePill = () => {
    switch (operationalStateLabel) {
      case "CRITICAL":
        return "bg-rose-100 text-rose-800 border-rose-300 font-extrabold animate-pulse";
      case "AT RISK":
        return "bg-amber-100 text-amber-900 border-amber-300 font-bold";
      case "WATCH":
        return "bg-blue-100 text-blue-900 border-blue-300 font-semibold";
      case "NORMAL":
      default:
        return "bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold";
    }
  };

  return (
    <div className="bg-white border-b border-[#E2E6EA] sticky top-0 z-20 shadow-xs select-none">
      {/* 1. Top Telemetry & Control Strip */}
      <div className="px-6 py-2 border-b border-[#EDF1F5] flex flex-wrap items-center justify-between gap-2 bg-[#FAFBFC] text-xs">
        {/* Left: Terminal Node & Autonomy Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#5C6B7A]">
            <span className="w-2 h-2 rounded-full bg-[#1B7A3D]" />
            <span className="font-semibold text-[#0F1B2B]">KPC DEPOT OPERATIONS</span>
            <span className="text-slate-300">•</span>
            <span className="font-bold text-[#1B7A3D]">{depot.code}</span>
          </div>

          <span className="text-slate-300">|</span>

          {/* Autonomy Badge */}
          <div className="flex items-center gap-1.5">
            {health.degradedModeActive ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-300">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                DEGRADED FALLBACK MODE
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-[#1B7A3D] border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-[#1B7A3D]" />
                AUTONOMY: L2 BOUNDED
              </span>
            )}
          </div>

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
              <div className="absolute left-0 top-6 z-50 w-72 p-3 bg-[#0B1420] text-slate-200 text-[11px] rounded-lg shadow-xl border border-slate-700 animate-in fade-in">
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800">
                  <span className="font-bold text-white uppercase text-[10px] tracking-wider">
                    Simulated Telemetry Source
                  </span>
                  <button onClick={() => setShowSimInfo(false)} className="text-slate-400 hover:text-white">
                    ✕
                  </button>
                </div>
                <p className="leading-relaxed">
                  Terminal signals, Coriolis flow rates, tare scale dwell, and bay occupancy are synthesized from KPC operational constraints for hackathon validation without live SCADA credentials.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Controls & Persistent Role Switcher */}
        <div className="flex items-center gap-2">
          {/* Live Stream Pulse */}
          <button
            onClick={onToggleLive}
            title={isLiveActive ? "Pause simulated telemetry" : "Resume simulated telemetry"}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              isLiveActive
                ? "bg-[#1B7A3D]/10 text-[#1B7A3D] hover:bg-[#1B7A3D]/20 border border-[#1B7A3D]/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
            }`}
          >
            <Radio className={`w-3 h-3 ${isLiveActive ? "animate-pulse text-[#1B7A3D]" : "text-slate-400"}`} />
            <span className="hidden sm:inline">{isLiveActive ? "TELEMETRY ACTIVE" : "PAUSED"}</span>
          </button>

          {/* Sync Button */}
          <button
            onClick={onRefresh}
            disabled={isSyncing}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-white hover:bg-slate-50 border border-[#E2E6EA] text-[#5C6B7A] transition-all"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin text-[#1B7A3D]" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Degraded Mode Toggle */}
          <button
            onClick={onToggleDegradedMode}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium border transition-all ${
              health.degradedModeActive
                ? "bg-rose-50 text-rose-800 border-rose-300 font-bold"
                : "bg-white hover:bg-slate-50 border-[#E2E6EA] text-[#5C6B7A]"
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span className="hidden sm:inline">{health.degradedModeActive ? "Exit Degraded" : "Simulate Degraded"}</span>
          </button>

          {/* Persistent Role Switcher */}
          <RoleSwitcher />
        </div>
      </div>

      {/* 2. Main Depot Context Bar */}
      <div className="px-6 py-3.5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        {/* Left: Title, Depot Dropdown & Operational State */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 border ${
              isCritical
                ? "bg-rose-50 border-rose-200 text-rose-700"
                : isHigh
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : "bg-emerald-50 border-emerald-200 text-emerald-700"
            }`}
          >
            <Building className="w-5 h-5" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#5C6B7A]">
                DEPOT OPERATIONS
              </span>
              <span className="text-slate-300">•</span>

              {/* Selected Depot Dropdown Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1.5 text-lg font-bold text-[#0F1B2B] hover:text-[#1B7A3D] transition-colors focus:outline-hidden"
                >
                  <span>{depot.name}</span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute left-0 top-8 z-50 w-56 py-1 bg-white rounded-lg shadow-xl border border-[#E2E6EA] animate-in fade-in">
                    <span className="px-3 py-1 text-[9px] font-mono uppercase text-[#8492A6] font-bold block border-b border-[#EDF1F5]">
                      Switch KPC Terminal Context
                    </span>
                    {allDepots.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => {
                          onSelectDepot(d.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-xs text-left flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          d.id === depot.id ? "bg-emerald-50/60 font-bold text-[#1B7A3D]" : "text-[#0F1B2B]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              d.riskLevel === "CRITICAL"
                                ? "bg-rose-500"
                                : d.riskLevel === "HIGH"
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                          />
                          <span>{d.name}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">{d.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Operational State Pill */}
              <span className={`text-[11px] px-2.5 py-0.5 rounded uppercase tracking-wide border ${getOperationalStatePill()}`}>
                {operationalStateLabel}
              </span>
            </div>

            {/* Quick Orientation Strip */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-[#5C6B7A]">
              <div className="flex items-center gap-1">
                <span className="text-[#8492A6]">Trucks inside:</span>
                <strong className="text-[#0F1B2B] font-mono font-bold">{depot.trucksInside}</strong>
              </div>
              <span className="text-slate-300">•</span>

              <div className="flex items-center gap-1">
                <span className="text-[#8492A6]">Expected collection demand:</span>
                <strong className="text-[#0F1B2B] font-mono font-bold">{depot.expectedDemandNext90Min}</strong>
              </div>
              <span className="text-slate-300">•</span>

              <div className="flex items-center gap-1">
                <span className="text-[#8492A6]">Effective capacity:</span>
                <strong className="text-[#1B7A3D] font-mono font-bold">
                  {depot.usableLoadingPositions}/{depot.totalPhysicalPositions} usable bays
                </strong>
              </div>
              <span className="text-slate-300">•</span>

              <div className="flex items-center gap-1">
                <span className="text-[#8492A6]">Predicted avg turnaround:</span>
                <strong className="text-[#0F1B2B] font-mono font-bold">
                  {depot.predictedTurnaroundMin || 71} min
                </strong>
              </div>
              <span className="text-slate-300">•</span>

              <span className="font-mono text-[10px] text-[#8492A6]">
                Data freshness: {health.dataFreshnessSeconds}s ago
              </span>
            </div>
          </div>
        </div>

        {/* Right: 5-Depot Quick Pills & Workspace Sub-View Tabs */}
        <div className="flex flex-col sm:items-end gap-2">
          {/* 5-Depot Segmented Switcher */}
          <div className="flex items-center p-1 bg-[#0F1B2B] rounded-lg border border-[#152234] shadow-xs">
            {allDepots.map((d) => {
              const isSelected = d.id === depot.id;

              return (
                <button
                  key={d.id}
                  onClick={() => onSelectDepot(d.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#1B7A3D] text-white shadow-xs"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      d.riskLevel === "CRITICAL"
                        ? "bg-rose-400 animate-pulse"
                        : d.riskLevel === "HIGH"
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                    }`}
                  />
                  <span>{d.name.split(" ")[0]}</span>
                  <span
                    className={`text-[9px] font-mono px-1 py-0.2 rounded ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {d.code}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sub-View Navigation Tabs */}
          {onSelectSubView && (
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md border border-[#E2E6EA] text-xs">
              <button
                onClick={() => onSelectSubView("live")}
                className={`px-3 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  activeSubView === "live" || activeSubView === "all"
                    ? "bg-white text-[#0F1B2B] shadow-2xs font-bold"
                    : "text-[#5C6B7A] hover:text-[#0F1B2B]"
                }`}
              >
                Live Yard
              </button>
              <button
                onClick={() => onSelectSubView("capacity")}
                className={`px-3 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  activeSubView === "capacity"
                    ? "bg-white text-[#0F1B2B] shadow-2xs font-bold"
                    : "text-[#5C6B7A] hover:text-[#0F1B2B]"
                }`}
              >
                Capacity & Equipment
              </button>
              <button
                onClick={() => onSelectSubView("forecast")}
                className={`px-3 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  activeSubView === "forecast"
                    ? "bg-white text-[#0F1B2B] shadow-2xs font-bold"
                    : "text-[#5C6B7A] hover:text-[#0F1B2B]"
                }`}
              >
                Forecast & Actions
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
