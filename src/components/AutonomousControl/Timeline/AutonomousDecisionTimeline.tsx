"use client";

import React, { useState } from "react";
import {
  Radio,
  TrendingUp,
  Search,
  Sliders,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  Check,
  AlertTriangle,
  X,
  Clock,
  Cpu,
  FileCode,
} from "lucide-react";
import { DecisionTimelineStep, DecisionStepStage } from "@/types/flowguard";

interface AutonomousDecisionTimelineProps {
  steps: DecisionTimelineStep[];
  incidentId: string;
  onOpenDrawer?: () => void;
}

export const AutonomousDecisionTimeline: React.FC<AutonomousDecisionTimelineProps> = ({
  steps,
  incidentId,
  onOpenDrawer,
}) => {
  const [expandedStage, setExpandedStage] = useState<DecisionStepStage | null>("OPTIMIZE");

  const getStepIcon = (stage: DecisionStepStage) => {
    switch (stage) {
      case "SIGNAL":
        return <Radio className="w-4 h-4" />;
      case "PREDICT":
        return <TrendingUp className="w-4 h-4" />;
      case "DIAGNOSE":
        return <Search className="w-4 h-4" />;
      case "OPTIMIZE":
        return <Sliders className="w-4 h-4" />;
      case "DECIDE":
        return <ShieldCheck className="w-4 h-4" />;
      case "EXECUTE":
        return <Zap className="w-4 h-4" />;
      case "VERIFY":
        return <CheckCircle2 className="w-4 h-4" />;
      case "LOG":
        return <Lock className="w-4 h-4" />;
    }
  };

  const getStepStatusStyle = (status: DecisionTimelineStep["status"]) => {
    switch (status) {
      case "COMPLETED":
        return {
          cardBorder: "border-slate-200 hover:border-emerald-300",
          badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          nodeBg: "bg-emerald-600 text-white",
          label: "Completed",
        };
      case "IN_PROGRESS":
        return {
          cardBorder: "border-blue-400 ring-2 ring-blue-100",
          badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
          nodeBg: "bg-blue-600 text-white",
          label: "In Progress",
        };
      case "BLOCKED":
        return {
          cardBorder: "border-rose-300 ring-2 ring-rose-100",
          badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
          nodeBg: "bg-rose-600 text-white",
          label: "Blocked",
        };
      case "FAILED":
        return {
          cardBorder: "border-slate-300 ring-2 ring-slate-100",
          badgeBg: "bg-slate-100 text-slate-700 border-slate-300",
          nodeBg: "bg-slate-600 text-white",
          label: "Fault",
        };
      case "PENDING":
      default:
        return {
          cardBorder: "border-slate-200 opacity-75",
          badgeBg: "bg-slate-100 text-slate-500 border-slate-200",
          nodeBg: "bg-slate-300 text-slate-600",
          label: "Pending",
        };
    }
  };

  const toggleExpand = (stage: DecisionStepStage) => {
    setExpandedStage(expandedStage === stage ? null : stage);
  };

  return (
    <div className="bg-white rounded-lg border border-[#E2E6EA] shadow-xs p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#0F1B2B] tracking-tight">
              Autonomous Decision Timeline
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase font-mono">
              8-STAGE PIPELINE
            </span>
          </div>
          <p className="text-xs text-[#5C6B7A] mt-0.5">
            Sequential closed-loop execution: from real-time field telemetry to combinatorial optimization and tamper-evident audit
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span>Incident: <strong>{incidentId}</strong></span>
          {onOpenDrawer && (
            <button
              onClick={onOpenDrawer}
              className="text-xs text-emerald-700 font-semibold hover:underline ml-2"
            >
              Expand Full Audit Log &rarr;
            </button>
          )}
        </div>
      </div>

      {/* Pipeline Visual Track (Cards Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step, idx) => {
          const style = getStepStatusStyle(step.status);
          const isExpanded = expandedStage === step.stage;

          return (
            <div
              key={step.stage}
              className={`rounded-lg border transition-all flex flex-col justify-between bg-white ${style.cardBorder} ${
                isExpanded ? "shadow-md ring-1 ring-emerald-500/30" : "hover:shadow-xs"
              }`}
            >
              {/* Card Header */}
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center shadow-2xs ${style.nodeBg}`}
                    >
                      {getStepIcon(step.stage)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          0{idx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-[#0F1B2B] uppercase tracking-wide">
                          {step.stage}
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium truncate block max-w-[130px]">
                        {step.label}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border font-mono ${style.badgeBg}`}
                  >
                    {style.label}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
                  <span>{step.timestamp}</span>
                  <span className="text-slate-500 truncate max-w-[120px]">{step.subLabel}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-700 leading-relaxed font-normal mb-3">
                  {step.summary}
                </p>

                {/* Key Metrics */}
                {step.metrics && step.metrics.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 mb-3">
                    {step.metrics.map((m, mIdx) => (
                      <div key={mIdx} className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 truncate pr-2">{m.label}:</span>
                        <span
                          className={`font-mono font-bold ${
                            m.isHighlight ? "text-emerald-700" : "text-slate-800"
                          }`}
                        >
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Expandable Technical Telemetry Details */}
                {step.payloadEntries && step.payloadEntries.length > 0 && (
                  <div>
                    <button
                      onClick={() => toggleExpand(step.stage)}
                      className="w-full flex items-center justify-between py-1.5 px-2 rounded bg-slate-50 text-[10px] font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
                    >
                      <span className="flex items-center gap-1">
                        <FileCode className="w-3 h-3 text-slate-400" />
                        <span>Prototype Telemetry Payload</span>
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 p-2.5 rounded bg-slate-900 text-slate-200 text-[10px] font-mono space-y-1.5 shadow-inner">
                        {step.payloadEntries.map((entry, eIdx) => (
                          <div key={eIdx} className="border-b border-slate-800 pb-1 last:border-0 last:pb-0">
                            <span className="text-slate-400 block text-[9px] uppercase tracking-wider">
                              {entry.key}:
                            </span>
                            <span
                              className={`break-words ${
                                entry.type === "badge"
                                  ? "text-emerald-300 font-semibold"
                                  : entry.type === "code"
                                  ? "text-amber-300"
                                  : "text-slate-200"
                              }`}
                            >
                              {entry.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
