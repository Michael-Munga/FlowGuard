"use client";

import React, { useState } from "react";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Zap,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { DriverUpdate, UpdatePriority } from "./types";

interface UpdatesTabProps {
  updates: DriverUpdate[];
  onAcknowledgeUpdate: (id: string) => void;
}

export const UpdatesTab: React.FC<UpdatesTabProps> = ({
  updates,
  onAcknowledgeUpdate,
}) => {
  const [filter, setFilter] = useState<"ALL" | "UNACKNOWLEDGED" | "IMPORTANT">("ALL");

  const filteredUpdates = updates.filter((u) => {
    if (filter === "UNACKNOWLEDGED") return u.requiresAcknowledgement && !u.isAcknowledged;
    if (filter === "IMPORTANT") return u.priority === "URGENT" || u.priority === "IMPORTANT";
    return true;
  });

  const getPriorityBadge = (priority: UpdatePriority) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "IMPORTANT":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "INFO":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    }
  };

  const getPriorityIcon = (priority: UpdatePriority) => {
    switch (priority) {
      case "URGENT":
        return <ShieldAlert className="w-4 h-4 text-red-400" />;
      case "IMPORTANT":
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case "INFO":
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div id="updates" className="space-y-3.5 pb-4 scroll-mt-3">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#0F1B2B] border border-[#1C2C42]">
        <button
          type="button"
          onClick={() => setFilter("ALL")}
          className={`flex-1 py-1.5 px-2 rounded-md text-[11px] font-bold transition-colors cursor-pointer text-center ${
            filter === "ALL" ? "bg-[#1B7A3D] text-white shadow-xs" : "text-slate-400 hover:text-white"
          }`}
        >
          All ({updates.length})
        </button>

        <button
          type="button"
          onClick={() => setFilter("UNACKNOWLEDGED")}
          className={`flex-1 py-1.5 px-2 rounded-md text-[11px] font-bold transition-colors cursor-pointer text-center ${
            filter === "UNACKNOWLEDGED" ? "bg-[#1B7A3D] text-white shadow-xs" : "text-slate-400 hover:text-white"
          }`}
        >
          Requires Ack ({updates.filter((u) => u.requiresAcknowledgement && !u.isAcknowledged).length})
        </button>

        <button
          type="button"
          onClick={() => setFilter("IMPORTANT")}
          className={`flex-1 py-1.5 px-2 rounded-md text-[11px] font-bold transition-colors cursor-pointer text-center ${
            filter === "IMPORTANT" ? "bg-[#1B7A3D] text-white shadow-xs" : "text-slate-400 hover:text-white"
          }`}
        >
          Urgent / Alerts
        </button>
      </div>

      {/* Feed */}
      <div className="space-y-3">
        {filteredUpdates.length === 0 ? (
          <div className="p-8 text-center bg-[#0F1B2B] rounded-xl border border-[#1C2C42] space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <span className="text-xs font-bold text-white block">No Updates in this view</span>
            <p className="text-[11px] text-slate-400">
              All field instructions and notices have been addressed.
            </p>
          </div>
        ) : (
          filteredUpdates.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl bg-[#0F1B2B] border space-y-3 shadow-xs transition-colors ${
                item.requiresAcknowledgement && !item.isAcknowledged
                  ? "border-amber-500/50 bg-gradient-to-b from-[#181C26] to-[#0F1B2B]"
                  : "border-[#1C2C42]"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#152234] border border-[#243447]">
                    {getPriorityIcon(item.priority)}
                  </div>
                  <div>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase font-bold ${getPriorityBadge(item.priority)}`}>
                      {item.priority} • {item.type}
                    </span>
                    <h4 className="text-xs font-bold text-white mt-1 leading-snug">{item.title}</h4>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  {item.timestamp}
                </span>
              </div>

              {/* Message */}
              <p className="text-xs text-slate-300 leading-relaxed">
                {item.message}
              </p>

              {/* Before/After Timing Delta Box (If Present) */}
              {item.previousTiming && item.newTiming && (
                <div className="p-2.5 rounded-lg bg-[#142234] border border-[#23354C] text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Previous:</span>
                    <span className="font-mono line-through text-slate-500">{item.previousTiming}</span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-emerald-300">
                    <span>Updated:</span>
                    <span className="font-mono text-white flex items-center gap-1">
                      <span>{item.newTiming}</span>
                      <Zap className="w-3 h-3 text-amber-400" />
                    </span>
                  </div>
                  {item.reason && (
                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-700/50">
                      <strong>Reason: </strong>{item.reason}
                    </div>
                  )}
                </div>
              )}

              {/* Acknowledgement Status / Action */}
              {item.requiresAcknowledgement && (
                <div>
                  {!item.isAcknowledged ? (
                    <button
                      type="button"
                      onClick={() => onAcknowledgeUpdate(item.id)}
                      className="w-full min-h-[44px] py-2.5 px-3 rounded-lg bg-[#1B7A3D] hover:bg-[#1E8A45] active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ACKNOWLEDGE UPDATE</span>
                    </button>
                  ) : (
                    <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-between text-[11px] font-bold">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>ACKNOWLEDGED</span>
                      </div>
                      <span className="font-mono text-[10px] text-emerald-200">
                        {item.acknowledgedAt || "10:33 EAT"}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
