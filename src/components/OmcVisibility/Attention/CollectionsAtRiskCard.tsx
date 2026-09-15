"use client";

import React from "react";
import {
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Building,
  ChevronRight,
  Truck,
  Activity,
} from "lucide-react";
import { OmcCollectionOrder } from "@/types/flowguard";

interface CollectionsAtRiskCardProps {
  orders: OmcCollectionOrder[];
  onSelectOrder: (order: OmcCollectionOrder) => void;
}

export const CollectionsAtRiskCard: React.FC<CollectionsAtRiskCardProps> = ({
  orders,
  onSelectOrder,
}) => {
  const atRiskOrders = orders
    .filter(
      (o) =>
        o.status === "AT RISK" ||
        o.status === "DEVELOPING RISK" ||
        o.riskSeverity === "CRITICAL" ||
        o.riskSeverity === "ELEVATED"
    )
    .slice(0, 4);

  // Helper to translate technical causes into customer-facing phrases
  const getCustomerReason = (order: OmcCollectionOrder) => {
    const raw = (order.whyAtRisk?.causeSummary || "").toLowerCase();
    if (raw.includes("demand") || raw.includes("inflow")) {
      return "High collection demand is currently slowing terminal processing.";
    }
    if (raw.includes("gate") || raw.includes("scale") || raw.includes("customs")) {
      return "Gate and tare weighbridge processing is taking longer than expected.";
    }
    if (raw.includes("meter") || raw.includes("calibration") || raw.includes("flow rate")) {
      return "Processing capacity is temporarily reduced on secondary gantry.";
    }
    if (raw.includes("cluster") || raw.includes("arrival")) {
      return "Several collections are expected to arrive during the same time window.";
    }
    return "Processing time is trending above the normal turnaround range.";
  };

  const getCustomerFlowGuardStatus = (order: OmcCollectionOrder) => {
    if (order.flowGuardAction) {
      if (order.flowGuardAction.status === "EXECUTED") {
        return "Sequence adjusted (Dual-arm prioritized)";
      }
      if (
        order.flowGuardAction.status === "SUPERVISOR_AUTHORIZED" ||
        order.flowGuardAction.status === "PENDING"
      ) {
        return "Priority clearance pending supervisor confirmation";
      }
      return "FlowGuard monitoring turnaround";
    }
    return "Monitoring terminal flow";
  };

  if (atRiskOrders.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-[#E2E6EA] p-5 shadow-xs flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-[#1B7A3D] border border-emerald-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#0F1B2B]">
              All Active Collections Are On Schedule
            </h4>
            <p className="text-xs text-[#5C6B7A]">
              No turnaround delay risks detected across KPC depots. All tankers tracking within baseline SLA targets.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded bg-emerald-50 text-[#1B7A3D] border border-emerald-200">
          ALL NOMINAL
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-[#E2E6EA] p-5 shadow-xs space-y-4 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EDF1F5] pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <h3 className="font-bold text-sm text-[#0F1B2B]">
            Collections Needing Attention ({atRiskOrders.length} Priority Alerts)
          </h3>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
            ACTIONABLE
          </span>
        </div>
        <span className="text-xs text-[#8492A6]">
          Click any collection to inspect the turnaround journey and customer-facing recovery status
        </span>
      </div>

      {/* Clean Structured Table of At-Risk Orders */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAFBFC] border-b border-[#E2E6EA] text-[10px] font-bold uppercase tracking-wider text-[#5C6B7A]">
            <tr>
              <th className="px-3 py-2">Order</th>
              <th className="px-3 py-2">Truck</th>
              <th className="px-3 py-2">Depot</th>
              <th className="px-3 py-2">Current Stage</th>
              <th className="px-3 py-2">Predicted Gate-Out</th>
              <th className="px-3 py-2">Risk</th>
              <th className="px-3 py-2">What Changed</th>
              <th className="px-3 py-2">FlowGuard Status</th>
              <th className="px-3 py-2 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDF1F5]">
            {atRiskOrders.map((order) => {
              const isCritical = order.riskSeverity === "CRITICAL";
              const whatChanged = getCustomerReason(order);
              const flowGuardStatus = getCustomerFlowGuardStatus(order);

              return (
                <tr
                  key={order.id}
                  onClick={() => onSelectOrder(order)}
                  className={`cursor-pointer transition-colors ${
                    isCritical ? "bg-rose-50/20 hover:bg-rose-50/40" : "bg-amber-50/15 hover:bg-amber-50/35"
                  }`}
                >
                  {/* Order */}
                  <td className="px-3 py-2.5 font-mono font-bold text-xs text-[#0F1B2B]">
                    {order.id}
                  </td>

                  {/* Truck */}
                  <td className="px-3 py-2.5 font-mono font-bold text-xs text-[#1B7A3D]">
                    {order.truckRegistration}
                  </td>

                  {/* Depot */}
                  <td className="px-3 py-2.5 text-xs text-[#0F1B2B] font-medium">
                    {order.depotName.split(" ")[0]}
                  </td>

                  {/* Current Stage */}
                  <td className="px-3 py-2.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border uppercase bg-blue-50 text-blue-700 border-blue-200">
                      {order.currentStageLabel.split(" ")[0]}
                    </span>
                  </td>

                  {/* Predicted Gate-Out */}
                  <td className="px-3 py-2.5">
                    <span className="font-mono font-bold text-xs text-[#0F1B2B] block">
                      {order.predictedGateOut}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {order.gateOutConfidencePct}% confidence
                    </span>
                  </td>

                  {/* Risk */}
                  <td className="px-3 py-2.5">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase border ${
                        isCritical
                          ? "bg-rose-100 text-rose-800 border-rose-300 font-extrabold animate-pulse"
                          : "bg-amber-100 text-amber-900 border-amber-300 font-bold"
                      }`}
                    >
                      {isCritical ? "CRITICAL DELAY" : "AT RISK"}
                    </span>
                  </td>

                  {/* What Changed (Customer-readable) */}
                  <td className="px-3 py-2.5 max-w-xs">
                    <span className="text-xs text-[#0F1B2B] block leading-snug font-medium" title={whatChanged}>
                      {whatChanged}
                    </span>
                  </td>

                  {/* FlowGuard Status */}
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1B7A3D] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <Zap className="w-3 h-3 text-[#1B7A3D] shrink-0" />
                      <span>{flowGuardStatus}</span>
                    </span>
                  </td>

                  {/* Details Arrow */}
                  <td className="px-3 py-2.5 text-right">
                    <button
                      type="button"
                      className="p-1 rounded text-slate-400 hover:text-[#0F1B2B] hover:bg-slate-100 cursor-pointer"
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
