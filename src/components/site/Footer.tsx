import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Send } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { CurrencySwitcher } from "@/lib/currency";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { subscribeNewsletter } from "@/lib/newsletter.functions";
import { toast } from "sonner";

const cols = [
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/services", label: "Services" },
      { to: "/case-studies", label: "Work" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Academy",
    links: [
      { to: "/academy", label: "Programs" },
      { to: "/verify", label: "Verify Cert" },
      { to: "/careers", label: "Careers" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/faq", label: "Help" },
      { to: "/terms", label: "Terms" },
      { to: "/privacy", label: "Privacy" },
    ],
  },
] as const;

export function Footer() {
  const subscribe = useServerFn(subscribeNewsletter);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    try {
      await subscribe({ data: { email, source: "footer" } });
      toast.success("Subscribed! Check your inbox soon for our next update.");
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not subscribe. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border bg-secondary/40">
      {/* Newsletter band */}
      <div className="border-b border-border bg-gradient-to-r from-[#0A0E2A] via-[#1a1052] to-[#0A0E2A] py-8 text-white sm:py-12">
        <div className="mx-auto grid max-w-7xl items-center gap-4 px-6 text-center sm:gap-6 md:grid-cols-[1fr_auto] md:text-left">
          <div>
            <h3 className="text-xl font-extrabold sm:text-2xl">Stay in the loop.</h3>
            <p className="mt-1 text-sm text-white/70 sm:mt-2">Digital work tips, freelancing & Academy updates.</p>
          </div>
          <form
            onSubmit={handleSubscribe}
            className="mx-auto flex w-full max-w-md flex-col gap-2 sm:flex-row md:mx-0"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email address"
              placeholder="you@email.com"
              className="flex-1 rounded-lg border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[oklch(0.65_0.19_252)]"
            />
            <Button type="submit" variant="brand" disabled={busy}>
              {busy ? "Subscribing…" : "Subscribe"} <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 sm:grid-cols-2 lg:grid-cols-5 lg:py-14">
        {/* Brand column */}
        <div className="sm:col-span-2 lg:col-span-2">
          <div className="flex items-center gap-3">
            <Logo className="h-10 w-10 sm:h-11 sm:w-11" />
            <div>
              <div className="text-sm font-extrabold tracking-tight">NAJEEB DIGITAL HUB</div>
              <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">NDH</div>
            </div>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Premium digital services & online academy.
          </p>
          <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.65_0.19_252)]" /> Sokoto, Nigeria
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-[oklch(0.65_0.19_252)]" /> +234 902 993 2794
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-[oklch(0.65_0.19_252)]" />
              <a className="hover:text-foreground" href="mailto:info@ndh.com.ng">info@ndh.com.ng</a>
            </li>
          </ul>
          <div className="mt-4 flex items-center gap-3">
            <a href="https://www.facebook.com/share/1Be6HN8zjS/" target="_blank" rel="noreferrer" aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-full border border-border transition hover:bg-gradient-brand hover:text-white">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="https://www.instagram.com/njb_digital_hub" target="_blank" rel="noreferrer" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-full border border-border transition hover:bg-gradient-brand hover:text-white">
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>

        {cols.map((c) => (
          <div key={c.title}>
            <div className="text-sm font-semibold">{c.title}</div>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              {c.links.map((l) => (
                <li key={`${c.title}-${l.label}`}>
                  <Link to={l.to} className="transition hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-4 text-xs text-muted-foreground sm:flex-row">
          <div>© {new Date().getFullYear()} Najeeb Digital Hub</div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span>Built in Sokoto, Nigeria</span>
            <CurrencySwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}