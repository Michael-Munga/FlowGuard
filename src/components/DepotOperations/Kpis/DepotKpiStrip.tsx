"use client";

import React, { useState } from "react";
import {
  Truck,
  Users,
  Fuel,
  Clock,
  AlertTriangle,
  Layers,
  HelpCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { DepotKpiSummary } from "@/types/flowguard";
import { useDataSource } from "@/context/DataSourceContext";

interface DepotKpiStripProps {
  summary: DepotKpiSummary;
}

export const DepotKpiStrip: React.FC<DepotKpiStripProps> = ({ summary }) => {
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
  const { dataMode, isApiConnected } = useDataSource();
  const isDisconnected = dataMode === "api" && !isApiConnected;

  // Turnaround calculations: Dwell + Loading Duration baseline (~65 min target)
  const avgTurnaround = summary.averageDwellMin ? summary.averageDwellMin + 28 : 71;
  const baselineTurnaround = 65;
  const turnaroundDelta = avgTurnaround - baselineTurnaround;
  const isTurnaroundElevated = turnaroundDelta > 5;

  // Effective capacity throughput rate per hour
  const effectiveRatePerHour = (
    (summary.effectiveCapacity90Min || 11) *
    (60 / 90)
  ).toFixed(1);

  const cards = [
    {
      id: 1,
      label: "TRUCKS INSIDE",
      value: isDisconnected ? "—" : summary.trucksInside.toString(),
      unit: "tankers",
      subtext: isDisconnected ? "Live operational data unavailable" : "Gate-In to Gate-Out yard occupancy",
      badge: isDisconnected ? "DISCONNECTED" : summary.trucksInside > 40 ? "High Yard Density" : "Nominal Flow",
      badgeColor: isDisconnected
        ? "bg-slate-100 text-slate-500 border-slate-200"
        : summary.trucksInside > 40
        ? "bg-amber-50 text-amber-900 border-amber-300 font-semibold"
        : "bg-slate-100 text-slate-700 border-slate-200",
      icon: <Truck className="w-4 h-4 text-[#0F1B2B]" />,
      explanation: "Total active road tankers currently physically located within KPC terminal boundaries.",
    },
    {
      id: 2,
      label: "IN QUEUE",
      value: isDisconnected ? "—" : summary.inQueue.toString(),
      unit: "tankers",
      subtext: isDisconnected ? "Live operational data unavailable" : "Tare weighbridge & validation hold",
      badge: isDisconnected ? "DISCONNECTED" : summary.inQueue > 8 ? "Staging Congestion" : summary.inQueue > 4 ? "Elevated Inflow" : "Fluid Queue",
      badgeColor: isDisconnected
        ? "bg-slate-100 text-slate-500 border-slate-200"
        : summary.inQueue > 8
        ? "bg-rose-50 text-rose-800 border-rose-300 font-bold"
        : summary.inQueue > 4
        ? "bg-amber-50 text-amber-800 border-amber-200"
        : "bg-emerald-50 text-[#1B7A3D] border-emerald-200",
      icon: <Users className="w-4 h-4 text-amber-700" />,
      explanation: "Tankers waiting for tare scale entry or customs seal verification prior to gantry dispatch.",
    },
    {
      id: 3,
      label: "LOADING",
      value: isDisconnected ? "—" : summary.currentlyLoading.toString(),
      unit: "tankers",
      subtext: isDisconnected ? "Live operational data unavailable" : `Active across ${summary.usablePositions} usable gantries`,
      badge: isDisconnected ? "DISCONNECTED" : `${summary.currentlyLoading}/${summary.usablePositions} Bays Busy`,
      badgeColor: isDisconnected ? "bg-slate-100 text-slate-500 border-slate-200" : "bg-blue-50 text-blue-800 border-blue-200 font-semibold",
      icon: <Fuel className="w-4 h-4 text-blue-700" />,
      explanation: "Tankers currently connected to loading arms undergoing bottom/top loading flow.",
    },
    {
      id: 4,
      label: "AVERAGE TURNAROUND",
      value: isDisconnected ? "—" : `${avgTurnaround}`,
      unit: "min",
      subtext: isDisconnected ? "Live operational data unavailable" : `Target SLA: ${baselineTurnaround} min gate-to-gate`,
      badge: isDisconnected
        ? "DISCONNECTED"
        : isTurnaroundElevated
        ? `+${turnaroundDelta}m above SLA`
        : turnaroundDelta <= 0
        ? "On SLA benchmark"
        : `+${turnaroundDelta}m delta`,
      badgeColor: isDisconnected
        ? "bg-slate-100 text-slate-500 border-slate-200"
        : isTurnaroundElevated
        ? "bg-rose-50 text-rose-800 border-rose-300 font-bold"
        : "bg-emerald-50 text-[#1B7A3D] border-emerald-200",
      icon: <Clock className={`w-4 h-4 ${isTurnaroundElevated ? "text-rose-600" : "text-[#1B7A3D]"}`} />,
      explanation: "Complete gate-to-gate operational duration: arrival tare + document release + gantry fill + gross weighbridge exit.",
    },
    {
      id: 5,
      label: "AT RISK",
      value: isDisconnected ? "—" : summary.atRiskCount.toString(),
      unit: "orders",
      subtext: isDisconnected ? "Live operational data unavailable" : summary.atRiskCount > 0 ? "Threshold breach predicted" : "Zero active breaches",
      badge: isDisconnected ? "DISCONNECTED" : summary.atRiskCount > 0 ? "Intervention Needed" : "All Stable",
      badgeColor: isDisconnected
        ? "bg-slate-100 text-slate-500 border-slate-200"
        : summary.atRiskCount > 0
        ? "bg-rose-100 text-rose-800 border-rose-300 font-bold animate-pulse"
        : "bg-emerald-50 text-[#1B7A3D] border-emerald-200",
      icon: <AlertTriangle className={`w-4 h-4 ${summary.atRiskCount > 0 ? "text-rose-600" : "text-[#1B7A3D]"}`} />,
      explanation: "Collections forecast to exceed terminal dwell SLA unless FlowGuard sequencing or dual-arm intervention is applied.",
    },
    {
      id: 6,
      label: "EFFECTIVE CAPACITY",
      value: isDisconnected ? "—" : `${effectiveRatePerHour}`,
      unit: "trucks/hr",
      subtext: isDisconnected ? "Live operational data unavailable" : `${summary.usablePositions}/${summary.totalPositions} positions (${summary.effectiveCapacity90Min || 11} orders / 90m)`,
      badge: isDisconnected
        ? "DISCONNECTED"
        : summary.usablePositions < summary.totalPositions
        ? `${summary.unavailablePositions} Bay Unavailable`
        : "100% Gantry Nominal",
      badgeColor: isDisconnected
        ? "bg-slate-100 text-slate-500 border-slate-200"
        : summary.usablePositions < summary.totalPositions
        ? "bg-amber-50 text-amber-800 border-amber-200 font-semibold"
        : "bg-emerald-50 text-[#1B7A3D] border-emerald-200",
      icon: <Layers className="w-4 h-4 text-[#1B7A3D]" />,
      explanation: "Achievable throughput accounting for physical bays, meter flow velocity, occupancy transfer loss, and compatibility constraints.",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 px-6 select-none">
      {cards.map((card) => (
        <div
          key={card.id}
          className="bg-white rounded-lg border border-[#E2E6EA] p-3.5 flex flex-col justify-between shadow-2xs hover:border-[#1B7A3D]/40 transition-all relative"
        >
          {/* Card Top */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C6B7A]">
                {card.label}
              </span>
              <button
                type="button"
                onMouseEnter={() => setActiveTooltip(card.id)}
                onMouseLeave={() => setActiveTooltip(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                title={card.explanation}
              >
                <HelpCircle className="w-2.5 h-2.5" />
              </button>
            </div>
            <div className="p-1 rounded bg-[#FAFBFC] border border-[#EDF1F5]">
              {card.icon}
            </div>
          </div>

          {/* Metric Value */}
          <div className="mt-2 mb-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-[#0F1B2B]">
              {card.value}
            </span>
            <span className="text-[11px] font-medium text-[#8492A6]">
              {card.unit}
            </span>
          </div>

          {/* Card Bottom Pill & Subtext */}
          <div className="space-y-1">
            <span
              className={`inline-block text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.2 rounded border ${card.badgeColor}`}
            >
              {card.badge}
            </span>
            <p className="text-[10px] text-[#8492A6] truncate font-medium">
              {card.subtext}
            </p>
          </div>

          {/* Hover Tooltip Popover */}
          {activeTooltip === card.id && (
            <div className="absolute left-2 -bottom-14 z-40 bg-[#0B1420] text-slate-200 text-[10px] p-2 rounded shadow-lg border border-slate-700 w-52 animate-in fade-in">
              {card.explanation}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
