"use client";

import React, { useEffect, useRef } from "react";
import {
  X,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  Clock,
  Database,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { SyncState, DriverIssueReport } from "./types";

interface OfflineSyncSheetProps {
  isOpen: boolean;
  onClose: () => void;
  syncState: SyncState;
  lastSyncTime: string;
  pendingSyncQueue: DriverIssueReport[];
  onToggleOffline: () => void;
  onTriggerSync: () => void;
}

export const OfflineSyncSheet: React.FC<OfflineSyncSheetProps> = ({
  isOpen,
  onClose,
  syncState,
  lastSyncTime,
  pendingSyncQueue,
  onToggleOffline,
  onTriggerSync,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex flex-col justify-end animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sync-sheet-title"
    >
      <div
        className="w-full max-w-md mx-auto bg-[#0B1420] border-t border-slate-700 rounded-t-2xl shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#152234] border border-[#243447] flex items-center justify-center text-emerald-400">
              {syncState === "OFFLINE" ? <WifiOff className="w-4 h-4 text-amber-400" /> : <Wifi className="w-4 h-4" />}
            </div>
            <div>
              <h3 id="sync-sheet-title" className="text-sm font-bold text-white">
                Network &amp; Local Cache Synchronization
              </h3>
              <p className="text-[11px] text-slate-400">PWA Offline-First Data Engine</p>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close sync status sheet"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current State Strip */}
        <div className="p-3.5 rounded-xl bg-[#0F1B2B] border border-[#1C2C42] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Active Network State:</span>
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                syncState === "OFFLINE"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
              }`}
            >
              {syncState}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="text-slate-400">Last Telemetry Ingestion:</span>
            <span className="font-mono text-white font-bold">{lastSyncTime}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="text-slate-400">Pending Actions in Queue:</span>
            <span className="font-mono text-amber-400 font-bold">{pendingSyncQueue.length} items</span>
          </div>
        </div>

        {/* Cached Data Status */}
        <div className="p-3.5 rounded-xl bg-[#0F1B2B] border border-[#1C2C42] space-y-2 text-xs">
          <h4 className="font-bold text-white uppercase font-mono text-[11px] flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Locally Cached Assets</span>
          </h4>
          <div className="space-y-1 text-slate-300 text-[11px]">
            <div className="flex items-center justify-between">
              <span>Collection Manifest (LO-NBO-8821):</span>
              <span className="text-emerald-400 font-mono">AVAILABLE (Cached)</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Latest Acknowledged Instruction:</span>
              <span className="text-emerald-400 font-mono">LOCKED</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Depot Speed &amp; Safety Protocols:</span>
              <span className="text-emerald-400 font-mono">OFFLINE-READY</span>
            </div>
          </div>
        </div>

        {/* Pending Queue List (If Any) */}
        {pendingSyncQueue.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-amber-300 uppercase font-mono">
              Pending Queue ({pendingSyncQueue.length})
            </h4>
            <div className="space-y-1.5">
              {pendingSyncQueue.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-white">{item.category}</span>
                    <span className="text-[10px] text-amber-300/80 block">{item.subReason || item.notes || "Report"}</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                    PENDING SYNC
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={onToggleOffline}
            className="py-3 px-3 rounded-xl bg-[#152234] hover:bg-[#1B2B40] border border-[#23354C] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {syncState === "OFFLINE" ? (
              <>
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span>Simulate Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-amber-400" />
                <span>Simulate Offline</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onTriggerSync}
            disabled={syncState === "OFFLINE"}
            className="py-3 px-3 rounded-xl bg-[#1B7A3D] hover:bg-[#1E8A45] disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
          >
            <RefreshCw className={`w-4 h-4 ${syncState === "SYNCING" ? "animate-spin" : ""}`} />
            <span>Force Sync Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
