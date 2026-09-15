"use client";

import React, { useState } from "react";
import {
  Truck,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Bell,
  Calendar,
  Layers,
  HelpCircle,
} from "lucide-react";
import { OmcKpiSummary } from "@/types/flowguard";

interface OmcKpiStripProps {
  summary: OmcKpiSummary;
}

export const OmcKpiStrip: React.FC<OmcKpiStripProps> = ({ summary }) => {
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);

  const onTrackCount = Math.max(0, summary.activeOrdersCount - summary.atRiskCount);
  const totalCollectionsToday = (summary.expectedGateOutsToday || 19) + summary.activeOrdersCount;
  const attentionCount = summary.atRiskCount;

  const cards = [
    {
      id: 1,
      label: "ACTIVE COLLECTIONS",
      value: summary.activeOrdersCount.toString(),
      unit: "orders",
      subtext: `${summary.trucksInKpcProcess} physically inside terminal`,
      badge: "In Process",
      badgeColor: "bg-slate-100 text-slate-700 border-slate-200 font-semibold",
      icon: <Truck className="w-4 h-4 text-[#0F1B2B]" />,
      explanation: "Current active collection orders registered with KPC for today's lifting allocation.",
    },
    {
      id: 2,
      label: "EXPECTED TODAY",
      value: totalCollectionsToday.toString(),
      unit: "orders",
      subtext: `${summary.gateOutsCompletedToday ?? 6} completed • ${summary.expectedGateOutsRemaining ?? 3} remaining`,
      badge: "Full Day Total",
      badgeColor: "bg-blue-50 text-blue-800 border-blue-200 font-semibold",
      icon: <Calendar className="w-4 h-4 text-blue-700" />,
      explanation: "Total collection volume scheduled across all KPC terminals for today.",
    },
    {
      id: 3,
      label: "ON TRACK",
      value: onTrackCount.toString(),
      unit: "orders",
      subtext: "Tracking within SLA turnaround target",
      badge: "Nominal Flow",
      badgeColor: "bg-emerald-50 text-[#1B7A3D] border-emerald-200 font-semibold",
      icon: <CheckCircle2 className="w-4 h-4 text-[#1B7A3D]" />,
      explanation: "Collections progressing through arrival, validation, and loading without predicted delay.",
    },
    {
      id: 4,
      label: "AT RISK",
      value: summary.atRiskCount.toString(),
      unit: "orders",
      subtext:
        summary.atRiskCount > 0
          ? "Potential turnaround elongation"
          : "Zero turnaround delay risks",
      badge: summary.atRiskCount > 0 ? "Action Recommended" : "All Clear",
      badgeColor:
        summary.atRiskCount > 0
          ? "bg-rose-100 text-rose-800 border-rose-300 font-bold animate-pulse"
          : "bg-emerald-50 text-[#1B7A3D] border-emerald-200",
      icon: (
        <AlertTriangle
          className={`w-4 h-4 ${
            summary.atRiskCount > 0 ? "text-rose-600" : "text-[#1B7A3D]"
          }`}
        />
      ),
      explanation: "Orders where terminal queue pressure or bay availability is forecast to impact target gate-out time.",
    },
    {
      id: 5,
      label: "PREDICTED GATE-OUT",
      value: "11:02–11:15",
      unit: "AM",
      subtext: "Next scheduled completion • 93% conf",
      badge: "Forecast Window",
      badgeColor: "bg-emerald-50 text-[#1B7A3D] border-emerald-200 font-semibold",
      icon: <Clock className="w-4 h-4 text-[#1B7A3D]" />,
      explanation: "Estimated exit window for earliest upcoming collection, derived from arrival and turnaround forecast.",
    },
    {
      id: 6,
      label: "UPDATES REQUIRING ATTENTION",
      value: attentionCount.toString(),
      unit: "notices",
      subtext: attentionCount > 0 ? "Timing changes require acknowledgement" : "All notifications reviewed",
      badge: attentionCount > 0 ? "Action Required" : "Up to Date",
      badgeColor:
        attentionCount > 0
          ? "bg-amber-100 text-amber-900 border-amber-300 font-bold"
          : "bg-slate-100 text-slate-700 border-slate-200",
      icon: <Bell className={`w-4 h-4 ${attentionCount > 0 ? "text-amber-700" : "text-slate-500"}`} />,
      explanation: "Gate-out timing changes, staging advisories, or autonomous sequence notifications awaiting dispatch desk review.",
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
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
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

          {/* Tooltip Hover */}
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
