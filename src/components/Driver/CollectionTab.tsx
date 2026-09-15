"use client";

import React from "react";
import {
  Truck,
  FileText,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Navigation,
  Fuel,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { JourneyStageConfig } from "./types";

interface CollectionTabProps {
  currentStage: JourneyStageConfig;
  onOpenReportSheet: () => void;
}

export const CollectionTab: React.FC<CollectionTabProps> = ({
  currentStage,
  onOpenReportSheet,
}) => {
  const handleExternalNavigate = () => {
    window.open("https://maps.google.com/?q=Kenya+Pipeline+Company+Nairobi+Terminal+PS10", "_blank");
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
      note: currentStage.stepNumber >= 2 ? "Weighbridge transponder ticket stamped" : "To be recorded upon gate entry",
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
      {/* 1. Header Order Banner */}
      <div className="p-4 rounded-xl bg-[#0F1B2B] border border-[#1C2C42] space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#1B7A3D] text-white flex items-center justify-center font-bold text-xs">
              KPC
            </span>
            <div>
              <h2 className="text-sm font-bold text-white font-mono">LO-NBO-8821</h2>
              <span className="text-[10px] text-slate-400">Vivo Energy Kenya Ltd</span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase font-bold">
            {currentStage.collectionStatus}
          </span>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-[#152234] border border-[#243447]">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Product</span>
            <span className="font-bold text-amber-400 font-mono text-xs">AGO (Automotive Gasoil)</span>
          </div>

          <div className="p-2 rounded-lg bg-[#152234] border border-[#243447]">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Total Volume</span>
            <span className="font-bold text-white font-mono text-xs">36,000 Litres</span>
          </div>

          <div className="p-2 rounded-lg bg-[#152234] border border-[#243447]">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Vehicle Reg</span>
            <span className="font-bold text-white font-mono text-xs">KDD 412X / ZF 9102</span>
          </div>

          <div className="p-2 rounded-lg bg-[#152234] border border-[#243447]">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Terminal Depot</span>
            <span className="font-bold text-white font-mono text-xs">Nairobi (PS10)</span>
          </div>
        </div>

        {/* 3-Compartment Breakdown */}
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
          <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">
            Tanker Compartment Allocations:
          </span>
          <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono">
            <div className="p-1.5 rounded bg-[#152234] border border-[#23354C]">
              <span className="text-[9px] text-slate-400 block">Comp 1</span>
              <span className="text-white font-bold">12,000L AGO</span>
            </div>
            <div className="p-1.5 rounded bg-[#152234] border border-[#23354C]">
              <span className="text-[9px] text-slate-400 block">Comp 2</span>
              <span className="text-white font-bold">12,000L AGO</span>
            </div>
            <div className="p-1.5 rounded bg-[#152234] border border-[#23354C]">
              <span className="text-[9px] text-slate-400 block">Comp 3</span>
              <span className="text-white font-bold">12,000L AGO</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Predictive Operational Timing */}
      <div className="p-4 rounded-xl bg-[#0F1B2B] border border-[#1C2C42] space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>FlowGuard Collection Predictions</span>
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-lg bg-[#152234] border border-[#243447]">
            <div>
              <span className="font-bold text-white block">Predicted Arrival Window</span>
              <span className="text-[10px] text-slate-400">Based on historical corridor speed</span>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-white text-xs">{currentStage.predictedArrivalWindow}</span>
              <span className="text-[10px] text-emerald-400 block font-mono">{currentStage.arrivalConfidencePct}% conf</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-[#152234] border border-[#243447]">
            <div>
              <span className="font-bold text-white block">Expected Terminal Turnaround</span>
              <span className="text-[10px] text-slate-400">Gate-in to gate-out duration</span>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-emerald-300 text-xs">{currentStage.expectedTurnaroundMin} minutes</span>
              <span className="text-[10px] text-slate-400 block font-mono">Current depot load</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-[#152234] border border-emerald-500/30">
            <div>
              <span className="font-bold text-emerald-300 block">Predicted Gate-Out Window</span>
              <span className="text-[10px] text-slate-400">Final security clearance &amp; exit</span>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-white text-xs">{currentStage.predictedGateOutWindow}</span>
              <span className="text-[10px] text-emerald-400 block font-mono">{currentStage.gateOutConfidencePct}% conf</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Document / Collection Requirements Checklist */}
      <div className="p-4 rounded-xl bg-[#0F1B2B] border border-[#1C2C42] space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>Collection Document Requirements</span>
        </h3>

        <div className="space-y-2 text-xs">
          {documentRequirements.map((req, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-[#152234] border border-[#243447] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{req.title}</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase font-bold">
                  {req.status}
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400">{req.id} • {req.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. External Navigation Action */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#112318] to-[#0F1B2B] border border-emerald-500/40 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white">KPC Nairobi Terminal (PS10)</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-300">Outer Ring Road, Industrial Area</span>
        </div>

        <button
          type="button"
          onClick={handleExternalNavigate}
          className="w-full py-3 px-4 rounded-lg bg-[#1B7A3D] hover:bg-[#1E8A45] active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
        >
          <Navigation className="w-4 h-4" />
          <span>NAVIGATE TO KPC NAIROBI GATE</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </button>
      </div>

      {/* 5. Report Issue Quick Link */}
      <button
        type="button"
        onClick={onOpenReportSheet}
        className="w-full py-2.5 px-3 rounded-lg bg-transparent border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
        <span>Report Document or Gate Ingress Issue</span>
      </button>
    </div>
  );
};
