"use client";

import React from "react";
import {
  Truck,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Zap,
  Radio,
  Navigation,
} from "lucide-react";
import { JourneyStageConfig, SyncState, DriverUpdate, DriverTab } from "./types";

interface HomeTabProps {
  currentStage: JourneyStageConfig;
  isInstructionAcknowledged: boolean;
  instructionAcknowledgedAt: string | null;
  onAcknowledgeInstruction: () => void;
  syncState: SyncState;
  lastSyncTime: string;
  recentUpdate?: DriverUpdate;
  onOpenReportSheet: () => void;
  onSelectTab: (tab: DriverTab) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  currentStage,
  isInstructionAcknowledged,
  instructionAcknowledgedAt,
  onAcknowledgeInstruction,
  syncState,
  recentUpdate,
  onOpenReportSheet,
  onSelectTab,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
      case "OPTIMIZED":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "AT RISK":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "LOADING":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "GATE-OUT READY":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      default:
        return "bg-slate-700/50 text-slate-300 border-slate-600";
    }
  };

  return (
    <div className="space-y-3.5 pb-2">
      {syncState === "OFFLINE" && (
        <div className="p-3 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <strong className="font-semibold block text-amber-300">OFFLINE MODE</strong>
            Cached data in use. Updates will synchronize when connectivity returns.
          </div>
        </div>
      )}

      <div className="px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Use app only when safely stopped. Depot speed limit: 15 km/h.</span>
        </div>
        <span className="text-[10px] font-mono text-slate-500 shrink-0">SOP #10</span>
      </div>

      <div className="p-3.5 rounded-xl bg-[#0F1B2B] border border-[#1C2C42] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-[#152234] border border-[#243447] flex items-center justify-center text-emerald-400 shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold font-mono text-white">KDD 412X</span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase font-bold ${getStatusBadge(
                  currentStage.collectionStatus
                )}`}
              >
                {currentStage.collectionStatus}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Vivo Energy • Order{" "}
              <strong className="font-mono text-slate-300">LO-NBO-8821</strong>
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[9px] font-mono uppercase text-slate-400 block">Product</span>
          <span className="text-xs font-bold text-amber-400 font-mono">36,000L AGO</span>
        </div>
      </div>

      {/* NEXT ACTION HERO */}
      <div className="p-5 rounded-2xl bg-gradient-to-b from-[#112318] via-[#0D1826] to-[#0A131F] border-2 border-emerald-500/60 shadow-xl space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>NEXT ACTION</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            Stage {currentStage.stepNumber} of 7
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider block font-semibold">
            Immediate Field Instruction:
          </span>
          <h1 className="text-xl font-black tracking-tight text-white mt-0.5 leading-tight">
            {currentStage.nextActionTitle}
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-medium">
            {currentStage.nextActionSubtitle}
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-[#142234]/80 border border-[#23354C] flex items-center gap-2 text-xs font-semibold text-emerald-300">
          <span className="w-4 h-4 flex items-center justify-center text-emerald-400 shrink-0">
            ●
          </span>
          <span className="leading-snug">{currentStage.nextActionLocation}</span>
        </div>

        <p className="text-[11px] text-slate-400 leading-normal">
          {currentStage.nextActionGuidance}
        </p>

        {currentStage.requiresAcknowledgement && !isInstructionAcknowledged ? (
          <button
            type="button"
            onClick={onAcknowledgeInstruction}
            className="w-full min-h-[50px] py-3.5 px-4 rounded-xl bg-[#1B7A3D] hover:bg-[#1E8A45] active:scale-[0.98] text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>ACKNOWLEDGE INSTRUCTION</span>
          </button>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>INSTRUCTION ACKNOWLEDGED</span>
            </div>
            <span className="font-mono text-[11px] text-emerald-200">
              {instructionAcknowledgedAt || "10:14 EAT"}
            </span>
          </div>
        )}
      </div>

      {currentStage.isRecovering && (
        <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-emerald-300 block">RECOVERING</span>
              <span className="text-[11px] text-emerald-400/90">{currentStage.recoveryNote}</span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase shrink-0">
            VERIFIED
          </span>
        </div>
      )}

      {/* Progress tracker */}
      <div className="p-4 rounded-xl bg-[#0F1B2B] border border-[#1C2C42] space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Collection Progress
          </span>
          <span className="text-[10px] font-mono text-emerald-400">
            {currentStage.subStatus}
          </span>
        </div>

        <div className="space-y-2.5 text-xs">
          {currentStage.steps.map((step) => {
            const isCompleted = step.status === "COMPLETED";
            const isCurrent = step.status === "CURRENT";
            return (
              <div
                key={step.index}
                className={`flex items-center justify-between rounded-md p-1.5 transition-colors ${
                  isCurrent
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-white font-bold"
                    : "text-slate-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] flex items-center justify-center font-bold">
                      ✓
                    </span>
                  ) : isCurrent ? (
                    <span className="relative flex h-2 w-2 ml-1 mr-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-500 text-[10px] flex items-center justify-center font-mono">
                      {step.index}
                    </span>
                  )}
                  <span
                    className={
                      isCompleted
                        ? "line-through text-slate-500"
                        : isCurrent
                        ? "text-emerald-300"
                        : "text-slate-400"
                    }
                  >
                    {step.title}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-slate-500">
                  {step.timestamp ||
                    (isCompleted ? "Done" : isCurrent ? "Current" : "Pending")}
                </span>
              </div>
            );
          })}
        </div>

        <div className="p-2.5 rounded-lg bg-[#142234] border border-[#23354C] text-[11px] flex items-center justify-between">
          <span className="text-slate-400">Current Depot Stage:</span>
          <strong className="text-white font-mono">{currentStage.stageName}</strong>
        </div>
      </div>

      {/* Compact timing — full detail in More tab */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-xl bg-[#0F1B2B] border border-[#1C2C42] space-y-0.5">
          <span className="text-[9px] uppercase font-mono text-slate-400 block font-bold">
            ARRIVAL
          </span>
          <span className="text-xs font-bold font-mono text-white block">
            {currentStage.predictedArrivalWindow}
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#0F1B2B] border border-[#1C2C42] space-y-0.5">
          <span className="text-[9px] uppercase font-mono text-slate-400 block font-bold">
            DWELL
          </span>
          <span className="text-xs font-bold font-mono text-emerald-300 block">
            {currentStage.expectedTurnaroundMin} min
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#0F1B2B] border border-emerald-500/30 space-y-0.5">
          <span className="text-[9px] uppercase font-mono text-emerald-400 block font-bold">
            EXIT
          </span>
          <span className="text-xs font-bold font-mono text-white block">
            {currentStage.predictedGateOutWindow}
          </span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <button
          type="button"
          onClick={onOpenReportSheet}
          className="p-2.5 rounded-xl bg-[#152234] hover:bg-[#1B2B40] border border-[#23354C] text-slate-300 hover:text-white flex flex-col items-center justify-center gap-1 text-center transition-colors cursor-pointer"
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] font-bold">Report Issue</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab("NAVIGATE")}
          className="p-2.5 rounded-xl bg-[#152234] hover:bg-[#1B2B40] border border-[#23354C] text-slate-300 hover:text-white flex flex-col items-center justify-center gap-1 text-center transition-colors cursor-pointer"
        >
          <Navigation className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] font-bold">Navigate</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab("UPDATES")}
          className="p-2.5 rounded-xl bg-[#152234] hover:bg-[#1B2B40] border border-[#23354C] text-slate-300 hover:text-white flex flex-col items-center justify-center gap-1 text-center transition-colors cursor-pointer"
        >
          <Radio className="w-4 h-4 text-blue-400" />
          <span className="text-[10px] font-bold">Updates</span>
        </button>
      </div>

      {recentUpdate && (
        <div
          onClick={() => onSelectTab("UPDATES")}
          className="p-3 rounded-xl bg-[#0F1B2B] hover:bg-[#152234] border border-[#1C2C42] flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-md bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div className="overflow-hidden">
              <span className="font-bold text-white block truncate">{recentUpdate.title}</span>
              <span className="text-[10px] text-slate-400 block truncate">
                {recentUpdate.message}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
        </div>
      )}
    </div>
  );
};