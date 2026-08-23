import { MessageCircle } from "lucide-react";

export function WhatsAppWidget() {
  const phone = "2349029932794";
  const message = encodeURIComponent("Hi NDH Team, I want to brief a project / enroll in Academy.");
  const url = `https://wa.me/${phone}?text=${message}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 left-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:shadow-xl"
    >
      <MessageCircle className="h-7 w-7 fill-white" />
      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">24h</span>
    </a>
  );
}
