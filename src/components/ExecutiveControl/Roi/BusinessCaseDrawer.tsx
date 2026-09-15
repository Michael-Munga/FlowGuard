"use client";

import React, { useEffect, useRef } from "react";
import {
  X,
  Calculator,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  ArrowRight,
} from "lucide-react";
import { RoiModelScenario } from "@/types/flowguard";

interface BusinessCaseDrawerProps {
  isOpen: boolean;
  currentRoi: RoiModelScenario | null;
  onClose: () => void;
}

export const BusinessCaseDrawer: React.FC<BusinessCaseDrawerProps> = ({
  isOpen,
  currentRoi,
  onClose,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Manage Escape key dismiss and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus close button on open for accessibility
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  // Do not render anything if drawer is closed or data is missing
  if (!isOpen || !currentRoi) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="business-case-drawer-title"
    >
      <div
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-[#0B1420] text-white flex items-center justify-between border-b border-[#1C2C42] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1B7A3D] text-white flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="business-case-drawer-title" className="text-base font-bold text-white tracking-tight">
                  Economic Model &amp; Investment Assumptions
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                  {currentRoi.scenarioName} SCENARIO
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Detailed CAPEX, OPEX, demurrage formula, and capital payback methodology
              </p>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close economic model drawer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* 1. Executive Summary Strip */}
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-mono text-slate-500 font-bold block mb-1">
                CAPEX
              </span>
              <span className="text-lg font-bold font-mono text-slate-900">
                KES {(currentRoi.implementationInvestmentKes / 1000000).toFixed(1)}M
              </span>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] uppercase font-mono text-emerald-800 font-bold block mb-1">
                Protected / Yr
              </span>
              <span className="text-lg font-bold font-mono text-emerald-700">
                KES {(currentRoi.annualProtectedValueKes / 1000000).toFixed(1)}M
              </span>
            </div>

            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <span className="text-[10px] uppercase font-mono text-blue-800 font-bold block mb-1">
                Payback
              </span>
              <span className="text-lg font-bold font-mono text-blue-700">
                {currentRoi.paybackMonths} Mo
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#0B1420] text-white">
              <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold block mb-1">
                Year 1 ROI
              </span>
              <span className="text-lg font-bold font-mono text-emerald-400">
                {currentRoi.firstYearRoiMultiplier}×
              </span>
            </div>
          </div>

          {/* 2. Implementation CAPEX Line Items */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono flex items-center justify-between">
              <span>1. Implementation Capital Expenditure (CAPEX)</span>
              <span className="text-slate-500 font-normal">KES 20.0M Total Baseline</span>
            </h4>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-mono text-slate-600">
                    <th className="py-2 px-3">Investment Component</th>
                    <th className="py-2 px-3">Scope &amp; Deliverables</th>
                    <th className="py-2 px-3 text-right">Cost (KES)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">Edge Telemetry Gateways</td>
                    <td className="py-2.5 px-3 text-slate-600">Ruggedized edge compute for weighbridge &amp; Coriolis polling across 5 depots</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">4,500,000</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">SAP &amp; SCADA Connectors</td>
                    <td className="py-2.5 px-3 text-slate-600">Enterprise OPC-UA, RFC / BAPI connectors, staging validation test harness</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">6,000,000</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">Software &amp; Solver Cluster</td>
                    <td className="py-2.5 px-3 text-slate-600">FlowGuard control plane, MILP optimization solver licenses, high-availability setup</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">5,500,000</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">Training &amp; Change Management</td>
                    <td className="py-2.5 px-3 text-slate-600">Depot superintendent SOP training, OMC onboarding, driver PWA launch materials</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">4,000,000</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan={2} className="py-2.5 px-3 text-slate-900">Total Upfront Implementation CAPEX</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-900">KES 20,000,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Annual Operational Cost (OPEX) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono flex items-center justify-between">
              <span>2. Annual Operational Expenses (OPEX)</span>
              <span className="text-slate-500 font-normal">KES {(currentRoi.annualOperatingCostKes / 1000000).toFixed(1)}M / Year</span>
            </h4>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-mono text-slate-600">
                    <th className="py-2 px-3">Operating Line Item</th>
                    <th className="py-2 px-3">Service Level Description</th>
                    <th className="py-2 px-3 text-right">Annual (KES)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">24/7 Technical SLA &amp; Support</td>
                    <td className="py-2.5 px-3 text-slate-600">Mission-critical engineer response for optimization solver and policy exceptions</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">5,000,000</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">Cloud Hosting &amp; WAN Redundancy</td>
                    <td className="py-2.5 px-3 text-slate-600">Multi-region disaster recovery, sub-second telemetry ingestion, backup fiber relays</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">3,500,000</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">Sensor Calibration &amp; Retraining</td>
                    <td className="py-2.5 px-3 text-slate-600">Quarterly Coriolis drift validation, model parameter updates, accuracy audits</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">3,500,000</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan={2} className="py-2.5 px-3 text-slate-900">Total Recurring Annual OPEX</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-900">
                      KES {currentRoi.annualOperatingCostKes.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Demurrage Calculation Methodology */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              3. Demurrage Penalty &amp; Value Protection Framework
            </h4>
            <ul className="space-y-1.5 text-[11px] text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Throughput Basis:</strong> Modeled on KPC's ~7.3 billion litres annual throughput, representing approximately 200,000 commercial road tanker collections annually across 5 major terminals.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Standard Demurrage Rate:</strong> Modeled at KES 25,000 per hour per delayed tanker past the 90-minute collection SLA envelope, in accordance with standard Transport and Storage Agreements (TSAs).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Turnaround Recovery:</strong> Verified 35.6% dwell reduction (average 31 minutes saved per vehicle), yielding KES 550M in annualized gross exposure mitigation under the Expected scenario.
                </span>
              </li>
            </ul>
          </div>

          {/* 5. Breakeven & Sensitivity */}
          <div className="p-4 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 font-mono">
              4. Sensitivity &amp; Breakeven Threshold
            </h4>
            <p className="text-[11px] text-emerald-950 leading-relaxed">
              <strong>Breakeven Attainment:</strong> To fully recoup the initial KES 20.0M capital investment within Year 1, FlowGuard needs to achieve a turnaround dwell reduction of only <strong>1.4% (less than 1.5 minutes per tanker)</strong>.
              The verified prototype reduction of 35.6% (31 minutes) provides an overwhelming 25× safety margin above capital breakeven.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>KPC FlowGuard Investment Model • Verified Methodology</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close economic model drawer"
            className="px-4 py-2 rounded-md bg-[#0B1420] text-white text-xs font-semibold hover:bg-slate-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
