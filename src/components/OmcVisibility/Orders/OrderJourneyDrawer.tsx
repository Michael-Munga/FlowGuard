"use client";

import React from "react";
import {
  X,
  Truck,
  Building,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Fuel,
  ArrowRight,
  Zap,
  Info,
  Coins,
  FileCheck,
  Send,
  HelpCircle,
} from "lucide-react";
import { OmcCollectionOrder, OmcJourneyStageId, OmcStageStatus } from "@/types/flowguard";

interface OrderJourneyDrawerProps {
  order: OmcCollectionOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onAcknowledgeOrder?: (orderId: string) => void;
}

export const OrderJourneyDrawer: React.FC<OrderJourneyDrawerProps> = ({
  order,
  isOpen,
  onClose,
  onAcknowledgeOrder,
}) => {
  if (!isOpen || !order) return null;

  const isCompleted = order.status === "COMPLETED";
  const isCritical = order.riskSeverity === "CRITICAL";
  const isElevated = order.riskSeverity === "ELEVATED";

  const getStageStatusIcon = (status: OmcStageStatus, idx: number) => {
    switch (status) {
      case "COMPLETED":
        return (
          <div className="w-6 h-6 rounded-full bg-[#1B7A3D] text-white flex items-center justify-center text-xs font-bold shrink-0">
            ✓
          </div>
        );
      case "ACTIVE":
        return (
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 ring-4 ring-blue-100 animate-pulse">
            {idx + 1}
          </div>
        );
      case "DELAYED":
        return (
          <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold shrink-0 ring-4 ring-rose-100">
            !
          </div>
        );
      case "PREDICTED":
      case "PENDING":
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0">
            {idx + 1}
          </div>
        );
    }
  };

  // Derive What Happens Next based on current stage
  const getWhatHappensNext = () => {
    switch (order.currentStage) {
      case "ORDER_PLACED":
        return {
          title: "Next: Depot Arrival & Weighbridge Tare Inspection",
          detail: "Tanker enters KPC security smart-gate, transponder is verified, and vehicle proceeds to tare scale for tare weight recording.",
        };
      case "GATE_IN":
        return {
          title: "Next: KRA Customs Clearance & Bay Dispatch",
          detail: "Electronic RECTS validation checks customs status, safety certification, and issues automated bay queue assignment.",
        };
      case "VALIDATION_RELEASE":
        return {
          title: "Next: Physical Gantry Loading",
          detail: `Tanker proceeds to ${order.assignedBay || "assigned gantry position"}. Dual loading arms connect and automated grounding checks initiate.`,
        };
      case "GANTRY_LOADING":
        return {
          title: "Next: Gross Weighbridge & Gate-Out Dispatch",
          detail: "Loading arms disconnect. Tanker proceeds to outbound weighbridge for gross mass check, high-security bolt sealing, and gate-out release.",
        };
      case "GATE_OUT":
      default:
        return {
          title: "Collection Complete: Gate-Out Recorded",
          detail: "KPC custody and terminal collection SLA has concluded. Truck has departed terminal perimeter.",
        };
    }
  };

  const nextStep = getWhatHappensNext();

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-[#E2E6EA] animate-in slide-in-from-right duration-250">
        {/* Drawer Header */}
        <div className="p-4 px-6 border-b border-[#E2E6EA] flex items-center justify-between bg-[#FAFBFC]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[#1B7A3D]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[#0F1B2B] font-mono">
                  {order.id}
                </h3>
                <span className="font-mono text-sm font-bold text-[#1B7A3D]">
                  {order.truckRegistration}
                </span>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                    isCritical
                      ? "bg-rose-100 text-rose-800 border-rose-300"
                      : isElevated
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : isCompleted
                      ? "bg-slate-100 text-slate-700 border-slate-200"
                      : "bg-emerald-100 text-[#1B7A3D] border-emerald-200"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-[#5C6B7A]">
                {order.omcName} • {order.depotName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* SECTION 1: Prediction Formula Banner */}
          <div className="bg-[#FAFBFC] border border-[#E2E6EA] rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C6B7A] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#1B7A3D]" />
                PREDICTED GATE-OUT &amp; TURNAROUND
              </span>
              <span className="text-[10px] font-mono font-bold text-[#1B7A3D] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {order.gateOutConfidencePct}% CONFIDENCE
              </span>
            </div>

            {/* Explicit Formula Visualization */}
            <div className="bg-white p-2.5 rounded-md border border-[#E2E6EA] flex items-center justify-between text-center">
              <div className="flex-1">
                <span className="text-[9px] font-bold text-[#8492A6] uppercase block">
                  {order.gateInTime ? "Actual Arrival" : "Predicted Arrival"}
                </span>
                <span className="font-mono font-bold text-xs text-[#0F1B2B]">
                  {order.gateInTime || order.expectedArrival}
                </span>
              </div>
              <span className="text-slate-300 font-bold px-1">+</span>
              <div className="flex-1">
                <span className="text-[9px] font-bold text-[#8492A6] uppercase block">
                  Turnaround
                </span>
                <span className="font-mono font-bold text-xs text-[#0F1B2B]">
                  {order.predictedTurnaroundMin} min
                </span>
              </div>
              <span className="text-slate-300 font-bold px-1">=</span>
              <div className="flex-1 bg-emerald-50/60 py-1 rounded border border-emerald-200">
                <span className="text-[9px] font-bold text-[#1B7A3D] uppercase block">
                  Predicted Gate-out
                </span>
                <span className="font-mono font-extrabold text-sm text-[#1B7A3D]">
                  {order.predictedGateOut}
                </span>
              </div>
            </div>

            {/* Turnaround Delta Details */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
              <span className="text-[11px] text-[#5C6B7A]">
                Baseline SLA standard: <strong className="font-mono text-[#0F1B2B]">{order.baselineTurnaroundMin} min</strong>
              </span>
              <span
                className={`font-mono text-xs font-bold ${
                  order.turnaroundDeltaMin > 0 ? "text-rose-700" : "text-emerald-700"
                }`}
              >
                {order.turnaroundDeltaMin > 0
                  ? `+${order.turnaroundDeltaMin} min vs baseline`
                  : `${order.turnaroundDeltaMin} min vs baseline`}
              </span>
            </div>

            <p className="text-[10px] text-[#8492A6] italic leading-relaxed">
              * Continuous machine-learning turnaround prediction. KPC custody and demurrage boundary ends at physical Gate-Out.
            </p>
          </div>

          {/* SECTION 2: Cargo & Transporter Specification */}
          <div className="bg-white rounded-lg border border-[#E2E6EA] p-4 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8492A6] block">
              Cargo &amp; Transporter Specification
            </span>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-[#5C6B7A] block">Product &amp; Volume</span>
                <span className="font-bold text-[#0F1B2B] block">
                  {order.product}
                </span>
                <span className="font-mono text-[#5C6B7A] text-[11px]">
                  {(order.quantityLitres / 1000).toFixed(0)}k Litres ({order.compartmentsCount} Compartments)
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#5C6B7A] block">Transporter Fleet</span>
                <span className="font-semibold text-[#0F1B2B] block">
                  {order.transporterName}
                </span>
                <span className="text-[#5C6B7A] text-[11px]">
                  Driver: {order.driverName}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#5C6B7A] block">Terminal Location</span>
                <span className="font-medium text-[#0F1B2B] block">
                  {order.depotName}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#5C6B7A] block">Assigned Gantry Bay</span>
                <span className="font-mono font-bold text-[#1B7A3D] block">
                  {order.assignedBay || "Queue Dynamic Allocation"}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 3: 5/6-Stage Collection Journey Timeline */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8492A6]">
                KPC Collection Journey Milestones
              </span>
              <span className="text-[10px] text-[#8492A6]">
                Order Registered → Gate-Out
              </span>
            </div>

            <div className="p-4 rounded-lg border border-[#E2E6EA] bg-white space-y-4">
              {order.journey.map((step, idx) => {
                const isPast = step.status === "COMPLETED";
                const isNow = step.status === "ACTIVE";

                return (
                  <div key={idx} className="flex items-start gap-3 relative">
                    {getStageStatusIcon(step.status, idx)}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-semibold text-xs ${
                              isNow
                                ? "text-blue-900 font-bold"
                                : isPast
                                ? "text-[#0F1B2B]"
                                : "text-slate-500"
                            }`}
                          >
                            {step.stageName}
                          </span>
                          {step.customsReleaseStatus && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${
                                step.customsReleaseStatus === "RELEASED"
                                  ? "bg-emerald-50 text-[#1B7A3D] border-emerald-200"
                                  : step.customsReleaseStatus === "INSPECTION_HOLD"
                                  ? "bg-amber-50 text-amber-800 border-amber-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }`}
                            >
                              KRA: {step.customsReleaseStatus}
                            </span>
                          )}
                        </div>

                        <span className="font-mono text-[11px] text-[#5C6B7A] shrink-0">
                          {step.timestamp || `${step.actualOrPredictedDurationMin}m est`}
                        </span>
                      </div>

                      {step.note && (
                        <p className="text-[11px] text-[#5C6B7A] mt-0.5 leading-relaxed">
                          {step.note}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: Why is this collection at risk? (Customer-Friendly Causal Factors) */}
          {order.whyAtRisk && (
            <div className="bg-amber-50/30 rounded-lg border border-amber-200 p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="text-xs uppercase tracking-wide">WHY IS THIS COLLECTION AT RISK?</span>
              </div>

              <p className="text-xs font-semibold text-[#0F1B2B]">
                {order.whyAtRisk.headline}
              </p>

              <p className="text-[11px] text-[#5C6B7A] leading-relaxed">
                {order.whyAtRisk.causeSummary}
              </p>

              <div className="space-y-1.5 pt-2 border-t border-amber-200/60">
                {order.whyAtRisk.causalContributions.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-[11px] bg-white p-2.5 rounded border border-amber-100"
                  >
                    <div>
                      <span className="font-semibold text-[#0F1B2B] block">
                        {c.factor}
                      </span>
                      <span className="text-[10px] text-[#5C6B7A] block">
                        {c.detail}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase shrink-0 ${
                        c.impactLevel === "High"
                          ? "bg-rose-50 text-rose-800 border-rose-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      {c.impactLevel} Impact
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs">
                <span className="text-[#5C6B7A] font-medium">Turnaround Delay Impact</span>
                <span className="font-mono font-bold text-rose-700">
                  +{order.turnaroundDeltaMin} min predicted delay above baseline
                </span>
              </div>
            </div>
          )}

          {/* SECTION 5: FlowGuard Update (What changed?) */}
          {order.flowGuardAction && (
            <div className="bg-emerald-50/40 rounded-lg border border-emerald-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                  <Zap className="w-4 h-4 text-[#1B7A3D]" />
                  <span className="text-xs uppercase tracking-wide">FLOWGUARD UPDATE</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#1B7A3D] text-white">
                  ACTION APPLIED
                </span>
              </div>

              <p className="font-bold text-xs text-[#0F1B2B]">
                {order.flowGuardAction.actionName}
              </p>

              <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-lg border border-emerald-200/70 text-center">
                <div className="border-r border-slate-100 pr-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#8492A6] block mb-1">
                    WITHOUT FLOWGUARD
                  </span>
                  <span className="font-mono line-through text-xs font-semibold text-slate-400 block">
                    {order.flowGuardAction.beforeGateOut}
                  </span>
                </div>

                <div className="border-r border-slate-100 px-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#1B7A3D] block mb-1">
                    WITH FLOWGUARD
                  </span>
                  <span className="font-mono font-extrabold text-sm text-[#1B7A3D] block">
                    {order.flowGuardAction.afterGateOut}
                  </span>
                </div>

                <div className="pl-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                    RECOVERED
                  </span>
                  <span className="font-mono font-extrabold text-sm text-emerald-700 block">
                    {Math.abs(order.flowGuardAction.expectedImpactMin)} min
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-[#5C6B7A] leading-relaxed">
                {order.flowGuardAction.rationale}
              </p>
              <p className="text-[10px] text-[#8492A6] italic border-t border-emerald-200/60 pt-1.5">
                * FlowGuard coordinated operational priority within KPC depot policy to recover turnaround time. No action required from your dispatch desk.
              </p>
            </div>
          )}

          {/* SECTION 6: What Happens Next? */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#0F1B2B] font-bold">
              <ArrowRight className="w-3.5 h-3.5 text-[#1B7A3D]" />
              <span className="text-xs uppercase tracking-wide">WHAT HAPPENS NEXT</span>
            </div>
            <p className="font-semibold text-xs text-[#0F1B2B]">
              {nextStep.title}
            </p>
            <p className="text-[11px] text-[#5C6B7A] leading-relaxed">
              {nextStep.detail}
            </p>
          </div>

          {/* SECTION 7: Financial Exposure Summary (Restrained & Defensible) */}
          {order.exposure && order.exposure.potentialKes > 0 && (
            <div className="bg-[#FAFBFC] rounded-lg border border-[#E2E6EA] p-3.5 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8492A6] block">
                Estimated Demurrage Exposure Summary
              </span>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-[#5C6B7A] block">Exposure at Risk</span>
                  <span className="font-mono font-bold text-[#0F1B2B] block">
                    KES {(order.exposure.potentialKes / 1000).toFixed(0)}k
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#1B7A3D] font-bold block">Exposure Protected</span>
                  <span className="font-mono font-bold text-[#1B7A3D] block">
                    KES {(order.exposure.protectedKes / 1000).toFixed(0)}k
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#8492A6] block">Realized Savings</span>
                  <span className="font-mono text-slate-600 block">
                    {order.exposure.realizedKes
                      ? `KES ${(order.exposure.realizedKes / 1000).toFixed(0)}k`
                      : "Pending exit"}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-[#8492A6] italic border-t border-slate-200/60 pt-1">
                Calculated against OMC Transportation Service Agreement (TSA) baseline turnaround tolerance.
              </p>
            </div>
          )}

          {/* SECTION 8: Customer Dispatch Notice & Acknowledgement */}
          <div className="bg-[#FAFBFC] rounded-lg border border-[#E2E6EA] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8492A6] block">
                Operational Dispatch Notice Status
              </span>
              <span className="text-xs text-[#0F1B2B] font-medium block mt-0.5">
                {order.communicationStatus.acknowledged ? (
                  <span className="text-[#1B7A3D] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ACKNOWLEDGED at {order.communicationStatus.acknowledgedAt || "08:35 AM"} (Confirmed receipt by OMC Dispatch)
                  </span>
                ) : (
                  <span className="text-amber-800 font-semibold">
                    Dispatched at {order.communicationStatus.notifiedAt || "09:46 AM"} • Awaiting dispatch receipt confirmation
                  </span>
                )}
              </span>
              <span className="text-[10px] text-[#8492A6] block mt-0.5">
                Confirms receipt of update. KPC operations personnel remain responsible for depot execution.
              </span>
            </div>

            {!order.communicationStatus.acknowledged && onAcknowledgeOrder && (
              <button
                type="button"
                onClick={() => onAcknowledgeOrder(order.id)}
                className="px-3 py-1.5 rounded-md text-xs font-bold text-white bg-[#1B7A3D] hover:bg-[#145d2e] shadow-xs transition-all cursor-pointer shrink-0 flex items-center gap-1.5 self-start sm:self-center"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ACKNOWLEDGE</span>
              </button>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 px-6 border-t border-[#E2E6EA] bg-[#FAFBFC] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-[#5C6B7A] hover:bg-slate-100 rounded cursor-pointer"
          >
            Close Order Details
          </button>

          <span className="text-[10px] font-mono text-[#8492A6]">
            KPC Service Charter Target: 60m Loading Standard
          </span>
        </div>
      </div>
    </div>
  );
};
