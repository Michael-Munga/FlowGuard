"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Wrench,
  Filter,
} from "lucide-react";
import { OperationalEvent } from "@/types/flowguard";

interface EventsFullViewProps {
  events: OperationalEvent[];
  depotName: string;
}

type SevFilter = "ALL" | "info" | "warning" | "critical";

const sevMeta: Record<
  OperationalEvent["severity"],
  { label: string; cls: string; icon: React.ReactNode }
> = {
  info: {
    label: "Info",
    cls: "bg-blue-50 text-blue-800 border-blue-200",
    icon: <Info className="w-3.5 h-3.5 text-blue-600" />,
  },
  warning: {
    label: "Warning",
    cls: "bg-amber-50 text-amber-900 border-amber-200",
    icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
  },
  critical: {
    label: "Critical",
    cls: "bg-rose-50 text-rose-800 border-rose-200",
    icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />,
  },
};

export const EventsFullView: React.FC<EventsFullViewProps> = ({
  events,
  depotName,
}) => {
  const [sev, setSev] = useState<SevFilter>("ALL");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      if (sev !== "ALL" && e.severity !== sev) return false;
      if (!q) return true;
      return (
        e.description.toLowerCase().includes(q) ||
        e.eventType.toLowerCase().includes(q) ||
        (e.associatedTruck ?? "").toLowerCase().includes(q)
      );
    });
  }, [events, sev, query]);

  const counts = {
    ALL: events.length,
    info: events.filter((e) => e.severity === "info").length,
    warning: events.filter((e) => e.severity === "warning").length,
    critical: events.filter((e) => e.severity === "critical").length,
  };

  return (
    <div className="bg-white rounded-lg border border-[#E2E6EA]">
      <div className="px-5 py-4 border-b border-[#EDF1F5] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-[#1B7A3D]" />
          <h3 className="text-sm font-bold text-[#0F1B2B] uppercase tracking-wide">
            Terminal Event Stream
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600">
            {depotName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search event, truck, order…"
              className="pl-8 pr-3 py-1.5 text-xs border border-[#E2E6EA] rounded-md w-64 focus:outline-none focus:border-[#1B7A3D]"
            />
          </div>

          <div className="flex items-center p-0.5 bg-slate-100 rounded-md border border-[#E2E6EA] text-xs">
            {(["ALL", "info", "warning", "critical"] as SevFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setSev(s)}
                className={`px-3 py-1 rounded text-[11px] font-semibold transition-all ${
                  sev === s
                    ? "bg-white text-[#0F1B2B] shadow-2xs"
                    : "text-[#5C6B7A] hover:text-[#0F1B2B]"
                }`}
              >
                {s === "ALL" ? "All" : sevMeta[s].label}
                <span className="ml-1.5 text-[10px] font-mono text-[#8492A6]">
                  {counts[s]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="divide-y divide-[#EDF1F5] max-h-[calc(100vh-320px)] overflow-y-auto">
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-[#8492A6]">
            No events match the current filter.
          </div>
        )}
        {filtered.map((e) => {
          const meta = sevMeta[e.severity];
          return (
            <div key={e.id} className="px-5 py-3 hover:bg-slate-50/60 transition-colors">
              <div className="flex items-start gap-3">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${meta.cls} shrink-0 mt-0.5`}
                >
                  {meta.icon}
                  {meta.label}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-[10px] text-[#8492A6]">
                      {e.timestamp}
                    </span>
                    <span className="font-bold text-[#0F1B2B]">
                      {e.eventType.replace(/_/g, " ")}
                    </span>
                    {e.associatedTruck && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-slate-700">
                        {e.associatedTruck}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#5C6B7A] mt-1 leading-relaxed">
                    {e.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-5 py-2 border-t border-[#EDF1F5] flex items-center justify-between text-[10px] text-[#8492A6] font-mono">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3 h-3 text-[#1B7A3D]" />
          <span>Simulated SCADA audit log · immutable</span>
        </div>
        <span>
          Showing {filtered.length} of {events.length}
        </span>
      </div>
    </div>
  );
};