"use client";

import React from "react";
import {
  Database,
  Radio,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { TelemetryDataSource } from "@/types/flowguard";

interface DataSourcesHealthGridProps {
  sources: TelemetryDataSource[];
  isDegradedMode: boolean;
}

export const DataSourcesHealthGrid: React.FC<DataSourcesHealthGridProps> = ({
  sources,
  isDegradedMode,
}) => {
  const getCategoryMeta = (category: TelemetryDataSource["systemCategory"]) => {
    switch (category) {
      case "ERP":
        return { label: "ERP / Loading Orders", badge: "bg-blue-50 text-blue-700 border-blue-200" };
      case "GATE":
        return { label: "Gate & Scale Events", badge: "bg-purple-50 text-purple-700 border-purple-200" };
      case "METERING":
        return { label: "Loading / Mass-Flow", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "SCADA":
        return { label: "Equipment & Maint.", badge: "bg-slate-100 text-slate-800 border-slate-300" };
      case "TANK_FARM":
        return { label: "Tank / Product Ready", badge: "bg-amber-50 text-amber-800 border-amber-200" };
      case "HISTORICAL":
        return { label: "Historical Baseline", badge: "bg-indigo-50 text-indigo-700 border-indigo-200" };
      case "TELEMATICS":
        return { label: "External Arrival Signals", badge: "bg-cyan-50 text-cyan-800 border-cyan-200" };
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[#E2E6EA] shadow-xs p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#0F1B2B] tracking-tight">
              Operational Telemetry &amp; Data Sources Health
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
              7 OPERATIONAL CATEGORIES
            </span>
          </div>
          <p className="text-xs text-[#5C6B7A] mt-0.5">
            Real-time health monitoring of operational sensor interfaces, loading orders, smart gates, and mass-flow telemetry
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Telemetry Ingestion: <strong>ACTIVE</strong></span>
        </div>
      </div>

      {/* Grid of 7 Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sources.map((source) => {
          const isDegraded = source.status === "DEGRADED";
          const categoryMeta = getCategoryMeta(source.systemCategory);

          return (
            <div
              key={source.id}
              className={`rounded-lg p-4 border flex flex-col justify-between transition-all ${
                isDegraded
                  ? "bg-amber-50/40 border-amber-300 ring-1 ring-amber-400/50"
                  : "bg-[#F8FAFC] border-[#E2E6EA]/80 hover:border-slate-300"
              }`}
            >
              <div>
                {/* Top Row: Category + Status */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border font-mono ${categoryMeta.badge}`}
                  >
                    {categoryMeta.label}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                      isDegraded
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {isDegraded ? (
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    )}
                    <span>{source.status}</span>
                  </span>
                </div>

                {/* Source Name */}
                <h4 className="text-xs font-bold text-slate-900 leading-snug mb-1">
                  {source.name}
                </h4>

                {/* Underlying Source System */}
                <p className="text-[11px] text-slate-500 leading-normal line-clamp-2 mb-3">
                  {source.sourceSystem}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="pt-2 border-t border-slate-200/70 space-y-1 text-[11px] font-mono">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400 font-sans">Latency:</span>
                  <span className="font-bold text-slate-800">{source.latencyMs} ms</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400 font-sans">Health:</span>
                  <span
                    className={`font-bold ${
                      isDegraded ? "text-amber-700" : "text-emerald-700"
                    }`}
                  >
                    {source.healthPct.toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400 font-sans">Sync:</span>
                  <span className="text-slate-700">{source.lastSync}</span>
                </div>

                {/* Fallback indicator if active */}
                {source.isFallbackActive && (
                  <div className="mt-2 pt-1.5 border-t border-amber-200 text-[10px] text-amber-900 font-sans leading-tight">
                    <strong className="block text-amber-950 font-mono text-[9px] uppercase">
                      Fallback Mechanism Engaged:
                    </strong>
                    {source.fallbackMechanism}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
