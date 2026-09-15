"use client";

import React, { useEffect, useRef } from "react";
import { X, HelpCircle, ShieldCheck, DollarSign, Clock, CheckCircle2 } from "lucide-react";

interface MetricDefinitionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MetricDefinitionModal: React.FC<MetricDefinitionModalProps> = ({ isOpen, onClose }) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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

    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const definitions = [
    {
      title: "Exposure at Risk",
      category: "Financial Exposure",
      icon: <DollarSign className="w-4 h-4 text-amber-600" />,
      badge: "Projected Risk",
      definition:
        "The estimated financial demurrage penalty liability that KPC or OMCs would incur under applicable Transport and Storage Agreements (TSAs) if an identified delay or bottleneck is not mitigated.",
      methodology:
        "Calculated by projecting each affected road tanker's dwell past its SLA window multiplied by standard hourly demurrage rates.",
    },
    {
      title: "Exposure Protected",
      category: "Financial Impact",
      icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
      badge: "Modeled Avoidance",
      definition:
        "The potential demurrage exposure that FlowGuard estimates was prevented through autonomous or approved operational interventions.",
      methodology:
        "Derived from the expected turnaround recovery delta (minutes saved) multiplied by the tanker's contract demurrage rate.",
    },
    {
      title: "Realized Savings",
      category: "Verified Outcome",
      icon: <CheckCircle2 className="w-4 h-4 text-blue-600" />,
      badge: "Observed Fact",
      definition:
        "The confirmed financial savings verified after observing physical gross scale gate-out telemetry and actual collection completion times.",
      methodology:
        "Calculated exclusively from verified interventions where physical dwell reduction has been recorded and integrity-checked.",
    },
    {
      title: "Turnaround Improvement (%)",
      category: "Operational Velocity",
      icon: <Clock className="w-4 h-4 text-emerald-600" />,
      badge: "Time Delta",
      definition:
        "The percentage reduction in gate-to-gate road tanker turnaround duration achieved under FlowGuard relative to the historical baseline.",
      methodology:
        "Formula: (Historical Baseline Minutes - Verified Current Minutes) / Historical Baseline Minutes × 100.",
    },
    {
      title: "Intervention Success Rate (%)",
      category: "Autonomy Efficacy",
      icon: <CheckCircle2 className="w-4 h-4 text-purple-600" />,
      badge: "Quality Metric",
      definition:
        "The percentage of executed autonomous or approved interventions that successfully achieved their target turnaround reduction SLA.",
      methodology:
        "Formula: Verified Successful Interventions / Total Completed Interventions × 100. Unverified or failed actions count as non-success.",
    },
    {
      title: "Recovery Attainment (%)",
      category: "Prediction Quality",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      badge: "Empirical Attainment",
      definition:
        "The percentage of predicted turnaround dwell recovery that is empirically observed after intervention execution.",
      methodology:
        "Formula: (Observed Turnaround Minutes Saved ÷ Predicted Turnaround Minutes Saved) × 100. Measures actual realized efficacy vs model expectation.",
    },
    {
      title: "Mean Prediction Error",
      category: "Predictive Precision",
      icon: <Clock className="w-4 h-4 text-blue-600" />,
      badge: "Error Margin",
      definition:
        "The mean absolute deviation between predicted event milestones (arrival, loading completion, gate-out) and actual physical telemetry.",
      methodology:
        "Formula: Σ |Predicted Minute - Actual Minute| / N. Currently ±4.2 minutes across the 5-depot terminal network.",
    },
    {
      title: "Capacity Recovered",
      category: "Resource Utilization",
      icon: <Clock className="w-4 h-4 text-indigo-600" />,
      badge: "Throughput",
      definition:
        "The cumulative processing hours and equivalent truck loading slots recovered through proactive queue deconfliction and bay fast-tracking.",
      methodology:
        "Aggregates minutes saved across all loading positions and converts them into equivalent standard turnaround windows.",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="metric-definition-title"
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-[#0B1420] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 id="metric-definition-title" className="text-base font-bold text-white tracking-tight">
                Executive Metric Definitions &amp; Business Rules
              </h3>
              <p className="text-xs text-slate-400">
                Authoritative standards governing FlowGuard financial and operational reporting
              </p>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close metric definitions modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 divide-y divide-slate-100">
          {definitions.map((def, idx) => (
            <div key={idx} className={idx === 0 ? "space-y-1.5" : "pt-4 space-y-1.5"}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-slate-100">{def.icon}</div>
                  <h4 className="text-sm font-bold text-slate-900">{def.title}</h4>
                  <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">
                    • {def.category}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {def.badge}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{def.definition}</p>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600 font-mono">
                <strong className="text-slate-800 font-sans">Calculation: </strong>
                {def.methodology}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>KPC FlowGuard Control Plane • Executive Specification</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close metric definitions modal"
            className="px-4 py-1.5 rounded-md bg-[#0B1420] text-white text-xs font-semibold hover:bg-slate-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
