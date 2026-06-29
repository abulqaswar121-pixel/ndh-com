import { MessageCircle } from "lucide-react";

export function WhatsAppFab() {
  const msg = encodeURIComponent("Hello NDH, I'd like to inquire about...");
  return (
    <a
      href={`https://wa.me/2349029932794?text=${msg}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full text-white shadow-glow"
      style={{ background: "linear-gradient(135deg,#25D366,#128C7E)" }}
    >
      <MessageCircle className="h-6 w-6" />
      <span className="pointer-events-none absolute inline-flex h-full w-full animate-ping rounded-full opacity-30" style={{ background: "#25D366" }} />
    </a>
  );
}