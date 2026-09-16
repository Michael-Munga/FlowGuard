"use client";

import React from "react";
import {
  Truck,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  HelpCircle,
  Layers,
  ChevronRight,
  FileText,
  Clock,
  Navigation,
} from "lucide-react";
import { SyncState, DriverIssueReport, JourneyStageConfig } from "./types";

interface MoreTabProps {
  syncState: SyncState;
  lastSyncTime: string;
  pendingSyncQueue: DriverIssueReport[];
  submittedReports: DriverIssueReport[];
  currentStageNumber: number;
  totalStages: number;
  currentStage: JourneyStageConfig;
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
  currentStage,
  onToggleOffline,
  onTriggerSync,
  onOpenReportSheet,
  onOpenSyncSheet,
  onOpenDemoController,
}) => {
  const handleExternalNavigate = () => {
    window.open(
      "https://maps.google.com/?q=Kenya+Pipeline+Company+Nairobi+Terminal+PS10",
      "_blank"
    );
  };

  const documentRequirements = [
    {
      title: "Electronic Loading Order (ELO)",
      id: "LO-NBO-8821",
      status: "READY",
      note: "SAP LE & TSA quota pre-approved",
    },
    {
      title: "Driver Terminal Ingress Pass",
      id: "ID: 24891002 (James Mwangi)",
      status: "AUTHENTICATED",
      note: "Biometric gate transponder active",
    },
    {
      title: "Tare Scale Platform Record",
      id: "14,820 kg (Tare Platform 1)",
      status: currentStage.stepNumber >= 2 ? "VERIFIED" : "PENDING",
      note:
        currentStage.stepNumber >= 2
          ? "Weighbridge transponder ticket stamped"
          : "To be recorded upon gate entry",
    },
    {
      title: "KRA RECTS Electronic Cargo Seals",
      id: "Customs Transit Pre-Authorization",
      status: currentStage.stepNumber >= 6 ? "SEALED" : "RESERVED",
      note: "Dual-tamper evident bolt seals staged at exit",
    },
  ];

  return (
    <div className="space-y-4 pb-4">
      {/* Driver profile */}
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
            <p className="text-[11px] text-emerald-400 font-medium">
              Trans-Rift Hauliers Ltd (Contractor)
            </p>
          </div>
        </div>
      </div>

      {/* Vehicle details */}
      <div className="p-4 rounded-xl bg-[#0F1B2B] border border-[#1C2C42] space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Assigned Tanker
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-400">HAZCHEM Class 3</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded bg-[#152234] border border-[#243447]">
            <span className="text-[10px] font-mono text-slate-400 block">Prime Mover</span>
            <span className="font-bold text-white font-mono">KDD 412X</span>
          </div>
          <div className="p-2 rounded bg-[#152234] border border-[#243447]">
            <span className="text-[10px] font-mono text-slate-400 block">
              Semi-Trailer Tank
            </span>
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

      {/* Predictive timing (moved from Collection) */}
      <div className="p-4 rounded-xl bg-[#0F1B2B] border border-[#1C2C42] space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
            FlowGuard Predictions
          </h4>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-lg bg-[#152234] border border-[#243447]">
            <div>
              <span className="font-bold text-white block">Predicted Arrival</span>
              <span className="text-[10px] text-slate-400">
                Based on corridor speed
              </span>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-white text-xs">
                {currentStage.predictedArrivalWindow}
              </span>
              <span className="text-[10px] text-emerald-400 block font-mono">
                {currentStage.arrivalConfidencePct}% conf
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-[#152234] border border-[#243447]">
            <div>
              <span className="font-bold text-white block">Expected Turnaround</span>
              <span className="text-[10px] text-slate-400">Gate-in to gate-out</span>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-emerald-300 text-xs">
                {currentStage.expectedTurnaroundMin} min
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-[#152234] border border-emerald-500/30">
            <div>
              <span className="font-bold text-emerald-300 block">Predicted Gate-Out</span>
              <span className="text-[10px] text-slate-400">Exit clearance</span>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-white text-xs">
                {currentStage.predictedGateOutWindow}
              </span>
              <span className="text-[10px] text-emerald-400 block font-mono">
                {currentStage.gateOutConfidencePct}% conf
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Document requirements (moved from Collection) */}
      <div className="p-4 rounded-xl bg-[#0F1B2B] border border-[#1C2C42] space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
            Document Requirements
          </h4>
        </div>
        <div className="space-y-2 text-xs">
          {documentRequirements.map((req, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-[#152234] border border-[#243447] space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-[11px]">{req.title}</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase font-bold">
                  {req.status}
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400">
                {req.id} • {req.note}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* External navigation (moved from Collection) */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#112318] to-[#0F1B2B] border border-emerald-500/40 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white">Navigate to KPC Nairobi</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleExternalNavigate}
          className="w-full py-3 px-4 rounded-lg bg-[#1B7A3D] hover:bg-[#1E8A45] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
        >
          <Navigation className="w-4 h-4" />
          <span>OPEN GOOGLE MAPS</span>
        </button>
      </div>

      {/* Sync diagnostics */}
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
            <span className="text-slate-400">Pending Offline Queue:</span>
            <span className="font-mono text-amber-400 font-bold">
              {pendingSyncQueue.length} items
            </span>
          </div>
        </div>

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
            <RefreshCw
              className={`w-3.5 h-3.5 ${syncState === "SYNCING" ? "animate-spin" : ""}`}
            />
            <span>Sync Now</span>
          </button>
        </div>
      </div>

      {/* Quick links */}
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
            <p className="text-[11px] text-slate-400">
              Traffic, gate access, paperwork, or safety issue
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </button>

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
            <p className="text-[11px] text-slate-400">
              Step through all 7 collection stages for presentation
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </button>

      {/* Safety standards */}
      <div className="p-4 rounded-xl bg-[#0F1B2B] border border-[#1C2C42] space-y-2.5">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
          <ShieldCheck className="w-4 h-4" />
          <span>KPC Terminal Safety Requirements</span>
        </div>
        <ul className="text-[11px] text-slate-300 space-y-1.5 list-disc list-inside">
          <li>Speed limit strictly 15 km/h across all gantry and staging areas.</li>
          <li>
            Earth bonding clamp must be secured prior to top-hatch or bottom-valve
            coupling.
          </li>
          <li>Anti-static safety footwear and flame-retardant PPE mandatory.</li>
          <li>Mobile devices prohibited on loading racks.</li>
        </ul>
      </div>

      {/* Support */}
      <div className="p-4 rounded-xl bg-[#0F1B2B] border border-[#1C2C42] space-y-2 text-xs">
        <div className="flex items-center gap-2 text-white font-bold">
          <HelpCircle className="w-4 h-4 text-blue-400" />
          <span>Terminal Help &amp; Dispatch Desk</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Nairobi Ops Desk:{" "}
          <strong className="text-white font-mono">+254 20 289 7100</strong>
        </p>
        <p className="text-[11px] text-slate-400">
          Emergency Line: <strong className="text-amber-400 font-mono">EXT 999</strong>
        </p>
      </div>

      <div className="p-3 text-center space-y-1 text-[10px] text-slate-500">
        <p className="font-mono">FlowGuard Driver PWA • v2.4.0 (Hackathon Prototype)</p>
        <p>Collection instructions reflect simulated operational data.</p>
      </div>
    </div>
  );
};