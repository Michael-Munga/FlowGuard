import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { ReportSheet, ReportFilters, buildFileName } from "./reportBuilders";

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

// ---------------------------------------------------------------------------
// PDF
// ---------------------------------------------------------------------------
export function exportPdf(sheet: ReportSheet, filters: ReportFilters) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;

  // Header band
  doc.setFillColor(GREEN_DARK);
  doc.rect(0, 0, pageWidth, 64, "F");
  doc.setTextColor("#FFFFFF");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(sheet.title, marginX, 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Generated ${fmtTimestamp()} · KPC FlowGuard Control Plane`, marginX, 48);

  // Meta table
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

  // Main data table
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

  // Narrative
  if (sheet.narrative) {
    const afterTable = (doc as any).lastAutoTable.finalY + 22;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Executive Narrative", marginX, afterTable);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const wrapped = doc.splitTextToSize(sheet.narrative, pageWidth - marginX * 2);
    doc.text(wrapped, marginX, afterTable + 14);
  }

  // Footer on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor("#718096");
    doc.text(
      `Kenya Pipeline Company · FlowGuard Executive Control Plane · Page ${i} of ${pageCount}`,
      marginX,
      doc.internal.pageSize.getHeight() - 20
    );
  }

  const fileName = buildFileName({ ...filters, format: "PDF" });
  doc.save(fileName);
}

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------
export function exportCsv(sheet: ReportSheet, filters: ReportFilters) {
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
    lines.push("# Executive Narrative");
    lines.push(esc(sheet.narrative));
  }

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  saveAs(blob, buildFileName({ ...filters, format: "CSV" }));
}

// ---------------------------------------------------------------------------
// XLSX
// ---------------------------------------------------------------------------
export function exportXlsx(sheet: ReportSheet, filters: ReportFilters) {
  const wb = XLSX.utils.book_new();

  // Meta sheet
  const metaAoa: (string | number)[][] = [
    [sheet.title],
    [`Generated ${fmtTimestamp()}`],
    [],
    ["Filter", "Value"],
    ...sheet.meta.map((m) => [m.key, m.value] as (string | number)[]),
  ];
  if (sheet.narrative) {
    metaAoa.push([], ["Executive Narrative"], [sheet.narrative]);
  }
  const wsMeta = XLSX.utils.aoa_to_sheet(metaAoa);
  wsMeta["!cols"] = [{ wch: 26 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, wsMeta, "Parameters");

  // Data sheet
  const dataAoa: (string | number)[][] = [
    sheet.columns,
    ...sheet.rows.map((r) => r.map((v) => (typeof v === "number" ? v : String(v)))),
  ];
  const wsData = XLSX.utils.aoa_to_sheet(dataAoa);
  wsData["!cols"] = sheet.columns.map(() => ({ wch: 22 }));
  XLSX.utils.book_append_sheet(wb, wsData, "Report Data");

  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, buildFileName({ ...filters, format: "XLSX" }));
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------
export function downloadReport(sheet: ReportSheet, filters: ReportFilters) {
  switch (filters.format) {
    case "CSV":
      exportCsv(sheet, filters);
      break;
    case "XLSX":
      exportXlsx(sheet, filters);
      break;
    case "PDF":
    default:
      exportPdf(sheet, filters);
      break;
  }
}