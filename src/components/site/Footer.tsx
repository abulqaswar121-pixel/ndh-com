import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Phone, Send, Clock } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { CurrencySwitcher } from "@/lib/currency";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { subscribeNewsletter } from "@/lib/newsletter.functions";
import { toast } from "sonner";

const cols = [
  {
    title: "Services",
    links: [
      { to: "/services", label: "All Services" },
      { to: "/start-project", label: "Start a Project" },
      { to: "/talent", label: "Talent Directory" },
      { to: "/faq", label: "How it works" },
    ],
  },
  {
    title: "Academy",
    links: [
      { to: "/academy", label: "Academy Overview" },
      { to: "/verify", label: "Verify Certificate" },
      { to: "/login", label: "Student Login" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/blog", label: "Blog" },
      { to: "/careers", label: "Careers" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/terms", label: "Terms of Service" },
      { to: "/privacy", label: "Privacy Policy" },
      { to: "/trust", label: "Trust & Safety" },
      { to: "/refunds", label: "Refund Policy" },
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
    <footer className="relative mt-24 border-t border-border bg-background">
      {/* Newsletter band */}
      <div className="border-b border-border bg-secondary/40 py-10">
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-6 md:grid-cols-[1fr_auto]">
          <div>
            <h3 className="text-xl font-semibold sm:text-2xl">Stay in the loop</h3>
            <p className="mt-1 text-sm text-muted-foreground">Product updates and hiring insights. No spam.</p>
          </div>
          <form
            onSubmit={handleSubscribe}
            className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email address"
              placeholder="you@email.com"
              className="flex-1 rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
            <Button type="submit" variant="brand" disabled={busy}>
              {busy ? "Subscribing…" : "Subscribe"} <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10 lg:py-14">
        {/* Mobile: Brand full-width, links in a 2-col side-by-side grid */}
        <div className="grid grid-cols-1 gap-8 lg:hidden">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-3">
              <Logo className="h-10 w-10" />
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
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.65_0.19_252)]" /> Nigeria · Worldwide
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
              <a href="https://www.facebook.com/share/1Be6HN8zjS/" target="_blank" rel="noreferrer" aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-full border border-border transition hover:border-primary hover:text-primary">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://www.instagram.com/njb_digital_hub" target="_blank" rel="noreferrer" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-full border border-border transition hover:border-primary hover:text-primary">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Link columns — side by side on mobile */}
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
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
        </div>

        {/* Desktop: original multi-column layout */}
        <div className="hidden gap-10 lg:grid lg:grid-cols-6">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <Logo className="h-11 w-11" />
              <div>
                <div className="text-sm font-semibold tracking-tight">Najeeb Digital Hub</div>
                <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">NDH</div>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Vetted digital talent and a managed delivery bureau. Hire specialists or brief a project.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Serving clients worldwide
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" /> +234 902 993 2794
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <a className="hover:text-foreground" href="mailto:support@ndh.com.ng">support@ndh.com.ng</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <a className="hover:text-foreground" href="mailto:info@ndh.com.ng">info@ndh.com.ng</a>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-primary" /> Response &lt; 4 business hours
              </li>
            </ul>
            <div className="mt-5 flex items-center gap-3">
              <a href="https://www.facebook.com/share/1Be6HN8zjS/" target="_blank" rel="noreferrer" aria-label="Facebook" className="grid h-10 w-10 place-items-center rounded-full border border-border transition hover:border-primary hover:text-primary">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://www.instagram.com/njb_digital_hub" target="_blank" rel="noreferrer" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-full border border-border transition hover:border-primary hover:text-primary">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <div className="text-sm font-semibold">{c.title}</div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
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
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-muted-foreground sm:flex-row">
          <div>© {new Date().getFullYear()} Najeeb Digital Hub. All rights reserved.</div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <CurrencySwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}