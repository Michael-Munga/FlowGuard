"use client";

import React from "react";
import { X, Building, ArrowRight, Gauge, AlertTriangle, Layers, Clock, ShieldCheck } from "lucide-react";
import { Depot, DepotId } from "@/types/flowguard";

interface DepotDrillDownModalProps {
  depot: Depot | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenDepotOperations?: (depotId: DepotId) => void;
}

export const DepotDrillDownModal: React.FC<DepotDrillDownModalProps> = ({
  depot,
  isOpen,
  onClose,
  onOpenDepotOperations,
}) => {
  if (!isOpen || !depot) return null;

  const handleDrillDown = () => {
    onClose();
    if (onOpenDepotOperations) {
      onOpenDepotOperations(depot.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-[#E2E6EA] max-w-xl w-full shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 px-6 border-b border-[#E2E6EA] flex items-center justify-between bg-[#FAFBFC]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-[#1B7A3D]/10 text-[#1B7A3D]">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[#0F1B2B]">{depot.name}</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 font-semibold text-slate-700">
                  {depot.code}
                </span>
              </div>
              <p className="text-xs text-[#5C6B7A]">
                Depot Operations Telemetry Context • {depot.region} Region
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Status Alert Banner */}
          <div
            className={`p-3 rounded-lg border flex items-center justify-between ${
              depot.riskLevel === "CRITICAL"
                ? "bg-rose-50 border-rose-200 text-rose-950"
                : depot.riskLevel === "HIGH"
                ? "bg-amber-50 border-amber-200 text-amber-950"
                : "bg-emerald-50 border-emerald-200 text-emerald-950"
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <div>
                <span className="font-bold uppercase tracking-wider text-[10px] block">
                  Current Operating State: {depot.state}
                </span>
                <span className="text-[11px] font-medium">
                  Primary Bottleneck: {depot.primaryBottleneck}
                </span>
              </div>
            </div>
            <span className="font-mono font-bold text-sm">
              {depot.predictedTurnaroundMin}m Turnaround
            </span>
          </div>

          {/* Operational Metrics Matrix */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-[#FAFBFC] border border-[#E2E6EA] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C6B7A] block">
                Loading Bays (Gantry Capacity)
              </span>
              <div className="font-mono text-base font-bold text-[#0F1B2B]">
                {depot.usableLoadingPositions} usable / {depot.totalPhysicalPositions} physical
              </div>
              <span className="text-[10px] text-[#5C6B7A] block">
                {depot.degradedPositions > 0
                  ? `${depot.degradedPositions} bays unavailable / offline`
                  : "All bays nominal"}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#FAFBFC] border border-[#E2E6EA] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C6B7A] block">
                Demand vs Processing Capacity
              </span>
              <div className="font-mono text-base font-bold text-[#0F1B2B]">
                +{depot.expectedDemandNext90Min} demand • {depot.estimatedProcessingCapacity90Min} cap
              </div>
              <span className="text-[10px] text-[#5C6B7A] block">
                {depot.trucksInside} in yard • Current queue: {depot.currentQueue} (Peak: {depot.predictedPeakQueue})
              </span>
            </div>
          </div>

          {/* Bottleneck Diagnostic Detail */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
              SCADA Diagnostics Detail:
            </span>
            <p className="text-[11px] text-slate-800 leading-relaxed">
              {depot.bottleneckDetail}
            </p>
          </div>

          {/* Direct Navigation Callout */}
          <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-[#1B7A3D] shrink-0" />
              <div>
                <span className="font-bold text-[11px] block">
                  Depot Operations Dashboard Ready
                </span>
                <span className="text-[10px] text-emerald-800">
                  Inspect individual gantry positions (P01–P08), yard truck board dwell, and autonomous actions.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-[#E2E6EA] bg-[#FAFBFC] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-[#5C6B7A] hover:bg-slate-100 rounded"
          >
            Close
          </button>

          <button
            onClick={handleDrillDown}
            className="px-4 py-1.5 text-xs font-bold text-white bg-[#1B7A3D] hover:bg-[#145d2e] rounded shadow-xs flex items-center gap-1.5"
          >
            <span>Open {depot.name.split(" ")[0]} Depot Operations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

