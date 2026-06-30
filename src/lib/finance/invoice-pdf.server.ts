import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type InvoicePdfInput = {
  invoice_number: string;
  issued_at: string | null;
  due_date: string | null;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  amount_paid: number;
  status: string;
  notes?: string | null;
  line_items: Array<{ description: string; quantity: number; unit_price: number }>;
  client?: { name?: string | null; email?: string | null } | null;
};

export async function renderInvoicePdf(inv: InvoicePdfInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]); // A4 portrait
  const { width, height } = page.getSize();

  const navy = rgb(0.043, 0.106, 0.227);
  const electric = rgb(0.0, 0.443, 0.965);
  const ink = rgb(0.07, 0.09, 0.16);
  const muted = rgb(0.45, 0.5, 0.58);
  const light = rgb(0.93, 0.96, 1);

  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvB = await pdf.embedFont(StandardFonts.HelveticaBold);

  // Header band
  page.drawRectangle({ x: 0, y: height - 90, width, height: 90, color: navy });
  page.drawText("NAJEEB DIGITAL HUB", {
    x: 40, y: height - 45, size: 16, font: helvB, color: rgb(1, 1, 1),
  });
  page.drawText("Sokoto, Nigeria  •  hello@ndh.com.ng", {
    x: 40, y: height - 64, size: 9, font: helv, color: rgb(0.78, 0.86, 1),
  });
  page.drawText("INVOICE", {
    x: width - 130, y: height - 50, size: 22, font: helvB, color: rgb(1, 1, 1),
  });

  // Invoice meta
  let y = height - 120;
  page.drawText(`Invoice #: ${inv.invoice_number}`, { x: 40, y, size: 11, font: helvB, color: ink });
  page.drawText(`Status: ${inv.status.toUpperCase()}`, { x: width - 200, y, size: 11, font: helvB, color: electric });
  y -= 16;
  if (inv.issued_at) page.drawText(`Issued: ${inv.issued_at.slice(0, 10)}`, { x: 40, y, size: 10, font: helv, color: muted });
  if (inv.due_date) page.drawText(`Due: ${inv.due_date.slice(0, 10)}`, { x: width - 200, y, size: 10, font: helv, color: muted });

  // Bill to
  y -= 30;
  page.drawText("Bill To", { x: 40, y, size: 9, font: helvB, color: muted });
  y -= 14;
  page.drawText(inv.client?.name || "Client", { x: 40, y, size: 11, font: helvB, color: ink });
  if (inv.client?.email) {
    y -= 13;
    page.drawText(inv.client.email, { x: 40, y, size: 10, font: helv, color: muted });
  }

  // Items table
  y -= 36;
  page.drawRectangle({ x: 40, y: y - 4, width: width - 80, height: 22, color: light });
  page.drawText("DESCRIPTION", { x: 50, y: y + 4, size: 9, font: helvB, color: navy });
  page.drawText("QTY", { x: 360, y: y + 4, size: 9, font: helvB, color: navy });
  page.drawText("UNIT", { x: 410, y: y + 4, size: 9, font: helvB, color: navy });
  page.drawText("AMOUNT", { x: width - 110, y: y + 4, size: 9, font: helvB, color: navy });
  y -= 22;

  for (const li of inv.line_items) {
    const amt = (Number(li.quantity) || 0) * (Number(li.unit_price) || 0);
    page.drawText(String(li.description).slice(0, 60), { x: 50, y, size: 10, font: helv, color: ink });
    page.drawText(String(li.quantity), { x: 360, y, size: 10, font: helv, color: ink });
    page.drawText(`${inv.currency} ${Number(li.unit_price).toLocaleString()}`, { x: 410, y, size: 10, font: helv, color: ink });
    page.drawText(`${inv.currency} ${amt.toLocaleString()}`, { x: width - 110, y, size: 10, font: helv, color: ink });
    y -= 18;
    if (y < 200) break;
  }

  // Totals
  y -= 16;
  const totalsX = width - 220;
  page.drawLine({ start: { x: totalsX, y: y + 10 }, end: { x: width - 40, y: y + 10 }, color: muted, thickness: 0.5 });
  page.drawText("Subtotal", { x: totalsX, y, size: 10, font: helv, color: muted });
  page.drawText(`${inv.currency} ${Number(inv.subtotal).toLocaleString()}`, { x: width - 110, y, size: 10, font: helv, color: ink });
  y -= 16;
  page.drawText("Tax", { x: totalsX, y, size: 10, font: helv, color: muted });
  page.drawText(`${inv.currency} ${Number(inv.tax).toLocaleString()}`, { x: width - 110, y, size: 10, font: helv, color: ink });
  y -= 20;
  page.drawText("TOTAL", { x: totalsX, y, size: 12, font: helvB, color: navy });
  page.drawText(`${inv.currency} ${Number(inv.total).toLocaleString()}`, { x: width - 110, y, size: 12, font: helvB, color: navy });
  if (Number(inv.amount_paid) > 0) {
    y -= 16;
    page.drawText("Paid", { x: totalsX, y, size: 10, font: helv, color: muted });
    page.drawText(`${inv.currency} ${Number(inv.amount_paid).toLocaleString()}`, { x: width - 110, y, size: 10, font: helv, color: ink });
  }

  if (inv.notes) {
    page.drawText("Notes", { x: 40, y: 90, size: 9, font: helvB, color: muted });
    page.drawText(String(inv.notes).slice(0, 200), { x: 40, y: 76, size: 9, font: helv, color: ink });
  }
  page.drawText("Thank you for doing business with NDH.", {
    x: 40, y: 40, size: 9, font: helv, color: muted,
  });

  return await pdf.save();
}