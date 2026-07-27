import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, Lock, BadgeCheck } from "lucide-react";
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
    <div className="min-h-screen bg-secondary/40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <Logo className="h-9 w-9" />
          <span className="text-sm font-semibold tracking-tight">Najeeb Digital Hub</span>
        </Link>
        <Link
          to="/"
          className="group inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back to homepage
        </Link>
      </div>
      <div className="mx-auto grid max-w-6xl gap-10 px-6 pb-16 lg:grid-cols-[1fr_360px]">
        <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-elegant lg:mx-0">
          {badge && (
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{badge}</div>
          )}
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        <aside className="hidden self-start rounded-xl border border-border bg-background p-6 lg:block">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Why NDH</div>
          <ul className="mt-4 space-y-4 text-sm">
            <li className="flex gap-3"><BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span><b className="font-semibold text-foreground">Vetted talent.</b><br /><span className="text-muted-foreground">Interviewed, tested, and tiered before entering the roster.</span></span></li>
            <li className="flex gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span><b className="font-semibold text-foreground">Managed delivery.</b><br /><span className="text-muted-foreground">A PM runs your timeline, quality checks and revisions.</span></span></li>
            <li className="flex gap-3"><Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span><b className="font-semibold text-foreground">Secure payments.</b><br /><span className="text-muted-foreground">Funds released after each milestone is approved.</span></span></li>
          </ul>
        </aside>
      </div>
    </div>
  );
}

export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-center gap-3 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-semibold transition hover:bg-secondary"
    >
      <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden>
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8a12 12 0 0 1 0-24c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1 0 24 44a20 20 0 0 0 20-20c0-1.2-.1-2.4-.4-3.5z" />
        <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16.1 18.9 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.2 2.4-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.6 39.6 16.3 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.8 0-1.2-.1-2.4-.4-3.5z" />
      </svg>
      {label}
    </button>
  );
}

export function Divider({ text = "or continue with email" }: { text?: string }) {
  return (
    <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
      <div className="h-px flex-1 bg-border" />
      {text}
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}