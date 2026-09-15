"use client";

import React from "react";
import { Activity, Radio, Cpu, ShieldCheck } from "lucide-react";
import { ActivityEvent } from "@/types/dashboard";

interface LiveActivityPanelProps {
  events: ActivityEvent[];
  streamActive: boolean;
  onToggleStream: () => void;
  onSelectTruckByReg?: (reg: string) => void;
  autonomyHealth?: number;
}

export const LiveActivityPanel: React.FC<LiveActivityPanelProps> = ({
  events,
  streamActive,
  onToggleStream,
  onSelectTruckByReg,
  autonomyHealth = 98.4,
}) => {
  return (
    <div className="bg-white rounded-lg border border-[#E2E6EA] shadow-xs flex flex-col h-full">
      {/* Panel Header */}
      <div className="p-4 border-b border-[#E2E6EA] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#1B7A3D]" />
          <h2 className="text-sm font-bold text-[#0F1B2B] tracking-tight">
            Live Activity
          </h2>
        </div>

        {/* Stream Active Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-[#5C6B7A]">
            Stream Active
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={streamActive}
            onClick={onToggleStream}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              streamActive ? "bg-[#1B7A3D]" : "bg-slate-300"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                streamActive ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Scrolling Events Feed */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 max-h-[500px]">
        {events.map((evt) => {
          // Severity dot color
          const dotColor =
            evt.severity === "critical"
              ? "bg-[#C0392B]"
              : evt.severity === "warning"
              ? "bg-[#B7791F]"
              : "bg-[#1B7A3D]";

          const badgeBg =
            evt.severity === "critical"
              ? "bg-rose-50 border-rose-100 text-[#C0392B]"
              : evt.severity === "warning"
              ? "bg-amber-50 border-amber-100 text-[#B7791F]"
              : "bg-slate-50 border-slate-100 text-[#0F1B2B]";

          return (
            <div
              key={evt.id}
              className={`p-2.5 rounded-md border text-xs transition-all hover:bg-slate-50/80 ${badgeBg}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
                  <span
                    onClick={() => {
                      if (evt.truckId && onSelectTruckByReg) {
                        onSelectTruckByReg(evt.truckId);
                      }
                    }}
                    className={`font-mono font-bold text-xs ${
                      evt.truckId ? "cursor-pointer hover:underline text-[#0F1B2B]" : "text-[#5C6B7A]"
                    }`}
                  >
                    {evt.source}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#8492A6]">
                  {evt.timestamp}
                </span>
              </div>
              <p className="text-[11px] text-[#0F1B2B] leading-relaxed pl-4">
                {evt.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Dispatch Autonomy Health (Bottom) */}
      <div className="p-3.5 border-t border-[#E2E6EA] bg-[#FAFBFC] rounded-b-lg">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#1B7A3D]" />
            <span className="text-[11px] font-bold text-[#0F1B2B]">
              Dispatch Autonomy Health
            </span>
          </div>
          <span className="text-[10px] font-bold text-[#1B7A3D] bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
            OPTIMAL ({autonomyHealth}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1B7A3D] rounded-full transition-all duration-500"
            style={{ width: `${autonomyHealth}%` }}
          />
        </div>
      </div>
    </div>
  );
};
