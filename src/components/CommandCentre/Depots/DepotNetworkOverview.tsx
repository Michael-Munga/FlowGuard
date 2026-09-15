"use client";

import React, { useState } from "react";
import {
  Building,
  AlertTriangle,
  Zap,
  ArrowRight,
  Clock,
  CheckCircle2,
  Gauge,
  Layers,
  ChevronDown,
  ChevronUp,
  Activity,
  ShieldAlert,
  Radio,
  MapPin,
} from "lucide-react";
import { Depot, RiskLevel, OperationalState } from "@/types/flowguard";

interface DepotNetworkOverviewProps {
  depots: Depot[];
  onSelectDepot: (depot: Depot) => void;
}

export const DepotNetworkOverview: React.FC<DepotNetworkOverviewProps> = ({
  depots,
  onSelectDepot,
}) => {
  const [expandedDepotId, setExpandedDepotId] = useState<string | null>("nairobi");
  const [showSchematicMap, setShowSchematicMap] = useState<boolean>(false);

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-50 text-[#C0392B] border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C0392B]" />
            CRITICAL
          </span>
        );
      case "HIGH":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-[#B7791F] border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B7791F]" />
            AT RISK
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            WATCH
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-[#1B7A3D] border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1B7A3D]" />
            NORMAL
          </span>
        );
    }
  };

  const getStateTag = (state: OperationalState) => {
    switch (state) {
      case "CAPACITY PRESSURE":
        return "bg-rose-100/70 text-rose-800 border-rose-300";
      case "EQUIPMENT RISK":
        return "bg-amber-100/70 text-amber-800 border-amber-300";
      case "HIGH DEMAND":
        return "bg-blue-100/70 text-blue-800 border-blue-300";
      case "DEGRADED":
        return "bg-purple-100/70 text-purple-800 border-purple-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedDepotId(expandedDepotId === id ? null : id);
  };

  // Structured Depot Risk Diagnosis (Section 9)
  const getRiskDiagnosis = (depotId: string) => {
    switch (depotId) {
      case "nairobi":
        return {
          problem: "Projected queue bottleneck & turnaround threshold breach (+53m delay risk)",
          cause: "Expected collection demand (18 orders) exceeds effective processing capacity (11 orders) over next 45 min with 3 loading positions constrained",
          action: "Rebalance eligible dual-arm collection activity toward auxiliary Position D (Bay P04)",
          controlState: "AUTO-EXECUTED",
          controlMode: "L2 Autonomous Rebalancing",
          expected: "Reduce projected backlog by 8 trucks and compress dwell by 34 min",
          verification: "VERIFIED (-34 min dwell recovered, 0 demurrage breach)",
          verificationStatus: "VERIFIED",
        };
      case "nakuru":
        return {
          problem: "Slow-fill queuing on primary rack & turnaround variance (+34m above baseline)",
          cause: "Loading position unavailable — metering performance degraded (-18% flow rate) during secondary line calibration",
          action: "Autonomous bay divert to auxiliary position and re-sequence high-volume road tankers",
          controlState: "AUTO-EXECUTED",
          controlMode: "L2 Flow-Rate Adaptive Divert",
          expected: "Bypass degraded position and stabilize turnaround at 64 min",
          verification: "VERIFIED (-26 min dwell recovered)",
          verificationStatus: "VERIFIED",
        };
      case "eldoret":
        return {
          problem: "Ingress transit queue forming before tare weighbridge (+19m turnaround drift)",
          cause: "Transit collection demand surge (14 orders) entering regional transport corridor",
          action: "Pre-clear gate validation credentials electronically & staggered staging dispatch",
          controlState: "AUTO-EXECUTED",
          controlMode: "L2 Predictive Pre-Clearance",
          expected: "Clear ingress backlog in 25 min",
          verification: "MONITORING (Observed: -12 min wait)",
          verificationStatus: "PARTIAL",
        };
      case "mombasa":
        return {
          problem: "None detected — Terminal operating in nominal state",
          cause: "Marine offloading and transit gantry racks operating at balanced throughput",
          action: "Continuous SCADA telemetry monitoring",
          controlState: "MONITORING",
          controlMode: "Passive Predictive Surveillance",
          expected: "Turnaround sustained at ~52 min",
          verification: "VERIFIED (All racks within SLA)",
          verificationStatus: "VERIFIED",
        };
      default:
        return {
          problem: "None detected — Regional depot operating within SLA",
          cause: "Collection demand balanced with usable loading capacity",
          action: "Normal queue sequencing",
          controlState: "MONITORING",
          controlMode: "Passive Predictive Surveillance",
          expected: "Turnaround sustained at ~48 min",
          verification: "VERIFIED (Within SLA)",
          verificationStatus: "VERIFIED",
        };
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[#E2E6EA] shadow-xs flex flex-col">
      {/* Section Header */}
      <div className="p-3.5 px-5 border-b border-[#E2E6EA] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#FAFBFC]">
        <div>
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-[#1B7A3D]" />
            <h2 className="text-sm font-bold text-[#0F1B2B] tracking-tight">
              Depot Network Overview
            </h2>
            <span className="text-[11px] text-[#5C6B7A] hidden sm:inline">
              (5 KPC Terminals Ranked by Operational Urgency)
            </span>
          </div>
          <p className="text-[11px] text-[#5C6B7A] mt-0.5">
            Comparing near-term collection demand against effective processing capacity, causal bottlenecks, and autonomous intervention status
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Schematic Map View Toggle */}
          <button
            onClick={() => setShowSchematicMap(!showSchematicMap)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-all flex items-center gap-1.5 ${
              showSchematicMap
                ? "bg-[#1B7A3D] text-white border-[#1B7A3D]"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{showSchematicMap ? "Hide Pipeline Map" : "Schematic Pipeline Map"}</span>
          </button>

          <div className="flex items-center gap-1 text-[10px] text-[#5C6B7A]">
            <span className="font-semibold text-[#0F1B2B]">Sort:</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded font-mono font-medium text-slate-800 border border-slate-200">
              Operational Urgency ↓
            </span>
          </div>
        </div>
      </div>

      {/* Schematic Pipeline Pressure Map (Section 16: Operational schematic, not fake GIS GPS) */}
      {showSchematicMap && (
        <div className="p-4 bg-slate-900 text-white border-b border-[#1C2C42] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                KPC Pipeline Flow &amp; Depot Pressure Schematic (Line 1, 4, 5)
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Schematic Operational Nodes • Telemetry Freshness: 2s
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2 pt-1">
            {/* Mombasa Node */}
            <div className="p-2.5 rounded bg-slate-800/80 border border-slate-700 text-center space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 block">KOT / PS1</span>
              <span className="text-xs font-bold text-white block truncate">Mombasa</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                NORMAL (52m)
              </span>
            </div>

            {/* Nairobi Node (Critical) */}
            <div className="p-2.5 rounded bg-rose-950/60 border-2 border-rose-500 text-center space-y-1 shadow-md shadow-rose-900/40">
              <span className="text-[10px] font-mono font-bold text-rose-300 block">PS10</span>
              <span className="text-xs font-bold text-white block truncate">Nairobi</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500 text-white animate-pulse">
                CRITICAL (114m)
              </span>
            </div>

            {/* Nakuru Node */}
            <div className="p-2.5 rounded bg-amber-950/60 border border-amber-500 text-center space-y-1">
              <span className="text-[10px] font-mono font-bold text-amber-300 block">PS25</span>
              <span className="text-xs font-bold text-white block truncate">Nakuru</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                AT RISK (88m)
              </span>
            </div>

            {/* Eldoret Node */}
            <div className="p-2.5 rounded bg-blue-950/60 border border-blue-500 text-center space-y-1">
              <span className="text-[10px] font-mono font-bold text-blue-300 block">PS27</span>
              <span className="text-xs font-bold text-white block truncate">Eldoret</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                WATCH (74m)
              </span>
            </div>

            {/* Kisumu Node */}
            <div className="p-2.5 rounded bg-slate-800/80 border border-slate-700 text-center space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 block">PS28</span>
              <span className="text-xs font-bold text-white block truncate">Kisumu</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                NORMAL (48m)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Depots List (Ranked by Urgency) */}
      <div className="divide-y divide-[#E2E6EA]">
        {depots.map((depot) => {
          const isCritical = depot.riskLevel === "CRITICAL";
          const isHigh = depot.riskLevel === "HIGH";
          const isExpanded = expandedDepotId === depot.id;
          const diagnosis = getRiskDiagnosis(depot.id);

          return (
            <div
              key={depot.id}
              onClick={() => onSelectDepot(depot)}
              className={`p-4 transition-all hover:bg-slate-50/80 cursor-pointer flex flex-col gap-3 ${
                isCritical
                  ? "bg-rose-50/20 border-l-4 border-l-[#C0392B]"
                  : isHigh
                  ? "bg-amber-50/20 border-l-4 border-l-[#B7791F]"
                  : "border-l-4 border-l-transparent"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Depot Identity & State */}
                <div className="lg:w-1/4 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#0F1B2B] tracking-tight">
                      {depot.name}
                    </span>
                    {getRiskBadge(depot.riskLevel)}
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded border uppercase ${getStateTag(
                        depot.state
                      )}`}
                    >
                      {depot.state}
                    </span>
                    <span className="text-[11px] text-[#5C6B7A]">
                      Region: {depot.region}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#5C6B7A] pt-0.5">
                    <span className="font-semibold text-[#0F1B2B]">Primary Bottleneck:</span>{" "}
                    {depot.primaryBottleneck}
                  </p>
                  <p className="text-[10px] text-slate-600 leading-snug">
                    {depot.bottleneckDetail}
                  </p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:w-7/12 text-xs">
                  {/* 1. Usable Gantry Loading Capacity */}
                  <div className="p-2.5 rounded bg-[#FAFBFC] border border-[#E2E6EA] flex flex-col justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C6B7A]">
                      Gantry Capacity
                    </span>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="font-mono font-bold text-sm text-[#0F1B2B]">
                        {depot.usableLoadingPositions} / {depot.totalPhysicalPositions}
                      </span>
                      <span className="text-[10px] text-[#5C6B7A]">positions usable</span>
                    </div>
                    {depot.degradedPositions > 0 ? (
                      <span className="text-[10px] text-[#C0392B] font-semibold mt-0.5">
                        {depot.degradedPositions} positions unavailable / servicing
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#1B7A3D] font-medium mt-0.5">
                        All loading arms nominal
                      </span>
                    )}
                  </div>

                  {/* 2. Expected Demand vs Effective Processing Capacity */}
                  <div className="p-2.5 rounded bg-[#FAFBFC] border border-[#E2E6EA] flex flex-col justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C6B7A]">
                      Demand vs Effective Cap
                    </span>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="font-mono font-bold text-sm text-blue-700">
                        {depot.expectedDemandNext90Min} demand
                      </span>
                      <span className="text-[#8492A6]">/</span>
                      <span className="font-mono font-bold text-sm text-[#0F1B2B]">
                        {depot.estimatedProcessingCapacity90Min} cap
                      </span>
                    </div>
                    <span className="text-[10px] text-[#5C6B7A] mt-0.5">
                      {depot.trucksInside} trucks in yard ({depot.currentQueue} queue)
                    </span>
                  </div>

                  {/* 3. Turnaround & Dwell Delta */}
                  <div className="p-2.5 rounded bg-[#FAFBFC] border border-[#E2E6EA] flex flex-col justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C6B7A]">
                      Predicted Turnaround
                    </span>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span
                        className={`font-mono font-bold text-sm ${
                          depot.predictedTurnaroundMin > depot.baselineTurnaroundMin + 15
                            ? "text-[#C0392B]"
                            : "text-[#0F1B2B]"
                        }`}
                      >
                        {depot.predictedTurnaroundMin}m
                      </span>
                      <span className="text-[10px] text-[#8492A6]">
                        (Baseline: {depot.baselineTurnaroundMin}m)
                      </span>
                    </div>
                    <span className="text-[10px] text-[#5C6B7A] mt-0.5">
                      Delivery rate: {depot.loadingPerformanceRatePct}% baseline
                    </span>
                  </div>

                  {/* 4. Autonomous Control Status */}
                  <div className="p-2.5 rounded bg-[#FAFBFC] border border-[#E2E6EA] flex flex-col justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C6B7A]">
                      Autonomous Control
                    </span>
                    <div className="mt-1 flex items-baseline gap-1">
                      {depot.activeInterventionCount > 0 ? (
                        <span className="font-mono font-bold text-sm text-[#1B7A3D]">
                          {depot.activeInterventionCount} Active
                        </span>
                      ) : (
                        <span className="font-mono font-medium text-sm text-slate-500">
                          0 Active
                        </span>
                      )}
                    </div>

                    {depot.interventionStatus === "ACTIVE INTERVENTION" ? (
                      <span className="text-[10px] font-bold text-[#1B7A3D] flex items-center gap-0.5 mt-0.5">
                        <Zap className="w-2.5 h-2.5" />
                        Auto-Executed
                      </span>
                    ) : depot.interventionStatus === "APPROVAL REQUIRED" ? (
                      <span className="text-[10px] font-bold text-[#B7791F] flex items-center gap-0.5 mt-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Approval Required
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#8492A6] mt-0.5">
                        Nominal Velocity
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions: Expand Diagnosis & Drill Down */}
                <div className="flex items-center justify-end gap-2 lg:w-1/12">
                  <button
                    onClick={(e) => toggleExpand(depot.id, e)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
                    title={isExpanded ? "Collapse Risk Diagnosis" : "Expand 6-Stage Risk Diagnosis"}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDepot(depot);
                    }}
                    className="px-2.5 py-1.5 text-xs font-semibold rounded-md bg-white border border-[#E2E6EA] text-[#0F1B2B] hover:bg-[#1B7A3D] hover:text-white hover:border-[#1B7A3D] transition-all flex items-center gap-1 shadow-2xs group"
                  >
                    <span>Drill Down</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>

              {/* 6-Stage Structured Risk Diagnosis (Section 9) */}
              {isExpanded && (
                <div className="mt-2 p-3.5 rounded-lg bg-[#0B1420] text-white border border-slate-800 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
                        Operational Risk Diagnosis — {depot.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                      Control State: {diagnosis.controlState} ({diagnosis.controlMode})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
                    {/* 1. PROBLEM */}
                    <div className="p-2.5 rounded bg-[#152234] border border-[#243447] space-y-1">
                      <span className="text-[9px] font-mono uppercase text-rose-400 font-bold block">
                        1. PROBLEM
                      </span>
                      <p className="text-[11px] text-slate-200 leading-tight">
                        {diagnosis.problem}
                      </p>
                    </div>

                    {/* 2. CAUSE */}
                    <div className="p-2.5 rounded bg-[#152234] border border-[#243447] space-y-1">
                      <span className="text-[9px] font-mono uppercase text-amber-400 font-bold block">
                        2. CAUSE
                      </span>
                      <p className="text-[11px] text-slate-200 leading-tight">
                        {diagnosis.cause}
                      </p>
                    </div>

                    {/* 3. ACTION */}
                    <div className="p-2.5 rounded bg-[#152234] border border-[#243447] space-y-1">
                      <span className="text-[9px] font-mono uppercase text-blue-400 font-bold block">
                        3. ACTION
                      </span>
                      <p className="text-[11px] text-slate-200 leading-tight">
                        {diagnosis.action}
                      </p>
                    </div>

                    {/* 4. CONTROL STATE */}
                    <div className="p-2.5 rounded bg-[#152234] border border-[#243447] space-y-1">
                      <span className="text-[9px] font-mono uppercase text-emerald-400 font-bold block">
                        4. CONTROL STATE
                      </span>
                      <p className="text-[11px] font-bold text-white font-mono leading-tight">
                        {diagnosis.controlState}
                      </p>
                      <span className="text-[9px] text-slate-400 block">
                        {diagnosis.controlMode}
                      </span>
                    </div>

                    {/* 5. EXPECTED OUTCOME */}
                    <div className="p-2.5 rounded bg-[#152234] border border-[#243447] space-y-1">
                      <span className="text-[9px] font-mono uppercase text-cyan-400 font-bold block">
                        5. EXPECTED OUTCOME
                      </span>
                      <p className="text-[11px] text-slate-200 leading-tight">
                        {diagnosis.expected}
                      </p>
                    </div>

                    {/* 6. VERIFICATION */}
                    <div className="p-2.5 rounded bg-[#152234] border border-[#243447] space-y-1">
                      <span className="text-[9px] font-mono uppercase text-emerald-400 font-bold block">
                        6. VERIFICATION
                      </span>
                      <p className="text-[11px] font-bold text-emerald-300 leading-tight">
                        {diagnosis.verification}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
