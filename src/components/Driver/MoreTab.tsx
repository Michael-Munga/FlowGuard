"use client";

import React from "react";
import {
  User,
  Truck,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  HelpCircle,
  Layers,
  Info,
  ChevronRight,
  Phone,
  FileCheck,
} from "lucide-react";
import { SyncState, DriverIssueReport } from "./types";

interface MoreTabProps {
  syncState: SyncState;
  lastSyncTime: string;
  pendingSyncQueue: DriverIssueReport[];
  submittedReports: DriverIssueReport[];
  currentStageNumber: number;
  totalStages: number;
  onToggleOffline: () => void;
  onTriggerSync: () => void;
  onOpenReportSheet: () => void;
  onOpenSyncSheet: () => void;
  onOpenDemoController: () => void;
}

export const MoreTab: React.FC<MoreTabProps> = ({
  syncState,
  lastSyncTime,
  pendingSyncQueue,
  submittedReports,
  currentStageNumber,
  totalStages,
  onToggleOffline,
  onTriggerSync,
  onOpenReportSheet,
  onOpenSyncSheet,
  onOpenDemoController,
}) => {
  return (
    <div className="space-y-4 pb-4">
      {/* 1. Driver Profile Card */}
      <div className="p-4 rounded-xl bg-[#0F1B2B] border border-[#1C2C42] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#1B7A3D] text-white flex items-center justify-center font-bold text-base shadow-sm">
            JM
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white">James Mwangi</h3>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase font-bold">
                VERIFIED
              </span>
            </div>
            <p className="text-xs text-slate-400">National ID: 24891002 • Class C/E</p>
            <p className="text-[11px] text-emerald-400 font-medium">Trans-Rift Hauliers Ltd (Contractor)</p>
          </div>
        </div>
      </div>

      {/* 2. Vehicle Details Card */}
      <div className="p-4 rounded-xl bg-[#0F1B2B] border border-[#1C2C42] space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">Assigned Tanker</h4>
          </div>
          <span className="text-[10px] font-mono text-slate-400">HAZCHEM Class 3</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded bg-[#152234] border border-[#243447]">
            <span className="text-[10px] font-mono text-slate-400 block">Prime Mover</span>
            <span className="font-bold text-white font-mono">KDD 412X</span>
          </div>
          <div className="p-2 rounded bg-[#152234] border border-[#243447]">
            <span className="text-[10px] font-mono text-slate-400 block">Semi-Trailer Tank</span>
            <span className="font-bold text-white font-mono">ZF 9102</span>
          </div>
          <div className="p-2 rounded bg-[#152234] border border-[#243447]">
            <span className="text-[10px] font-mono text-slate-400 block">Compartments</span>
            <span className="font-bold text-white font-mono">3 × 12,000L</span>
          </div>
          <div className="p-2 rounded bg-[#152234] border border-[#243447]">
            <span className="text-[10px] font-mono text-slate-400 block">Tare Weight</span>
            <span className="font-bold text-emerald-400 font-mono">14,820 KG</span>
          </div>
        </div>
      </div>

      {/* 3. Offline & Sync Diagnostics Center */}
      <div className="p-4 rounded-xl bg-[#0F1B2B] border border-[#1C2C42] space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            {syncState === "OFFLINE" ? (
              <WifiOff className="w-4 h-4 text-amber-400" />
            ) : (
              <Wifi className="w-4 h-4 text-emerald-400" />
            )}
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Offline &amp; Sync Status
            </h4>
          </div>

          <span
            className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
              syncState === "OFFLINE"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
            }`}
          >
            {syncState}
          </span>
        </div>

        <div className="text-xs space-y-1.5 text-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Last Successful Sync:</span>
            <span className="font-mono text-white font-bold">{lastSyncTime}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Cached Collection Data:</span>
            <span className="font-mono text-emerald-400 font-bold">LO-NBO-8821 (Available)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Pending Offline Queue:</span>
            <span className="font-mono text-amber-400 font-bold">{pendingSyncQueue.length} items</span>
          </div>
        </div>

        {/* Demo Toggle & Sync Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={onToggleOffline}
            className="py-2 px-2.5 rounded-lg bg-[#152234] hover:bg-[#1C2D44] border border-[#243447] text-slate-200 hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {syncState === "OFFLINE" ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>Go Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate Offline</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onTriggerSync}
            disabled={syncState === "OFFLINE"}
            className="py-2 px-2.5 rounded-lg bg-[#1B7A3D] hover:bg-[#1E8A45] disabled:opacity-50 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncState === "SYNCING" ? "animate-spin" : ""}`} />
            <span>Sync Now</span>
          </button>
        </div>
      </div>

      {/* 4. Action: Quick Issue Report Launcher */}
      <button
        type="button"
        onClick={onOpenReportSheet}
        className="w-full p-3.5 rounded-xl bg-gradient-to-r from-[#2B1B15] to-[#0F1B2B] border border-amber-500/40 text-left flex items-center justify-between transition-colors hover:border-amber-500/60 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Report Exception / Delay</h4>
            <p className="text-[11px] text-slate-400">Traffic, gate access, paperwork, or safety issue</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </button>

      {/* 5. Demo Journey Stepper Launcher (For Judges & Presenters) */}
      <button
        type="button"
        onClick={onOpenDemoController}
        className="w-full p-3.5 rounded-xl bg-[#0F1B2B] hover:bg-[#152234] border border-emerald-500/40 text-left flex items-center justify-between transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-white">Demo Scenario Stepper</h4>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                Stage {currentStageNumber}/{totalStages}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Step through all 7 collection stages for presentation</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </button>

      {/* 6. Depot Safety Standards Notice */}
      <div className="p-4 rounded-xl bg-[#0F1B2B] border border-[#1C2C42] space-y-2.5">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
          <ShieldCheck className="w-4 h-4" />
          <span>KPC Terminal Safety Requirements</span>
        </div>
        <ul className="text-[11px] text-slate-300 space-y-1.5 list-disc list-inside">
          <li>Speed limit strictly 15 km/h across all gantry and staging areas.</li>
          <li>Earth bonding clamp must be secured prior to top-hatch or bottom-valve coupling.</li>
          <li>Anti-static safety footwear and flame-retardant PPE mandatory.</li>
          <li>Mobile devices prohibited on loading racks (use only in cab when stopped).</li>
        </ul>
      </div>

      {/* 7. Support & KPC Terminal Contact */}
      <div className="p-4 rounded-xl bg-[#0F1B2B] border border-[#1C2C42] space-y-2 text-xs">
        <div className="flex items-center gap-2 text-white font-bold">
          <HelpCircle className="w-4 h-4 text-blue-400" />
          <span>Terminal Help &amp; Dispatch Desk</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Nairobi Terminal Operations Desk: <strong className="text-white font-mono">+254 20 289 7100</strong>
        </p>
        <p className="text-[11px] text-slate-400">
          Safety &amp; Fire Marshals Emergency Line: <strong className="text-amber-400 font-mono">EXT 999</strong>
        </p>
      </div>

      {/* 8. App Information & Synthetic Prototype Disclosure */}
      <div className="p-3 text-center space-y-1 text-[10px] text-slate-500">
        <p className="font-mono">FlowGuard Driver PWA • v2.4.0 (Hackathon Prototype)</p>
        <p>Collection instructions and timings reflect simulated operational data.</p>
      </div>
    </div>
  );
};
