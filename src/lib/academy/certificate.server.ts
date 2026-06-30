import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";

export type CertificatePdfInput = {
  studentName: string;
  programName: string;
  programType: string;
  certificateNumber: string;
  grade?: string | null;
  issueDate: Date;
  verifyUrl: string;
};

/** Render an NDH certificate as a landscape A4 PDF. Returns raw bytes. */
export async function renderCertificatePdf(input: CertificatePdfInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  // A4 landscape: 842 x 595 pt
  const page = pdf.addPage([842, 595]);
  const { width, height } = page.getSize();

  const navy = rgb(0.043, 0.106, 0.227); // deep navy
  const electric = rgb(0.0, 0.443, 0.965); // electric blue
  const teal = rgb(0.118, 0.741, 0.741);
  const ink = rgb(0.07, 0.09, 0.16);
  const muted = rgb(0.38, 0.42, 0.5);

  // Background
  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.984, 0.988, 1) });
  // Top accent
  page.drawRectangle({ x: 0, y: height - 14, width, height: 14, color: electric });
  // Bottom accent
  page.drawRectangle({ x: 0, y: 0, width, height: 14, color: teal });
  // Inner border
  page.drawRectangle({
    x: 28, y: 28, width: width - 56, height: height - 56,
    borderColor: navy, borderWidth: 1.2,
  });

  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvB = await pdf.embedFont(StandardFonts.HelveticaBold);
  const helvO = await pdf.embedFont(StandardFonts.HelveticaOblique);

  const centerText = (text: string, y: number, size: number, font = helv, color = ink) => {
    const w = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (width - w) / 2, y, size, font, color });
  };

  // Header brand
  centerText("NAJEEB DIGITAL HUB", height - 80, 14, helvB, navy);
  centerText("ACADEMY", height - 98, 9, helv, muted);

  // Title
  centerText("Certificate of Completion", height - 160, 32, helvB, navy);

  // Subtitle
  centerText("This is to certify that", height - 200, 12, helvO, muted);

  // Student name
  centerText(input.studentName.toUpperCase(), height - 250, 30, helvB, electric);

  // Line under name
  const nameWidth = Math.min(500, helvB.widthOfTextAtSize(input.studentName.toUpperCase(), 30));
  page.drawLine({
    start: { x: (width - nameWidth) / 2 - 20, y: height - 260 },
    end: { x: (width + nameWidth) / 2 + 20, y: height - 260 },
    thickness: 0.8, color: muted,
  });

  // Citation
  centerText("has successfully completed the program", height - 290, 12, helv, ink);
  centerText(input.programName, height - 320, 20, helvB, navy);
  centerText(`${input.programType}${input.grade ? ` · Grade: ${input.grade}` : ""}`, height - 342, 11, helv, muted);

  // QR code
  const qrPng = await QRCode.toBuffer(input.verifyUrl, {
    errorCorrectionLevel: "M", margin: 1, width: 180, color: { dark: "#0B1B3A", light: "#FFFFFF" },
  });
  const qrImage = await pdf.embedPng(qrPng);
  const qrSize = 90;
  page.drawImage(qrImage, { x: width - 28 - qrSize - 28, y: 70, width: qrSize, height: qrSize });
  page.drawText("Scan to verify", {
    x: width - 28 - qrSize - 28, y: 60, size: 8, font: helv, color: muted,
  });

  // Left meta
  page.drawText("Certificate No.", { x: 70, y: 140, size: 8, font: helv, color: muted });
  page.drawText(input.certificateNumber, { x: 70, y: 124, size: 11, font: helvB, color: ink });

  page.drawText("Issued", { x: 70, y: 100, size: 8, font: helv, color: muted });
  page.drawText(input.issueDate.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }),
    { x: 70, y: 84, size: 11, font: helvB, color: ink });

  // Signature line
  page.drawLine({
    start: { x: width / 2 - 90, y: 110 },
    end: { x: width / 2 + 90, y: 110 },
    thickness: 0.6, color: muted,
  });
  centerText("Registrar, NDH Academy", 92, 9, helv, muted);

  // Verify URL
  centerText(input.verifyUrl, 50, 8, helv, muted);

  return await pdf.save();
}