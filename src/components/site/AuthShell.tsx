import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, Lock, BadgeCheck, Globe, Award } from "lucide-react";
import { Logo } from "./Logo";

export function AuthShell({
  title,
  subtitle,
  illustration: _illustration,
  illustrationAlt: _illustrationAlt,
  children,
  badge,
}: {
  title: string;
  subtitle?: string;
  illustration: string;
  illustrationAlt: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0A0E2A] text-white">
      <div className="border-b border-white/10 bg-[#0A0E2A]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="h-9 w-9" />
            <span className="text-sm font-bold tracking-tight">Najeeb Digital Hub • Worldwide</span>
          </Link>
          <Link to="/" className="group inline-flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to homepage • Worldwide Bureau
          </Link>
        </div>
      </div>
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
        <div className="order-2 lg:order-1">
          <div className="hidden lg:block">
            <div className="text-xs uppercase tracking-widest text-white/50">Official Bureau • Worldwide • 80 Services • 40 AI Courses • Worldwide</div>
            <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Trusted worldwide by founders who can't afford freelancer roulette.</h2>
            <p className="mt-4 text-sm leading-relaxed text-white/60">Join NDH — managed delivery, escrow via Paystack, PM + QA on every task, QR-verified certificates. HQ Nigeria — serving clients worldwide in Nigeria to worldwide clients, all timezones. Fast Response worldwide TZ.</p>
            <div className="mt-8 grid gap-4">
              <div className="flex gap-3"><BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-400" /><div><div className="font-semibold">Vetted talent T1-T5 — Worldwide Pool</div><div className="text-sm text-white/50">Interviewed, tested, tiered, anonymous IDs NDH-DS-1234 for privacy/bias protection.</div></div></div>
              <div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" /><div><div className="font-semibold">Managed delivery + Escrow — Trusted Worldwide</div><div className="text-sm text-white/50">PM scopes in 4h, funds held Paystack escrow per milestone, released on approval, source files + docs + QA sign-off included.</div></div></div>
              <div className="flex gap-3"><Award className="mt-0.5 h-5 w-5 shrink-0 text-purple-400" /><div><div className="font-semibold">40 AI Courses + QR-verified + Talent Pipeline</div><div className="text-sm text-white/50">Curated from YouTube, AI exam + project, Director approves, certificate verifiable at /verify worldwide, join talent pool and earn.</div></div></div>
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs text-white/40"><Globe className="h-3.5 w-3.5" /> Worldwide • Remote-first • Nigeria → Worldwide • EN • USD/NGN/GBP/EUR • HQ Nigeria</div>
          </div>
        </div>
        <div className="order-1 mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-white p-8 text-black shadow-2xl lg:order-2">
          {badge && <div className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-primary">{badge} • Worldwide • Secure • Worldwide</div>}
          <h1 className="text-2xl font-bold tracking-tight text-black">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle} — Trusted worldwide.</p>}
          <div className="mt-6">{children}</div>
          <div className="mt-6 border-t pt-4 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} NDH • Official • Worldwide • 80 Services • 40 AI Courses • 86+ Talents • Escrow • HQ Nigeria → Worldwide</div>
        </div>
      </div>
    </div>
  );
}

export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  return (
    <button type="button" className="flex w-full items-center justify-center gap-3 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-semibold transition hover:bg-secondary">
      <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden>
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8a12 12 0 0 1 0-24c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1 0 24 44a20 20 0 0 0 20-20c0-1.2-.1-2.4-.4-3.5z" />
        <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16.1 18.9 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.2 2.4-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.6 39.6 16.3 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.8 0-1.2-.1-2.4-.4-3.5z" />
      </svg>
      {label} • Worldwide
    </button>
  );
}

export function Divider({ text = "or continue with email — worldwide secure" }: { text?: string }) {
  return (
    <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
      <div className="h-px flex-1 bg-border" />
      {text}
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
