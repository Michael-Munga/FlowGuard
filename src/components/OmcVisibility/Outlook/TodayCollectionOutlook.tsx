"use client";

import React, { useState } from "react";
import {
  Clock,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Activity,
  Building,
  CheckCircle2,
  Info,
} from "lucide-react";
import { OmcHourlyOutlook } from "@/types/flowguard";

interface TodayCollectionOutlookProps {
  outlooks: OmcHourlyOutlook[];
  omcName: string;
}

interface DepotReadiness {
  name: string;
  code: string;
  status: "NORMAL" | "WATCH" | "ATTENTION";
  condition: string;
  turnaroundEstimate: string;
}

const DEPOT_READINESS: DepotReadiness[] = [
  {
    name: "Nairobi Terminal",
    code: "PS10",
    status: "ATTENTION",
    condition: "Morning peak inflow; dual-arm allocation active",
    turnaroundEstimate: "64 min (+16m)",
  },
  {
    name: "Mombasa Terminal",
    code: "PS01",
    status: "NORMAL",
    condition: "Marine discharge nominal; 8 of 8 gantries clear",
    turnaroundEstimate: "44 min (Nominal)",
  },
  {
    name: "Nakuru Depot",
    code: "PS25",
    status: "WATCH",
    condition: "Customs validation queue backlog; slight dwell",
    turnaroundEstimate: "58 min (+8m)",
  },
  {
    name: "Eldoret Depot",
    code: "PS27",
    status: "NORMAL",
    condition: "Western corridor steady; weighbridges flowing",
    turnaroundEstimate: "46 min (Nominal)",
  },
  {
    name: "Kisumu Depot",
    code: "PS28",
    status: "NORMAL",
    condition: "Lake transit loading on schedule; no queues",
    turnaroundEstimate: "48 min (Nominal)",
  },
];

export const TodayCollectionOutlook: React.FC<TodayCollectionOutlookProps> = ({
  outlooks,
  omcName,
}) => {
  const [selectedHorizon, setSelectedHorizon] = useState<string>("ALL");

  const horizons = [
    { id: "30min", label: "NEXT 30 MIN", window: "10:00–10:30", count: 3, status: "WATCH", condition: "Peak Queue Staging" },
    { id: "60min", label: "NEXT 60 MIN", window: "10:30–11:30", count: 5, status: "AT RISK", condition: "Capacity Pressure (+16m)" },
    { id: "90min", label: "NEXT 90 MIN", window: "11:30–13:00", count: 4, status: "ON TRACK", condition: "Stabilizing Turnover" },
    { id: "today", label: "TODAY (FULL SHIFT)", window: "07:00–19:00", count: 18, status: "ON TRACK", condition: "88% On-SLA Delivery" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AT RISK":
      case "CAPACITY_PRESSURE":
      case "ATTENTION":
        return {
          badge: "bg-amber-100 text-amber-900 border-amber-300 font-bold",
          border: "border-amber-200 bg-amber-50/25",
        };
      case "WATCH":
      case "STABILIZING":
        return {
          badge: "bg-blue-100 text-blue-900 border-blue-200 font-semibold",
          border: "border-blue-200 bg-blue-50/20",
        };
      case "ON TRACK":
      case "NORMAL":
      default:
        return {
          badge: "bg-emerald-100 text-emerald-900 border-emerald-300 font-medium",
          border: "border-[#E2E6EA] bg-[#FAFBFC]",
        };
    }
  };

  return (
    <div className="space-y-4 select-none">
      {/* 1. Main Collection Outlook Card */}
      <div className="bg-white rounded-lg border border-[#E2E6EA] p-5 shadow-xs space-y-3.5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#EDF1F5] pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1B7A3D]" />
            <div>
              <h3 className="font-bold text-sm text-[#0F1B2B]">
                Today&apos;s Collection Outlook
              </h3>
              <span className="text-xs text-[#5C6B7A]">
                Forward terminal collection windows and turnaround conditions for {omcName}
              </span>
            </div>
          </div>

          <span className="text-[10px] font-mono text-[#1B7A3D] font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            DEMAND &amp; CAPACITY HORIZONS
          </span>
        </div>

        {/* 4 Horizons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {horizons.map((h) => {
            const config = getStatusBadge(h.status);
            return (
              <div
                key={h.id}
                className={`p-3.5 rounded-lg border flex flex-col justify-between transition-all ${config.border}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-[#0F1B2B] tracking-wider uppercase">
                      {h.label}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded border uppercase ${config.badge}`}
                    >
                      {h.status}
                    </span>
                  </div>

                  <span className="font-mono text-xs font-bold text-slate-700 block mb-1">
                    Window: {h.window}
                  </span>

                  <div className="flex items-baseline gap-1.5 mb-1.5">
                    <span className="font-mono text-xl font-extrabold text-[#0F1B2B]">
                      {h.count}
                    </span>
                    <span className="text-[11px] text-[#5C6B7A] font-medium">
                      scheduled collections
                    </span>
                  </div>

                  <div className="mt-1">
                    <span className="inline-block text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[#0F1B2B]">
                      {h.condition}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[10px] text-[#8492A6]">
                  <span>Target SLA: 52m</span>
                  <span className="font-medium text-[#1B7A3D]">FlowGuard Active</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dispatch Advisory */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5 text-xs text-[#5C6B7A]">
          <Info className="w-4 h-4 text-[#1B7A3D] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#0F1B2B]">Operational Dispatch Advisory:</strong> During windows marked with <span className="font-bold text-amber-800">Capacity Pressure</span>, staggering vehicle arrival ETAs by 15 minutes reduces pre-gate queuing and ensures direct gantry bay routing upon tare check.
          </p>
        </div>
      </div>

      {/* 2. Terminal & Depot Readiness Card */}
      <div className="bg-white rounded-lg border border-[#E2E6EA] p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-[#EDF1F5] pb-2.5">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-[#1B7A3D]" />
            <div>
              <h4 className="font-bold text-xs text-[#0F1B2B] uppercase tracking-wide">
                Terminal &amp; Depot Readiness Summary
              </h4>
              <span className="text-[10px] text-[#8492A6]">
                Real-time loading position availability across the 5 KPC collection depots
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#5C6B7A]">
            NETWORK STATUS: 5 / 5 OPERATIONAL
          </span>
        </div>

        {/* Depot Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {DEPOT_READINESS.map((depot) => {
            const config = getStatusBadge(depot.status);
            return (
              <div
                key={depot.code}
                className={`p-3 rounded-lg border space-y-1.5 ${config.border}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#0F1B2B]">
                    {depot.name.split(" ")[0]}
                  </span>
                  <span className="font-mono text-[9px] text-[#8492A6]">
                    {depot.code}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded border uppercase ${config.badge}`}
                  >
                    {depot.status}
                  </span>
                  <span className="font-mono text-[10px] text-[#0F1B2B] font-semibold">
                    {depot.turnaroundEstimate.split(" ")[0]}
                  </span>
                </div>

                <p className="text-[10px] text-[#5C6B7A] leading-tight pt-1">
                  {depot.condition}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
