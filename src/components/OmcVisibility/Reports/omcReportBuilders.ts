// src/components/OmcVisibility/Reports/omcReportBuilders.ts
//
// Pure functions that turn OMC filters + order data into rows for CSV/PDF/XLSX.
// When a backend lands, swap the internals with fetches to
//   GET /api/v1/reports/omc/{omcId}?type=...&from=...&to=...

import {
  OmcCollectionOrder,
  OmcKpiSummary,
  OmcProfile,
  OmcNotification,
  OmcHourlyOutlook,
} from "@/types/flowguard";

export type OmcReportType =
  | "ORDER_STATUS"
  | "TURNAROUND_PERFORMANCE"
  | "DEMURRAGE_EXPOSURE"
  | "JOURNEY_AUDIT"
  | "NOTIFICATION_LOG";

export type ReportFormat = "PDF" | "CSV" | "XLSX";

export type OmcOrderStatusFilter =
  | "ALL"
  | "ON TRACK"
  | "DEVELOPING RISK"
  | "AT RISK"
  | "DELAYED"
  | "LOADING"
  | "READY FOR EXIT"
  | "COMPLETED";

export type OmcRiskSeverityFilter = "ALL" | "CRITICAL" | "ELEVATED" | "NOMINAL";

export type OmcProductFilter = "ALL" | "PMS" | "AGO" | "DPK" | "JET A-1";

export interface OmcReportFilters {
  reportType: OmcReportType;
  format: ReportFormat;
  dateFrom: string;
  dateTo: string;
  status: OmcOrderStatusFilter;
  depotId: string;
  riskSeverity: OmcRiskSeverityFilter;
  product: OmcProductFilter;
  includeCharts: boolean;
}

export interface OmcReportData {
  profile: OmcProfile | null;
  orders: OmcCollectionOrder[];
  kpis: OmcKpiSummary | null;
  notifications: OmcNotification[];
  outlooks: OmcHourlyOutlook[];
}

export const OMC_REPORT_LABELS: Record<OmcReportType, string> = {
  ORDER_STATUS: "Order Status Report",
  TURNAROUND_PERFORMANCE: "Turnaround Performance",
  DEMURRAGE_EXPOSURE: "Demurrage Exposure",
  JOURNEY_AUDIT: "Journey Audit",
  NOTIFICATION_LOG: "Notification Log",
};

export const OMC_FILTER_LABELS = {
  status: {
    ALL: "All statuses",
    "ON TRACK": "On track",
    "DEVELOPING RISK": "Developing risk",
    "AT RISK": "At risk",
    DELAYED: "Delayed",
    LOADING: "Loading",
    "READY FOR EXIT": "Ready for exit",
    COMPLETED: "Completed",
  } as Record<OmcOrderStatusFilter, string>,
  riskSeverity: {
    ALL: "All severities",
    CRITICAL: "Critical",
    ELEVATED: "Elevated",
    NOMINAL: "Nominal",
  } as Record<OmcRiskSeverityFilter, string>,
  product: {
    ALL: "All products",
    PMS: "PMS (Super Unleaded)",
    AGO: "AGO (Diesel)",
    DPK: "DPK (Kerosene)",
    "JET A-1": "JET A-1 (Aviation)",
  } as Record<OmcProductFilter, string>,
};

export const defaultOmcFilters = (): OmcReportFilters => ({
  reportType: "ORDER_STATUS",
  format: "PDF",
  dateFrom: "",
  dateTo: "",
  status: "ALL",
  depotId: "ALL",
  riskSeverity: "ALL",
  product: "ALL",
  includeCharts: true,
});

export interface ReportSheet {
  title: string;
  columns: string[];
  rows: (string | number)[][];
  meta: { key: string; value: string }[];
  narrative?: string;
}

const fmtKes = (n: number) =>
  `KES ${n.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const productKey = (p: string): OmcProductFilter => {
  const up = p.toUpperCase();
  if (up.startsWith("PMS")) return "PMS";
  if (up.startsWith("AGO")) return "AGO";
  if (up.startsWith("DPK")) return "DPK";
  if (up.startsWith("JET")) return "JET A-1";
  return "ALL";
};

function applyFilters(
  orders: OmcCollectionOrder[],
  filters: OmcReportFilters
): OmcCollectionOrder[] {
  return orders.filter((o) => {
    if (filters.status !== "ALL" && o.status !== filters.status) return false;
    if (filters.depotId !== "ALL" && o.depotId !== filters.depotId) return false;
    if (filters.riskSeverity !== "ALL" && o.riskSeverity !== filters.riskSeverity)
      return false;
    if (filters.product !== "ALL" && productKey(o.product) !== filters.product)
      return false;
    if (filters.dateFrom && o.orderPlacementTime) {
      const d = new Date(o.orderPlacementTime);
      if (!isNaN(d.getTime()) && d < new Date(filters.dateFrom)) return false;
    }
    if (filters.dateTo && o.orderPlacementTime) {
      const d = new Date(o.orderPlacementTime);
      if (!isNaN(d.getTime()) && d > new Date(filters.dateTo)) return false;
    }
    return true;
  });
}

export function buildOmcReport(
  filters: OmcReportFilters,
  data: OmcReportData
): ReportSheet {
  const omcName = data.profile?.name ?? "OMC";
  const filtered = applyFilters(data.orders, filters);

  const filterMeta = [
    { key: "Report Type", value: OMC_REPORT_LABELS[filters.reportType] },
    { key: "OMC", value: omcName },
    { key: "Date Range", value: `${filters.dateFrom || "earliest"} → ${filters.dateTo || "now"}` },
    { key: "Order Status", value: OMC_FILTER_LABELS.status[filters.status] },
    { key: "Depot", value: filters.depotId },
    { key: "Risk Severity", value: OMC_FILTER_LABELS.riskSeverity[filters.riskSeverity] },
    { key: "Product", value: OMC_FILTER_LABELS.product[filters.product] },
  ];

  switch (filters.reportType) {
    case "ORDER_STATUS": {
      return {
        title: `${omcName} — Order Status Report`,
        columns: [
          "Order #",
          "Truck",
          "Driver",
          "Depot",
          "Product",
          "Quantity (L)",
          "Current Stage",
          "Status",
          "Risk",
          "Predicted Gate-Out",
          "Turnaround (min)",
        ],
        rows: filtered.map((o) => [
          o.id,
          o.truckRegistration,
          o.driverName,
          o.depotName,
          o.product,
          o.quantityLitres,
          o.currentStageLabel,
          o.status,
          o.riskSeverity,
          o.predictedGateOut,
          o.predictedTurnaroundMin,
        ]),
        meta: filterMeta,
      };
    }

    case "TURNAROUND_PERFORMANCE": {
      const k = data.kpis;
      return {
        title: `${omcName} — Turnaround Performance`,
        columns: ["Metric", "Value"],
        rows: [
          ["Active orders", k?.activeOrdersCount ?? 0],
          ["Trucks currently in KPC process", k?.trucksInKpcProcess ?? 0],
          ["Orders at risk", k?.atRiskCount ?? 0],
          ["Predicted average turnaround (min)", k?.predictedAvgTurnaroundMin ?? 0],
          ["Baseline average turnaround (min)", k?.baselineAvgTurnaroundMin ?? 0],
          ["Turnaround delta (min)", k?.turnaroundDeltaMin ?? 0],
          ["Gate-outs completed today", k?.gateOutsCompletedToday ?? 0],
          ["Expected gate-outs remaining", k?.expectedGateOutsRemaining ?? 0],
          ["Expected gate-outs today (total)", k?.expectedGateOutsToday ?? 0],
          ["Exposure at risk", fmtKes(k?.exposureAtRiskKes ?? 0)],
          ["Exposure protected", fmtKes(k?.exposureProtectedKes ?? 0)],
          ["Realized savings", fmtKes(k?.realizedSavingsKes ?? 0)],
        ],
        meta: filterMeta,
        narrative:
          "Turnaround performance is measured gate-in to gate-out against the 90-minute KPC collection SLA envelope. FlowGuard reroutes and re-sequences orders autonomously to compress dwell time and protect against TSA demurrage penalties.",
      };
    }

    case "DEMURRAGE_EXPOSURE": {
      const k = data.kpis;
      const exposureRows: (string | number)[][] = filtered
        .filter((o) => o.exposure?.potentialKes)
        .map((o) => [
          o.id,
          o.truckRegistration,
          o.depotName,
          o.status,
          o.riskSeverity,
          fmtKes(o.exposure?.potentialKes ?? 0),
          fmtKes(o.exposure?.protectedKes ?? 0),
          fmtKes(o.exposure?.realizedKes ?? 0),
        ]);
      return {
        title: `${omcName} — Demurrage Exposure`,
        columns: [
          "Order #",
          "Truck",
          "Depot",
          "Status",
          "Risk",
          "Potential Exposure",
          "Protected",
          "Realized",
        ],
        rows: exposureRows.length
          ? exposureRows
          : [
              ["Aggregate exposure at risk", "", "", "", "", fmtKes(k?.exposureAtRiskKes ?? 0), "", ""],
              ["Aggregate exposure protected", "", "", "", "", "", fmtKes(k?.exposureProtectedKes ?? 0), ""],
              ["Aggregate realized savings", "", "", "", "", "", "", fmtKes(k?.realizedSavingsKes ?? 0)],
            ],
        meta: filterMeta,
      };
    }

    case "JOURNEY_AUDIT": {
      const rows: (string | number)[][] = [];
      filtered.forEach((o) => {
        o.journey.forEach((stage) => {
          rows.push([
            o.id,
            o.truckRegistration,
            stage.stageName,
            stage.status,
            stage.timestamp ?? "—",
            `${stage.actualOrPredictedDurationMin} min`,
            stage.note ?? "—",
          ]);
        });
      });
      return {
        title: `${omcName} — Journey Audit`,
        columns: [
          "Order #",
          "Truck",
          "Stage",
          "Status",
          "Timestamp",
          "Duration",
          "Note",
        ],
        rows,
        meta: filterMeta,
      };
    }

    case "NOTIFICATION_LOG":
    default: {
      return {
        title: `${omcName} — Notification Log`,
        columns: ["Timestamp", "Type", "Order", "Truck", "Title", "Severity", "Acknowledged"],
        rows: data.notifications.map((n) => [
          n.timestamp,
          n.type,
          n.orderId ?? "—",
          n.truckRegistration ?? "—",
          n.title,
          n.severity.toUpperCase(),
          n.isAcknowledged ? `Yes (${n.acknowledgedAt ?? "—"})` : "No",
        ]),
        meta: filterMeta,
      };
    }
  }
}

export function buildOmcFileName(
  filters: OmcReportFilters,
  omcId: string
): string {
  const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  const ext = filters.format.toLowerCase();
  return `KAFDO_OMC_${omcId}_${filters.reportType}_${ts}.${ext}`;
}