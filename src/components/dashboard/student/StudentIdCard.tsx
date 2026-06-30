import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function StudentIdCard(props: {
  studentName: string;
  studentNumber: string;
  programName: string;
  programType: string;
  avatarUrl: string | null;
  verifyUrl: string;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = 1012; // ~85.6mm * 12 px/mm
    const H = 638;  // ~53.98mm * 12 px/mm
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#0B1B3A");
    grad.addColorStop(1, "#0071F7");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Teal accent bar
    ctx.fillStyle = "#1ABDBD";
    ctx.fillRect(0, H - 28, W, 28);

    // Brand
    ctx.fillStyle = "#fff";
    ctx.font = "700 28px 'Helvetica', sans-serif";
    ctx.fillText("NAJEEB DIGITAL HUB", 56, 70);
    ctx.font = "500 16px 'Helvetica', sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText("ACADEMY · STUDENT ID", 56, 96);

    // Avatar circle
    const ax = 56, ay = 150, ar = 110;
    ctx.save();
    ctx.beginPath(); ctx.arc(ax + ar, ay + ar, ar, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
    ctx.fillStyle = "#152554"; ctx.fillRect(ax, ay, ar * 2, ar * 2);
    if (props.avatarUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.drawImage(img, ax, ay, ar * 2, ar * 2);
        ctx.restore();
        ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(ax + ar, ay + ar, ar, 0, Math.PI * 2); ctx.stroke();
      };
      img.src = props.avatarUrl;
    } else {
      ctx.fillStyle = "#fff"; ctx.font = "700 80px 'Helvetica', sans-serif"; ctx.textAlign = "center";
      ctx.fillText(props.studentName.charAt(0).toUpperCase(), ax + ar, ay + ar + 28);
      ctx.textAlign = "start";
      ctx.restore();
    }

    // Right text block
    const tx = 320;
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.font = "600 13px 'Helvetica', sans-serif";
    ctx.fillText("STUDENT", tx, 170);
    ctx.fillStyle = "#fff";
    ctx.font = "700 36px 'Helvetica', sans-serif";
    const name = props.studentName.toUpperCase();
    ctx.fillText(name.length > 26 ? name.slice(0, 26) + "…" : name, tx, 210);

    ctx.fillStyle = "rgba(255,255,255,0.65)"; ctx.font = "600 13px 'Helvetica', sans-serif";
    ctx.fillText("PROGRAM", tx, 260);
    ctx.fillStyle = "#fff"; ctx.font = "600 22px 'Helvetica', sans-serif";
    const prog = props.programName;
    ctx.fillText(prog.length > 36 ? prog.slice(0, 36) + "…" : prog, tx, 290);
    ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.font = "500 16px 'Helvetica', sans-serif";
    ctx.fillText(props.programType, tx, 314);

    ctx.fillStyle = "rgba(255,255,255,0.65)"; ctx.font = "600 13px 'Helvetica', sans-serif";
    ctx.fillText("STUDENT ID", tx, 370);
    ctx.fillStyle = "#fff"; ctx.font = "700 20px 'Courier', monospace";
    ctx.fillText(props.studentNumber, tx, 396);

    // QR code bottom-right
    QRCode.toDataURL(props.verifyUrl, { margin: 0, width: 180, color: { dark: "#0B1B3A", light: "#FFFFFF" } })
      .then((qrUrl) => {
        const qimg = new Image();
        qimg.onload = () => {
          // White card behind QR
          ctx.fillStyle = "#fff";
          ctx.fillRect(W - 220, H - 220, 180, 180);
          ctx.drawImage(qimg, W - 220, H - 220, 180, 180);
          ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.font = "500 12px 'Helvetica', sans-serif";
          ctx.fillText("Scan to verify", W - 215, H - 42);
        };
        qimg.src = qrUrl;
      });
  }, [props.studentName, props.studentNumber, props.programName, props.programType, props.avatarUrl, props.verifyUrl]);

  function downloadPng() {
    const canvas = canvasRef.current; if (!canvas) return;
    const link = document.createElement("a");
    link.download = `NDH-StudentID-${props.studentNumber}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && props.onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Your NDH Student ID</DialogTitle></DialogHeader>
        <div className="overflow-auto rounded-xl border border-border bg-secondary/30 p-3">
          <canvas ref={canvasRef} className="h-auto w-full rounded-lg" />
        </div>
        <div className="flex justify-end">
          <Button onClick={downloadPng}><Download className="mr-2 h-4 w-4" /> Download PNG</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}