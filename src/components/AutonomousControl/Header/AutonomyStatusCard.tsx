"use client";

import React from "react";
import { ShieldCheck, Lock, Zap, Info, AlertTriangle } from "lucide-react";

interface AutonomyStatusCardProps {
  isDegradedMode: boolean;
  l1Count?: number;
  l2Count?: number;
  l3Count?: number;
}

export const AutonomyStatusCard: React.FC<AutonomyStatusCardProps> = ({
  isDegradedMode,
  l1Count = 3,
  l2Count = 4,
  l3Count = 1,
}) => {
  return (
    <div className="bg-white rounded-lg border border-[#E2E6EA] p-4 shadow-xs select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#EDF1F5]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#1B7A3D]" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-[#0F1B2B] uppercase tracking-wider">
                AUTONOMY MODE:
              </span>
              <span
                className={`font-mono text-xs font-extrabold px-2 py-0.5 rounded border uppercase ${
                  isDegradedMode
                    ? "bg-rose-50 text-rose-800 border-rose-300 animate-pulse"
                    : "bg-emerald-50 text-[#1B7A3D] border-emerald-300"
                }`}
              >
                {isDegradedMode ? "DEGRADED (FALLBACK ACTIVE)" : "NORMAL"}
              </span>
            </div>
            <span className="text-[10px] text-[#5C6B7A]">
              Autonomy by default. Human approval by exception. Every action operates within bounded safety limits.
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 self-start md:self-auto">
          FLOWGUARD AUTONOMY POLICY — PROTOTYPE FRAMEWORK
        </span>
      </div>

      {/* 3 Autonomy Tiers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
        {/* L1 Advisory */}
        <div className="p-3 rounded-lg border border-slate-200 bg-[#FAFBFC] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1 text-[10px] font-bold font-mono uppercase text-slate-500">
              <Info className="w-3 h-3 text-slate-400" />
              <span>L1 ADVISORY</span>
            </div>
            <span className="text-[11px] text-[#5C6B7A] block mt-0.5">
              Recommendation only
            </span>
          </div>
          <span className="font-mono text-2xl font-extrabold text-slate-700">
            {l1Count}
          </span>
        </div>

        {/* L2 Auto-Executable */}
        <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/40 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1 text-[10px] font-bold font-mono uppercase text-[#1B7A3D]">
              <Zap className="w-3 h-3 text-[#1B7A3D]" />
              <span>L2 AUTO-EXECUTABLE</span>
            </div>
            <span className="text-[11px] text-[#5C6B7A] block mt-0.5">
              Low-risk bounded actions
            </span>
          </div>
          <span className="font-mono text-2xl font-extrabold text-[#1B7A3D]">
            {l2Count}
          </span>
        </div>

        {/* L3 Approval Required */}
        <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/40 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1 text-[10px] font-bold font-mono uppercase text-amber-800">
              <Lock className="w-3 h-3 text-amber-700" />
              <span>L3 APPROVAL REQUIRED</span>
            </div>
            <span className="text-[11px] text-[#5C6B7A] block mt-0.5">
              Human sign-off enforced
            </span>
          </div>
          <span className="font-mono text-2xl font-extrabold text-amber-800">
            {l3Count}
          </span>
        </div>
      </div>
    </div>
  );
};
