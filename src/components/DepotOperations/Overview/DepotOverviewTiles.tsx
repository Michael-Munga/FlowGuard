"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Layers,
  TrendingUp,
  Wallet,
  ChevronRight,
} from "lucide-react";
import {
  Depot,
  DepotKpiSummary,
  DepotCapacityState,
  DepotEquipmentState,
  DepotBottleneckDiagnosis,
} from "@/types/flowguard";

interface DepotOverviewTilesProps {
  depot: Depot;
  kpi: DepotKpiSummary;
  capacity: DepotCapacityState;
  equipment: DepotEquipmentState;
  bottleneck: DepotBottleneckDiagnosis;
  demurragePreventedKes: number;
}

const fmtKes2 = (n: number) =>
  `KES ${n.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const DepotOverviewTiles: React.FC<DepotOverviewTilesProps> = ({
  depot,
  kpi,
  capacity,
  equipment,
  bottleneck,
  demurragePreventedKes,
}) => {
  const tiles = [
    {
      id: "flow",
      title: "Operations Flow",
      icon: <Activity className="w-4 h-4" />,
      accent: "text-emerald-700 bg-emerald-50 border-emerald-200",
      primary: `${kpi.trucksInside} trucks inside`,
      secondary: `${kpi.currentlyLoading} loading · ${kpi.inQueue} queued`,
      meta: `Avg dwell ${kpi.averageDwellMin} min (baseline ${kpi.baselineDwellMin} min)`,
      href: `/depot/live?depot=${depot.id}`,
    },
    {
      id: "capacity",
      title: "Gantry & Equipment",
      icon: <Layers className="w-4 h-4" />,
      accent: "text-blue-700 bg-blue-50 border-blue-200",
      primary: `${capacity.usableNow}/${capacity.totalPhysicalPositions} bays usable`,
      secondary: `${capacity.degraded} degraded · ${capacity.offlineUnavailable} offline`,
      meta: equipment.metering.detail.slice(0, 60),
      href: `/depot/capacity?depot=${depot.id}`,
    },
    {
      id: "pressure",
      title: "Bottleneck Pressure",
      icon: <TrendingUp className="w-4 h-4" />,
      accent: "text-amber-700 bg-amber-50 border-amber-200",
      primary: bottleneck.currentBottleneck,
      secondary: bottleneck.currentImpact ?? "No impact recorded",
      meta: bottleneck.forecastHorizon ?? "Next 45–90 min horizon",
      href: `/depot/forecast?depot=${depot.id}`,
    },
    {
      id: "risk",
      title: "At-Risk Orders",
      icon: <AlertTriangle className="w-4 h-4" />,
      accent: "text-rose-700 bg-rose-50 border-rose-200",
      primary: `${kpi.atRiskCount} orders at risk`,
      secondary: `${depot.predictedTurnaroundMin} min predicted turnaround`,
      meta: `Baseline ${depot.baselineTurnaroundMin} min · exposure on record`,
      href: `/depot/live?depot=${depot.id}`,
    },
    {
      id: "value",
      title: "Value Protected",
      icon: <Wallet className="w-4 h-4" />,
      accent: "text-emerald-800 bg-emerald-50 border-emerald-200",
      primary: fmtKes2(demurragePreventedKes),
      secondary: `Demurrage prevented this session`,
      meta: `Across ${bottleneck.contributions.length} causal factors`,
      href: `/depot/events?depot=${depot.id}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
      {tiles.map((t) => (
        <Link
          key={t.id}
          href={t.href}
          className="group bg-white rounded-lg border border-[#E2E6EA] hover:border-[#1B7A3D]/40 hover:shadow-md p-4 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div
              className={`p-1.5 rounded-md border ${t.accent}`}
            >
              {t.icon}
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#1B7A3D] transition-colors" />
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8492A6]">
            {t.title}
          </div>
          <div className="text-sm font-bold text-[#0F1B2B] mt-1 leading-snug">
            {t.primary}
          </div>
          <div className="text-[11px] text-[#5C6B7A] mt-0.5">{t.secondary}</div>
          <div className="text-[10px] text-[#8492A6] mt-2 pt-2 border-t border-[#EDF1F5] leading-snug">
            {t.meta}
          </div>
        </Link>
      ))}
    </div>
  );
};