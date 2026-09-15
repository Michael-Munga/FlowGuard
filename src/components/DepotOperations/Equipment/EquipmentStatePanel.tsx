"use client";

import React, { useState } from "react";
import {
  Activity,
  Gauge,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Fuel,
  TrendingDown,
  Info,
  Clock,
  Layers,
} from "lucide-react";
import { DepotEquipmentState, EquipmentItem } from "@/types/flowguard";

interface EquipmentStatePanelProps {
  equipmentState: DepotEquipmentState;
}

export const EquipmentStatePanel: React.FC<EquipmentStatePanelProps> = ({
  equipmentState,
}) => {
  const [selectedItem, setSelectedItem] = useState<EquipmentItem | null>(null);

  const items = [
    { key: "loadingSystem", label: "Loading System", data: equipmentState.loadingSystem },
    { key: "metering", label: "Metering", data: equipmentState.metering },
    { key: "gateSystem", label: "Gate / Scale Processing", data: equipmentState.gateSystem },
    { key: "scada", label: "SCADA / Control Signal", data: equipmentState.scada },
    { key: "productReadiness", label: "Product Readiness", data: equipmentState.productReadiness },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "HEALTHY":
      case "READY":
      case "NORMAL":
        return "bg-emerald-50 text-[#1B7A3D] border-emerald-200";
      case "QUEUED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "DEGRADED":
        return "bg-amber-50 text-amber-800 border-amber-200 font-bold";
      case "MAINTENANCE":
      case "UNAVAILABLE":
        return "bg-rose-50 text-rose-800 border-rose-200 font-bold";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const isDegraded = equipmentState.loadingPerformanceRatePct < 90;

  return (
    <div className="bg-white rounded-lg border border-[#E2E6EA] p-5 shadow-xs space-y-4 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EDF1F5] pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#1B7A3D]" />
          <div>
            <h3 className="font-bold text-sm text-[#0F1B2B]">
              Equipment State & System Operational Readiness
            </h3>
            <span className="text-xs text-[#5C6B7A]">
              Simulated telemetry status across core depot loading, metering, gate and tank subsystems
            </span>
          </div>
        </div>

        {/* Loading Performance Hero Tag */}
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${
              isDegraded
                ? "bg-amber-50 border-amber-200 text-amber-950"
                : "bg-emerald-50 border-emerald-200 text-emerald-950"
            }`}
          >
            <Gauge className={`w-4 h-4 ${isDegraded ? "text-amber-700" : "text-[#1B7A3D]"}`} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C6B7A]">
                  Loading Performance:
                </span>
                <span className="text-xs font-mono font-bold">
                  {equipmentState.loadingPerformanceRatePct}% of baseline
                </span>
              </div>
              <span className="text-[10px] text-[#5C6B7A] block">
                {equipmentState.loadingPerformanceDeltaLabel} ({equipmentState.averageFlowRateLpm} L/min vs {equipmentState.baselineFlowRateLpm} L/min)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Component Cards Grid: 5 Defensible Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {items.map(({ key, label, data }) => {
          const isSelected = selectedItem?.name === data.name;

          return (
            <button
              key={key}
              onClick={() => setSelectedItem(isSelected ? null : data)}
              className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all hover:border-[#1B7A3D]/40 cursor-pointer ${
                isSelected
                  ? "border-[#1B7A3D] ring-2 ring-[#1B7A3D]/20 bg-emerald-50/20"
                  : data.status === "DEGRADED"
                  ? "bg-amber-50/20 border-amber-300"
                  : "bg-[#FAFBFC] border-[#E2E6EA]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C6B7A] truncate">
                    {label}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${getStatusBadge(
                      data.status
                    )}`}
                  >
                    {data.status}
                  </span>
                </div>

                <span className="font-semibold text-xs text-[#0F1B2B] block truncate">
                  {data.name}
                </span>

                <p className="text-[10px] text-[#8492A6] mt-1 line-clamp-2">
                  {data.detail}
                </p>
              </div>

              <div className="mt-2 pt-1 border-t border-slate-200/50 flex items-center justify-between text-[9px] text-[#8492A6]">
                <span>Updated: {data.lastChecked}</span>
                <span className="text-[#1B7A3D] font-medium">Inspect</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Operational Product Readiness Diagnostic Callout */}
      <div className="p-3 bg-[#FAFBFC] rounded-lg border border-[#E2E6EA] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Fuel className="w-4 h-4 text-[#1B7A3D] shrink-0" />
          <div>
            <span className="font-bold text-[#0F1B2B] text-xs">
              Product Readiness Status: {equipmentState.productReadiness.status === "READY" ? "PRODUCT READY — Orders Can Proceed" : "PRODUCT READINESS CONSTRAINT"}
            </span>
            <p className="text-[#5C6B7A] text-[11px] leading-relaxed">
              {equipmentState.productReadiness.detail}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-[#8492A6] shrink-0">
          Tank farm manifold release synchronized
        </span>
      </div>

      {/* Equipment Detail Modal/Banner (if clicked) */}
      {selectedItem && (
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-300 text-xs space-y-1.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#1B7A3D]" />
              <span className="font-bold text-[#0F1B2B]">{selectedItem.name}</span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${getStatusBadge(
                  selectedItem.status
                )}`}
              >
                {selectedItem.status}
              </span>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          <p className="text-[#5C6B7A] text-[11px] leading-relaxed">
            {selectedItem.detail}
          </p>
          <span className="text-[10px] text-[#8492A6] block font-mono">
            Simulated Terminal Telemetry Polling Cycle: 1.0s • Last Signal: {selectedItem.lastChecked}
          </span>
        </div>
      )}
    </div>
  );
};
