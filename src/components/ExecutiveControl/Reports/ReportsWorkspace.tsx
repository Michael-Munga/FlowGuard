"use client";

import React, { useMemo, useState } from "react";
import {
  FileText,
  Download,
  FileSpreadsheet,
  FileType2,
  Calendar,
  Building2,
  Layers,
  AlertTriangle,
  Gauge,
  Filter,
  CheckCircle2,
  History,
  RefreshCw,
} from "lucide-react";
import {
  ExecutiveKpiSummary,
  ExecutiveRiskSummary,
  ExecutiveTrustHealth,
  DepotExecutivePerformance,
  ExecutiveTimePeriod,
} from "@/types/flowguard";
import {
  buildReport,
  defaultFilters,
  REPORT_LABELS,
  FILTER_LABELS,
  ReportType,
  ReportFormat,
  DemurrageRiskBand,
  AccuracyBand,
  InterventionStatusBand,
  ReportFilters,
  ReportSheet,
} from "./reportBuilders";
import { downloadReport } from "./reportExports";

interface ReportsWorkspaceProps {
  kpis: ExecutiveKpiSummary | null;
  depots: DepotExecutivePerformance[];
  riskSummary: ExecutiveRiskSummary | null;
  trustHealth: ExecutiveTrustHealth | null;
  timePeriod: ExecutiveTimePeriod;
}

interface RecentReport {
  id: number;
  label: string;
  format: ReportFormat;
  generatedAt: string;
  sheet: ReportSheet;
  filters: ReportFilters;
}

export const ReportsWorkspace: React.FC<ReportsWorkspaceProps> = ({
  kpis,
  depots,
  riskSummary,
  trustHealth,
  timePeriod,
}) => {
  const [filters, setFilters] = useState<ReportFilters>(defaultFilters());
  const [recent, setRecent] = useState<RecentReport[]>([]);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const data = { kpis, depots, riskSummary, trustHealth, timePeriod };
  const preview = useMemo(() => buildReport(filters, data), [filters, kpis, depots, riskSummary, trustHealth, timePeriod]);

  const update = <K extends keyof ReportFilters>(k: K, v: ReportFilters[K]) =>
    setFilters((prev) => ({ ...prev, [k]: v }));

  const handleDownload = () => {
    setBusy(true);
    try {
      downloadReport(preview, filters);
      const entry: RecentReport = {
        id: Date.now(),
        label: `${REPORT_LABELS[filters.reportType]} · ${filters.depotId === "ALL" ? "Network" : filters.depotId}`,
        format: filters.format,
        generatedAt: new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        sheet: preview,
        filters,
      };
      setRecent((prev) => [entry, ...prev].slice(0, 8));
      setToast(`${filters.format} generated — ${preview.rows.length} rows`);
      setTimeout(() => setToast(null), 3000);
    } finally {
      setBusy(false);
    }
  };

  const handleRedownload = (r: RecentReport) => downloadReport(r.sheet, r.filters);

  const depotOptions =
    filters.depotId === "ALL"
      ? []
      : depots.find((d) => d.depotId === filters.depotId)?.code
      ? ["P01", "P02", "P03", "P04", "P05", "P06", "P07", "P08"]
      : ["P01", "P02", "P03", "P04", "P05", "P06", "P07", "P08"];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
      {/* Config panel */}
      <div className="xl:col-span-4 space-y-4">
        <div className="bg-white rounded-lg border border-[#E2E6EA] p-5">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#EDF1F5]">
            <Filter className="w-4 h-4 text-[#1B7A3D]" />
            <h3 className="text-sm font-bold text-[#0F1B2B] uppercase tracking-wide">
              Report Configuration
            </h3>
          </div>

          {/* Report type */}
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8492A6] mb-1.5">
            Report Type
          </label>
          <select
            className="w-full px-3 py-2 text-xs border border-[#E2E6EA] rounded-md mb-4 focus:outline-none focus:border-[#1B7A3D] bg-white"
            value={filters.reportType}
            onChange={(e) => update("reportType", e.target.value as ReportType)}
          >
            {(Object.keys(REPORT_LABELS) as ReportType[]).map((k) => (
              <option key={k} value={k}>
                {REPORT_LABELS[k]}
              </option>
            ))}
          </select>

          {/* Date range */}
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8492A6] mb-1.5">
            <Calendar className="w-3 h-3 inline mr-1" />
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <input
              type="date"
              className="px-3 py-2 text-xs border border-[#E2E6EA] rounded-md focus:outline-none focus:border-[#1B7A3D]"
              value={filters.dateFrom}
              onChange={(e) => update("dateFrom", e.target.value)}
            />
            <input
              type="date"
              className="px-3 py-2 text-xs border border-[#E2E6EA] rounded-md focus:outline-none focus:border-[#1B7A3D]"
              value={filters.dateTo}
              onChange={(e) => update("dateTo", e.target.value)}
            />
          </div>

          {/* Depot */}
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8492A6] mb-1.5">
            <Building2 className="w-3 h-3 inline mr-1" />
            Depot
          </label>
          <select
            className="w-full px-3 py-2 text-xs border border-[#E2E6EA] rounded-md mb-4 focus:outline-none focus:border-[#1B7A3D] bg-white"
            value={filters.depotId}
            onChange={(e) => {
              update("depotId", e.target.value);
              update("bayCode", "ALL");
            }}
          >
            <option value="ALL">All depots (network)</option>
            {depots.map((d) => (
              <option key={d.depotId} value={d.depotId}>
                {d.depotName} ({d.code})
              </option>
            ))}
          </select>

          {/* Bay */}
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8492A6] mb-1.5">
            <Layers className="w-3 h-3 inline mr-1" />
            Bay
          </label>
          <select
            className="w-full px-3 py-2 text-xs border border-[#E2E6EA] rounded-md mb-4 focus:outline-none focus:border-[#1B7A3D] bg-white"
            value={filters.bayCode}
            onChange={(e) => update("bayCode", e.target.value)}
          >
            <option value="ALL">All bays</option>
            {depotOptions.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>

          {/* Risk band */}
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8492A6] mb-1.5">
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            Demurrage Risk Band
          </label>
          <select
            className="w-full px-3 py-2 text-xs border border-[#E2E6EA] rounded-md mb-4 focus:outline-none focus:border-[#1B7A3D] bg-white"
            value={filters.demurrageBand}
            onChange={(e) => update("demurrageBand", e.target.value as DemurrageRiskBand)}
          >
            {(Object.keys(FILTER_LABELS.demurrageBand) as DemurrageRiskBand[]).map((k) => (
              <option key={k} value={k}>
                {FILTER_LABELS.demurrageBand[k]}
              </option>
            ))}
          </select>

          {/* Accuracy band */}
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8492A6] mb-1.5">
            <Gauge className="w-3 h-3 inline mr-1" />
            Prediction Accuracy Band
          </label>
          <select
            className="w-full px-3 py-2 text-xs border border-[#E2E6EA] rounded-md mb-4 focus:outline-none focus:border-[#1B7A3D] bg-white"
            value={filters.accuracyBand}
            onChange={(e) => update("accuracyBand", e.target.value as AccuracyBand)}
          >
            {(Object.keys(FILTER_LABELS.accuracyBand) as AccuracyBand[]).map((k) => (
              <option key={k} value={k}>
                {FILTER_LABELS.accuracyBand[k]}
              </option>
            ))}
          </select>

          {/* Intervention status */}
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8492A6] mb-1.5">
            Intervention Status
          </label>
          <select
            className="w-full px-3 py-2 text-xs border border-[#E2E6EA] rounded-md mb-5 focus:outline-none focus:border-[#1B7A3D] bg-white"
            value={filters.interventionStatus}
            onChange={(e) =>
              update("interventionStatus", e.target.value as InterventionStatusBand)
            }
          >
            {(Object.keys(FILTER_LABELS.interventionStatus) as InterventionStatusBand[]).map(
              (k) => (
                <option key={k} value={k}>
                  {FILTER_LABELS.interventionStatus[k]}
                </option>
              )
            )}
          </select>

          {/* Format */}
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8492A6] mb-1.5">
            Export Format
          </label>
          <div className="grid grid-cols-3 gap-2 mb-5">
            {(["PDF", "CSV", "XLSX"] as ReportFormat[]).map((f) => {
              const active = filters.format === f;
              const Icon =
                f === "PDF" ? FileType2 : f === "CSV" ? FileText : FileSpreadsheet;
              return (
                <button
                  key={f}
                  onClick={() => update("format", f)}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-bold border transition-all ${
                    active
                      ? "bg-[#0F1B2B] text-white border-[#0F1B2B]"
                      : "bg-white text-[#5C6B7A] border-[#E2E6EA] hover:border-[#1B7A3D]/40"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {f}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleDownload}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md bg-[#1B7A3D] text-white font-bold text-sm hover:bg-[#146030] transition-all shadow-sm disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            {busy ? "Generating…" : `Download ${filters.format}`}
          </button>

          {toast && (
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {toast}
            </div>
          )}
        </div>

        {/* Recent reports */}
        <div className="bg-white rounded-lg border border-[#E2E6EA] p-5">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-[#EDF1F5]">
            <History className="w-4 h-4 text-[#1B7A3D]" />
            <h3 className="text-sm font-bold text-[#0F1B2B] uppercase tracking-wide">
              Recent Reports
            </h3>
          </div>
          {recent.length === 0 ? (
            <p className="text-xs text-[#8492A6] italic">
              Generated reports will appear here for re-download.
            </p>
          ) : (
            <div className="space-y-2">
              {recent.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-md bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-[#0F1B2B] truncate">{r.label}</div>
                    <div className="text-[10px] font-mono text-[#8492A6]">
                      {r.format} · {r.generatedAt}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRedownload(r)}
                    className="p-1.5 rounded hover:bg-white text-[#5C6B7A] hover:text-[#1B7A3D] transition-colors"
                    title="Re-download"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview panel */}
      <div className="xl:col-span-8">
        <div className="bg-white rounded-lg border border-[#E2E6EA]">
          <div className="px-5 py-4 border-b border-[#EDF1F5] flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#0F1B2B]">{preview.title}</h3>
              <p className="text-[11px] text-[#8492A6] mt-0.5">
                Live preview · {preview.rows.length} rows · {filters.format} export
              </p>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
              Preview
            </span>
          </div>

          {/* Meta parameters */}
          <div className="px-5 py-3 bg-slate-50 border-b border-[#EDF1F5]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
              {preview.meta.map((m) => (
                <div key={m.key} className="flex flex-col">
                  <span className="text-[9px] uppercase font-mono text-[#8492A6]">
                    {m.key}
                  </span>
                  <span className="font-semibold text-[#0F1B2B] truncate">
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Data table */}
          <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-[#F8FAFC] border-b border-[#E2E6EA] z-10">
                <tr>
                  {preview.columns.map((c) => (
                    <th
                      key={c}
                      className="py-2.5 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {preview.rows.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    {r.map((cell, ci) => (
                      <td
                        key={ci}
                        className="py-2.5 px-4 text-slate-700 font-mono text-[11px] align-top"
                      >
                        {String(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {preview.narrative && (
            <div className="px-5 py-4 border-t border-[#EDF1F5] bg-emerald-50/40">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#1B7A3D] mb-1">
                Executive Narrative
              </div>
              <p className="text-xs text-[#0F1B2B] leading-relaxed">
                {preview.narrative}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};