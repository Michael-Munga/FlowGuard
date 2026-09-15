"use client";

import React, { useState } from "react";
import {
  Search,
  Bell,
  RotateCw,
  FileText,
  AlertOctagon,
  Activity,
  Check,
} from "lucide-react";
import { PipelineLine } from "@/types/dashboard";

interface TopHeaderProps {
  pipelineLines: PipelineLine[];
  updatedSecondsAgo: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRefresh: () => void;
  onAcknowledgeAll: () => void;
  unreadAlertsCount: number;
  onOpenNotifications: () => void;
  onOpenShiftLog: () => void;
  isRefreshing?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  pipelineLines,
  updatedSecondsAgo,
  searchQuery,
  onSearchChange,
  onRefresh,
  onAcknowledgeAll,
  unreadAlertsCount,
  onOpenNotifications,
  onOpenShiftLog,
  isRefreshing = false,
}) => {
  const [ackedToast, setAckedToast] = useState(false);

  const handleAckClick = () => {
    onAcknowledgeAll();
    setAckedToast(true);
    setTimeout(() => setAckedToast(false), 2500);
  };

  return (
    <header className="bg-white border-b border-[#E2E6EA] px-5 py-3 sticky top-0 z-20 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        {/* Left: Title & Subtitle */}
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#0F1B2B] tracking-tight">
                Command Centre
              </h1>
              {/* LIVE Badge */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#1B7A3D]/10 border border-[#1B7A3D]/25">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1B7A3D] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1B7A3D]"></span>
                </span>
                <span className="text-[10px] font-bold text-[#1B7A3D] uppercase tracking-wider">
                  LIVE
                </span>
              </div>
              <span className="text-xs text-[#5C6B7A] font-medium hidden sm:inline">
                • Updated {updatedSecondsAgo}s ago
              </span>
            </div>
            <p className="text-xs text-[#5C6B7A] mt-0.5">
              Live downstream operations across all depots
            </p>
          </div>
        </div>

        {/* Middle: Pipeline Line Pills */}
        <div className="hidden lg:flex items-center gap-2">
          {pipelineLines.map((line) => (
            <div
              key={line.id}
              className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#FAFBFC] border border-[#E2E6EA] text-xs shadow-xs hover:border-[#cbd5e1] transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1B7A3D]" />
                <span className="font-semibold text-[#0F1B2B]">{line.name}</span>
                <span className="text-[#5C6B7A] text-[11px]">({line.fromTo})</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono">
                {line.flowRate}
              </span>
            </div>
          ))}
        </div>

        {/* Right: Search, Actions & Notification Icons */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-[#8492A6] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search trucks, depots, OMC..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAFBFC] border border-[#E2E6EA] rounded-md text-[#0F1B2B] placeholder-[#8492A6] focus:outline-none focus:ring-1 focus:ring-[#1B7A3D] focus:border-[#1B7A3D] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8492A6] hover:text-[#0F1B2B]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Shift Log Button */}
          <button
            onClick={onOpenShiftLog}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#0F1B2B] bg-white border border-[#E2E6EA] rounded-md hover:bg-[#F8FAFC] hover:border-[#cbd5e1] transition-colors shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-[#5C6B7A]" />
            <span>Shift Log</span>
          </button>

          {/* Red Acknowledge All Button */}
          <button
            onClick={handleAckClick}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#C0392B] hover:bg-[#a93226] active:scale-98 rounded-md transition-all shadow-xs"
          >
            {ackedToast ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Acknowledged!</span>
              </>
            ) : (
              <>
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Acknowledge All</span>
              </>
            )}
          </button>

          {/* Notification Bell with Badge */}
          <button
            onClick={onOpenNotifications}
            className="relative p-1.5 text-[#5C6B7A] hover:text-[#0F1B2B] hover:bg-[#F1F5F9] rounded-md transition-colors border border-[#E2E6EA] bg-white"
            title="System Alerts & Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#C0392B] text-white text-[9px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center border-2 border-white">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Refresh / Sync Button */}
          <button
            onClick={onRefresh}
            className={`p-1.5 text-[#5C6B7A] hover:text-[#0F1B2B] hover:bg-[#F1F5F9] rounded-md transition-colors border border-[#E2E6EA] bg-white ${
              isRefreshing ? "animate-spin text-[#1B7A3D]" : ""
            }`}
            title="Sync SCADA Telemetry Now"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
