"use client";

import React, { useState } from "react";
import { Radio, Activity, Clock, Zap, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { OperationalEvent } from "@/types/flowguard";

interface LiveEventStreamProps {
  events: OperationalEvent[];
}

export const LiveEventStream: React.FC<LiveEventStreamProps> = ({ events }) => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const getEventIcon = (type: string, severity: string) => {
    if (type.includes("ACTION") || type.includes("INTERVENTION")) {
      return <Zap className="w-3 h-3 text-[#1B7A3D]" />;
    }
    if (type.includes("VERIF")) {
      return <CheckCircle2 className="w-3 h-3 text-emerald-600" />;
    }
    if (severity === "critical" || severity === "warning") {
      return <AlertTriangle className="w-3 h-3 text-amber-600" />;
    }
    return <Activity className="w-3 h-3 text-slate-500" />;
  };

  return (
    <div className="bg-white rounded-lg border border-[#E2E6EA] shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="p-3.5 px-5 border-b border-[#E2E6EA] flex items-center justify-between bg-[#FAFBFC]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#1B7A3D]" />
          <h2 className="text-sm font-bold text-[#0F1B2B] tracking-tight">
            Live Operational Event Stream
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[#1B7A3D] font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1B7A3D] animate-ping" />
          <span>Synchronized (0.8s cycle)</span>
        </div>
      </div>

      {/* Events List */}
      <div className="p-3 space-y-2 flex-1 overflow-y-auto max-h-[480px]">
        {events.map((evt) => {
          const isSelected = selectedEventId === evt.id;
          const dotColor =
            evt.severity === "critical"
              ? "bg-[#C0392B]"
              : evt.severity === "warning"
              ? "bg-[#B7791F]"
              : "bg-[#1B7A3D]";

          const badgeBg =
            evt.severity === "critical"
              ? "bg-rose-50/70 border-rose-200 text-[#C0392B]"
              : evt.severity === "warning"
              ? "bg-amber-50/70 border-amber-200 text-[#B7791F]"
              : "bg-slate-50/70 border-slate-200 text-[#0F1B2B]";

          return (
            <div
              key={evt.id}
              onClick={() => setSelectedEventId(isSelected ? null : evt.id)}
              className={`p-2.5 rounded-md border text-xs transition-all hover:bg-slate-50 cursor-pointer ${badgeBg} ${
                isSelected ? "ring-1 ring-[#1B7A3D] shadow-2xs" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                  <span className="font-bold text-[11px] text-[#0F1B2B]">
                    {evt.depotName.split("(")[0].trim()}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 bg-white rounded border border-slate-200 text-slate-700 uppercase">
                    {evt.eventType.replace(/_/g, " ")}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#8492A6]">
                  {evt.timestamp}
                </span>
              </div>

              <div className="flex items-start gap-1.5 pl-3.5">
                <div className="mt-0.5 shrink-0">
                  {getEventIcon(evt.eventType, evt.severity)}
                </div>
                <p className="text-[11px] text-[#5C6B7A] leading-snug">
                  {evt.description}
                </p>
              </div>

              {evt.associatedTruck && (
                <div className="mt-1 pl-3.5 flex items-center gap-1 text-[10px] font-mono text-slate-500">
                  <span>Tanker:</span>
                  <span className="font-bold text-[#0F1B2B]">{evt.associatedTruck}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
