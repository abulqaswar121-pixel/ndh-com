import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Phone, Send, Clock, ShieldCheck } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { CurrencySwitcher } from "@/lib/currency";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { subscribeNewsletter } from "@/lib/newsletter.functions";
import { toast } from "sonner";

const cols = [
  { title: "Services", links: [{ to: "/services", label: "All Services" }, { to: "/start-project", label: "Start a Project" }, { to: "/faq", label: "How it works" }, { to: "/contact", label: "Contact" }] },
  { title: "Academy", links: [{ to: "/academy", label: "Academy Overview" }, { to: "/verify", label: "Verify Certificate" }, { to: "/login", label: "Student Login" }] },
  { title: "Company", links: [{ to: "/about", label: "About" }, { to: "/case-studies", label: "Case Studies" }, { to: "/contact", label: "Contact" }, { to: "/faq", label: "FAQ" }] },
  { title: "Legal", links: [{ to: "/terms", label: "Terms" }, { to: "/privacy", label: "Privacy" }, { to: "/trust", label: "Trust & Safety" }, { to: "/refunds", label: "Refunds" }] },
] as const;

export function Footer() {
  const subscribe = useServerFn(subscribeNewsletter);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault(); if (!email) return; setBusy(true);
    try { await subscribe({ data: { email, source: "footer" } }); toast.success("Subscribed!"); setEmail(""); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Could not subscribe."); }
    finally { setBusy(false); }
  };
  return (
    <footer className="relative mt-24 border-t border-border bg-background">
      <div className="border-b border-border bg-secondary/40 py-8">
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-6 md:grid-cols-[1fr_auto]">
          <div><h3 className="text-lg font-semibold">Stay in the loop</h3><p className="mt-1 text-sm text-muted-foreground">Product updates and hiring insights. No spam.</p></div>
          <form onSubmit={handleSubscribe} className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="flex-1 rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40" />
            <Button type="submit" variant="brand" disabled={busy}>{busy ? "Subscribing…" : "Subscribe"} <Send className="h-4 w-4" /></Button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10 lg:py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3"><Logo className="h-10 w-10" /><div><div className="text-sm font-bold tracking-tight">Najeeb Digital Hub</div><div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">NDH • Official • Est. 2024</div></div></div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">Managed bureau for digital services + AI academy. Vetted talents, escrow, QA, QR-verified certificates. HQ Nigeria, serving clients worldwide.</p>
            <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Nigeria • Worldwide • Remote-first</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +234 902 993 2794</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> info@ndh.com.ng • support@ndh.com.ng</li>
              <li className="flex items-center gap-2"><Clock className="h-4 w-4" /> Fast Response</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Escrow • QA • NDA</li>
            </ul>
            <div className="mt-4 flex gap-2">
              <a href="https://www.facebook.com/share/1Be6HN8zjS/" target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-full border border-border hover:border-primary hover:text-primary"><Facebook className="h-4 w-4" /></a>
              <a href="https://www.instagram.com/njb_digital_hub" target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-full border border-border hover:border-primary hover:text-primary"><Instagram className="h-4 w-4" /></a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:col-span-4">
            {cols.map((c) => (
              <div key={c.title}><div className="text-sm font-semibold">{c.title}</div><ul className="mt-3 space-y-2 text-sm text-muted-foreground">{c.links.map((l) => <li key={l.label}><Link to={l.to} className="hover:text-foreground">{l.label}</Link></li>)}</ul></div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-muted-foreground sm:flex-row">
          <div>© {new Date().getFullYear()} Najeeb Digital Hub. All rights reserved. Official bureau.</div>
          <div className="flex items-center gap-4"><CurrencySwitcher /></div>
        </div>
      </div>
    </footer>
  );
}
