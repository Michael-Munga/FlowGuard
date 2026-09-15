"use client";

import React from "react";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Zap,
  Radio,
  FileCode,
  Clock,
  ArrowRight,
  TrendingDown,
  Database,
  Cpu,
  Layers,
  FileCheck,
} from "lucide-react";
import { AutonomyIncident } from "@/types/flowguard";

interface ForensicDecisionDrawerProps {
  incident: AutonomyIncident | null;
  isOpen: boolean;
  onClose: () => void;
  onAuthorizeAction?: (id: string) => void;
  onRejectAction?: (id: string, reason?: string) => void;
  isActionPending?: boolean;
}

export const ForensicDecisionDrawer: React.FC<ForensicDecisionDrawerProps> = ({
  incident,
  isOpen,
  onClose,
  onAuthorizeAction,
  onRejectAction,
  isActionPending = false,
}) => {
  if (!isOpen || !incident) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Slide-out Drawer Panel */}
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl z-10 flex flex-col overflow-hidden animate-slide-left border-l border-slate-200">
        {/* Header */}
        <div className="p-6 bg-[#0B1420] text-white flex-shrink-0">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                PROTOTYPE FORENSIC AUDIT RECORD
              </span>
              <span className="text-xs font-mono text-slate-400">
                {incident.id}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono text-slate-400">
                {incident.timestamp} EAT
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
            {incident.headline}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Depot: <strong>{incident.depotName}</strong> • Autonomy Tier:{" "}
            <strong>{incident.autonomyLevel}</strong>
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          {/* Status & Verification Hero Strip */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Current Control State
              </span>
              <span className="text-sm font-bold text-slate-900 font-mono">
                {incident.status}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Dwell Recovery
              </span>
              <span className="text-sm font-bold text-emerald-700 font-mono">
                {incident.verification.verifiedReductionMin !== undefined
                  ? `-${incident.verification.verifiedReductionMin} min verified`
                  : `-${incident.verification.targetReductionMin} min target`}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Exposure Protected
              </span>
              <span className="text-sm font-bold text-slate-900 font-mono">
                KES {incident.verification.exposureProtectedKes.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Interactive Approval Bar if Pending */}
          {incident.status === "APPROVAL REQUIRED" && onAuthorizeAction && onRejectAction && (
            <div className="p-4 rounded-lg bg-amber-50 border-2 border-amber-400 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-amber-950 text-xs">
                  Awaiting Supervisor Electronic Signature
                </h4>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Policy {incident.appliedPolicy.code} requires human confirmation before dispatching actuation to the operational actuation interface.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onAuthorizeAction(incident.id)}
                  disabled={isActionPending}
                  className="px-4 py-2 rounded-md bg-[#1B7A3D] text-white font-bold text-xs tracking-wide shadow-sm hover:bg-[#156331] transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>{isActionPending ? "AUTHORIZING..." : "AUTHORIZE NOW"}</span>
                </button>

                <button
                  onClick={() => onRejectAction(incident.id)}
                  disabled={isActionPending}
                  className="px-3 py-2 rounded-md bg-white border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-50 transition-all"
                >
                  Reject
                </button>
              </div>
            </div>
          )}

          {/* 1. Sensory Ingestion Snapshot */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-600" />
              <span>1. Prototype Telemetry Payload (Simulated Field Signal)</span>
            </h4>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <p className="text-slate-800 font-medium">{incident.telemetryTrigger}</p>
              <div className="pt-2 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
                {incident.causalFactors.map((c, i) => (
                  <div key={i} className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[9px] uppercase">
                      Factor {i + 1} ({c.impactScore}%)
                    </span>
                    <span className="text-slate-800 font-semibold truncate block">
                      {c.factor}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Predictive Modeling & Causal Weights */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-600" />
              <span>2. Optimization Evaluation &amp; Risk Horizon</span>
            </h4>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <p className="text-slate-800">{incident.predictedProblem}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono pt-1">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-400 block text-[9px] uppercase">Model Version</span>
                  <span className="font-bold text-slate-800 text-[10px]">FG-TURNAROUND-SYNTH-v1.4</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-400 block text-[9px] uppercase">Target Reduction</span>
                  <span className="font-bold text-emerald-700">
                    -{incident.verification.targetReductionMin} min
                  </span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-400 block text-[9px] uppercase">Demurrage Risk</span>
                  <span className="font-bold text-rose-700">
                    KES {incident.verification.exposureProtectedKes.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Applied Policy Rule & Guardrails */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>3. FlowGuard Prototype Policy Rule &amp; Safety Boundary</span>
            </h4>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900 text-xs">
                  {incident.appliedPolicy.code}: {incident.appliedPolicy.name}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  EVALUATED
                </span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div>
                  <strong className="text-slate-600">Condition:</strong>{" "}
                  <span className="font-mono text-slate-800">{incident.appliedPolicy.condition}</span>
                </div>
                <div>
                  <strong className="text-slate-600">Authorized Action:</strong>{" "}
                  <span className="text-slate-800">{incident.appliedPolicy.actionAuthorized}</span>
                </div>
                <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-900">
                  <strong className="text-rose-950">Safety Boundary / Limit:</strong>{" "}
                  {incident.appliedPolicy.safetyInvariant}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Actuation Command Telemetry Payload */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-slate-600" />
              <span>4. Prototype Actuation Payload (Operational Actuation Interface)</span>
            </h4>
            <div className="p-3.5 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] space-y-2 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Target Controller:</span>
                <span className="text-emerald-400 font-bold">{incident.actuationDetails.dispatchTarget}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Command Type:</span>
                <span className="text-amber-300">{incident.actuationDetails.commandType}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Target Device:</span>
                <span className="text-slate-300">{incident.actuationDetails.targetDevice}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Affected Orders:</span>
                <span className="text-slate-300">{incident.actuationDetails.affectedOrders.join(", ")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Ack Latency:</span>
                <span className="text-emerald-400">{incident.actuationDetails.ackLatencyMs} ms</span>
              </div>
            </div>
          </div>

          {/* 5. Closed-Loop Verification Telemetry */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>5. Closed-Loop Verification Telemetry</span>
            </h4>
            <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200 space-y-2 text-[11px]">
              <p className="text-emerald-950 font-medium">
                Method: {incident.verification.verificationMethod}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono pt-1">
                <div className="bg-white p-2 rounded border border-emerald-200">
                  <span className="text-slate-500 block text-[9px] uppercase">Measured Recovery</span>
                  <span className="text-emerald-700 font-bold text-sm">
                    {incident.verification.verifiedReductionMin !== undefined
                      ? `-${incident.verification.verifiedReductionMin} min`
                      : "Pending Field Completion"}
                  </span>
                </div>
                <div className="bg-white p-2 rounded border border-emerald-200">
                  <span className="text-slate-500 block text-[9px] uppercase">Recovery Attainment</span>
                  <span className="text-emerald-700 font-bold text-sm">
                    {incident.verification.recoveryAttainmentPct
                      ? `${incident.verification.recoveryAttainmentPct}%`
                      : incident.verification.accuracyPct
                      ? `${incident.verification.accuracyPct}%`
                      : "Pending"}
                  </span>
                </div>
                <div className="bg-white p-2 rounded border border-emerald-200 col-span-2 sm:col-span-1">
                  <span className="text-slate-500 block text-[9px] uppercase">Realized Demurrage Savings</span>
                  <span className="text-emerald-700 font-bold text-sm">
                    KES {(incident.verification.realizedSavingsKes || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Cryptographic Audit Block Signature */}
          <div className="p-3.5 rounded-lg bg-slate-100 border border-slate-200 space-y-1.5 text-[11px] font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500">
                Immutable Audit Digest
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-bold">
                SHA-256
              </span>
            </div>
            <div className="p-2 rounded bg-white border border-slate-300 text-[10px] break-all text-slate-800 font-bold">
              {incident.auditHash}
            </div>
            <p className="text-[10px] text-slate-500 font-sans mt-1">
              Tamper-evident audit record. Cryptographically integrity-checked (SHA-256 digest) for operational accountability and closed-loop verification.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
          <span>Incident: <strong>{incident.id}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-[#0B1420] text-white font-medium text-xs hover:bg-slate-800 transition-colors"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
