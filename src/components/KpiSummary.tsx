"use client";

import React from "react";
import {
  Truck,
  Layers,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Activity,
} from "lucide-react";

interface KpiSummaryProps {
  processedToday: number;
  currentlyInSystem: number;
  criticalRiskCount: number;
  warningRiskCount: number;
  onTimeRate: number;
}

export const KpiSummary: React.FC<KpiSummaryProps> = ({
  processedToday = 248,
  currentlyInSystem = 42,
  criticalRiskCount = 3,
  warningRiskCount = 6,
  onTimeRate = 94.2,
}) => {
  const totalAtRisk = criticalRiskCount + warningRiskCount;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 px-6 pt-5 pb-2">
      {/* Card 1: Trucks Processed Today */}
      <div className="bg-white rounded-lg border border-[#E2E6EA] p-4 shadow-xs flex flex-col justify-between hover:border-[#cbd5e1] transition-all">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5C6B7A]">
              Trucks Processed Today
            </span>
            <div className="w-7 h-7 rounded-md bg-[#FAFBFC] border border-[#E2E6EA] flex items-center justify-center text-[#0F1B2B]">
              <Truck className="w-4 h-4 text-[#5C6B7A]" />
            </div>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-[#0F1B2B] tracking-tight">
              {processedToday}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-xs">
            <span className="flex items-center text-[#1B7A3D] font-semibold text-[11px]">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              +12 vs yesterday
            </span>
            <span className="text-[#8492A6] text-[11px]">• Target: 280/day</span>
          </div>
        </div>

        {/* Thin colored progress bar at bottom */}
        <div className="mt-3.5 pt-2 border-t border-[#F1F5F9]">
          <div className="h-1.5 w-full bg-[#EDF2F7] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1B7A3D] rounded-full"
              style={{ width: `${Math.min(100, (processedToday / 280) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card 2: Currently in System */}
      <div className="bg-white rounded-lg border border-[#E2E6EA] p-4 shadow-xs flex flex-col justify-between hover:border-[#cbd5e1] transition-all">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5C6B7A]">
              Currently in System
            </span>
            <div className="w-7 h-7 rounded-md bg-[#FAFBFC] border border-[#E2E6EA] flex items-center justify-center text-[#0F1B2B]">
              <Layers className="w-4 h-4 text-[#5C6B7A]" />
            </div>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-[#0F1B2B] tracking-tight">
              {currentlyInSystem}
            </span>
            <span className="text-xs text-[#5C6B7A] font-medium">
              across 5 depots
            </span>
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-xs">
            <span className="text-[#1B7A3D] font-medium text-[11px] flex items-center gap-1">
              <Activity className="w-3 h-3 text-[#1B7A3D]" />
              Active Influx Rate: 14 bbl/min eq
            </span>
          </div>
        </div>

        {/* Thin progress bar */}
        <div className="mt-3.5 pt-2 border-t border-[#F1F5F9]">
          <div className="h-1.5 w-full bg-[#EDF2F7] rounded-full overflow-hidden flex">
            <div className="h-full bg-[#1B7A3D]" style={{ width: "68%" }} />
            <div className="h-full bg-[#3DAA63]" style={{ width: "20%" }} />
          </div>
        </div>
      </div>

      {/* Card 3: Trucks at Risk */}
      <div className="bg-white rounded-lg border border-[#E2E6EA] p-4 shadow-xs flex flex-col justify-between hover:border-[#cbd5e1] transition-all">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5C6B7A]">
              Trucks at Risk
            </span>
            <div className="w-7 h-7 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-[#B7791F]">
              <AlertTriangle className="w-4 h-4 text-[#B7791F]" />
            </div>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-[#C0392B] tracking-tight">
              {totalAtRisk}
            </span>
            <span className="text-xs text-[#5C6B7A] font-medium">
              {criticalRiskCount} critical, {warningRiskCount} warning
            </span>
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-xs">
            <span className="text-[#B7791F] font-semibold text-[11px] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
              Escalation Status: Action Required
            </span>
          </div>
        </div>

        {/* Segment bar with amber and red breakdown */}
        <div className="mt-3.5 pt-2 border-t border-[#F1F5F9]">
          <div className="h-1.5 w-full bg-[#EDF2F7] rounded-full overflow-hidden flex">
            <div
              className="h-full bg-[#C0392B]"
              style={{
                width: `${totalAtRisk > 0 ? (criticalRiskCount / totalAtRisk) * 100 : 0}%`,
              }}
            />
            <div
              className="h-full bg-[#B7791F]"
              style={{
                width: `${totalAtRisk > 0 ? (warningRiskCount / totalAtRisk) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Card 4: On-Time Rate */}
      <div className="bg-white rounded-lg border border-[#E2E6EA] p-4 shadow-xs flex flex-col justify-between hover:border-[#cbd5e1] transition-all">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5C6B7A]">
              On-Time Rate
            </span>
            <div className="w-7 h-7 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#1B7A3D]">
              <CheckCircle2 className="w-4 h-4 text-[#1B7A3D]" />
            </div>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-[#1B7A3D] tracking-tight">
              {onTimeRate.toFixed(1)}%
            </span>
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-xs">
            <span className="flex items-center text-[#1B7A3D] font-semibold text-[11px]">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              +6.4pp vs last week
            </span>
            <span className="text-[#8492A6] text-[11px]">• SLA: 90.0%</span>
          </div>
        </div>

        {/* Thin green progress bar at bottom */}
        <div className="mt-3.5 pt-2 border-t border-[#F1F5F9]">
          <div className="h-1.5 w-full bg-[#EDF2F7] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1B7A3D] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, onTimeRate)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
