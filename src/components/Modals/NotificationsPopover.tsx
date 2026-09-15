"use client";

import React from "react";
import { X, Bell, Check, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { ActivityEvent } from "@/types/dashboard";

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  events: ActivityEvent[];
  onMarkAllRead: () => void;
  onSelectTruck?: (truckId: string) => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  isOpen,
  onClose,
  events,
  onMarkAllRead,
  onSelectTruck,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-2xs" onClick={onClose} />

      <div className="fixed top-14 right-6 z-50 w-88 max-w-[95vw] bg-white rounded-lg border border-[#E2E6EA] shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
        {/* Header */}
        <div className="p-3.5 px-4 border-b border-[#E2E6EA] flex items-center justify-between bg-[#FAFBFC]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#1B7A3D]" />
            <h4 className="font-bold text-xs text-[#0F1B2B]">
              Dispatch Alerts & Events
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="text-[11px] text-[#1B7A3D] hover:underline font-semibold"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Alerts List */}
        <div className="max-h-96 overflow-y-auto divide-y divide-[#E2E6EA]">
          {events.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#5C6B7A]">
              No active unacknowledged alerts.
            </div>
          ) : (
            events.map((evt) => {
              let icon = <Info className="w-4 h-4 text-[#1B7A3D]" />;
              let borderClass = "border-l-2 border-l-[#1B7A3D]";
              if (evt.severity === "critical") {
                icon = <AlertCircle className="w-4 h-4 text-[#C0392B]" />;
                borderClass = "border-l-2 border-l-[#C0392B] bg-rose-50/30";
              } else if (evt.severity === "warning") {
                icon = <AlertTriangle className="w-4 h-4 text-[#B7791F]" />;
                borderClass = "border-l-2 border-l-[#B7791F] bg-amber-50/30";
              }

              return (
                <div
                  key={evt.id}
                  className={`p-3 text-xs transition-colors hover:bg-slate-50 ${borderClass}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 font-bold font-mono text-[#0F1B2B]">
                      {icon}
                      <span>{evt.source}</span>
                    </div>
                    <span className="text-[10px] text-[#8492A6] font-mono">
                      {evt.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5C6B7A] leading-relaxed">
                    {evt.description}
                  </p>
                  {evt.truckId && onSelectTruck && (
                    <button
                      onClick={() => {
                        onSelectTruck(evt.truckId!);
                        onClose();
                      }}
                      className="mt-1.5 text-[10px] font-bold text-[#1B7A3D] hover:underline block"
                    >
                      Inspect Truck Details →
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};
