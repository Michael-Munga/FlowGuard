"use client";

import React from "react";
import { Fuel, Wifi, WifiOff, RefreshCw, Bell, Layers } from "lucide-react";
import { RoleSwitcher } from "@/components/Navigation/RoleSwitcher";
import { SyncState, DriverTab } from "./types";

interface DriverTopBarProps {
  syncState: SyncState;
  lastSyncTime: string;
  pendingCount: number;
  unreadCount: number;
  currentStageNumber: number;
  totalStages: number;
  activeTab: DriverTab;
  onSelectTab: (tab: DriverTab) => void;
  onOpenSyncSheet: () => void;
  onOpenDemoController: () => void;
  driverRegistration?: string;
}

export const DriverTopBar: React.FC<DriverTopBarProps> = ({
  syncState,
  lastSyncTime,
  pendingCount,
  unreadCount,
  currentStageNumber,
  totalStages,
  activeTab,
  onSelectTab,
  onOpenSyncSheet,
  onOpenDemoController,
  driverRegistration,
}) => {
  const getSyncBadge = () => {
    switch (syncState) {
      case "ONLINE":
        return {
          icon: <Wifi className="w-3 h-3 text-emerald-400" />,
          label: "ONLINE",
          sub: lastSyncTime.split(" ")[0],
          bg: "bg-emerald-500/10 border-emerald-500/25 text-emerald-300",
        };
      case "SYNCING":
        return {
          icon: <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />,
          label: "SYNCING",
          sub: "Updating...",
          bg: "bg-blue-500/10 border-blue-500/25 text-blue-300",
        };
      case "OFFLINE":
        return {
          icon: <WifiOff className="w-3 h-3 text-amber-400" />,
          label: "OFFLINE",
          sub: pendingCount > 0 ? `${pendingCount} queue` : "Cached",
          bg: "bg-amber-500/15 border-amber-500/30 text-amber-300",
        };
      case "SYNC COMPLETE":
        return {
          icon: <Wifi className="w-3 h-3 text-emerald-400" />,
          label: "SYNCED",
          sub: "Just now",
          bg: "bg-emerald-500/10 border-emerald-500/25 text-emerald-300",
        };
      default:
        return {
          icon: <Wifi className="w-3 h-3 text-slate-400" />,
          label: "CONNECTED",
          sub: lastSyncTime,
          bg: "bg-slate-800 text-slate-300",
        };
    }
  };

  const syncInfo = getSyncBadge();

  return (
    <header className="px-3.5 py-2.5 bg-[#0B1420] border-b border-slate-800 sticky top-0 z-30 flex flex-col gap-2 shrink-0">
      {/* Top Line: Brand, Sync Pill, Unread Notifications, and Role Switcher */}
      <div className="flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1B7A3D] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Fuel className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-tight">
                FlowGuard Driver
              </span>
              <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PWA
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Nairobi Terminal</span>
            </div>
          </div>
        </div>

        {/* Action controls right */}
        <div className="flex items-center gap-1.5">
          {/* Sync Status Button */}
          <button
            type="button"
            onClick={onOpenSyncSheet}
            aria-label="View network connectivity and sync status"
            className={`px-2 py-1 rounded-md border text-[10px] font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${syncInfo.bg}`}
          >
            {syncInfo.icon}
            <span className="hidden xs:inline">{syncInfo.label}</span>
            <span className="text-[9px] opacity-75 font-normal">({syncInfo.sub})</span>
          </button>

          {/* Unread Updates Notification Button */}
          <button
            type="button"
            onClick={() => onSelectTab("UPDATES")}
            aria-label={`View updates (${unreadCount} unacknowledged)`}
            className="relative p-1.5 rounded-md bg-[#152234] border border-[#243447] text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center justify-center font-mono">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Role Switcher for Hackathon Judges */}
          <div className="shrink-0 scale-90 origin-right">
            <RoleSwitcher />
          </div>
        </div>
      </div>

      {/* Secondary Quick-Access Strip: Demo Journey Stepper trigger */}
      <div className="flex items-center justify-between bg-[#111C2B] px-2.5 py-1 rounded-md border border-[#1E2E44] text-[10px]">
        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="text-emerald-400 font-bold font-mono">ORDER:</span>
          <span className="font-mono text-white font-semibold">LO-NBO-8821</span>
          <span className="text-slate-500">•</span>
          <span className="text-amber-300 font-mono">36kL AGO</span>
        </div>

        {/* Demo Stage Switcher Pill */}
        <button
          type="button"
          onClick={onOpenDemoController}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 font-mono text-[9px] font-bold cursor-pointer transition-colors"
        >
          <Layers className="w-2.5 h-2.5" />
          <span>Stage {currentStageNumber}/{totalStages}</span>
          <span className="text-slate-400">▾</span>
        </button>
      </div>
    </header>
  );
};
