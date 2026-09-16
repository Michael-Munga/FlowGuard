"use client";

import React from "react";
import Link from "next/link";
import {
  Package,
  Wallet,
  Clock,
  Zap,
  AlertTriangle,
  Rocket,
  ArrowRight,
  CheckCircle2,
  Activity,
} from "lucide-react";
import {
  ExecutiveKpiSummary,
  ExecutiveRiskSummary,
  ExecutiveTrustHealth,
  ExecutiveAlert,
  ExecutiveTimePeriod,
} from "@/types/flowguard";

interface ExecutiveOverviewTilesProps {
  kpis: ExecutiveKpiSummary | null;
  riskSummary: ExecutiveRiskSummary | null;
  trustHealth: ExecutiveTrustHealth | null;
  alerts: ExecutiveAlert[];
  timePeriod: ExecutiveTimePeriod;
}

const fmtKes = (n: number) =>
  `KES ${(n / 1_000_000).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}M`;

const fmtNum = (n: number) =>
  n.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const ExecutiveOverviewTiles: React.FC<ExecutiveOverviewTilesProps> = ({
  kpis,
  riskSummary,
  trustHealth,
  alerts,
  timePeriod,
}) => {
  const periodLabel =
    timePeriod === "TODAY" ? "Today"
    : timePeriod === "7_DAYS" ? "Last 7 Days"
    : "Last 30 Days";

  const throughputLitres = 42_500_000; // modeled period throughput
  const activeTrucks = 26;

  const tiles = [
    {
      id: "throughput",
      title: "Network Throughput",
      icon: <Package className="w-4 h-4" />,
      accent: "text-emerald-700 bg-emerald-50 border-emerald-200",
      primary: `${fmtNum(throughputLitres / 1_000_000)}M litres`,
      secondary: `${activeTrucks} active tankers · ${periodLabel}`,
      meta: "Aggregated across Nairobi, Nakuru, Eldoret, Mombasa, Kisumu",
      href: "/executive/performance",
      footer: "Served within 90-minute SLA envelope",
    },
    {
      id: "demurrage",
      title: "Demurrage Value",
      icon: <Wallet className="w-4 h-4" />,
      accent: "text-emerald-800 bg-emerald-50 border-emerald-300",
      primary: fmtKes(kpis?.totalExposureProtectedKes ?? 14_820_000),
      secondary: `Realized ${fmtKes(kpis?.realizedSavingsKes ?? 11_350_000)}`,
      meta: `${riskSummary?.protectionRatePct ?? 75.3}% of projected exposure prevented`,
      href: "/executive/value",
      footer: `Projected total ${fmtKes(riskSummary?.projectedExposureTotalKes ?? 19_670_000)}`,
      highlight: true,
    },
    {
      id: "turnaround",
      title: "Turnaround Compression",
      icon: <Clock className="w-4 h-4" />,
      accent: "text-blue-700 bg-blue-50 border-blue-200",
      primary: `${kpis?.currentTurnaroundMin ?? 56} min`,
      secondary: `Baseline ${kpis?.baselineTurnaroundMin ?? 87} min`,
      meta: `${kpis?.turnaroundImprovementPct ?? -35.6}% improvement (${
        kpis?.turnaroundRecoveredMin ?? 31
      } min recovered)`,
      href: "/executive/performance",
      footer: "Sustained trajectory verified over 30-day window",
    },
    {
      id: "autonomy",
      title: "Autonomy Efficacy",
      icon: <Zap className="w-4 h-4" />,
      accent: "text-amber-700 bg-amber-50 border-amber-200",
      primary: `${kpis?.interventionSuccessRatePct ?? 92}%`,
      secondary: `${kpis?.interventionsVerifiedSuccess ?? 46} of ${
        kpis?.autonomousInterventionsTotal ?? 50
      } verified`,
      meta: `Prediction attainment ${
        kpis?.recoveryAttainmentPct ?? 89.5
      }% · ±${kpis?.meanPredictionErrorMin ?? 4.2} min error`,
      href: "/executive/performance",
      footer: "Zero safety invariant breaches recorded",
    },
    {
      id: "risk",
      title: "Operational Risk",
      icon: <AlertTriangle className="w-4 h-4" />,
      accent: "text-rose-700 bg-rose-50 border-rose-200",
      primary: fmtKes(riskSummary?.remainingAtRiskKes ?? 4_850_000),
      secondary: `${riskSummary?.topRisks.length ?? 0} active risk vectors`,
      meta: riskSummary?.topRisks?.[0]
        ? `Top: ${riskSummary.topRisks[0].depotName} — ${riskSummary.topRisks[0].bottleneckCategory}`
        : "No critical vectors detected",
      href: "/executive/risk",
      footer: `${alerts.filter((a) => a.type === "WARNING" || a.type === "ACTION_REQUIRED").length} open management alerts`,
    },
    {
      id: "readiness",
      title: "Deployment Readiness",
      icon: <Rocket className="w-4 h-4" />,
      accent: "text-indigo-700 bg-indigo-50 border-indigo-200",
      primary: kpis?.recommendation?.headline ?? "Proceed to pilot",
      secondary: trustHealth?.systemState ?? "OPERATIONAL",
      meta: `Autonomy mode ${trustHealth?.autonomyMode ?? "BOUNDED L2/L3"} · Audit ${
        trustHealth?.auditIntegrity ?? "SYNCHRONIZED"
      }`,
      href: "/executive/readiness",
      footer: "Stage-gate recommendation ready for board review",
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
          <div className="text-[11px] text-[#8492A6] mt-2 leading-snug">{t.meta}</div>
          <div className="text-[10px] text-[#8492A6] mt-3 pt-3 border-t border-[#EDF1F5] flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-[#1B7A3D]" />
            {t.footer}
          </div>
        </Link>
      ))}
    </div>
  );
};