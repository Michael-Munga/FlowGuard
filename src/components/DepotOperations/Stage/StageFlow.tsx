"use client";

import React from "react";
import {
  CalendarClock,
  ShieldAlert,
  FileCheck,
  ParkingSquare,
  Fuel,
  LogOut,
  ArrowRight,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { YardTruck, YardStage } from "@/types/flowguard";

interface StageFlowProps {
  trucks: YardTruck[];
  expectedArrivalCount: number;
  selectedStage?: string;
  onSelectStage?: (stage: string) => void;
}

interface StageDefinition {
  id: string;
  title: string;
  shortLabel: string;
  count: number;
  avgDwellMin: number;
  baselineDwellMin: number;
  dwellDeltaMin: number;
  status: "NORMAL" | "WATCH" | "AT_RISK" | "CRITICAL";
  statusText: string;
  icon: React.ReactNode;
}

export const StageFlow: React.FC<StageFlowProps> = ({
  trucks,
  expectedArrivalCount,
  selectedStage = "ALL",
  onSelectStage,
}) => {
  // Derive stage counts and dwell from current depot trucks
  const gateInTrucks = trucks.filter((t) => t.currentStage === "Gate-In");
  const validationTrucks = trucks.filter((t) => t.currentStage === "Validation / Release");
  const stagingTrucks = trucks.filter(
    (t) => t.currentStage !== "Loading" && t.currentStage !== "Gate-Out" && t.currentStage !== "Ready to Exit" && t.currentStage !== "Gate-In" && t.currentStage !== "Validation / Release"
  ); // or trucks without assigned bay waiting in yard
  // If staging is empty, calculate trucks waiting for gantry bay
  const waitingTrucks = trucks.filter(
    (t) => (t.currentStage === "Validation / Release" || t.currentStage === "Gate-In") && !t.assignedPosition
  );
  const loadingTrucks = trucks.filter((t) => t.currentStage === "Loading");
  const gateOutTrucks = trucks.filter(
    (t) => t.currentStage === "Ready to Exit" || t.currentStage === "Gate-Out"
  );

  const calcDwell = (group: YardTruck[], defaultBaseline: number) => {
    if (group.length === 0) return { avg: defaultBaseline, delta: 0 };
    const totalDwell = group.reduce((acc, t) => acc + t.timeInStageMin, 0);
    const avg = Math.round(totalDwell / group.length);
    const delta = Math.round(group.reduce((acc, t) => acc + t.dwellDeltaMin, 0) / group.length);
    return { avg, delta };
  };

  const gateInDwell = calcDwell(gateInTrucks, 10);
  const validationDwell = calcDwell(validationTrucks, 15);
  const loadingDwell = calcDwell(loadingTrucks, 22);
  const gateOutDwell = calcDwell(gateOutTrucks, 8);

  const stages: StageDefinition[] = [
    {
      id: "EXPECTED",
      title: "EXPECTED ARRIVAL",
      shortLabel: "Scheduled",
      count: expectedArrivalCount || 14,
      avgDwellMin: 0,
      baselineDwellMin: 0,
      dwellDeltaMin: 0,
      status: expectedArrivalCount > 16 ? "WATCH" : "NORMAL",
      statusText: "Next 90m order bookings",
      icon: <CalendarClock className="w-4 h-4" />,
    },
    {
      id: "GATE_IN",
      title: "ARRIVED / GATE-IN",
      shortLabel: "Security & Tare",
      count: gateInTrucks.length || 6,
      avgDwellMin: gateInDwell.avg,
      baselineDwellMin: 10,
      dwellDeltaMin: gateInDwell.delta,
      status: gateInDwell.delta > 5 ? "AT_RISK" : gateInDwell.delta > 2 ? "WATCH" : "NORMAL",
      statusText: gateInDwell.delta > 0 ? `+${gateInDwell.delta}m tare delay` : "Tare scale fluid",
      icon: <ShieldAlert className="w-4 h-4" />,
    },
    {
      id: "VALIDATION",
      title: "VALIDATION / RELEASE",
      shortLabel: "Customs & ERP",
      count: validationTrucks.length || 4,
      avgDwellMin: validationDwell.avg,
      baselineDwellMin: 15,
      dwellDeltaMin: validationDwell.delta,
      status: validationDwell.delta > 8 ? "CRITICAL" : validationDwell.delta > 3 ? "WATCH" : "NORMAL",
      statusText: validationDwell.delta > 0 ? `+${validationDwell.delta}m seal hold` : "Clearance on track",
      icon: <FileCheck className="w-4 h-4" />,
    },
    {
      id: "STAGING",
      title: "WAITING / STAGING",
      shortLabel: "Yard Staging",
      count: Math.max(waitingTrucks.length, 5),
      avgDwellMin: 18,
      baselineDwellMin: 12,
      dwellDeltaMin: 6,
      status: "WATCH",
      statusText: "Awaiting gantry vacancy",
      icon: <ParkingSquare className="w-4 h-4" />,
    },
    {
      id: "LOADING",
      title: "GANTRY LOADING",
      shortLabel: "Active Fill",
      count: loadingTrucks.length || 7,
      avgDwellMin: loadingDwell.avg,
      baselineDwellMin: 22,
      dwellDeltaMin: loadingDwell.delta,
      status: loadingDwell.delta > 6 ? "CRITICAL" : loadingDwell.delta > 2 ? "WATCH" : "NORMAL",
      statusText: loadingDwell.delta > 0 ? `+${loadingDwell.delta}m fill delta` : "Flow velocity nominal",
      icon: <Fuel className="w-4 h-4" />,
    },
    {
      id: "GATE_OUT",
      title: "READY / GATE-OUT",
      shortLabel: "Gross & Exit",
      count: gateOutTrucks.length || 3,
      avgDwellMin: gateOutDwell.avg,
      baselineDwellMin: 8,
      dwellDeltaMin: gateOutDwell.delta,
      status: "NORMAL",
      statusText: "Final gross & dispatch",
      icon: <LogOut className="w-4 h-4" />,
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-[#E2E6EA] p-4 shadow-xs space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EDF1F5] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-[#1B7A3D]/10 text-[#1B7A3D]">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#0F1B2B]">
              Depot Turnaround Stage Flow & Dwell Analysis
            </h3>
            <p className="text-xs text-[#5C6B7A]">
              Real-time physical tanker progression across KPC operational checkpoints (Gate-In to Gate-Out)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[10px] font-mono uppercase text-[#8492A6]">
            Total In-Depot Flow:
          </span>
          <span className="font-mono font-bold text-xs text-[#0F1B2B] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {trucks.length} Active Tankers Inside
          </span>
        </div>
      </div>

      {/* Stage Progression Flow Rail */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {stages.map((stg, idx) => {
          const isSelected = selectedStage === stg.id;
          const isBottleneck = stg.status === "CRITICAL" || stg.status === "AT_RISK";

          return (
            <div
              key={stg.id}
              onClick={() => onSelectStage && onSelectStage(stg.id)}
              className={`p-3 rounded-lg border transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? "border-[#1B7A3D] ring-2 ring-[#1B7A3D]/20 bg-emerald-50/30"
                  : isBottleneck
                  ? "bg-rose-50/30 border-rose-200 hover:border-rose-400"
                  : stg.status === "WATCH"
                  ? "bg-amber-50/20 border-amber-200 hover:border-amber-400"
                  : "bg-[#FAFBFC] border-[#E2E6EA] hover:border-slate-300"
              }`}
            >
              {/* Top Step & Status */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#8492A6]">
                    <span>0{idx + 1}</span>
                    <span className="text-slate-300">•</span>
                    <div
                      className={`p-1 rounded ${
                        isBottleneck
                          ? "bg-rose-100 text-rose-700"
                          : stg.status === "WATCH"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-[#1B7A3D]"
                      }`}
                    >
                      {stg.icon}
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider ${
                      stg.status === "CRITICAL"
                        ? "bg-rose-100 text-rose-800 border-rose-300 font-extrabold animate-pulse"
                        : stg.status === "AT_RISK"
                        ? "bg-rose-50 text-rose-700 border-rose-200 font-bold"
                        : stg.status === "WATCH"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-emerald-50 text-[#1B7A3D] border-emerald-200"
                    }`}
                  >
                    {stg.status === "CRITICAL" || stg.status === "AT_RISK"
                      ? "BOTTLENECK"
                      : stg.status === "WATCH"
                      ? "ELEVATED"
                      : "FLOWING"}
                  </span>
                </div>

                {/* Stage Title */}
                <span className="text-[11px] font-bold text-[#0F1B2B] block tracking-tight truncate">
                  {stg.title}
                </span>

                {/* Big Count Metric */}
                <div className="mt-1.5 flex items-baseline gap-1.5">
                  <span className="font-mono text-2xl font-bold text-[#0F1B2B]">
                    {stg.count}
                  </span>
                  <span className="text-[10px] text-[#5C6B7A] font-medium">
                    tankers
                  </span>
                </div>
              </div>

              {/* Stage Dwell Info Footer */}
              <div className="mt-2 pt-1.5 border-t border-slate-200/60 text-[10px]">
                {stg.avgDwellMin > 0 ? (
                  <div className="flex items-center justify-between">
                    <span className="text-[#8492A6]">Dwell:</span>
                    <span
                      className={`font-mono font-bold ${
                        stg.dwellDeltaMin > 4
                          ? "text-rose-700"
                          : stg.dwellDeltaMin > 0
                          ? "text-amber-700"
                          : "text-[#1B7A3D]"
                      }`}
                    >
                      {stg.avgDwellMin}m {stg.dwellDeltaMin > 0 ? `(+${stg.dwellDeltaMin}m)` : "(norm)"}
                    </span>
                  </div>
                ) : (
                  <div className="text-[#8492A6] truncate">{stg.statusText}</div>
                )}
                <span className="text-[9px] text-[#8492A6] block truncate mt-0.5">
                  {stg.shortLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
