"use client";

import React from "react";
import { Radio, AlertTriangle, CheckCircle2, ShieldCheck, Clock, Terminal } from "lucide-react";
import { OperationalEvent } from "@/types/flowguard";

interface DepotEventStreamProps {
  events: OperationalEvent[];
  depotName: string;
}

export const DepotEventStream: React.FC<DepotEventStreamProps> = ({
  events,
  depotName,
}) => {
  return (
    <div className="bg-white rounded-lg border border-[#E2E6EA] p-4 shadow-xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#EDF1F5] pb-2.5">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#1B7A3D]" />
          <div>
            <h4 className="font-bold text-xs text-[#0F1B2B] uppercase tracking-wide">
              Live Terminal Event Stream
            </h4>
            <span className="text-[10px] text-[#8492A6]">
              Simulated SCADA signals & autonomous audit log • {depotName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-mono text-[#1B7A3D]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1B7A3D] animate-ping" />
          <span>SIMULATED STREAM</span>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {events.length > 0 ? (
          events.map((evt) => (
            <div
              key={evt.id}
              className={`p-2.5 rounded-md border text-xs flex items-start gap-2.5 transition-all ${
                evt.severity === "critical"
                  ? "bg-rose-50/40 border-rose-200"
                  : evt.severity === "warning"
                  ? "bg-amber-50/40 border-amber-200"
                  : "bg-[#FAFBFC] border-[#E2E6EA]"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {evt.severity === "critical" ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                ) : evt.severity === "warning" ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1B7A3D]" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-[10px] px-1 rounded bg-slate-100 text-slate-700">
                      {evt.eventType}
                    </span>
                    {evt.associatedTruck && (
                      <span className="font-mono text-[10px] text-blue-700 font-semibold">
                        {evt.associatedTruck}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-[#8492A6] shrink-0">
                    {evt.timestamp}
                  </span>
                </div>

                <p className="text-[11px] text-[#5C6B7A] mt-1 leading-relaxed">
                  {evt.description}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-6 text-center text-xs text-[#8492A6]">
            No live telemetry events logged for this depot yet.
          </div>
        )}
      </div>
    </div>
  );
};
