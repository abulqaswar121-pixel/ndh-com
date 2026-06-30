import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Phone, Send } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";

const cols = [
  {
    title: "Company",
    links: [
      { to: "/about", label: "About Us" },
      { to: "/team", label: "Our Team" },
      { to: "/careers", label: "Careers" },
      { to: "/blog", label: "Blog" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Services",
    links: [
      { to: "/services", label: "Design" },
      { to: "/services", label: "Development" },
      { to: "/services", label: "Content" },
      { to: "/services", label: "Marketing" },
      { to: "/services", label: "Media" },
      { to: "/services", label: "AI & Tech" },
    ],
  },
  {
    title: "NDH Academy",
    links: [
      { to: "/academy", label: "Certificate Programs" },
      { to: "/academy", label: "Diploma Programs" },
      { to: "/academy", label: "Professional Programs" },
      { to: "/verify", label: "Verify Certificate" },
      { to: "/login", label: "Student Login" },
    ],
  },
  {
    title: "Support",
    links: [
      { to: "/faq", label: "Help Center" },
      { to: "/faq", label: "FAQ" },
      { to: "/submit-task", label: "Submit a Task" },
      { to: "/talent-application", label: "Talent Application" },
      { to: "/terms", label: "Terms & Privacy" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border bg-secondary/40">
      {/* Newsletter band */}
      <div className="border-b border-border bg-gradient-to-r from-[#0A0E2A] via-[#1a1052] to-[#0A0E2A] py-12 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-6 md:grid-cols-[1fr_auto]">
          <div>
            <h3 className="text-2xl font-extrabold sm:text-3xl">Stay in the loop.</h3>
            <p className="mt-2 text-sm text-white/70">Get sharp ideas on digital work, freelancing and NDH Academy updates.</p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
          >
            <input
              type="email"
              required
              placeholder="you@email.com"
              className="flex-1 rounded-lg border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[oklch(0.65_0.19_252)]"
            />
            <Button type="submit" variant="brand">
              Subscribe <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-2 lg:grid-cols-6">
        {/* Brand column */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <Logo className="h-11 w-11" />
            <div>
              <div className="text-sm font-extrabold tracking-tight">NAJEEB DIGITAL HUB</div>
              <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">NDH</div>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            A premium digital services bureau and online academy. Where Digital Excellence Meets Opportunity.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.65_0.19_252)]" /> Sokoto, Nigeria · Serving worldwide
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-[oklch(0.65_0.19_252)]" /> +234 902 993 2794 <span className="text-xs">(also WhatsApp)</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-[oklch(0.65_0.19_252)]" />
              <a className="hover:text-foreground" href="mailto:support@ndh.com.ng">support@ndh.com.ng</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-[oklch(0.65_0.19_252)]" />
              <a className="hover:text-foreground" href="mailto:info@ndh.com.ng">info@ndh.com.ng</a>
            </li>
          </ul>
          <div className="mt-5 flex items-center gap-3">
            <a href="https://www.facebook.com/share/1Be6HN8zjS/" target="_blank" rel="noreferrer" aria-label="Facebook" className="grid h-10 w-10 place-items-center rounded-full border border-border transition hover:bg-gradient-brand hover:text-white">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="https://www.instagram.com/njb_digital_hub" target="_blank" rel="noreferrer" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-full border border-border transition hover:bg-gradient-brand hover:text-white">
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

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-muted-foreground sm:flex-row">
          <div>© {new Date().getFullYear()} Najeeb Digital Hub. All rights reserved.</div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span>Built by NDH in Sokoto, Nigeria</span>
            <span className="hidden sm:inline">·</span>
            <span>ndh.com.ng</span>
          </div>
        </div>
      </div>
    </footer>
  );
}