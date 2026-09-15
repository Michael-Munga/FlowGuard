"use client";

import React, { useState, useMemo } from "react";
import {
  Truck,
  Search,
  Filter,
  ArrowUpDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Fuel,
} from "lucide-react";
import { YardTruck, YardStage, TruckRiskStatus } from "@/types/flowguard";

interface YardTruckBoardProps {
  trucks: YardTruck[];
  onSelectTruck: (truck: YardTruck) => void;
  selectedTruckId?: string;
}

export const YardTruckBoard: React.FC<YardTruckBoardProps> = ({
  trucks,
  onSelectTruck,
  selectedTruckId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("ALL");

  // Filter & Sort Logic: Prioritizes Operational Urgency First (RED -> AMBER -> GREEN -> NEUTRAL)
  const filteredTrucks = useMemo(() => {
    return trucks
      .filter((t) => {
        const matchesSearch =
          t.registration.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.omc.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.whyAtRisk?.cause || "").toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (stageFilter === "ALL") return true;
        if (stageFilter === "AT_RISK") return t.riskStatus === "RED" || t.riskStatus === "AMBER";
        if (stageFilter === "LOADING") return t.currentStage === "Loading";
        if (stageFilter === "GATE_IN") return t.currentStage === "Gate-In";
        if (stageFilter === "VALIDATION") return t.currentStage === "Validation / Release";
        if (stageFilter === "READY_EXIT")
          return t.currentStage === "Ready to Exit" || t.currentStage === "Gate-Out";

        return true;
      })
      .sort((a, b) => {
        const severityRank: Record<TruckRiskStatus, number> = {
          RED: 4,
          AMBER: 3,
          GREEN: 2,
          NEUTRAL: 1,
        };
        // Highest severity first, then highest dwell delta
        if (severityRank[b.riskStatus] !== severityRank[a.riskStatus]) {
          return severityRank[b.riskStatus] - severityRank[a.riskStatus];
        }
        return b.dwellDeltaMin - a.dwellDeltaMin;
      });
  }, [trucks, searchQuery, stageFilter]);

  const getStageBadge = (stage: YardStage) => {
    switch (stage) {
      case "Loading":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Gate-In":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Validation / Release":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "Ready to Exit":
        return "bg-emerald-50 text-[#1B7A3D] border-emerald-200";
      case "Gate-Out":
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getRiskLabel = (status: TruckRiskStatus) => {
    switch (status) {
      case "RED":
        return "CRITICAL";
      case "AMBER":
        return "AT RISK";
      case "GREEN":
        return "WATCH";
      case "NEUTRAL":
      default:
        return "NORMAL";
    }
  };

  const getRiskBadge = (status: TruckRiskStatus) => {
    switch (status) {
      case "RED":
        return "bg-rose-100 text-rose-800 border-rose-300 font-extrabold animate-pulse";
      case "AMBER":
        return "bg-amber-100 text-amber-900 border-amber-300 font-bold";
      case "GREEN":
        return "bg-blue-50 text-blue-800 border-blue-200 font-semibold";
      case "NEUTRAL":
      default:
        return "bg-emerald-50 text-[#1B7A3D] border-emerald-200 font-medium";
    }
  };

  // Helper to format predicted gate out as arrival window with confidence
  const formatGateOutWindow = (truck: YardTruck) => {
    const rawTime = truck.predictedGateOut || "12:00 PM";
    const confidence = truck.confidencePct || 86;
    // Format window: e.g. 11:45–12:00 (92% conf)
    return {
      window: rawTime.includes("–") ? rawTime : `${rawTime}`,
      confidence: `${confidence}% conf`,
    };
  };

  return (
    <div className="bg-white rounded-lg border border-[#E2E6EA] overflow-hidden shadow-xs space-y-0">
      {/* Board Header & Controls */}
      <div className="p-4 border-b border-[#EDF1F5] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#FAFBFC]">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#1B7A3D]" />
            <h3 className="font-bold text-sm text-[#0F1B2B]">
              Yard & Gantry Active Truck Board ({filteredTrucks.length} Active Tankers)
            </h3>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border">
              PRIORITIZED BY OPERATIONAL URGENCY
            </span>
          </div>
          <p className="text-xs text-[#5C6B7A] mt-0.5">
            Stage dwell vs stage benchmark, causal delay factors, predicted gate-out windows, and autonomous action states
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search order, truck, OMC, cause..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-md border border-[#E2E6EA] bg-white focus:outline-hidden focus:ring-1 focus:ring-[#1B7A3D] w-48 sm:w-60 text-[#0F1B2B]"
            />
          </div>

          {/* Quick Segmented Filter */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-md border border-[#E2E6EA] text-xs">
            {[
              { id: "ALL", label: "All" },
              { id: "AT_RISK", label: "At Risk" },
              { id: "LOADING", label: "Loading" },
              { id: "GATE_IN", label: "Gate-In" },
              { id: "VALIDATION", label: "Validation" },
              { id: "READY_EXIT", label: "Ready / Exit" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStageFilter(tab.id)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  stageFilter === tab.id
                    ? "bg-white text-[#0F1B2B] shadow-2xs font-semibold"
                    : "text-[#5C6B7A] hover:text-[#0F1B2B]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dense Operational Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAFBFC] border-b border-[#E2E6EA] text-[10px] font-bold uppercase tracking-wider text-[#5C6B7A] select-none">
            <tr>
              <th className="px-3.5 py-2.5">Collection / Order</th>
              <th className="px-3 py-2.5">OMC</th>
              <th className="px-3 py-2.5">Truck</th>
              <th className="px-3 py-2.5">Current Stage</th>
              <th className="px-3 py-2.5">Stage Dwell</th>
              <th className="px-3 py-2.5">Predicted Gate-Out</th>
              <th className="px-3 py-2.5">Risk</th>
              <th className="px-3 py-2.5">Primary Cause</th>
              <th className="px-3 py-2.5">Next Action</th>
              <th className="px-3 py-2.5">FlowGuard State</th>
              <th className="px-3 py-2.5 text-right">Details</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#EDF1F5]">
            {filteredTrucks.map((truck) => {
              const isSelected = selectedTruckId === truck.id;
              const isDwellElevated = truck.dwellDeltaMin > 3;
              const gateOut = formatGateOutWindow(truck);
              const primaryCause = truck.whyAtRisk?.cause || "Nominal progression";

              return (
                <tr
                  key={truck.id}
                  onClick={() => onSelectTruck(truck)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-emerald-50/60 hover:bg-emerald-50/80"
                      : truck.riskStatus === "RED"
                      ? "bg-rose-50/25 hover:bg-rose-50/45"
                      : "hover:bg-slate-50/80"
                  }`}
                >
                  {/* 1. Collection / Order ID */}
                  <td className="px-3.5 py-2.5">
                    <span className="font-mono font-bold text-xs text-[#0F1B2B] block">
                      {truck.orderNumber}
                    </span>
                    <span className="text-[10px] text-[#5C6B7A] block">
                      {truck.product.split(" ")[0]} • {(truck.quantityLitres / 1000).toFixed(0)}kL
                    </span>
                  </td>

                  {/* 2. OMC */}
                  <td className="px-3 py-2.5">
                    <span className="font-semibold text-xs text-[#0F1B2B] block truncate max-w-[130px]">
                      {truck.omc}
                    </span>
                    <span className="text-[10px] text-[#8492A6]">
                      {truck.compartmentsCount} compartments
                    </span>
                  </td>

                  {/* 3. Truck */}
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          truck.riskStatus === "RED"
                            ? "bg-rose-500 animate-pulse"
                            : truck.riskStatus === "AMBER"
                            ? "bg-amber-500"
                            : truck.riskStatus === "GREEN"
                            ? "bg-blue-500"
                            : "bg-emerald-500"
                        }`}
                      />
                      <span className="font-mono font-bold text-xs text-[#0F1B2B]">
                        {truck.registration}
                      </span>
                    </div>
                  </td>

                  {/* 4. Current Stage */}
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${getStageBadge(
                          truck.currentStage
                        )}`}
                      >
                        {truck.currentStage}
                      </span>
                      {truck.assignedPosition && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 border text-slate-700">
                          {truck.assignedPosition}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 5. Stage Dwell */}
                  <td className="px-3 py-2.5">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono font-bold text-xs text-[#0F1B2B]">
                        {truck.timeInStageMin}m
                      </span>
                      <span className="text-[10px] text-[#8492A6]">
                        (exp {truck.baselineStageMin}m)
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-medium block ${
                        isDwellElevated
                          ? "text-rose-700 font-bold"
                          : truck.dwellDeltaMin < 0
                          ? "text-emerald-700"
                          : "text-[#8492A6]"
                      }`}
                    >
                      {truck.dwellDeltaMin > 0
                        ? `+${truck.dwellDeltaMin}m above SLA`
                        : truck.dwellDeltaMin < 0
                        ? `${truck.dwellDeltaMin}m on track`
                        : "on baseline"}
                    </span>
                  </td>

                  {/* 6. Predicted Gate-Out Window */}
                  <td className="px-3 py-2.5">
                    <div className="font-mono text-xs font-bold text-[#0F1B2B]">
                      {gateOut.window}
                    </div>
                    <span className="text-[10px] text-[#1B7A3D] font-mono block font-semibold">
                      {gateOut.confidence}
                    </span>
                  </td>

                  {/* 7. Risk */}
                  <td className="px-3 py-2.5">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-wide ${getRiskBadge(
                        truck.riskStatus
                      )}`}
                    >
                      {getRiskLabel(truck.riskStatus)}
                    </span>
                  </td>

                  {/* 8. Primary Cause */}
                  <td className="px-3 py-2.5 max-w-[170px]">
                    <span className="text-xs text-[#5C6B7A] block truncate font-medium" title={primaryCause}>
                      {primaryCause}
                    </span>
                  </td>

                  {/* 9. Next Action */}
                  <td className="px-3 py-2.5 text-xs text-[#5C6B7A] max-w-[160px] truncate" title={truck.nextAction}>
                    {truck.nextAction}
                  </td>

                  {/* 10. FlowGuard State */}
                  <td className="px-3 py-2.5">
                    <span className="text-[10px] font-mono font-bold text-[#1B7A3D] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {truck.flowGuardStatus}
                    </span>
                  </td>

                  {/* 11. Details */}
                  <td className="px-3 py-2.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTruck(truck);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredTrucks.length === 0 && (
        <div className="p-8 text-center text-xs text-[#8492A6]">
          No road tankers match the selected filters.
        </div>
      )}
    </div>
  );
};
