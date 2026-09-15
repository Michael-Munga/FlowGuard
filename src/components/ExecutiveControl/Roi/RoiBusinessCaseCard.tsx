"use client";

import React, { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Clock,
  Calculator,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { RoiModelScenario, RoiScenarioName } from "@/types/flowguard";
import { BusinessCaseDrawer } from "./BusinessCaseDrawer";

interface RoiBusinessCaseCardProps {
  currentRoi: RoiModelScenario;
  activeScenario: RoiScenarioName;
  onSelectScenario: (s: RoiScenarioName) => void;
}

export const RoiBusinessCaseCard: React.FC<RoiBusinessCaseCardProps> = ({
  currentRoi,
  activeScenario,
  onSelectScenario,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const scenarios: RoiScenarioName[] = ["Conservative", "Expected", "Upside"];

  return (
    <>
      <div className="bg-white rounded-lg border border-[#E2E6EA] shadow-xs p-6 space-y-6">
        {/* Header & Scenario Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-[#0F1B2B] tracking-tight">
                Modeled Business Case &amp; Investment Payback (Projected ROI Analysis)
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                MODELED BUSINESS CASE
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                {currentRoi.firstYearRoiMultiplier}× YEAR 1 RETURN
              </span>
            </div>
            <p className="text-xs text-[#5C6B7A] mt-0.5">
              Forward-looking modeled financial evaluation comparing deployment capital expenditure against annualized demurrage prevention (not realized financial performance)
            </p>
          </div>

          {/* Actions & Scenario Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setIsDrawerOpen((prev) => !prev)}
              aria-expanded={isDrawerOpen}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-600" />
              <span>Inspect Cost Model &amp; Line Items</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
              <span className="text-xs text-slate-500 font-semibold px-2">Scenario:</span>
              {scenarios.map((s) => (
                <button
                  key={s}
                  onClick={() => onSelectScenario(s)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                    activeScenario === s
                      ? "bg-white text-[#0F1B2B] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4-KPI Economic Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Implementation Investment */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-1">
              IMPLEMENTATION CAPEX
            </span>
            <span className="text-2xl font-bold font-mono text-slate-900 block">
              KES {(currentRoi.implementationInvestmentKes / 1000000).toFixed(1)}M
            </span>
            <span className="text-[11px] text-slate-600 mt-1 block">
              Fixed software &amp; edge deployment baseline
            </span>
          </div>

          {/* 2. Annualized Protected Value */}
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
            <span className="text-[10px] font-mono uppercase text-emerald-800 font-bold block mb-1">
              ANNUAL PROTECTED VALUE
            </span>
            <span className="text-2xl font-bold font-mono text-emerald-700 block">
              KES {(currentRoi.annualProtectedValueKes / 1000000).toFixed(1)}M
            </span>
            <span className="text-[11px] text-emerald-800 mt-1 block">
              Modeled demurrage penalty avoidance
            </span>
          </div>

          {/* 3. Estimated Payback Period */}
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <span className="text-[10px] font-mono uppercase text-blue-800 font-bold block mb-1">
              ESTIMATED PAYBACK
            </span>
            <span className="text-2xl font-bold font-mono text-blue-700 block">
              {currentRoi.paybackMonths} Months
            </span>
            <span className="text-[11px] text-blue-800 mt-1 block">
              Capital recovery horizon
            </span>
          </div>

          {/* 4. Year 1 Net ROI Multiplier */}
          <div className="p-4 rounded-lg bg-[#0B1420] text-white">
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block mb-1">
              YEAR 1 NET ROI
            </span>
            <span className="text-2xl font-bold font-mono text-emerald-400 block">
              {currentRoi.firstYearRoiMultiplier}×
            </span>
            <span className="text-[11px] text-slate-300 mt-1 block font-mono">
              KES {(currentRoi.netFirstYearBenefitKes / 1000000).toFixed(0)}M Net Year 1 Benefit
            </span>
          </div>
        </div>

        {/* Inspectable Formula Box & Scenario Assumptions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Formula Walkthrough (~55%) */}
          <div className="lg:col-span-7 p-4 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs space-y-2.5 shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Calculator className="w-4 h-4" />
                <span className="font-bold uppercase tracking-wider text-[11px]">
                  Mathematical Transparency (Inspectable Equation)
                </span>
              </div>
              <span className="text-[10px] text-slate-400">KPC Operations Model</span>
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex items-center justify-between text-slate-300">
                <span>Annual Value Protected:</span>
                <span className="font-bold text-white">
                  KES {(currentRoi.annualProtectedValueKes / 1000000).toFixed(1)}M
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span>Less Annual Operating Cost (Cloud, Support):</span>
                <span className="text-slate-200">
                  - KES {(currentRoi.annualOperatingCostKes / 1000000).toFixed(1)}M
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1">
                <span>Less Implementation Investment (CAPEX):</span>
                <span className="text-slate-200">
                  - KES {(currentRoi.implementationInvestmentKes / 1000000).toFixed(1)}M
                </span>
              </div>

              <div className="flex items-center justify-between text-emerald-300 pt-1 text-xs">
                <span className="font-bold">Net Year 1 Value:</span>
                <span className="font-bold text-sm">
                  KES {(currentRoi.netFirstYearBenefitKes / 1000000).toFixed(1)}M
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-sans flex items-center justify-between">
              <span>
                ROI Formula: (Net Year 1 Value ÷ Implementation Investment) ={" "}
                <strong className="text-emerald-300 font-mono">{currentRoi.firstYearRoiMultiplier}×</strong>
              </span>
              <span>
                Payback: (CAPEX ÷ Net Value) × 12 ={" "}
                <strong className="text-white font-mono">{currentRoi.paybackMonths} mo</strong>
              </span>
            </div>
          </div>

          {/* Scenario Assumptions (~45%) */}
          <div className="lg:col-span-5 p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] font-mono">
                {currentRoi.scenarioName} Scenario Underlying Assumptions
              </h4>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="text-[10px] text-emerald-700 hover:underline font-semibold cursor-pointer"
              >
                View Details
              </button>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-600">
              {currentRoi.assumptions.map((asm, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{asm}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Benchmark Disclaimer Notice */}
        <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] leading-normal">
            <strong>Methodology Note:</strong> Financial projections are modeled from historical KPC annual throughput statistics (~7.3 billion litres distributed annually across road tanker collection corridors) and standardized demurrage rate schedules (KES 25,000/hr past SLA). Values represent simulated closed-loop runs and serve as an illustrative business case for board review.
          </p>
        </div>
      </div>

      {/* Assumptions & Cost Model Detail Drawer */}
      <BusinessCaseDrawer
        isOpen={isDrawerOpen}
        currentRoi={currentRoi}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
};
