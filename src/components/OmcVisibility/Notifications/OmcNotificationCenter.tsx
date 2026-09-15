"use client";

import React, { useState } from "react";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  Radio,
  Check,
  ExternalLink,
  Filter,
} from "lucide-react";
import { OmcNotification } from "@/types/flowguard";

interface OmcNotificationCenterProps {
  notifications: OmcNotification[];
  onAcknowledge: (id: string) => void;
  onSelectOrder?: (orderId: string) => void;
  omcName: string;
}

export const OmcNotificationCenter: React.FC<OmcNotificationCenterProps> = ({
  notifications,
  onAcknowledge,
  onSelectOrder,
  omcName,
}) => {
  const [filterType, setFilterType] = useState<string>("ALL");

  const unacknowledgedCount = notifications.filter((n) => !n.isAcknowledged).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === "ALL") return true;
    if (filterType === "UNACKNOWLEDGED") return !n.isAcknowledged;
    if (filterType === "WARNINGS") return n.severity === "warning";
    if (filterType === "ADVISORIES") return n.severity !== "warning";
    return true;
  });

  return (
    <div className="bg-white rounded-lg border border-[#E2E6EA] p-4 shadow-xs space-y-3 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EDF1F5] pb-2.5">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#1B7A3D]" />
          <div>
            <h4 className="font-bold text-xs text-[#0F1B2B] uppercase tracking-wide">
              Operational Dispatch Feed &amp; Communications
            </h4>
            <span className="text-[10px] text-[#8492A6]">
              Real-time gate-out alerts &amp; KPC terminal advisories for {omcName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unacknowledgedCount > 0 ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
              {unacknowledgedCount} UNACKNOWLEDGED
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-[#1B7A3D] border border-emerald-200">
              ALL ACKNOWLEDGED
            </span>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md border border-[#E2E6EA] text-xs self-start">
        {[
          { id: "ALL", label: `All (${notifications.length})` },
          { id: "UNACKNOWLEDGED", label: `Pending Ack (${unacknowledgedCount})` },
          { id: "WARNINGS", label: "Delay Warnings" },
          { id: "ADVISORIES", label: "Interventions & Flow" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
              filterType === tab.id
                ? "bg-white text-[#0F1B2B] shadow-2xs font-semibold"
                : "text-[#5C6B7A] hover:text-[#0F1B2B]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
        {filteredNotifications.map((n) => {
          const isWarning = n.severity === "warning";
          const isSuccess = n.severity === "success";

          return (
            <div
              key={n.id}
              className={`p-3 rounded-md border text-xs flex items-start gap-2.5 transition-all ${
                isWarning
                  ? "bg-amber-50/40 border-amber-200"
                  : isSuccess
                  ? "bg-emerald-50/40 border-emerald-200"
                  : "bg-[#FAFBFC] border-[#E2E6EA]"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isWarning ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                ) : isSuccess ? (
                  <Zap className="w-4 h-4 text-[#1B7A3D]" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-slate-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-[#0F1B2B] text-xs">
                      {n.title}
                    </span>
                    {n.truckRegistration && (
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-white border border-slate-200 text-[#1B7A3D]">
                        {n.truckRegistration}
                      </span>
                    )}
                    {n.orderId && (
                      <span className="font-mono text-[10px] text-[#5C6B7A]">
                        ({n.orderId})
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-[#8492A6] shrink-0">
                    {n.timestamp}
                  </span>
                </div>

                <p className="text-[11px] text-[#5C6B7A] mt-1 leading-relaxed">
                  {n.message}
                </p>

                {/* Actions Bar */}
                <div className="mt-2.5 pt-1.5 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] text-[#8492A6]">
                    Depot: <strong className="text-[#0F1B2B]">{n.depotName}</strong>
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* View Collection Button */}
                    {n.orderId && onSelectOrder && (
                      <button
                        type="button"
                        onClick={() => onSelectOrder(n.orderId!)}
                        className="px-2 py-1 rounded text-[10px] font-medium bg-white hover:bg-slate-50 border border-slate-200 text-[#0F1B2B] transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                        title="View order journey details in drawer"
                      >
                        <ExternalLink className="w-3 h-3 text-[#1B7A3D]" />
                        <span>VIEW COLLECTION</span>
                      </button>
                    )}

                    {/* Acknowledge Button or Status */}
                    {n.requiresAcknowledgement && !n.isAcknowledged ? (
                      <button
                        type="button"
                        onClick={() => onAcknowledge(n.id)}
                        className="px-2.5 py-1 rounded text-[10px] font-bold bg-[#1B7A3D] text-white hover:bg-[#145d2e] shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                        title="Confirms receipt of update by OMC dispatch desk"
                      >
                        <Check className="w-3 h-3" />
                        <span>ACKNOWLEDGE</span>
                      </button>
                    ) : n.isAcknowledged ? (
                      <span className="text-[10px] text-[#1B7A3D] font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <Check className="w-3 h-3" />
                        <span>ACKNOWLEDGED {n.acknowledgedAt ? `• ${n.acknowledgedAt}` : "• RECEIVED"}</span>
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredNotifications.length === 0 && (
          <div className="p-6 text-center text-xs text-[#8492A6]">
            No notifications match the selected filter.
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="pt-2 border-t border-[#EDF1F5] text-[10px] text-[#8492A6] leading-tight">
        * Acknowledging a notice confirms receipt by the OMC dispatch desk. KPC operations personnel remain responsible for depot physical operations and gantry execution.
      </div>
    </div>
  );
};
