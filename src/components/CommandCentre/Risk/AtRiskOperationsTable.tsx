"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  Zap,
  Clock,
  CheckCircle2,
  Filter,
  Info,
  Layers,
} from "lucide-react";
import { AtRiskOperation, RiskLevel, ActionStatus } from "@/types/flowguard";

interface AtRiskOperationsTableProps {
  operations: AtRiskOperation[];
  selectedOperationId?: string;
  onSelectOperation: (op: AtRiskOperation) => void;
}

export const AtRiskOperationsTable: React.FC<AtRiskOperationsTableProps> = ({
  operations,
  selectedOperationId,
  onSelectOperation,
}) => {
  const [filterDepot, setFilterDepot] = useState<string>("ALL");

  const filteredOps = operations.filter((op) => {
    if (filterDepot === "ALL") return true;
    return op.depotId === filterDepot;
  });

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
            HIGH
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            WATCH
          </span>
        );
    }
  };

  const getActionBadge = (status: ActionStatus) => {
    switch (status) {
      case "AUTO-EXECUTED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-[#1B7A3D] border border-emerald-200">
            <Zap className="w-2.5 h-2.5" />
            AUTO-EXECUTED
          </span>
        );
      case "APPROVAL REQUIRED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-[#B7791F] border border-amber-200 animate-pulse">
            <AlertTriangle className="w-2.5 h-2.5" />
            APPROVAL REQ
          </span>
        );
      case "AUTO-SCHEDULED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
            SCHEDULED
          </span>
        );
      case "VERIFIED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-[#1B7A3D] border border-emerald-200">
            <CheckCircle2 className="w-2.5 h-2.5" />
            VERIFIED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
            MONITORING
          </span>
        );
    }
  };

  // Helper to derive current operational stage based on operation details
  const getOperationalStage = (op: AtRiskOperation) => {
    if (op.riskLevel === "CRITICAL") return "Staging Yard / Ingress";
    if (op.riskLevel === "HIGH") return "Tare Weighbridge / Queue";
    return "Gantry Bay Allocation";
  };

  return (
    <div className="bg-white rounded-lg border border-[#E2E6EA] shadow-xs flex flex-col h-full">
      {/* Table Header */}
      <div className="p-3.5 px-5 border-b border-[#E2E6EA] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#FAFBFC]">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#C0392B]" />
            <h2 className="text-sm font-bold text-[#0F1B2B] tracking-tight">
              At-Risk Collection Operations &amp; Causal Diagnoses
            </h2>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-rose-100 text-[#C0392B]">
              {operations.length} Orders Flagged
            </span>
          </div>
          <p className="text-[11px] text-[#5C6B7A] mt-0.5">
            Real-time collection orders predicted to breach turnaround SLA with distinct arrival windows, causal factors, and autonomous mitigation
          </p>
        </div>

        {/* Depot Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#F1F5F9] p-0.5 rounded border border-[#E2E6EA] text-xs">
          <button
            onClick={() => setFilterDepot("ALL")}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              filterDepot === "ALL"
                ? "bg-white text-[#0F1B2B] font-semibold shadow-2xs"
                : "text-[#5C6B7A] hover:text-[#0F1B2B]"
            }`}
          >
            All Depots
          </button>
          <button
            onClick={() => setFilterDepot("nairobi")}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              filterDepot === "nairobi"
                ? "bg-white text-[#0F1B2B] font-semibold shadow-2xs"
                : "text-[#5C6B7A] hover:text-[#0F1B2B]"
            }`}
          >
            Nairobi
          </button>
          <button
            onClick={() => setFilterDepot("nakuru")}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              filterDepot === "nakuru"
                ? "bg-white text-[#0F1B2B] font-semibold shadow-2xs"
                : "text-[#5C6B7A] hover:text-[#0F1B2B]"
            }`}
          >
            Nakuru
          </button>
          <button
            onClick={() => setFilterDepot("eldoret")}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              filterDepot === "eldoret"
                ? "bg-white text-[#0F1B2B] font-semibold shadow-2xs"
                : "text-[#5C6B7A] hover:text-[#0F1B2B]"
            }`}
          >
            Eldoret
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E2E6EA] bg-[#FAFBFC] text-[10px] font-bold uppercase tracking-wider text-[#5C6B7A]">
              <th className="py-2.5 px-3">Order / Collection ID</th>
              <th className="py-2.5 px-3">OMC</th>
              <th className="py-2.5 px-3">Depot</th>
              <th className="py-2.5 px-3">Stage</th>
              <th className="py-2.5 px-3">Predicted Gate-Out</th>
              <th className="py-2.5 px-3">Risk</th>
              <th className="py-2.5 px-4">Primary Operational Cause</th>
              <th className="py-2.5 px-3">FlowGuard Action</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-2 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E6EA] text-xs">
            {filteredOps.map((op) => {
              const isSelected = selectedOperationId === op.id;
              const borderHighlight =
                op.riskLevel === "CRITICAL"
                  ? "border-l-4 border-l-[#C0392B] bg-rose-50/20"
                  : "border-l-4 border-l-[#B7791F] bg-amber-50/20";

              return (
                <tr
                  key={op.id}
                  onClick={() => onSelectOperation(op)}
                  className={`cursor-pointer transition-colors group ${
                    isSelected
                      ? `${borderHighlight} font-medium`
                      : "hover:bg-[#F8FAFC] border-l-4 border-l-transparent"
                  }`}
                >
                  {/* 1. Order & Truck Registration */}
                  <td className="py-3 px-3">
                    <div className="font-mono font-bold text-xs text-[#0F1B2B]">
                      {op.orderNumber}
                    </div>
                    <div className="text-[10px] font-mono text-[#5C6B7A]">
                      {op.truckRegistration}
                    </div>
                  </td>

                  {/* 2. OMC */}
                  <td className="py-3 px-3">
                    <div className="font-semibold text-xs text-[#0F1B2B] truncate max-w-[120px]">
                      {op.omcName}
                    </div>
                    <div className="text-[10px] text-[#5C6B7A] truncate max-w-[120px]">
                      {(op.quantityLitres / 1000).toFixed(0)}kL {op.product.split("-")[0].trim()}
                    </div>
                  </td>

                  {/* 3. Depot */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-medium text-xs text-[#0F1B2B]">
                      {op.depotName.split("(")[0].trim()}
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      {op.depotId === "nairobi" ? "PS10" : op.depotId === "nakuru" ? "PS25" : "PS27"}
                    </span>
                  </td>

                  {/* 4. Operational Stage */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {getOperationalStage(op)}
                    </span>
                  </td>

                  {/* 5. Predicted Gate-out (Section 11: Window + Confidence) */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-mono font-bold text-xs text-[#0F1B2B]">
                      {op.predictedGateOut}
                    </div>
                    <div className="text-[10px] text-[#5C6B7A] leading-tight">
                      <span>Arr: {op.expectedArrival}</span>
                      <span className="text-emerald-700 font-semibold ml-1">({op.confidencePct}% conf)</span>
                    </div>
                    <div className="text-[9px] text-[#C0392B] font-mono font-semibold">
                      +{op.delayRiskMin}m vs SLA baseline
                    </div>
                  </td>

                  {/* 6. Risk Level */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    {getRiskBadge(op.riskLevel)}
                  </td>

                  {/* 7. Primary Operational Cause */}
                  <td className="py-3 px-4 max-w-xs">
                    <p className="text-[11px] text-[#0F1B2B] leading-tight line-clamp-2 font-normal">
                      {op.primaryCause}
                    </p>
                  </td>

                  {/* 8. FlowGuard Action */}
                  <td className="py-3 px-3 max-w-[180px]">
                    <p className="text-[11px] text-slate-800 line-clamp-2 font-medium">
                      {op.selectedIntervention}
                    </p>
                  </td>

                  {/* 9. Control Status */}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    {getActionBadge(op.actionStatus)}
                  </td>

                  {/* Action Link */}
                  <td className="py-3 px-2 text-right">
                    <button
                      className="p-1 rounded text-[#8492A6] group-hover:text-[#0F1B2B] hover:bg-slate-200 transition-colors"
                      title="Inspect Causal Risk Breakdown"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
