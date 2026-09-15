"use client";

import React, { useState } from "react";
import { Building, TrendingDown, Clock, ShieldCheck, CheckCircle2, ChevronRight, ExternalLink } from "lucide-react";
import { DepotExecutivePerformance, DepotId } from "@/types/flowguard";
import { DepotPerformanceDrawer } from "./DepotPerformanceDrawer";

interface DepotPerformanceTableProps {
  depots: DepotExecutivePerformance[];
  selectedDepotId: DepotId | "ALL";
  onSelectDepotId: (id: DepotId | "ALL") => void;
  onInspectDepot?: (depot: DepotExecutivePerformance) => void;
}

export const DepotPerformanceTable: React.FC<DepotPerformanceTableProps> = ({
  depots,
  selectedDepotId,
  onSelectDepotId,
  onInspectDepot,
}) => {
  const [activeDrawerDepot, setActiveDrawerDepot] = useState<DepotExecutivePerformance | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPTIMIZED":
        return "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold";
      case "EQUIPMENT MONITORING":
        return "bg-amber-100 text-amber-900 border-amber-300 font-semibold";
      case "GATE BALANCED":
        return "bg-blue-100 text-blue-800 border-blue-300 font-semibold";
      case "NOMINAL FLOW":
        return "bg-slate-100 text-slate-700 border-slate-300 font-medium";
      case "STEADY REGIONAL":
        return "bg-indigo-50 text-indigo-800 border-indigo-200 font-medium";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const handleRowClick = (depot: DepotExecutivePerformance) => {
    onSelectDepotId(depot.depotId);
    if (onInspectDepot) {
      onInspectDepot(depot);
    } else {
      setActiveDrawerDepot(depot);
    }
  };

  // Compute dynamic consolidated totals
  const totalInterventions = depots.reduce((sum, d) => sum + d.interventionsCount, 0);
  const totalProtected = depots.reduce((sum, d) => sum + d.exposureProtectedKes, 0);
  const totalRealized = depots.reduce((sum, d) => sum + d.realizedSavingsKes, 0);

  return (
    <>
      <div className="bg-white rounded-lg border border-[#E2E6EA] shadow-xs overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E6EA] flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#0F1B2B] tracking-tight">
                5-Depot Network Performance Scorecard
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                NETWORK BENCHMARK
              </span>
            </div>
            <p className="text-xs text-[#5C6B7A] mt-0.5">
              Turnaround dwell, autonomous interventions, and exposure prevented across KPC terminal operations. Click any depot to inspect.
            </p>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium mr-1">Filter:</span>
            <button
              onClick={() => onSelectDepotId("ALL")}
              className={`px-2.5 py-1 rounded text-xs transition-all ${
                selectedDepotId === "ALL"
                  ? "bg-[#0B1420] text-white font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All 5 Depots
            </button>
            {depots.map((d) => (
              <button
                key={d.depotId}
                onClick={() => onSelectDepotId(d.depotId)}
                className={`px-2 py-1 rounded text-xs transition-all ${
                  selectedDepotId === d.depotId
                    ? "bg-[#1B7A3D] text-white font-semibold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {d.code}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E6EA] text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3.5 px-4">Terminal &amp; Region</th>
                <th className="py-3.5 px-4 text-center">Throughput Share</th>
                <th className="py-3.5 px-4 text-right">Baseline Dwell</th>
                <th className="py-3.5 px-4 text-right">FlowGuard Dwell</th>
                <th className="py-3.5 px-4 text-right">Turnaround Recovery</th>
                <th className="py-3.5 px-4 text-center">Interventions</th>
                <th className="py-3.5 px-4 text-right">Exposure Protected</th>
                <th className="py-3.5 px-4 text-right">Realized Savings</th>
                <th className="py-3.5 px-4 text-center">Operating State</th>
                <th className="py-3.5 px-4">Primary Bottleneck</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {depots.map((d) => {
                const isSelected = selectedDepotId === d.depotId;
                const statusStyle = getStatusBadge(d.currentStatus);

                return (
                  <tr
                    key={d.depotId}
                    onClick={() => handleRowClick(d)}
                    className={`transition-colors cursor-pointer group ${
                      isSelected ? "bg-emerald-50/50 font-medium" : "hover:bg-slate-50/70"
                    }`}
                  >
                    {/* Name & Region */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                        <span>{d.depotName}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {d.code} • {d.region}
                      </span>
                    </td>

                    {/* Volume Share */}
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {d.volumeProcessedPct}%
                      </span>
                    </td>

                    {/* Baseline */}
                    <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                      {d.baselineTurnaroundMin}m
                    </td>

                    {/* FlowGuard */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                      {d.currentTurnaroundMin}m
                    </td>

                    {/* Delta & % */}
                    <td className="py-3.5 px-4 text-right font-mono">
                      <div className="font-bold text-emerald-700">
                        -{d.turnaroundRecoveredMin}m
                      </div>
                      <span className="text-[10px] text-slate-500">
                        ({d.turnaroundImprovementPct}%)
                      </span>
                    </td>

                    {/* Interventions */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                      {d.interventionsCount}
                    </td>

                    {/* Exposure Protected */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      KES {(d.exposureProtectedKes / 1000000).toFixed(2)}M
                    </td>

                    {/* Realized Savings */}
                    <td className="py-3.5 px-4 text-right font-mono text-emerald-700 font-bold">
                      KES {(d.realizedSavingsKes / 1000000).toFixed(2)}M
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider ${statusStyle}`}>
                        {d.currentStatus}
                      </span>
                    </td>

                    {/* Bottleneck */}
                    <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                      {d.topBottleneck}
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(d);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-mono text-[10px] font-bold border border-slate-200 transition-colors flex items-center gap-1 mx-auto"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Network Totals Footer */}
            <tfoot>
              <tr className="bg-[#F8FAFC] border-t-2 border-[#E2E6EA] font-bold text-slate-900">
                <td className="py-3 px-4">
                  <span className="uppercase text-[11px] tracking-wider text-slate-700">
                    Network Consolidated (5 Depots)
                  </span>
                </td>
                <td className="py-3 px-4 text-center font-mono">100%</td>
                <td className="py-3 px-4 text-right font-mono text-slate-600">87m</td>
                <td className="py-3 px-4 text-right font-mono text-emerald-700">56m</td>
                <td className="py-3 px-4 text-right font-mono text-emerald-700">
                  -31m (-35.6%)
                </td>
                <td className="py-3 px-4 text-center font-mono text-slate-900">{totalInterventions}</td>
                <td className="py-3 px-4 text-right font-mono text-emerald-800">
                  KES {(totalProtected / 1000000).toFixed(2)}M
                </td>
                <td className="py-3 px-4 text-right font-mono text-emerald-700">
                  KES {(totalRealized / 1000000).toFixed(2)}M
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold uppercase">
                    ACTIVE
                  </span>
                </td>
                <td className="py-3 px-4 text-[11px] text-slate-500">
                  Capacity Pressure (#1 Driver)
                </td>
                <td className="py-3 px-4 text-center text-[10px] font-mono text-slate-400">
                  Consolidated
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      <DepotPerformanceDrawer
        depot={activeDrawerDepot}
        onClose={() => setActiveDrawerDepot(null)}
      />
    </>
  );
};
