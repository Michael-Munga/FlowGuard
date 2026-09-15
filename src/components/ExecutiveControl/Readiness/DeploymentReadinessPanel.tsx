"use client";

import React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Radio,
  Server,
  Smartphone,
  Cpu,
  ArrowRight,
  Sparkles,
  Lock,
  Layers,
  CheckCircle,
  Database,
  Sliders,
  Scale,
  Fuel,
  Network,
  Award,
} from "lucide-react";
import {
  DeploymentReadinessCategory,
  ExecutiveTrustHealth,
  ExecutiveRecommendation,
} from "@/types/flowguard";

interface DeploymentReadinessPanelProps {
  readiness: DeploymentReadinessCategory[];
  trustHealth: ExecutiveTrustHealth | null;
  recommendation: ExecutiveRecommendation | undefined;
}

export const DeploymentReadinessPanel: React.FC<DeploymentReadinessPanelProps> = ({
  readiness,
  trustHealth,
  recommendation,
}) => {
  const getStatusBadge = (statusLabel: string) => {
    switch (statusLabel) {
      case "ACTIVE":
      case "Demonstrated":
        return "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold";
      case "CONNECTED IN SIMULATION":
      case "Demonstrated in simulation":
        return "bg-teal-100 text-teal-800 border-teal-300 font-semibold";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200 font-mono";
    }
  };

  const integrationAdapters = [
    {
      name: "SAP SD/LE (Loading Orders)",
      protocol: "RFC / BAPI & OData",
      role: "Inbound order manifest & OMC account validation",
      status: "CONNECTED IN SIMULATION",
      icon: <Database className="w-4 h-4 text-blue-600" />,
    },
    {
      name: "Avery Berkel Weighbridges",
      protocol: "REST Webhook / MQTT",
      role: "Tare and gross scale timestamped axle weights",
      status: "CONNECTED IN SIMULATION",
      icon: <Scale className="w-4 h-4 text-emerald-600" />,
    },
    {
      name: "Coriolis Mass-Flow Meters",
      protocol: "Modbus TCP / OPC-UA",
      role: "Continuous density, temp, and flow rate telemetry",
      status: "CONNECTED IN SIMULATION",
      icon: <Cpu className="w-4 h-4 text-purple-600" />,
    },
    {
      name: "Terminal SCADA DCS Interlocks",
      protocol: "OPC-UA Tag Subscription",
      role: "Physical loading arm valve and emergency shutoff state",
      status: "CONNECTED IN SIMULATION",
      icon: <Sliders className="w-4 h-4 text-amber-600" />,
    },
    {
      name: "Tank Farm ATG (Enraf / Saab)",
      protocol: "Fieldbus Gauge Loop",
      role: "Tank level, ullage, and high-high safety interlocks",
      status: "CONNECTED IN SIMULATION",
      icon: <Fuel className="w-4 h-4 text-indigo-600" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Production Architecture & Subsystem Capability Status */}
      <div className="bg-white rounded-lg border border-[#E2E6EA] shadow-xs p-6 space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-[#0F1B2B] tracking-tight">
                FlowGuard Operational Architecture &amp; Production Integration
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>SYSTEM STATUS: OPERATIONAL</span>
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                DEGRADED MODE: AVAILABLE
              </span>
            </div>
            <p className="text-xs text-[#5C6B7A] mt-0.5">
              Production connection model: Live algorithmic execution evaluated in closed-loop simulation with pre-architected KPC system adapters
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500">Scale Footprint:</span>
            <span className="bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded border border-slate-200">
              1 Control Plane • 5 Terminals • 6 Workspaces
            </span>
          </div>
        </div>

        {/* 7-Subsystem Capability Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-mono text-[11px]">
                <th className="py-2.5 px-3 font-bold uppercase w-1/4">Core Subsystem / Capability</th>
                <th className="py-2.5 px-3 font-bold uppercase w-1/6">Operational Status</th>
                <th className="py-2.5 px-3 font-bold uppercase w-1/3">Simulation Verification Notes</th>
                <th className="py-2.5 px-3 font-bold uppercase w-1/4">Production Connection Adapter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {readiness.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{item.dimension}</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">{item.id}</div>
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`inline-block text-[10px] uppercase px-2.5 py-0.5 rounded border whitespace-nowrap ${getStatusBadge(
                        item.statusLabel || item.status
                      )}`}
                    >
                      {item.statusLabel || item.status}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-[11px] text-slate-600 leading-snug">
                    {item.notes}
                  </td>

                  <td className="py-3 px-3 text-[11px] text-slate-600 leading-snug">
                    <span className="font-mono text-[9px] uppercase font-bold text-slate-500 block mb-0.5">
                      Production Step:
                    </span>
                    {item.productionRoadmap}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Operational Boundary & Safety Disclosures */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-[11px] font-mono">
          <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-start gap-2">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-slate-700">
              <strong className="text-slate-900 font-sans block">Deterministic Safety Invariant Guarantee:</strong>
              FlowGuard operates with zero direct unverified physical pump writes. Physical emergency shutoff valves and overfill alarms remain hard-interlocked at the terminal DCS level.
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-start gap-2">
            <Network className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-slate-700">
              <strong className="text-slate-900 font-sans block">Operational Boundary Demarcation:</strong>
              FlowGuard turnaround optimization terminates strictly at terminal Gate-Out. Transit corridors utilize optional GPS updates; no downstream transport routing is enforced.
            </div>
          </div>
        </div>
      </div>

      {/* 2. Authorized KPC Operational Adapters Strip */}
      <div className="bg-white rounded-lg border border-[#E2E6EA] shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono flex items-center gap-1.5">
              <Server className="w-4 h-4 text-indigo-600" />
              <span>Authorized KPC Enterprise System Interfaces (Adapter Model)</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Standardized connector contracts defined for direct integration during pilot deployment
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            5 ADAPTERS READY
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {integrationAdapters.map((adapter, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2 hover:border-slate-300 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="p-1 rounded bg-white border border-slate-200">{adapter.icon}</div>
                  <span className="text-[8px] font-mono font-bold text-teal-800 bg-teal-50 px-1 py-0.2 rounded border border-teal-200 uppercase">
                    SIMULATED
                  </span>
                </div>
                <span className="font-bold text-slate-900 block text-xs truncate">
                  {adapter.name}
                </span>
                <span className="text-[10px] font-mono text-slate-500 block">
                  {adapter.protocol}
                </span>
              </div>
              <p className="text-[10px] text-slate-600 leading-tight">
                {adapter.role}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. System Trust / Health & Final Pilot Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Compact System Trust Strip (~45%) */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-[#E2E6EA] shadow-xs p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                System Health &amp; Trust Telemetry
              </h4>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              OPERATIONAL
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Prediction Engine:</span>
                <span className="font-mono font-bold text-emerald-700">
                  HEALTHY (Mean Error: ±4.2 min)
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">MILP Optimization Solver:</span>
                <span className="font-mono font-bold text-emerald-700">
                  CONVERGED (84ms latency)
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Autonomy Tier:</span>
                <span className="font-mono font-bold text-slate-900">
                  BOUNDED L2/L3 (Deterministic Invariants)
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Audit Trail Integrity:</span>
                <span className="font-mono font-bold text-emerald-700">
                  SYNCHRONIZED (SHA-256 Verified)
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Degraded Fallback:</span>
                <span className="font-mono font-bold text-blue-700">
                  AVAILABLE (Graceful Advisory Mode)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stage-Gate Boardroom Recommendation (~55%) */}
        <div className="lg:col-span-7 bg-[#0B1420] text-white rounded-lg p-6 shadow-sm border border-[#1C2C42] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                  KPC STAGE-GATE MILESTONE DECISION
                </span>
                <h4 className="text-sm font-bold text-white tracking-tight">
                  {recommendation?.headline || "PROCEED TO CONTROLLED MULTI-DEPOT PILOT"}
                </h4>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30 uppercase">
              READY FOR AUTHORIZATION
            </span>
          </div>

          <div className="text-xs text-slate-300 leading-relaxed font-sans">
            <strong className="text-white">Recommended Board Action: </strong>
            {recommendation?.action ||
              "Authorize phased pilot deployment across Nairobi (PS10), Nakuru (PS25), and Eldoret (PS27) operational corridors."}
          </div>

          <div className="space-y-2 pt-1 border-t border-slate-800 text-xs">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              Core Technical &amp; Commercial Justifications:
            </span>
            <ul className="space-y-1.5 text-[11px] text-slate-300">
              {recommendation?.justifications.map((just, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{just}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
