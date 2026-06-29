import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, Phone } from "lucide-react";
import { Logo } from "./Logo";

const emails = [
  "support@ndh.com.ng",
  "admin@ndh.com.ng",
  "info@ndh.com.ng",
  "hello@ndh.com.ng",
  "academy@ndh.com.ng",
  "talents@ndh.com.ng",
  "billing@ndh.com.ng",
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <Logo className="h-10 w-10" />
            <div>
              <div className="text-sm font-extrabold tracking-tight">NAJEEB DIGITAL HUB</div>
              <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">NDH</div>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            A premium digital services bureau and online academy. Where Digital Excellence Meets Opportunity.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <a href="https://www.facebook.com/share/1Be6HN8zjS/" target="_blank" rel="noreferrer" aria-label="Facebook" className="grid h-10 w-10 place-items-center rounded-full border border-border hover:bg-gradient-brand hover:text-white transition">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="https://www.instagram.com/njb_digital_hub" target="_blank" rel="noreferrer" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-full border border-border hover:bg-gradient-brand hover:text-white transition">
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold">Explore</div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/services" className="hover:text-foreground">Services</Link></li>
            <li><Link to="/academy" className="hover:text-foreground">NDH Academy</Link></li>
            <li><Link to="/join-talent" className="hover:text-foreground">Join as Talent</Link></li>
            <li><Link to="/verify" className="hover:text-foreground">Verify Certificate</Link></li>
            <li><Link to="/blog" className="hover:text-foreground">Blog</Link></li>
            <li><Link to="/faq" className="hover:text-foreground">FAQ</Link></li>
            <li><Link to="/terms" className="hover:text-foreground">Terms</Link></li>
            <li><Link to="/privacy" className="hover:text-foreground">Privacy</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-sm font-semibold">Contact</div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> +234 902 993 2794</li>
            {emails.map((e) => (
              <li key={e} className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <a href={`mailto:${e}`} className="truncate hover:text-foreground">{e}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-muted-foreground sm:flex-row">
          <div>© {new Date().getFullYear()} Najeeb Digital Hub. All rights reserved.</div>
          <div>ndh.com.ng</div>
        </div>
      </div>
    </footer>
  );
}