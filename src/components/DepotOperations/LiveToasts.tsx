"use client";

import React, { useEffect, useRef, useState } from "react";
import { Zap, X } from "lucide-react";
import { OperationalEvent } from "@/types/flowguard";

interface Toast {
  id: string;
  title: string;
  body: string;
  severity: "info" | "warning" | "critical";
}

interface LiveToastsProps {
  events: OperationalEvent[];
}

export const LiveToasts: React.FC<LiveToastsProps> = ({ events }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seenIds = useRef<Set<string>>(new Set());
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const actionable = events.filter(
      (e) =>
        !seenIds.current.has(e.id) &&
        (e.eventType === "ACTION_EXECUTED" ||
          e.eventType === "ACTION_VERIFIED" ||
          e.eventType === "INTERVENTION_TRIGGERED" ||
          e.eventType === "EQUIPMENT_DEGRADATION")
    );
    if (!actionable.length) return;

    const next: Toast[] = actionable.slice(0, 3).map((e) => ({
      id: e.id,
      title:
        e.eventType === "ACTION_EXECUTED" ? "FlowGuard executed"
        : e.eventType === "ACTION_VERIFIED" ? "FlowGuard verified"
        : e.eventType === "INTERVENTION_TRIGGERED" ? "Approval required"
        : "Equipment alert",
      body: e.description,
      severity: e.severity,
    }));

    actionable.forEach((e) => seenIds.current.add(e.id));
    setToasts((prev) => [...next, ...prev].slice(0, 4));

    next.forEach((t) => {
      const existing = timersRef.current.get(t.id);
      if (existing) clearTimeout(existing);
      const handle = setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
        timersRef.current.delete(t.id);
      }, 6000);
      timersRef.current.set(t.id, handle);
    });
  }, [events]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((h) => clearTimeout(h));
      timers.clear();
    };
  }, []);

  const dismiss = (id: string) => {
    const h = timersRef.current.get(id);
    if (h) clearTimeout(h);
    timersRef.current.delete(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed bottom-16 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto w-80 rounded-lg border shadow-xl bg-white animate-in slide-in-from-right duration-300 ${
            t.severity === "critical"
              ? "border-rose-300"
              : t.severity === "warning"
              ? "border-amber-300"
              : "border-emerald-300"
          }`}
        >
          <div className="flex items-start gap-3 p-3">
            <div
              className={`p-1.5 rounded-md shrink-0 ${
                t.severity === "critical"
                  ? "bg-rose-600 text-white"
                  : t.severity === "warning"
                  ? "bg-amber-600 text-white"
                  : "bg-[#1B7A3D] text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#5C6B7A]">
                {t.title}
              </div>
              <div className="text-xs text-[#0F1B2B] leading-snug mt-0.5">
                {t.body}
              </div>
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="text-slate-400 hover:text-[#0F1B2B] shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};