"use client";

import React from "react";
import Link from "next/link";
import {
  Package,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Bell,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import {
  OmcProfile,
  OmcKpiSummary,
  OmcCollectionOrder,
  OmcNotification,
} from "@/types/flowguard";

interface OmcOverviewTilesProps {
  profile: OmcProfile | null;
  kpis: OmcKpiSummary | null;
  orders: OmcCollectionOrder[];
  notifications: OmcNotification[];
}

const fmtKes = (n: number) =>
  `KES ${n.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const OmcOverviewTiles: React.FC<OmcOverviewTilesProps> = ({
  profile,
  kpis,
  orders,
  notifications,
}) => {
  const atRiskOrders = orders.filter(
    (o) => o.riskSeverity === "CRITICAL" || o.riskSeverity === "ELEVATED"
  );
  const topAtRisk = atRiskOrders[0];

  const unacknowledged = notifications.filter(
    (n) => n.requiresAcknowledgement && !n.isAcknowledged
  ).length;

  const tiles = [
    {
      id: "active-orders",
      title: "Active Collections",
      icon: <Package className="w-4 h-4" />,
      accent: "text-blue-700 bg-blue-50 border-blue-200",
      primary: `${kpis?.activeOrdersCount ?? orders.length} orders`,
      secondary: `${kpis?.trucksInKpcProcess ?? 0} trucks in KPC process`,
      meta: `Expected gate-outs today: ${kpis?.expectedGateOutsToday ?? 0}`,
      href: "/omc/orders",
      footer: `${kpis?.gateOutsCompletedToday ?? 0} already completed`,
    },
    {
      id: "turnaround",
      title: "Turnaround Outlook",
      icon: <Clock className="w-4 h-4" />,
      accent: "text-emerald-700 bg-emerald-50 border-emerald-200",
      primary: `${kpis?.predictedAvgTurnaroundMin ?? 0} min`,
      secondary: `Baseline ${kpis?.baselineAvgTurnaroundMin ?? 0} min`,
      meta: `Delta ${kpis?.turnaroundDeltaMin ?? 0} min vs baseline`,
      href: "/omc/outlook",
      footer: "SLA envelope: 90 minutes gate-in to gate-out",
      highlight: true,
    },
    {
      id: "exposure",
      title: "Demurrage Exposure",
      icon: <TrendingDown className="w-4 h-4" />,
      accent: "text-rose-700 bg-rose-50 border-rose-200",
      primary: fmtKes(kpis?.exposureAtRiskKes ?? 0),
      secondary: `Protected ${fmtKes(kpis?.exposureProtectedKes ?? 0)}`,
      meta: `Realized savings ${fmtKes(kpis?.realizedSavingsKes ?? 0)}`,
      href: "/omc/reports",
      footer: "FlowGuard reroutes to protect your TSA window",
    },
    {
      id: "at-risk",
      title: "Orders At Risk",
      icon: <AlertTriangle className="w-4 h-4" />,
      accent: "text-amber-700 bg-amber-50 border-amber-200",
      primary: `${kpis?.atRiskCount ?? 0} at risk`,
      secondary: topAtRisk
        ? `${topAtRisk.truckRegistration} · ${topAtRisk.currentStageLabel}`
        : "All collections tracking on-time",
      meta: topAtRisk
        ? `${topAtRisk.depotName} · ${topAtRisk.predictedTurnaroundMin} min predicted`
        : "No active risk vectors",
      href: "/omc/orders",
      footer: "Tap to see full journey & delay cause",
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: <Bell className="w-4 h-4" />,
      accent: "text-purple-700 bg-purple-50 border-purple-200",
      primary: `${notifications.length} total`,
      secondary:
        unacknowledged > 0 ? `${unacknowledged} awaiting acknowledgement` : "All acknowledged",
      meta: `Recent: ${
        notifications[0]?.title ?? "No updates yet"
      }`,
      href: "/omc/notifications",
      footer: "Two-way dispatcher updates",
    },
    {
      id: "gate-outs",
      title: "Gate-Out Progress",
      icon: <CheckCircle2 className="w-4 h-4" />,
      accent: "text-indigo-700 bg-indigo-50 border-indigo-200",
      primary: `${kpis?.gateOutsCompletedToday ?? 0} of ${
        kpis?.expectedGateOutsToday ?? 0
      }`,
      secondary: `${
        kpis?.expectedGateOutsRemaining ?? 0
      } remaining for today`,
      meta: "Update cadence: continuous",
      href: "/omc/orders",
      footer: "Real-time driver progress visibility",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {tiles.map((t) => (
        <Link
          key={t.id}
          href={t.href}
          className={`group rounded-lg p-5 transition-all hover:shadow-md ${
            t.highlight
              ? "bg-gradient-to-b from-emerald-50/60 to-white border-2 border-emerald-400"
              : "bg-white border border-[#E2E6EA] hover:border-[#1B7A3D]/40"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-md border ${t.accent}`}>{t.icon}</div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#1B7A3D] group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8492A6]">
            {t.title}
          </div>
          <div className="text-xl font-bold text-[#0F1B2B] mt-1.5 leading-tight font-mono">
            {t.primary}
          </div>
          <div className="text-xs text-[#5C6B7A] mt-1">{t.secondary}</div>
          <div className="text-[11px] text-[#8492A6] mt-2 leading-snug line-clamp-2">
            {t.meta}
          </div>
          <div className="text-[10px] text-[#8492A6] mt-3 pt-3 border-t border-[#EDF1F5] flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-[#1B7A3D]" />
            {t.footer}
          </div>
        </Link>
      ))}
    </div>
  );
};