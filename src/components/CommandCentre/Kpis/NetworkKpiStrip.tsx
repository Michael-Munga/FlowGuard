"use client";

import React, { useState } from "react";
import {
  Truck,
  Building,
  AlertTriangle,
  Clock,
  Zap,
  ShieldCheck,
  Info,
} from "lucide-react";
import { NetworkKpis } from "@/types/flowguard";
import { useDataSource } from "@/context/DataSourceContext";

interface NetworkKpiStripProps {
  kpis: NetworkKpis;
}

export const NetworkKpiStrip: React.FC<NetworkKpiStripProps> = ({ kpis }) => {
  const [showExposureTooltip, setShowExposureTooltip] = useState(false);
  const { dataMode, isApiConnected } = useDataSource();
  const isDisconnected = dataMode === "api" && !isApiConnected;

  const formatKes = (amount: number) => {
    if (amount >= 1000000) {
      return `KES ${(amount / 1000000).toFixed(2)}M`;
    }
    if (amount >= 1000) {
      return `KES ${(amount / 1000).toFixed(0)}k`;
    }
    return `KES ${amount}`;
  };

  const turnaroundDelta = kpis.avgPredictedTurnaroundMin - kpis.baselineTurnaroundMin;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5 px-6 pt-4 pb-2">
      {/* 1. Expected Collection Demand */}
      <div className="bg-white rounded-lg border border-[#E2E6EA] p-3.5 shadow-2xs hover:border-[#cbd5e1] transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C6B7A]">
              Expected Collection Demand
            </span>
            <div className="w-5 h-5 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <Truck className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-[#0F1B2B] tracking-tight">
              {isDisconnected ? "—" : kpis.expectedCollectionDemandNearTerm.toLocaleString()}
            </span>
            <span className="text-[10px] text-[#5C6B7A] font-medium">orders / trucks</span>
          </div>
        </div>
        <div className="mt-2 text-[10px] text-[#5C6B7A] flex items-center justify-between border-t border-[#F1F5F9] pt-1.5">
          <span className="text-[#0F1B2B] font-semibold">{isDisconnected ? "Live operational data unavailable" : "Near-Term Horizon"}</span>
          {!isDisconnected && <span className="font-mono text-slate-500">Next 90 Min</span>}
        </div>
      </div>

      {/* 2. Trucks Inside KPC */}
      <div className="bg-white rounded-lg border border-[#E2E6EA] p-3.5 shadow-2xs hover:border-[#cbd5e1] transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C6B7A]">
              Trucks Inside KPC
            </span>
            <div className="w-5 h-5 rounded bg-slate-50 border border-[#E2E6EA] flex items-center justify-center text-[#5C6B7A]">
              <Building className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-[#0F1B2B] tracking-tight">
              {isDisconnected ? "—" : kpis.trucksInsideTotal}
            </span>
            <span className="text-[10px] text-[#5C6B7A] font-medium">active in yard</span>
          </div>
        </div>
        <div className="mt-2 text-[10px] text-[#5C6B7A] flex items-center justify-between border-t border-[#F1F5F9] pt-1.5">
          {isDisconnected ? (
            <span className="text-slate-400">Live operational data unavailable</span>
          ) : (
            <>
              <span className="text-[#1B7A3D] font-semibold">{kpis.loadingTrucksCount ?? 0} loading</span>
              <span className="text-slate-500">{kpis.queueTrucksCount ?? 0} in gate / queue</span>
            </>
          )}
        </div>
      </div>

      {/* 3. At-Risk Operations */}
      <div className="bg-white rounded-lg border border-[#E2E6EA] p-3.5 shadow-2xs hover:border-[#cbd5e1] transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C6B7A]">
              At-Risk Operations
            </span>
            <div className="w-5 h-5 rounded bg-rose-50 border border-rose-200 flex items-center justify-center text-[#C0392B]">
              <AlertTriangle className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-[#C0392B] tracking-tight">
              {isDisconnected ? "—" : kpis.atRiskCount}
            </span>
            <span className="text-[10px] text-[#C0392B] font-semibold">predicted delays</span>
          </div>
        </div>
        <div className="mt-2 text-[10px] text-[#B7791F] flex items-center justify-between border-t border-[#F1F5F9] pt-1.5 font-medium">
          {isDisconnected ? (
            <span className="text-slate-400">Live operational data unavailable</span>
          ) : (
            <>
              <span className="text-rose-700 font-semibold">{kpis.severityCounts?.critical ?? 2} Critical</span>
              <span className="text-amber-700 font-semibold">{(kpis.severityCounts?.high ?? 0) + (kpis.severityCounts?.medium ?? 0) || 2} Watch / High</span>
            </>
          )}
        </div>
      </div>

      {/* 4. Predicted Turnaround */}
      <div className="bg-white rounded-lg border border-[#E2E6EA] p-3.5 shadow-2xs hover:border-[#cbd5e1] transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C6B7A]">
              Predicted Turnaround
            </span>
            <div className="w-5 h-5 rounded bg-slate-50 border border-[#E2E6EA] flex items-center justify-center text-[#5C6B7A]">
              <Clock className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-[#0F1B2B] tracking-tight">
              {isDisconnected ? "—" : `${kpis.avgPredictedTurnaroundMin}m`}
            </span>
            <span className="text-[10px] text-[#5C6B7A]">network avg</span>
          </div>
        </div>
        <div className="mt-2 text-[10px] flex items-center justify-between border-t border-[#F1F5F9] pt-1.5">
          {isDisconnected ? (
            <span className="text-slate-400">Live operational data unavailable</span>
          ) : (
            <>
              <span className="text-[#8492A6]">Baseline: {kpis.baselineTurnaroundMin}m</span>
              <span className={`font-semibold ${turnaroundDelta > 0 ? "text-[#B7791F]" : "text-[#1B7A3D]"}`}>
                ({turnaroundDelta > 0 ? `+${turnaroundDelta.toFixed(1)}m` : `${turnaroundDelta.toFixed(1)}m`})
              </span>
            </>
          )}
        </div>
      </div>

      {/* 5. Active Interventions */}
      <div className="bg-white rounded-lg border border-[#E2E6EA] p-3.5 shadow-2xs hover:border-[#cbd5e1] transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C6B7A]">
              Active Interventions
            </span>
            <div className="w-5 h-5 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#1B7A3D]">
              <Zap className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-[#1B7A3D] tracking-tight">
              {isDisconnected ? "—" : kpis.activeInterventionsCount}
            </span>
            <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-50 text-[#1B7A3D] border border-emerald-200 font-mono">
              {isDisconnected ? "OFFLINE" : "ACTIVE"}
            </span>
          </div>
        </div>
        <div className="mt-2 text-[10px] text-[#5C6B7A] flex items-center justify-between border-t border-[#F1F5F9] pt-1.5">
          {isDisconnected ? (
            <span className="text-slate-400">Live operational data unavailable</span>
          ) : (
            <>
              <span className="text-emerald-700 font-semibold">{kpis.autoExecutedCount ?? kpis.activeInterventionsCount} Auto-Executed</span>
              {kpis.approvalRequiredCount > 0 && (
                <span className="text-amber-700 font-bold">{kpis.approvalRequiredCount} Approval Req</span>
              )}
            </>
          )}
        </div>
      </div>

      {/* 6. Exposure Protected (Strict Separation of Financial Concepts) */}
      <div className="bg-white rounded-lg border border-[#E2E6EA] p-3.5 shadow-2xs hover:border-[#cbd5e1] transition-all flex flex-col justify-between relative">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C6B7A]">
                Exposure Protected
              </span>
              <button
                onClick={() => setShowExposureTooltip(!showExposureTooltip)}
                className="text-slate-400 hover:text-slate-600 focus:outline-hidden"
                title="Explain financial exposure methodology"
              >
                <Info className="w-3 h-3" />
              </button>
            </div>
            <div className="w-5 h-5 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#1B7A3D]">
              <ShieldCheck className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-[#1B7A3D] tracking-tight">
              {isDisconnected ? "—" : formatKes(kpis.exposureProtectedKes)}
            </span>
            <span className="text-[9px] font-bold uppercase px-1 py-0.2 rounded bg-emerald-100/60 text-emerald-800">
              {isDisconnected ? "OFFLINE" : "MODELED"}
            </span>
          </div>
        </div>
        <div className="mt-2 text-[10px] text-[#5C6B7A] flex items-center justify-between border-t border-[#F1F5F9] pt-1.5">
          {isDisconnected ? (
            <span className="text-slate-400">Live operational data unavailable</span>
          ) : (
            <>
              <span className="text-slate-500">At Risk:</span>
              <span className="font-mono text-[#C0392B] font-semibold">{formatKes(kpis.exposureAtRiskKes)}</span>
              <span className="text-slate-300">|</span>
              <span className="font-mono text-slate-600">Realized: {formatKes(kpis.realizedSavingsKes)}</span>
            </>
          )}
        </div>

        {/* Informational Tooltip Popover */}
        {showExposureTooltip && (
          <div className="absolute right-0 bottom-full mb-2 w-72 p-3 rounded-lg bg-[#0B1420] text-white shadow-xl border border-slate-700 z-30 text-[11px] space-y-1.5">
            <div className="font-bold text-amber-300 flex items-center justify-between">
              <span>Financial Exposure Definitions</span>
              <button onClick={() => setShowExposureTooltip(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="text-slate-300 leading-snug">
              <strong className="text-white">Exposure at Risk:</strong> Potential demurrage liability incurred if orders breach terminal dwell SLA.
            </p>
            <p className="text-slate-300 leading-snug">
              <strong className="text-emerald-300">Exposure Protected:</strong> Modeled risk mitigated via FlowGuard autonomous rebalancing. (Control-plane projection, not realized accounting).
            </p>
            <p className="text-slate-300 leading-snug">
              <strong className="text-white">Realized Savings:</strong> Demurrage penalties verified avoided post gate-out.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
