"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Bell,
  X,
  Truck,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Smartphone,
} from "lucide-react";
import { DriverPushPayload } from "@/services/notificationsService";

interface DriverPushNotificationProps {
  payload: DriverPushPayload | null;
  onClose: () => void;
  onOpenSheet: () => void;
}

const fmtKes = (n: number) =>
  `KES ${n.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// ---------------------------------------------------------------------------
// Push banner — portaled to document.body so nothing can clip it
// ---------------------------------------------------------------------------
export const DriverPushNotification: React.FC<DriverPushNotificationProps> = ({
  payload,
  onClose,
  onOpenSheet,
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!payload || !mounted) return null;

  const banner = (
    <div
      className="fixed top-24 right-6 w-96 animate-in slide-in-from-right duration-300"
      style={{ position: "fixed", zIndex: 9999 }}
    >
      <div className="rounded-xl bg-[#0B1420] text-white shadow-2xl border border-[#1C2C42] overflow-hidden">
        <div className="px-3 py-2 flex items-center justify-between bg-[#070D15] border-b border-[#1C2C42]">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400">
            <Smartphone className="w-3 h-3" />
            Push · {payload.driverName}
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors p-1"
            aria-label="Dismiss push notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#1B7A3D] text-white shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-emerald-400">
                <span>KPC FlowGuard</span>
                <span className="w-1 h-1 rounded-full bg-slate-500" />
                <span>now</span>
              </div>
              <div className="text-sm font-bold mt-1">
                Reroute: {payload.fromBay} → {payload.toBay}
              </div>
              <div className="text-xs text-slate-300 mt-1 leading-snug">
                Hi {payload.driverName.split(" ")[0]}, please proceed to bay{" "}
                <strong className="text-white">{payload.toBay}</strong> at{" "}
                {payload.depotName}. Time saved {payload.savedMinutes} min · demurrage
                avoided {fmtKes(payload.savedKes)}.
              </div>

              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={onOpenSheet}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1B7A3D] hover:bg-[#146030] text-[11px] font-bold transition-colors"
                >
                  <Truck className="w-3 h-3" />
                  Open driver app
                </button>
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-slate-300 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(banner, document.body);
};

// ---------------------------------------------------------------------------
// Driver sheet modal — portaled + full-screen dim + Esc + scroll lock
// ---------------------------------------------------------------------------
interface DriverSheetModalProps {
  payload: DriverPushPayload | null;
  onClose: () => void;
}

export const DriverSheetModal: React.FC<DriverSheetModalProps> = ({
  payload,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!payload) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [payload, onClose]);

  if (!payload || !mounted) return null;

  const steps = [
    { label: "Gate-In complete", done: true },
    {
      label: `Original bay ${payload.fromBay} flagged degraded`,
      done: true,
      warn: true,
    },
    {
      label: `Rerouted to bay ${payload.toBay}`,
      done: true,
      highlight: true,
    },
    { label: "Proceed to gantry", done: false },
    { label: "Load & weighbridge outbound", done: false },
  ];

  const sheet = (
    <div
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="driver-sheet-title"
      style={{ position: "fixed", zIndex: 9999 }}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-[#0B1420] to-[#152234] p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#3DAA63]" />
              <span
                id="driver-sheet-title"
                className="text-[10px] font-mono uppercase tracking-wider text-slate-400"
              >
                Driver App · Live
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1"
              aria-label="Close driver sheet"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-4">
            <div className="text-xs text-slate-400">Truck</div>
            <div className="text-lg font-bold font-mono">
              {payload.truckRegistration}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-md">
              <MapPin className="w-3 h-3 text-rose-400" />
              <span className="text-xs font-mono">{payload.fromBay}</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1.5 rounded-md">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-emerald-300">
                {payload.toBay}
              </span>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8492A6] mb-3">
            Journey
          </div>
          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                    s.done
                      ? s.warn
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : s.highlight
                        ? "bg-emerald-600 text-white"
                        : "bg-emerald-100 text-emerald-700 border border-emerald-300"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}
                >
                  {s.done ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                </div>
                <div
                  className={`text-xs leading-snug ${
                    s.highlight
                      ? "font-bold text-emerald-800"
                      : s.warn
                      ? "text-amber-800 font-semibold"
                      : s.done
                      ? "text-[#0F1B2B]"
                      : "text-[#8492A6]"
                  }`}
                >
                  {s.label}
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
            <div className="font-bold text-emerald-900">
              Estimated recovery: {payload.savedMinutes} min
            </div>
            <div className="text-emerald-800 mt-0.5">
              Demurrage avoided: {fmtKes(payload.savedKes)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(sheet, document.body);
};