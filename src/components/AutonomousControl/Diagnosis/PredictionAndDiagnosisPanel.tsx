"use client";

import React from "react";
import {
  TrendingUp,
  Search,
  AlertTriangle,
  Clock,
  Sliders,
  HelpCircle,
  BarChart3,
  CheckCircle2,
  Info,
} from "lucide-react";
import { AutonomyIncident } from "@/types/flowguard";

interface PredictionAndDiagnosisPanelProps {
  incident: AutonomyIncident;
}

export const PredictionAndDiagnosisPanel: React.FC<PredictionAndDiagnosisPanelProps> = ({
  incident,
}) => {
  // Causal factors with percentages matching Section 13
  const factorContributions = [
    { name: "Queue pressure", pct: 34, detail: "Accumulation of waiting road tankers at ingress" },
    { name: "Loading capacity pressure", pct: 27, detail: "5 of 8 gantries usable; P06-P08 servicing" },
    { name: "Arrival clustering", pct: 18, detail: "18 collection orders scheduled in 90m window" },
    { name: "Equipment constraint", pct: 9, detail: "Metering flow velocity 86% of nominal baseline" },
    { name: "Other operational factors", pct: 12, detail: "Tare weighbridge scale latency & documentation" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 select-none">
      {/* 1. Prediction Detail & Prediction Error Card (Sections 10 & 11) */}
      <div className="bg-white rounded-lg border border-[#E2E6EA] p-5 shadow-xs flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#1B7A3D]" />
              <h3 className="font-bold text-sm text-[#0F1B2B] uppercase tracking-wide">
                Prediction Detail &amp; Model Error
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-semibold px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
              WINDOW: NEXT 60–90 MIN
            </span>
          </div>

          <p className="text-xs text-[#5C6B7A] mt-2">
            Forward machine-learning turnaround projection conditioned on depot queue density and gantry velocity.
          </p>

          {/* Key Prediction Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 text-xs">
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block font-medium">
                Baseline SLA
              </span>
              <span className="font-mono font-bold text-slate-800 text-sm">
                65 min
              </span>
            </div>

            <div className="p-2.5 rounded bg-rose-50 border border-rose-200">
              <span className="text-[10px] text-rose-700 uppercase block font-medium">
                Predicted Turnaround
              </span>
              <span className="font-mono font-bold text-rose-800 text-sm">
                114 min
              </span>
            </div>

            <div className="p-2.5 rounded bg-amber-50 border border-amber-200">
              <span className="text-[10px] text-amber-800 uppercase block font-medium">
                Expected Delta
              </span>
              <span className="font-mono font-bold text-amber-900 text-sm">
                +49 min delay
              </span>
            </div>

            <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] text-[#1B7A3D] uppercase block font-medium">
                Model Confidence
              </span>
              <span className="font-mono font-bold text-[#1B7A3D] text-sm">
                92.4%
              </span>
            </div>
          </div>

          {/* Explicit Predicted vs Observed & Prediction Error (Section 11) */}
          <div className="mt-3.5 p-3 rounded-lg bg-[#FAFBFC] border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-600 font-bold uppercase">
                Observed vs Predicted Comparison:
              </span>
              <span className="text-[10px] text-slate-400">
                Ground-Truth Field Gross Scale
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-[9px] uppercase text-slate-400 font-bold block">
                  Predicted
                </span>
                <span className="font-mono font-bold text-slate-800">
                  114 min
                </span>
              </div>

              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-[9px] uppercase text-slate-400 font-bold block">
                  Observed (Unmitigated)
                </span>
                <span className="font-mono font-bold text-slate-800">
                  110 min
                </span>
              </div>

              <div className="bg-white p-2 rounded border border-emerald-200 bg-emerald-50/40">
                <span className="text-[9px] uppercase text-[#1B7A3D] font-bold block">
                  Mean Prediction Error
                </span>
                <span className="font-mono font-extrabold text-[#1B7A3D]">
                  4 min
                </span>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 italic">
              * Note: Reported as Mean Prediction Error (±4 min), not classification accuracy. Within acceptable operational tolerance of ±15 min.
            </p>
          </div>
        </div>

        {/* Decision Logic: Why this action? (Section 15 & 34) */}
        <div className="pt-3 border-t border-slate-200 space-y-1 text-xs">
          <span className="font-bold text-[#0F1B2B] flex items-center gap-1 text-[11px] uppercase tracking-wider">
            <Info className="w-3.5 h-3.5 text-[#1B7A3D]" />
            <span>Decision Explanation: Why this action?</span>
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
            <div>
              <strong className="text-slate-700">Why did FlowGuard act?</strong>
              <p className="text-slate-500">Demand pressure was projected to exceed effective depot processing capacity by 7 tankers.</p>
            </div>
            <div>
              <strong className="text-slate-700">Why this action?</strong>
              <p className="text-slate-500">Highest-benefit action (-38m expected recovery) within allowed low-risk operating boundary.</p>
            </div>
            <div>
              <strong className="text-slate-700">Why autonomous?</strong>
              <p className="text-slate-500">Covered under L2 Auto-Executable policy (POL-042); zero hazardous cargo conflict detected.</p>
            </div>
            <div>
              <strong className="text-slate-700">Why verification outcome?</strong>
              <p className="text-slate-500">Observed recovery (-34m) attained 89.5% of simulated target reduction (-38m).</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Diagnosis & Factor Contribution Card (Sections 12 & 13) */}
      <div className="bg-white rounded-lg border border-[#E2E6EA] p-5 shadow-xs flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-sm text-[#0F1B2B] uppercase tracking-wide">
                Diagnosis &amp; Factor Contribution
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              SIMULATED RISK CONTRIBUTION MODEL
            </span>
          </div>

          <p className="text-xs text-[#5C6B7A] mt-2">
            Model explanation signals quantifying relative contribution of depot operational factors to turnaround delay risk.
          </p>

          {/* Factor Contribution Bars (Section 13) */}
          <div className="space-y-2.5 mt-3">
            {factorContributions.map((factor, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>{factor.name}</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {factor.pct}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      factor.pct >= 30
                        ? "bg-rose-500"
                        : factor.pct >= 20
                        ? "bg-amber-500"
                        : factor.pct >= 15
                        ? "bg-blue-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${factor.pct}%` }}
                  />
                </div>

                <span className="text-[10px] text-slate-500 block leading-tight">
                  {factor.detail}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footnote Disclosing Simulation (Section 13) */}
        <div className="p-3 bg-slate-50 rounded border border-slate-200 text-[10px] text-slate-500 leading-relaxed">
          <strong>Methodology Note:</strong> Factor contributions are model explanation signals generated via gradient feature attribution to aid platform operator situational awareness. They do not constitute formal audited mechanical causal coefficients.
        </div>
      </div>
    </div>
  );
};
