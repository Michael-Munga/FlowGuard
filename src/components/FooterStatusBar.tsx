"use client";

import React, { useState } from "react";
import { Lock, Server, Wifi, Cpu, Shield, AlertTriangle } from "lucide-react";

interface FooterStatusBarProps {
  dataFreshnessSeconds: number;
}

export const FooterStatusBar: React.FC<FooterStatusBarProps> = ({
  dataFreshnessSeconds,
}) => {
  const [degradedMode, setDegradedMode] = useState(false);

  return (
    <>
      {degradedMode && (
        <div className="bg-amber-500 text-slate-950 px-6 py-1 text-xs font-semibold flex items-center justify-between border-t border-amber-600 transition-all">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>
              WARNING: SCADA Degraded Mode Active — Operating on local cache and asynchronous batch queues.
            </span>
          </div>
          <button
            onClick={() => setDegradedMode(false)}
            className="text-[10px] underline uppercase tracking-wider font-bold hover:text-white"
          >
            Restore Full SCADA Link
          </button>
        </div>
      )}

      <footer className="bg-white border-t border-[#E2E6EA] px-6 py-2 text-[11px] text-[#5C6B7A] flex flex-wrap items-center justify-between gap-y-2 select-none">
        {/* Left indicators */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#1B7A3D]" />
            <span className="font-medium text-[#0F1B2B]">API:</span>
            <span>Connected</span>
          </div>

          <span className="text-slate-300">|</span>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#1B7A3D]" />
            <span className="font-medium text-[#0F1B2B]">Event Stream:</span>
            <span>Healthy</span>
          </div>

          <span className="text-slate-300 hidden sm:inline">|</span>

          <div className="flex items-center gap-1.5 hidden sm:flex">
            <span className="font-medium text-[#0F1B2B]">Data Freshness:</span>
            <span className="font-mono text-[#1B7A3D] font-bold">
              {dataFreshnessSeconds}s
            </span>
          </div>

          <span className="text-slate-300 hidden md:inline">|</span>

          <div className="flex items-center gap-1.5 hidden md:flex">
            <span className="w-2 h-2 rounded-full bg-[#1B7A3D]" />
            <span className="font-medium text-[#0F1B2B]">Prediction Engine:</span>
            <span>Operational</span>
          </div>

          <span className="text-slate-300 hidden lg:inline">|</span>

          <div className="flex items-center gap-1.5 hidden lg:flex">
            <span className="w-2 h-2 rounded-full bg-[#1B7A3D]" />
            <span className="font-medium text-[#0F1B2B]">Notifications:</span>
            <span>Operational</span>
          </div>
        </div>

        {/* Right-aligned indicators */}
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-[10px] uppercase tracking-wider text-[#8492A6] hidden xl:inline">
            KENYA PIPELINE COMPANY LTD © SCADA SUB-SYSTEM
          </span>

          <span className="text-slate-300 hidden xl:inline">|</span>

          <div className="flex items-center gap-1 text-[#0F1B2B] font-mono text-[10px] font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            <Lock className="w-2.5 h-2.5 text-[#1B7A3D]" />
            <span>SECURE MODE: EMB-88</span>
          </div>

          <span className="text-slate-300">|</span>

          {/* Degraded Mode Toggle */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium text-[#5C6B7A]">
              Degraded Mode
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={degradedMode}
              onClick={() => setDegradedMode(!degradedMode)}
              className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                degradedMode ? "bg-[#C0392B]" : "bg-slate-200"
              }`}
              title="Toggle SCADA Degraded Diagnostic Mode"
            >
              <span
                className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  degradedMode ? "translate-x-3" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </footer>
    </>
  );
};
