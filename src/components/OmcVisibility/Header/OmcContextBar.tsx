"use client";

import React, { useState } from "react";
import {
  Building2,
  Radio,
  RefreshCw,
  ChevronDown,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Truck,
  CheckCircle2,
  HelpCircle,
  Calendar,
} from "lucide-react";
import { OmcProfile, OmcId, SystemHealth } from "@/types/flowguard";
import { RoleSwitcher } from "@/components/Navigation/RoleSwitcher";

interface OmcContextBarProps {
  omcProfile: OmcProfile;
  allOmcs: OmcProfile[];
  onSelectOmc: (omcId: OmcId) => void;
  health: SystemHealth;
  isSyncing: boolean;
  onRefresh: () => void;
  isLiveActive: boolean;
  onToggleLive: () => void;
  dataFreshnessSeconds: number;
  activeSubView?: "all" | "orders" | "outlook" | "notifications";
  onSelectSubView?: (subView: "all" | "orders" | "outlook" | "notifications") => void;
}

export const OmcContextBar: React.FC<OmcContextBarProps> = ({
  omcProfile,
  allOmcs,
  onSelectOmc,
  health,
  isSyncing,
  onRefresh,
  isLiveActive,
  onToggleLive,
  dataFreshnessSeconds,
  activeSubView = "all",
  onSelectSubView,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSimInfo, setShowSimInfo] = useState(false);

  const hasRisks = omcProfile.atRiskCount > 0;

  return (
    <div className="bg-white border-b border-[#E2E6EA] sticky top-0 z-20 shadow-xs select-none">
      {/* 1. Top Telemetry & Control Strip */}
      <div className="px-6 py-2 border-b border-[#EDF1F5] flex flex-wrap items-center justify-between gap-2 bg-[#FAFBFC] text-xs">
        {/* Left: Organization Node & Portal Mode */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#5C6B7A]">
            <span className="w-2 h-2 rounded-full bg-[#1B7A3D]" />
            <span>OMC COLLECTION DESK</span>
            <span className="text-slate-300">•</span>
            <span className="font-bold text-[#0F1B2B]">{omcProfile.accountCode}</span>
          </div>

          <span className="text-slate-300">|</span>

          {/* Autonomy Connection */}
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-[#1B7A3D] border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-[#1B7A3D]" />
              FLOWGUARD INTELLIGENCE FEED: ACTIVE
            </span>
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
                    Simulated Customer Stream
                  </span>
                  <button onClick={() => setShowSimInfo(false)} className="text-slate-400 hover:text-white">
                    ✕
                  </button>
                </div>
                <p className="leading-relaxed">
                  Collection milestones, arrival estimates, and gate-out predictions are synthesized from KPC loading models for demo verification without asserting live commercial ERP links.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Controls, Freshness & Role Switcher */}
        <div className="flex items-center gap-2">
          {/* Freshness counter */}
          <div className="flex items-center gap-1 text-[11px] text-[#8492A6] mr-1 hidden sm:flex">
            <Clock className="w-3 h-3" />
            <span>Updated {dataFreshnessSeconds}s ago</span>
          </div>

          {/* Live Pulse Toggle */}
          <button
            onClick={onToggleLive}
            title={isLiveActive ? "Pause simulated stream" : "Resume simulated stream"}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
              isLiveActive
                ? "bg-[#1B7A3D]/10 text-[#1B7A3D] hover:bg-[#1B7A3D]/20 border border-[#1B7A3D]/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
            }`}
          >
            <Radio className={`w-3 h-3 ${isLiveActive ? "animate-pulse text-[#1B7A3D]" : "text-slate-400"}`} />
            <span className="hidden sm:inline">{isLiveActive ? "STREAM ACTIVE" : "PAUSED"}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isSyncing}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-white hover:bg-slate-50 border border-[#E2E6EA] text-[#5C6B7A] transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin text-[#1B7A3D]" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Persistent Role Switcher */}
          <RoleSwitcher />
        </div>
      </div>

      {/* 2. Main OMC Header Area */}
      <div className="px-6 py-3.5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        {/* Left: Title, Subtitle, Customer Selector & Status */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 border bg-emerald-50 border-emerald-200 text-[#1B7A3D] shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-[#0F1B2B]">
                OMC COLLECTION VISIBILITY
              </h1>
              <span className="text-slate-300">•</span>

              {/* Customer / OMC Dropdown Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1.5 text-base font-bold text-[#1B7A3D] hover:text-[#145d2e] transition-colors focus:outline-hidden cursor-pointer"
                >
                  <span>{omcProfile.name}</span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute left-0 top-8 z-50 w-60 py-1 bg-white rounded-lg shadow-xl border border-[#E2E6EA] animate-in fade-in">
                    <span className="px-3 py-1 text-[9px] font-mono uppercase text-[#8492A6] font-bold block border-b border-[#EDF1F5]">
                      Switch Customer / OMC Context
                    </span>
                    {allOmcs.map((omc) => (
                      <button
                        key={omc.id}
                        onClick={() => {
                          onSelectOmc(omc.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-xs text-left flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                          omc.id === omcProfile.id ? "bg-emerald-50/60 font-bold text-[#1B7A3D]" : "text-[#0F1B2B]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              omc.atRiskCount > 0 ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                          />
                          <span>{omc.name}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">{omc.accountCode}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {omcProfile.accountCode}
              </span>
            </div>

            {/* Subtitle & Summary Metrics */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-xs text-[#5C6B7A]">
              <span>Collection status, arrival prediction and gate-out visibility</span>
              <span className="text-slate-300">•</span>

              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span className="text-[#0F1B2B] font-medium">Tue, 15 Sep 2026</span>
              </div>
              <span className="text-slate-300">•</span>

              <div className="flex items-center gap-1">
                <span className="text-[#8492A6]">Collections:</span>
                <strong className="text-[#0F1B2B] font-mono">{omcProfile.activeOrdersCount}</strong>
              </div>
              <span className="text-slate-300">•</span>

              <div className="flex items-center gap-1">
                <span className="text-[#8492A6]">At Risk:</span>
                <strong className={hasRisks ? "text-amber-800 font-mono font-bold" : "text-emerald-800 font-mono font-bold"}>
                  {omcProfile.atRiskCount}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right: OMC Quick Switcher Pills & Sub-View Tabs */}
        <div className="flex flex-col sm:items-end gap-2">
          {/* OMC Segmented Switcher Pills */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-[#E2E6EA]">
            {allOmcs.map((omc) => {
              const isSelected = omc.id === omcProfile.id;
              return (
                <button
                  key={omc.id}
                  onClick={() => onSelectOmc(omc.id)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#1B7A3D] text-white shadow-2xs"
                      : "text-slate-600 hover:text-black hover:bg-white/80"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      omc.atRiskCount > 0 ? "bg-amber-400" : "bg-emerald-400"
                    }`}
                  />
                  <span>{omc.shortName}</span>
                </button>
              );
            })}
          </div>

          {/* Sub-View Navigation Tabs */}
          {onSelectSubView && (
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md border border-[#E2E6EA] text-xs">
              <button
                onClick={() => onSelectSubView("orders")}
                className={`px-3 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  activeSubView === "orders" || activeSubView === "all"
                    ? "bg-white text-[#0F1B2B] shadow-2xs font-bold"
                    : "text-[#5C6B7A] hover:text-[#0F1B2B]"
                }`}
              >
                Active Orders
              </button>
              <button
                onClick={() => onSelectSubView("outlook")}
                className={`px-3 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  activeSubView === "outlook"
                    ? "bg-white text-[#0F1B2B] shadow-2xs font-bold"
                    : "text-[#5C6B7A] hover:text-[#0F1B2B]"
                }`}
              >
                Collection Outlook
              </button>
              <button
                onClick={() => onSelectSubView("notifications")}
                className={`px-3 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  activeSubView === "notifications"
                    ? "bg-white text-[#0F1B2B] shadow-2xs font-bold"
                    : "text-[#5C6B7A] hover:text-[#0F1B2B]"
                }`}
              >
                Notifications
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
