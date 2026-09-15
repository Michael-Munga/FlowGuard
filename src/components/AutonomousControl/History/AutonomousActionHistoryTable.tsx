"use client";

import React from "react";
import {
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Zap,
  ShieldAlert,
  FileText,
  Clock,
  ArrowRight,
} from "lucide-react";
import { AutonomyIncident } from "@/types/flowguard";

interface AutonomousActionHistoryTableProps {
  incidents: AutonomyIncident[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterStatus: string;
  onFilterStatusChange: (status: string) => void;
  filterDepot: string;
  onFilterDepotChange: (depot: string) => void;
  onSelectIncident: (incident: AutonomyIncident) => void;
  onOpenDrawer: (incident: AutonomyIncident) => void;
}

export const AutonomousActionHistoryTable: React.FC<AutonomousActionHistoryTableProps> = ({
  incidents,
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  filterDepot,
  onFilterDepotChange,
  onSelectIncident,
  onOpenDrawer,
}) => {
  const statusTabs = [
    { id: "ALL", label: "All Decisions" },
    { id: "VERIFIED", label: "Verified" },
    { id: "APPROVAL REQUIRED", label: "Approval Required" },
    { id: "BLOCKED / ESCALATED", label: "Blocked / Escalated" },
    { id: "FAILED", label: "Fault / Handover" },
  ];

  const depots = [
    { id: "ALL", label: "All Depots" },
    { id: "nairobi", label: "Nairobi (PS10)" },
    { id: "nakuru", label: "Nakuru (PS25)" },
    { id: "kisumu", label: "Kisumu (PS28)" },
    { id: "eldoret", label: "Eldoret (PS27)" },
    { id: "mombasa", label: "Mombasa (KOT)" },
  ];

  const getStatusBadge = (status: AutonomyIncident["status"]) => {
    switch (status) {
      case "VERIFIED":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "APPROVAL REQUIRED":
        return "bg-amber-100 text-amber-900 border-amber-300 font-bold";
      case "BLOCKED BY POLICY":
      case "BLOCKED / ESCALATED":
        return "bg-rose-100 text-rose-900 border-rose-300 font-bold";
      case "FAILED":
        return "bg-slate-100 text-slate-800 border-slate-300 font-medium";
      case "AUTO-EXECUTED":
        return "bg-blue-50 text-blue-800 border-blue-200";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[#E2E6EA] shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E2E6EA] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#0F1B2B] tracking-tight">
              Autonomous Decision History &amp; Audit Log
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase">
              TAMPER-EVIDENT AUDIT LOG
            </span>
          </div>
          <p className="text-xs text-[#5C6B7A] mt-0.5">
            Cryptographically integrity-checked (SHA-256) audit log of sensory triggers, model predictions, optimization evaluations, and closed-loop verifications
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search incident, policy, depot..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-emerald-600 transition-all"
          />
        </div>
      </div>

      {/* Filter Tabs & Depot Selector */}
      <div className="px-6 py-2.5 bg-[#F8FAFC] border-b border-[#E2E6EA] flex flex-wrap items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onFilterStatusChange(tab.id)}
              className={`px-3 py-1 rounded text-xs transition-all ${
                filterStatus === tab.id
                  ? "bg-[#0B1420] text-white font-semibold shadow-2xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Depot Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Depot:</span>
          <select
            value={filterDepot}
            onChange={(e) => onFilterDepotChange(e.target.value)}
            className="bg-white border border-slate-200 text-slate-800 rounded px-2.5 py-1 text-xs focus:outline-hidden focus:border-emerald-600"
          >
            {depots.map((dep) => (
              <option key={dep.id} value={dep.id}>
                {dep.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E2E6EA] text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <th className="py-3 px-4 w-20">Time</th>
              <th className="py-3 px-4 w-28">Incident ID</th>
              <th className="py-3 px-4">Depot</th>
              <th className="py-3 px-4 min-w-[240px]">Headline / Operational Action</th>
              <th className="py-3 px-4">Policy Rule</th>
              <th className="py-3 px-4 text-center">Tier</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Dwell Recovery</th>
              <th className="py-3 px-4 text-center w-28">Forensics</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {incidents.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500">
                  No autonomous decisions match the selected filters.
                </td>
              </tr>
            ) : (
              incidents.map((inc) => {
                const statusStyle = getStatusBadge(inc.status);

                return (
                  <tr
                    key={inc.id}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => onSelectIncident(inc)}
                  >
                    {/* Timestamp */}
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {inc.timestamp}
                    </td>

                    {/* Incident ID */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {inc.id}
                    </td>

                    {/* Depot */}
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {inc.depotName.split(" ")[0]}
                    </td>

                    {/* Headline */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900 group-hover:text-emerald-800 transition-colors">
                        {inc.headline}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-md">
                        {inc.predictedProblem}
                      </div>
                    </td>

                    {/* Policy */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                      {inc.appliedPolicy.code}
                    </td>

                    {/* Tier */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-600">
                      {inc.autonomyLevel}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border ${statusStyle}`}
                      >
                        {inc.status}
                      </span>
                    </td>

                    {/* Dwell Recovery */}
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      {inc.verification.verifiedReductionMin !== undefined ? (
                        <span className="text-emerald-700">
                          -{inc.verification.verifiedReductionMin}m
                        </span>
                      ) : (
                        <span className="text-slate-500">
                          -{inc.verification.targetReductionMin}m (est)
                        </span>
                      )}
                    </td>

                    {/* Inspect Button */}
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onOpenDrawer(inc)}
                        className="flex items-center gap-1 mx-auto px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-800 hover:text-white transition-all text-[11px] font-semibold"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
