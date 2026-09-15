"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  HelpCircle,
  Eye,
  Info,
} from "lucide-react";
import { AutonomyPolicyRule } from "@/types/flowguard";

interface PolicyGovernancePanelProps {
  policyRules: AutonomyPolicyRule[];
  activeRuleCode?: string;
}

export const PolicyGovernancePanel: React.FC<PolicyGovernancePanelProps> = ({
  policyRules,
  activeRuleCode = "POL-042",
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const categories = ["ALL", "Capacity", "Equipment", "Gate", "Safety"];

  const filteredRules = policyRules.filter((rule) => {
    if (selectedCategory !== "ALL" && rule.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const getTierBadge = (level: AutonomyPolicyRule["autonomyLevel"]) => {
    if (level.includes("L1")) {
      return "bg-slate-100 text-slate-700 border-slate-200";
    }
    if (level.includes("L2")) {
      return "bg-emerald-50 text-[#1B7A3D] border-emerald-300 font-semibold";
    }
    return "bg-amber-50 text-amber-900 border-amber-300 font-bold";
  };

  return (
    <div className="bg-white rounded-lg border border-[#E2E6EA] shadow-xs overflow-hidden select-none space-y-0">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E2E6EA] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#1B7A3D]" />
            <h3 className="text-base font-bold text-[#0F1B2B] tracking-tight">
              FlowGuard Autonomy Policies &amp; Governance
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
              PROTOTYPE POLICY FRAMEWORK
            </span>
          </div>
          <p className="text-xs text-[#5C6B7A] mt-0.5">
            Deterministic operational boundaries, safety invariants, and authority tiers governing FlowGuard prototype actions.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#0B1420] text-white font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Autonomy Level Architecture Summary Cards (Section 16) */}
      <div className="p-6 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#F8FAFC] border-b border-[#E2E6EA]">
        {/* L1 */}
        <div className="p-3.5 rounded-lg border border-slate-200 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                L1 — ADVISORY
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                Informational
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 mb-1">
              Recommendation Only
            </h4>
            <p className="text-[11px] text-slate-600 leading-normal">
              Provides early risk warnings, arrival forecasts, and advisory notices. FlowGuard does not execute field actions without explicit operator initiation.
            </p>
          </div>
        </div>

        {/* L2 */}
        <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1B7A3D] font-mono">
                L2 — AUTO-EXECUTABLE
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                Bounded Autonomy
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 mb-1">
              Low-Risk Operational Actions
            </h4>
            <p className="text-[11px] text-slate-600 leading-normal">
              Permitted to autonomously re-sequence loading queues and enable dual-arm fast tracks within strict safety boundaries.
            </p>
          </div>
        </div>

        {/* L3 */}
        <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 font-mono">
                L3 — HUMAN APPROVAL
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">
                Sign-Off Required
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 mb-1">
              Higher-Risk Decisions
            </h4>
            <p className="text-[11px] text-slate-600 leading-normal">
              Physical bay diverts, meter recalibration holds, and product priority changes require explicit electronic approval by human controllers.
            </p>
          </div>
        </div>

        {/* Safe Handover */}
        <div className="p-3.5 rounded-lg border border-purple-200 bg-purple-50/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800 font-mono">
                SAFE HANDOVER
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-900">
                Graceful Fail-Safe
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 mb-1">
              Human Escalation
            </h4>
            <p className="text-[11px] text-slate-600 leading-normal">
              If no safe executable action exists or telemetry degrades unexpectedly, FlowGuard safely halts actuation and hands over control to human operations.
            </p>
          </div>
        </div>
      </div>

      {/* Section 17: Active Action Policy Decision Record */}
      <div className="px-6 py-3 bg-[#FAFBFC] border-b border-[#E2E6EA]">
        <div className="p-3 bg-white rounded-lg border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-[#1B7A3D] border border-emerald-300 uppercase">
              ACTIVE POLICY EVALUATION
            </span>
            <span className="font-bold text-slate-900">
              Rule {activeRuleCode}: High-Demand Dual-Arm Fast-Track Authorization
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-[11px] font-mono">
            <div>
              <span className="text-slate-400 block text-[9px] uppercase">Risk Level</span>
              <span className="font-bold text-[#1B7A3D]">LOW</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase">Action Class</span>
              <span className="font-bold text-slate-800">Operational Sequencing</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase">Authority</span>
              <span className="font-bold text-[#1B7A3D]">AUTO-EXECUTABLE (L2)</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase">Constraint Checks</span>
              <span className="font-bold text-[#1B7A3D]">PASSED (0 Violation)</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase">Approval Required</span>
              <span className="font-bold text-slate-800">NO</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase">Execution</span>
              <span className="font-bold text-[#1B7A3D]">AUTHORIZED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rules Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E2E6EA] text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <th className="py-3 px-4 w-24">FlowGuard Rule</th>
              <th className="py-3 px-4">Rule Name</th>
              <th className="py-3 px-4 text-center">Category</th>
              <th className="py-3 px-4 text-center">Autonomy Level</th>
              <th className="py-3 px-4">Prototype Autonomy Condition</th>
              <th className="py-3 px-4">Authorized Action</th>
              <th className="py-3 px-4 min-w-[200px]">Configured Safety Boundary</th>
              <th className="py-3 px-4 text-center w-20">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRules.map((rule) => {
              const isActive = rule.code === activeRuleCode;
              const tierBadgeStyle = getTierBadge(rule.autonomyLevel);

              return (
                <tr
                  key={rule.id}
                  className={`transition-colors ${
                    isActive ? "bg-emerald-50/60 font-medium" : "hover:bg-slate-50/70"
                  }`}
                >
                  {/* Code */}
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    <div className="flex items-center gap-1.5">
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1B7A3D]"></span>
                      )}
                      <span>{rule.code}</span>
                    </div>
                  </td>

                  {/* Name */}
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {rule.name}
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 text-center">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {rule.category}
                    </span>
                  </td>

                  {/* Tier */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded border ${tierBadgeStyle}`}
                    >
                      {rule.autonomyLevel.split(" - ")[0]}
                    </span>
                  </td>

                  {/* Condition */}
                  <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                    {rule.condition}
                  </td>

                  {/* Authorized Action */}
                  <td className="py-3 px-4 text-slate-700">
                    {rule.actionAuthorized}
                  </td>

                  {/* Safety Invariant */}
                  <td className="py-3 px-4 text-xs font-semibold text-rose-900 bg-rose-50/30">
                    {rule.safetyInvariant}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                      <CheckCircle2 className="w-3 h-3 text-[#1B7A3D]" />
                      <span>{rule.status}</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footnote Disclosing Prototype Policy Limits (Section 17) */}
      <div className="p-3.5 bg-[#F8FAFC] border-t border-[#E2E6EA] text-[10px] text-slate-500 leading-relaxed">
        <strong>Governance Disclosure:</strong> FlowGuard policy rules represent a demonstration prototype framework for bounded operational autonomy. They do not represent official KPC corporate governance or regulatory compliance mandates.
      </div>
    </div>
  );
};
