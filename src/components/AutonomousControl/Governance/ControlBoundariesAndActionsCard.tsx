"use client";

import React from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Zap,
  Clock,
  Radio,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sliders,
  FileCode,
} from "lucide-react";

interface ActiveInterventionItem {
  actionId: string;
  decisionId: string;
  depotName: string;
  actionName: string;
  controlState: string;
  expectedOutcome: string;
  currentOutcome: string;
  verificationStatus: string;
  age: string;
}

const ACTIVE_INTERVENTIONS: ActiveInterventionItem[] = [
  {
    actionId: "ACT-8801-01",
    decisionId: "DEC-0142",
    depotName: "Nairobi Terminal",
    actionName: "Dual-Arm Fast Track & Queue Re-sequence",
    controlState: "AUTO-EXECUTED",
    expectedOutcome: "-38 min",
    currentOutcome: "-34 min",
    verificationStatus: "VERIFIED",
    age: "45 min ago",
  },
  {
    actionId: "ACT-8802-01",
    decisionId: "DEC-0139",
    depotName: "Nakuru Depot",
    actionName: "Loading Bay Divert (Bay P02 -> Bay P01)",
    controlState: "APPROVAL REQUIRED",
    expectedOutcome: "-22 min",
    currentOutcome: "Awaiting Signature",
    verificationStatus: "IN PROGRESS",
    age: "12 min ago",
  },
  {
    actionId: "ACT-8803-01",
    decisionId: "DEC-0138",
    depotName: "Mombasa Terminal",
    actionName: "Staging Area Reallocation & Deadlock Hold",
    controlState: "ESCALATED",
    expectedOutcome: "-18 min",
    currentOutcome: "Handed to Controller",
    verificationStatus: "SAFE HANDOVER",
    age: "24 min ago",
  },
];

export const ControlBoundariesAndActionsCard: React.FC = () => {
  return (
    <div className="space-y-4 select-none">
      {/* 1. Control Boundaries Card (Section 36) */}
      <div className="bg-white rounded-lg border border-[#E2E6EA] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#1B7A3D]" />
            <h3 className="font-bold text-sm text-[#0F1B2B] uppercase tracking-wide">
              FlowGuard Operational Control Boundaries
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500 font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
            BOUNDED AUTONOMY CHARTER
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* What FlowGuard Can Do */}
          <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/30 space-y-2">
            <span className="text-[11px] font-bold text-[#1B7A3D] uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="w-4 h-4" />
              FLOWGUARD CAN
            </span>
            <ul className="space-y-1.5 text-slate-700 text-[11px] pl-1">
              <li className="flex items-start gap-1.5">
                <span className="text-[#1B7A3D] font-bold">✓</span>
                <span>Predict turnaround delays and queue buildups ahead of physical gantry arrival</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#1B7A3D] font-bold">✓</span>
                <span>Identify causal bottleneck factors across gates, scales, meters, and loading bays</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#1B7A3D] font-bold">✓</span>
                <span>Evaluate candidate actions and select optimal intervention using multi-objective optimization</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#1B7A3D] font-bold">✓</span>
                <span>Execute bounded digital actions within L2 policy limits (dual-arm coupling &amp; queue re-sequencing)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#1B7A3D] font-bold">✓</span>
                <span>Notify stakeholders (OMC dispatch desks, depot operators, and road tanker drivers)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#1B7A3D] font-bold">✓</span>
                <span>Verify operational recovery via closed-loop gross weighbridge departure telemetry</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#1B7A3D] font-bold">✓</span>
                <span>Record immutable, cryptographically integrity-checked audit logs for accountability</span>
              </li>
            </ul>
          </div>

          {/* What FlowGuard Does NOT Automatically Do */}
          <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/25 space-y-2">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <ShieldAlert className="w-4 h-4" />
              FLOWGUARD DOES NOT AUTOMATICALLY
            </span>
            <ul className="space-y-1.5 text-slate-700 text-[11px] pl-1">
              <li className="flex items-start gap-1.5">
                <span className="text-rose-600 font-bold">&times;</span>
                <span>Override human safety decisions, terminal emergency stops, or physical interlocks</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-600 font-bold">&times;</span>
                <span>Claim authority over uncontrolled third-party operations or uncertified hardware</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-600 font-bold">&times;</span>
                <span>Control downstream truck movement or last-mile transit after depot Gate-Out</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-600 font-bold">&times;</span>
                <span>Bypass configured policy constraints, KRA customs holds, or product safety invariants</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-600 font-bold">&times;</span>
                <span>Modify aviation fuel manifolds without physical laboratory chemist certification</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-600 font-bold">&times;</span>
                <span>Force autonomous execution when telemetry sources are stale, missing, or degraded</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 2. Active Interventions Table (Section 37) */}
      <div className="bg-white rounded-lg border border-[#E2E6EA] shadow-xs overflow-hidden">
        <div className="px-6 py-3.5 border-b border-[#E2E6EA] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#1B7A3D]" />
            <h4 className="font-bold text-xs text-[#0F1B2B] uppercase tracking-wide">
              Active Autonomous Interventions Table ({ACTIVE_INTERVENTIONS.length} System Actions)
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            NETWORK SURVEILLANCE
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E6EA] text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                <th className="py-2.5 px-4">Action ID</th>
                <th className="py-2.5 px-4">Decision</th>
                <th className="py-2.5 px-4">Depot</th>
                <th className="py-2.5 px-4">Action Summary</th>
                <th className="py-2.5 px-4 text-center">Control State</th>
                <th className="py-2.5 px-4 text-right">Expected Outcome</th>
                <th className="py-2.5 px-4 text-right">Current Outcome</th>
                <th className="py-2.5 px-4 text-center">Verification</th>
                <th className="py-2.5 px-4 text-right">Age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ACTIVE_INTERVENTIONS.map((item) => (
                <tr key={item.actionId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-800 text-[11px]">
                    {item.actionId}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-600 text-[11px]">
                    {item.decisionId}
                  </td>
                  <td className="py-2.5 px-4 font-medium text-slate-800">
                    {item.depotName.split(" ")[0]}
                  </td>
                  <td className="py-2.5 px-4 text-slate-700">
                    {item.actionName}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span
                      className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                        item.controlState === "AUTO-EXECUTED"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : item.controlState === "APPROVAL REQUIRED"
                          ? "bg-amber-50 text-amber-800 border-amber-200 font-bold"
                          : "bg-purple-50 text-purple-800 border-purple-200"
                      }`}
                    >
                      {item.controlState}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                    {item.expectedOutcome}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-[#1B7A3D]">
                    {item.currentOutcome}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span
                      className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                        item.verificationStatus === "VERIFIED"
                          ? "bg-emerald-100 text-[#1B7A3D]"
                          : item.verificationStatus === "IN PROGRESS"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {item.verificationStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-400 font-mono text-[10px]">
                    {item.age}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
