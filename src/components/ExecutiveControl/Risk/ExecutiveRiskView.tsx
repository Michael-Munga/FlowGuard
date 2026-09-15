"use client";

import React from "react";
import {
  AlertTriangle,
  ShieldCheck,
  DollarSign,
  Building,
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";
import { ExecutiveRiskSummary, ExecutiveAlert } from "@/types/flowguard";

interface ExecutiveRiskViewProps {
  riskSummary: ExecutiveRiskSummary | null;
  alerts: ExecutiveAlert[];
}

export const ExecutiveRiskView: React.FC<ExecutiveRiskViewProps> = ({ riskSummary, alerts }) => {
  const projectedKes = riskSummary?.projectedExposureTotalKes || 19670000;
  const protectedKes = riskSummary?.exposureProtectedKes || 14820000;
  const atRiskKes = riskSummary?.remainingAtRiskKes || 4850000;
  const protectionRate = riskSummary?.protectionRatePct || 75.3;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* 1. Financial Exposure Accounting (~55%) */}
      <div className="xl:col-span-7 bg-white rounded-lg border border-[#E2E6EA] shadow-xs p-6 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0F1B2B] tracking-tight">
                  Financial Demurrage Exposure Accounting
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                  75.3% RISK MITIGATION
                </span>
              </div>
              <p className="text-xs text-[#5C6B7A] mt-0.5">
                Modeled TSA demurrage penalty liability projected, prevented, and remaining active
              </p>
            </div>

            <span className="text-xs font-mono font-bold text-slate-700">
              Total Exposure: KES {(projectedKes / 1000000).toFixed(2)}M
            </span>
          </div>

          {/* 3 Metric Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-mono text-slate-500 font-bold block mb-1">
                PROJECTED TOTAL
              </span>
              <span className="text-xl font-bold font-mono text-slate-800">
                KES {(projectedKes / 1000000).toFixed(2)}M
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                Gross modeled delay liability
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] uppercase font-mono text-emerald-800 font-bold block mb-1">
                EXPOSURE PROTECTED
              </span>
              <span className="text-xl font-bold font-mono text-emerald-700">
                KES {(protectedKes / 1000000).toFixed(2)}M
              </span>
              <span className="text-[10px] text-emerald-600 block mt-1 font-semibold">
                {protectionRate}% prevented
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200">
              <span className="text-[10px] uppercase font-mono text-amber-900 font-bold block mb-1">
                REMAINING AT RISK
              </span>
              <span className="text-xl font-bold font-mono text-amber-800">
                KES {(atRiskKes / 1000000).toFixed(2)}M
              </span>
              <span className="text-[10px] text-amber-700 block mt-1">
                Active operational exposure
              </span>
            </div>
          </div>

          {/* Stacked Protection Bar */}
          <div className="space-y-1.5 my-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-700 font-bold">
                Protected: KES {(protectedKes / 1000000).toFixed(2)}M ({protectionRate}%)
              </span>
              <span className="text-amber-700 font-bold">
                Active at Risk: KES {(atRiskKes / 1000000).toFixed(2)}M ({(100 - protectionRate).toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-amber-200 h-3 rounded-full overflow-hidden flex shadow-inner">
              <div
                className="h-full bg-emerald-600 transition-all duration-500 rounded-l-full"
                style={{ width: `${protectionRate}%` }}
              />
            </div>
          </div>

          {/* Top 3 Network Risks Table */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 font-mono">
              Top 3 Active Network Operational Risks
            </h4>
            <div className="space-y-2">
              {riskSummary?.topRisks.map((risk) => (
                <div
                  key={risk.rank}
                  className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between text-xs gap-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono font-bold text-slate-400 w-5">#{risk.rank}</span>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 block truncate">{risk.depotName}</span>
                      <span className="text-[11px] text-slate-500">
                        {risk.bottleneckCategory} • {risk.ordersExposedCount} collections exposed
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono flex-shrink-0">
                    <span className="font-bold text-slate-900 block">
                      KES {(risk.potentialExposureKes / 1000000).toFixed(2)}M
                    </span>
                    <span className="text-[10px] text-emerald-700 font-sans font-semibold">
                      {risk.mitigationStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Executive Strategic Alerts (~45%) */}
      <div className="xl:col-span-5 bg-white rounded-lg border border-[#E2E6EA] shadow-xs p-6 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0F1B2B] tracking-tight">
                  Executive Strategic Alerts
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                  MANAGEMENT EXCEPTIONS
                </span>
              </div>
              <p className="text-xs text-[#5C6B7A] mt-0.5">
                High-level operational exceptions and notable system milestones
              </p>
            </div>

            <Bell className="w-4 h-4 text-slate-500" />
          </div>

          {/* Alerts List */}
          <div className="space-y-2.5 my-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-lg border text-xs space-y-1 transition-all bg-slate-50/70 border-slate-200 hover:border-slate-300"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {alert.type === "SUCCESS" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    {alert.type === "WARNING" && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                    {alert.type === "INFO" && <Info className="w-3.5 h-3.5 text-blue-600" />}
                    {alert.type === "ACTION_REQUIRED" && <AlertCircle className="w-3.5 h-3.5 text-purple-600" />}
                    <h5 className="font-bold text-slate-900">{alert.title}</h5>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{alert.timestamp}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-normal pl-5">
                  {alert.message}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
          Strategic notifications are filtered to major operational events and governance gates.
        </div>
      </div>
    </div>
  );
};
