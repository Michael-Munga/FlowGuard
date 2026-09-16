// src/components/OmcVisibility/Reports/omcReportExports.ts

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  ReportSheet,
  OmcReportFilters,
  buildOmcFileName,
} from "./omcReportBuilders";

const GREEN_DARK = "#0B1420";
const GREEN = "#1B7A3D";

function fmtTimestamp(): string {
  return new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function exportOmcPdf(
  sheet: ReportSheet,
  filters: OmcReportFilters,
  omcId: string
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;

  doc.setFillColor(GREEN_DARK);
  doc.rect(0, 0, pageWidth, 64, "F");
  doc.setTextColor("#FFFFFF");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(sheet.title, marginX, 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    `Generated ${fmtTimestamp()} · KPC FlowGuard OMC Visibility`,
    marginX,
    48
  );

  let y = 84;
  doc.setTextColor("#0F1B2B");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Report Parameters", marginX, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [["Filter", "Value"]],
    body: sheet.meta.map((m) => [m.key, m.value]),
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: GREEN, textColor: "#FFFFFF", fontStyle: "bold" },
    margin: { left: marginX, right: marginX },
    theme: "grid",
  });

  const afterMeta = (doc as any).lastAutoTable.finalY + 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Report Data", marginX, afterMeta);

  autoTable(doc, {
    startY: afterMeta + 8,
    head: [sheet.columns],
    body: sheet.rows.map((r) => r.map((v) => String(v))),
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: GREEN, textColor: "#FFFFFF", fontStyle: "bold" },
    alternateRowStyles: { fillColor: "#F7FAFC" },
    margin: { left: marginX, right: marginX },
    theme: "grid",
  });

  if (sheet.narrative) {
    const afterTable = (doc as any).lastAutoTable.finalY + 22;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Notes", marginX, afterTable);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const wrapped = doc.splitTextToSize(sheet.narrative, pageWidth - marginX * 2);
    doc.text(wrapped, marginX, afterTable + 14);
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor("#718096");
    doc.text(
      `Kenya Pipeline Company · FlowGuard OMC Visibility · Page ${i} of ${pageCount}`,
      marginX,
      doc.internal.pageSize.getHeight() - 20
    );
  }

  doc.save(buildOmcFileName({ ...filters, format: "PDF" }, omcId));
}

export function exportOmcCsv(
  sheet: ReportSheet,
  filters: OmcReportFilters,
  omcId: string
) {
  const lines: string[] = [];
  const esc = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  lines.push(`# ${sheet.title}`);
  lines.push(`# Generated,${fmtTimestamp()}`);
  sheet.meta.forEach((m) => lines.push(`# ${m.key},${esc(m.value)}`));
  lines.push("");
  lines.push(sheet.columns.map(esc).join(","));
  sheet.rows.forEach((r) => lines.push(r.map(esc).join(",")));
  if (sheet.narrative) {
    lines.push("");
    lines.push("# Notes");
    lines.push(esc(sheet.narrative));
  }

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  saveAs(blob, buildOmcFileName({ ...filters, format: "CSV" }, omcId));
}

export function exportOmcXlsx(
  sheet: ReportSheet,
  filters: OmcReportFilters,
  omcId: string
) {
  const wb = XLSX.utils.book_new();

  const metaAoa: (string | number)[][] = [
    [sheet.title],
    [`Generated ${fmtTimestamp()}`],
    [],
    ["Filter", "Value"],
    ...sheet.meta.map((m) => [m.key, m.value] as (string | number)[]),
  ];
  if (sheet.narrative) metaAoa.push([], ["Notes"], [sheet.narrative]);
  const wsMeta = XLSX.utils.aoa_to_sheet(metaAoa);
  wsMeta["!cols"] = [{ wch: 26 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, wsMeta, "Parameters");

  const dataAoa: (string | number)[][] = [
    sheet.columns,
    ...sheet.rows.map((r) =>
      r.map((v) => (typeof v === "number" ? v : String(v)))
    ),
  ];
  const wsData = XLSX.utils.aoa_to_sheet(dataAoa);
  wsData["!cols"] = sheet.columns.map(() => ({ wch: 22 }));
  XLSX.utils.book_append_sheet(wb, wsData, "Report Data");

  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, buildOmcFileName({ ...filters, format: "XLSX" }, omcId));
}

export function downloadOmcReport(
  sheet: ReportSheet,
  filters: OmcReportFilters,
  omcId: string
) {
  switch (filters.format) {
    case "CSV":
      exportOmcCsv(sheet, filters, omcId);
      break;
    case "XLSX":
      exportOmcXlsx(sheet, filters, omcId);
      break;
    case "PDF":
    default:
      exportOmcPdf(sheet, filters, omcId);
      break;
  }
}