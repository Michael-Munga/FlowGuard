"use client";

import React, { useMemo, useState } from "react";
import {
  FileText,
  Download,
  FileSpreadsheet,
  FileType2,
  Calendar,
  Building2,
  AlertTriangle,
  Filter,
  CheckCircle2,
  History,
  RefreshCw,
  Package,
} from "lucide-react";
import {
  OmcProfile,
  OmcCollectionOrder,
  OmcKpiSummary,
  OmcNotification,
  OmcHourlyOutlook,
} from "@/types/flowguard";
import {
  buildOmcReport,
  defaultOmcFilters,
  OMC_REPORT_LABELS,
  OMC_FILTER_LABELS,
  OmcReportType,
  ReportFormat,
  OmcOrderStatusFilter,
  OmcRiskSeverityFilter,
  OmcProductFilter,
  OmcReportFilters,
  ReportSheet,
} from "./omcReportBuilders";
import { downloadOmcReport } from "./omcReportExports";

interface OmcReportsWorkspaceProps {
  profile: OmcProfile | null;
  orders: OmcCollectionOrder[];
  kpis: OmcKpiSummary | null;
  notifications: OmcNotification[];
  outlooks: OmcHourlyOutlook[];
}

interface RecentReport {
  id: number;
  label: string;
  format: ReportFormat;
  generatedAt: string;
  sheet: ReportSheet;
  filters: OmcReportFilters;
}

export const OmcReportsWorkspace: React.FC<OmcReportsWorkspaceProps> = ({
  profile,
  orders,
  kpis,
  notifications,
  outlooks,
}) => {
  const [filters, setFilters] = useState<OmcReportFilters>(defaultOmcFilters());
  const [recent, setRecent] = useState<RecentReport[]>([]);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const omcId = profile?.id ?? "omc";
  const data = { profile, orders, kpis, notifications, outlooks };
  const preview = useMemo(
    () => buildOmcReport(filters, data),
    [filters, profile, orders, kpis, notifications, outlooks]
  );

  const update = <K extends keyof OmcReportFilters>(
    k: K,
    v: OmcReportFilters[K]
  ) => setFilters((prev) => ({ ...prev, [k]: v }));

  const handleDownload = () => {
    setBusy(true);
    try {
      downloadOmcReport(preview, filters, omcId);
      const entry: RecentReport = {
        id: Date.now(),
        label: `${OMC_REPORT_LABELS[filters.reportType]} · ${
          filters.status === "ALL" ? "All orders" : filters.status
        }`,
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

  const handleRedownload = (r: RecentReport) =>
    downloadOmcReport(r.sheet, r.filters, omcId);

  const depotOptions = useMemo(() => {
    const map = new Map<string, string>();
    orders.forEach((o) => map.set(o.depotId, o.depotName));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [orders]);

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

          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8492A6] mb-1.5">
            Report Type
          </label>
          <select
            className="w-full px-3 py-2 text-xs border border-[#E2E6EA] rounded-md mb-4 focus:outline-none focus:border-[#1B7A3D] bg-white"
            value={filters.reportType}
            onChange={(e) => update("reportType", e.target.value as OmcReportType)}
          >
            {(Object.keys(OMC_REPORT_LABELS) as OmcReportType[]).map((k) => (
              <option key={k} value={k}>
                {OMC_REPORT_LABELS[k]}
              </option>
            ))}
          </select>

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

          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8492A6] mb-1.5">
            Order Status
          </label>
          <select
            className="w-full px-3 py-2 text-xs border border-[#E2E6EA] rounded-md mb-4 focus:outline-none focus:border-[#1B7A3D] bg-white"
            value={filters.status}
            onChange={(e) =>
              update("status", e.target.value as OmcOrderStatusFilter)
            }
          >
            {(Object.keys(OMC_FILTER_LABELS.status) as OmcOrderStatusFilter[]).map(
              (k) => (
                <option key={k} value={k}>
                  {OMC_FILTER_LABELS.status[k]}
                </option>
              )
            )}
          </select>

          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8492A6] mb-1.5">
            <Building2 className="w-3 h-3 inline mr-1" />
            Depot
          </label>
          <select
            className="w-full px-3 py-2 text-xs border border-[#E2E6EA] rounded-md mb-4 focus:outline-none focus:border-[#1B7A3D] bg-white"
            value={filters.depotId}
            onChange={(e) => update("depotId", e.target.value)}
          >
            <option value="ALL">All depots</option>
            {depotOptions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8492A6] mb-1.5">
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            Risk Severity
          </label>
          <select
            className="w-full px-3 py-2 text-xs border border-[#E2E6EA] rounded-md mb-4 focus:outline-none focus:border-[#1B7A3D] bg-white"
            value={filters.riskSeverity}
            onChange={(e) =>
              update("riskSeverity", e.target.value as OmcRiskSeverityFilter)
            }
          >
            {(Object.keys(
              OMC_FILTER_LABELS.riskSeverity
            ) as OmcRiskSeverityFilter[]).map((k) => (
              <option key={k} value={k}>
                {OMC_FILTER_LABELS.riskSeverity[k]}
              </option>
            ))}
          </select>

          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8492A6] mb-1.5">
            <Package className="w-3 h-3 inline mr-1" />
            Product
          </label>
          <select
            className="w-full px-3 py-2 text-xs border border-[#E2E6EA] rounded-md mb-5 focus:outline-none focus:border-[#1B7A3D] bg-white"
            value={filters.product}
            onChange={(e) => update("product", e.target.value as OmcProductFilter)}
          >
            {(Object.keys(OMC_FILTER_LABELS.product) as OmcProductFilter[]).map(
              (k) => (
                <option key={k} value={k}>
                  {OMC_FILTER_LABELS.product[k]}
                </option>
              )
            )}
          </select>

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

        {/* Recent */}
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
                    <div className="font-semibold text-[#0F1B2B] truncate">
                      {r.label}
                    </div>
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

      {/* Preview */}
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

          <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-[#F8FAFC] border-b border-[#E2E6EA] z-10">                <tr>
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
                {preview.rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={preview.columns.length}
                      className="py-8 text-center text-xs text-slate-400"
                    >
                      No rows match the current filters.
                    </td>
                  </tr>
                ) : (
                  preview.rows.map((r, idx) => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          {preview.narrative && (
            <div className="px-5 py-4 border-t border-[#EDF1F5] bg-emerald-50/40">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#1B7A3D] mb-1">
                Notes
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