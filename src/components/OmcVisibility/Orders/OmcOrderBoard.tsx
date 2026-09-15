"use client";

import React from "react";
import {
  Truck,
  Search,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Zap,
  ShieldCheck,
  Fuel,
  Building,
} from "lucide-react";
import { OmcCollectionOrder, OmcCollectionStatus } from "@/types/flowguard";

interface OmcOrderBoardProps {
  orders: OmcCollectionOrder[];
  onSelectOrder: (order: OmcCollectionOrder) => void;
  selectedOrderId?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterStage: string;
  onFilterChange: (f: string) => void;
  omcName: string;
}

export const OmcOrderBoard: React.FC<OmcOrderBoardProps> = ({
  orders,
  onSelectOrder,
  selectedOrderId,
  searchQuery,
  onSearchChange,
  filterStage,
  onFilterChange,
  omcName,
}) => {
  const getStatusBadge = (order: OmcCollectionOrder) => {
    const isRecovering =
      order.flowGuardAction &&
      order.flowGuardAction.expectedImpactMin < 0 &&
      order.status !== "COMPLETED";

    if (order.status === "AT RISK" || order.status === "DELAYED") {
      return (
        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide bg-rose-100 text-rose-800 border-rose-300">
          AT RISK
        </span>
      );
    }
    if (order.status === "DEVELOPING RISK") {
      return (
        <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wide bg-amber-100 text-amber-800 border-amber-300">
          DEVELOPING RISK
        </span>
      );
    }
    if (isRecovering) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide bg-emerald-50 text-[#1B7A3D] border-emerald-300">
          <Zap className="w-2.5 h-2.5 text-[#1B7A3D]" />
          <span>RECOVERING</span>
        </span>
      );
    }
    if (order.status === "LOADING") {
      return (
        <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded border uppercase tracking-wide bg-blue-100 text-blue-800 border-blue-200">
          LOADING
        </span>
      );
    }
    if (order.status === "READY FOR EXIT") {
      return (
        <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wide bg-emerald-50 text-[#1B7A3D] border-emerald-200">
          READY FOR EXIT
        </span>
      );
    }
    if (order.status === "COMPLETED") {
      return (
        <span className="inline-block text-[10px] px-2 py-0.5 rounded border uppercase tracking-wide bg-slate-100 text-slate-600 border-slate-200">
          COMPLETED
        </span>
      );
    }
    return (
      <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded border uppercase tracking-wide bg-emerald-50 text-[#1B7A3D] border-emerald-200">
        ON TRACK
      </span>
    );
  };

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case "GANTRY_LOADING":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "VALIDATION_RELEASE":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "GATE_IN":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "GATE_OUT":
        return "bg-emerald-50 text-[#1B7A3D] border-emerald-200";
      case "ORDER_PLACED":
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[#E2E6EA] overflow-hidden shadow-xs space-y-0">
      {/* Board Header & Controls */}
      <div className="p-4 border-b border-[#EDF1F5] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#FAFBFC]">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#1B7A3D]" />
            <h3 className="font-bold text-sm text-[#0F1B2B]">
              Active Collection Orders ({orders.length} Registered Collections)
            </h3>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
              PRIORITIZED BY TURNAROUND URGENCY
            </span>
          </div>
          <p className="text-xs text-[#5C6B7A] mt-0.5">
            Real-time status across KPC gantries, turnaround deviations, and predicted gate-out
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search order, truck, depot..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-md border border-[#E2E6EA] bg-white focus:outline-hidden focus:ring-1 focus:ring-[#1B7A3D] w-48 sm:w-56 text-[#0F1B2B]"
            />
          </div>

          {/* Quick Segmented Filter */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-md border border-[#E2E6EA] text-xs">
            {[
              { id: "ALL", label: "All" },
              { id: "AT_RISK", label: "At Risk" },
              { id: "IN_PROCESS", label: "In Process" },
              { id: "LOADING", label: "Loading" },
              { id: "COMPLETED", label: "Completed" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => onFilterChange(tab.id)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  filterStage === tab.id
                    ? "bg-white text-[#0F1B2B] shadow-2xs font-semibold"
                    : "text-[#5C6B7A] hover:text-[#0F1B2B]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dense Operational Table - Exact Specification Columns */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAFBFC] border-b border-[#E2E6EA] text-[10px] font-bold uppercase tracking-wider text-[#5C6B7A] select-none">
            <tr>
              <th className="px-3.5 py-2.5">Collection / Order ID</th>
              <th className="px-3 py-2.5">Truck</th>
              <th className="px-3 py-2.5">Depot</th>
              <th className="px-3 py-2.5">Product</th>
              <th className="px-3 py-2.5">Current Stage</th>
              <th className="px-3 py-2.5">Predicted Arrival</th>
              <th className="px-3 py-2.5">Predicted Turnaround</th>
              <th className="px-3 py-2.5">Predicted Gate-Out</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Last Update</th>
              <th className="px-2.5 py-2.5 text-right">Journey</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#EDF1F5]">
            {orders.map((order) => {
              const isSelected = selectedOrderId === order.id;
              const isCritical = order.riskSeverity === "CRITICAL";
              const isElevated = order.riskSeverity === "ELEVATED";

              // Arrival representation: If inside terminal, show gate-in time; if not, show expected arrival window & confidence
              const hasArrived = Boolean(order.gateInTime);
              const arrivalDisplay = hasArrived
                ? `${order.gateInTime}`
                : `${order.expectedArrival}`;
              const arrivalSubtext = hasArrived
                ? "Gate-in recorded"
                : `${order.gateOutConfidencePct}% confidence`;

              return (
                <tr
                  key={order.id}
                  onClick={() => onSelectOrder(order)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-emerald-50/50 hover:bg-emerald-50/70"
                      : isCritical
                      ? "bg-rose-50/20 hover:bg-rose-50/40"
                      : isElevated
                      ? "bg-amber-50/15 hover:bg-amber-50/30"
                      : "hover:bg-slate-50/80"
                  }`}
                >
                  {/* 1. Collection / Order ID */}
                  <td className="px-3.5 py-2.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isCritical
                            ? "bg-rose-500 animate-pulse"
                            : isElevated
                            ? "bg-amber-500"
                            : order.status === "COMPLETED"
                            ? "bg-slate-300"
                            : "bg-emerald-500"
                        }`}
                      />
                      <div>
                        <span className="font-mono font-bold text-xs text-[#0F1B2B] block">
                          {order.id}
                        </span>
                        <span className="text-[10px] text-[#8492A6] block">
                          Reg: {order.orderPlacementTime}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* 2. Truck */}
                  <td className="px-3 py-2.5">
                    <div>
                      <span className="font-mono text-xs text-[#1B7A3D] font-bold block">
                        {order.truckRegistration}
                      </span>
                      <span className="text-[10px] text-[#5C6B7A] truncate block max-w-[120px]">
                        {order.driverName.split("(")[0]}
                      </span>
                    </div>
                  </td>

                  {/* 3. Depot */}
                  <td className="px-3 py-2.5">
                    <span className="font-semibold text-xs text-[#0F1B2B] block">
                      {order.depotName.split(" ")[0]}
                    </span>
                    <span className="text-[10px] text-[#8492A6] truncate block max-w-[110px]">
                      {order.transporterName}
                    </span>
                  </td>

                  {/* 4. Product */}
                  <td className="px-3 py-2.5">
                    <span className="font-medium text-xs text-[#0F1B2B] block">
                      {order.product.split(" ")[0]}
                    </span>
                    <span className="text-[10px] font-mono text-[#5C6B7A] block">
                      {(order.quantityLitres / 1000).toFixed(0)}k L ({order.compartmentsCount}c)
                    </span>
                  </td>

                  {/* 5. Current Stage */}
                  <td className="px-3 py-2.5">
                    <div className="space-y-0.5">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${getStageBadge(
                          order.currentStage
                        )}`}
                      >
                        {order.currentStageLabel.split(" ")[0]}
                      </span>
                      {order.assignedBay && (
                        <span className="text-[10px] font-mono text-[#5C6B7A] block truncate max-w-[100px]">
                          {order.assignedBay.split(" ")[0]} {order.assignedBay.split(" ")[1] || ""}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 6. Predicted Arrival */}
                  <td className="px-3 py-2.5">
                    <span className="font-mono font-bold text-xs text-[#0F1B2B] block">
                      {arrivalDisplay}
                    </span>
                    <span className="text-[10px] text-[#8492A6] block">
                      {arrivalSubtext}
                    </span>
                  </td>

                  {/* 7. Predicted Turnaround */}
                  <td className="px-3 py-2.5">
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono font-bold text-xs text-[#0F1B2B]">
                        {order.predictedTurnaroundMin}m
                      </span>
                      <span className="text-[10px] text-[#8492A6]">
                        (exp {order.baselineTurnaroundMin}m)
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-medium block ${
                        order.turnaroundDeltaMin > 5
                          ? "text-rose-700 font-bold"
                          : order.turnaroundDeltaMin < 0
                          ? "text-emerald-700"
                          : "text-[#8492A6]"
                      }`}
                    >
                      {order.turnaroundDeltaMin > 0
                        ? `+${order.turnaroundDeltaMin}m above SLA`
                        : order.turnaroundDeltaMin < 0
                        ? `${order.turnaroundDeltaMin}m ahead`
                        : "On SLA baseline"}
                    </span>
                  </td>

                  {/* 8. Predicted Gate-Out */}
                  <td className="px-3 py-2.5">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono font-bold text-xs text-[#0F1B2B]">
                        {order.predictedGateOut}
                      </span>
                      {order.gateOutConfidencePct < 100 && (
                        <span className="text-[9px] font-mono text-[#8492A6]">
                          ({order.gateOutConfidencePct}%)
                        </span>
                      )}
                    </div>
                    {order.flowGuardAction ? (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-mono font-bold text-[#1B7A3D] bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                        <Zap className="w-2 h-2" />
                        <span>{order.flowGuardAction.expectedImpactMin}m</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#8492A6] block">Nominal exit</span>
                    )}
                  </td>

                  {/* 9. Status */}
                  <td className="px-3 py-2.5">
                    {getStatusBadge(order)}
                  </td>

                  {/* 10. Last Update */}
                  <td className="px-3 py-2.5">
                    <span className="font-mono text-[11px] text-[#5C6B7A] block">
                      {order.lastUpdate}
                    </span>
                    <span className="text-[9px] text-[#8492A6] block">
                      KPC Telemetry
                    </span>
                  </td>

                  {/* 11. Journey Trigger */}
                  <td className="px-2.5 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectOrder(order);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                      title="Inspect Order Journey & FlowGuard Action"
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

      {orders.length === 0 && (
        <div className="p-8 text-center text-xs text-[#8492A6]">
          No active collection orders match the selected filters for {omcName}.
        </div>
      )}
    </div>
  );
};
