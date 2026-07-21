import { jsPDF } from "jspdf";

/**
 * Export plain text as a simple, readable PDF — used for the "Download as
 * PDF" feature from the original spec. Wraps long lines and paginates
 * automatically rather than clipping content that overflows one page.
 */
export function exportTextAsPdf(title: string, content: string): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 48;
  const marginTop = 64;
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxLineWidth = pageWidth - marginX * 2;
  const lineHeight = 16;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  const titleLines = doc.splitTextToSize(title, maxLineWidth);
  doc.text(titleLines, marginX, marginTop);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const bodyLines: string[] = doc.splitTextToSize(content, maxLineWidth);

  let y = marginTop + titleLines.length * lineHeight + lineHeight;
  for (const line of bodyLines) {
    if (y > pageHeight - marginTop) {
      doc.addPage();
      y = marginTop;
    }
    doc.text(line, marginX, y);
    y += lineHeight;
  }

  const filename = `${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 60) || "reply"}.pdf`;
  doc.save(filename);
}
