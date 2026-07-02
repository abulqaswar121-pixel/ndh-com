import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Logo } from "./Logo";
import { AnimatedBlobs } from "./AnimatedBlobs";
import { UnsplashImg } from "./UnsplashImg";

export function AuthShell({
  title,
  subtitle,
  illustration,
  illustrationAlt,
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
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative isolate hidden overflow-hidden bg-hero text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <AnimatedBlobs />
        <Link to="/" className="relative z-10 flex items-center gap-3">
          <Logo className="h-11 w-11" />
          <div>
            <div className="text-sm font-extrabold tracking-tight">NAJEEB DIGITAL HUB</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/60">NDH</div>
          </div>
        </Link>
        <div className="relative z-10 max-w-md">
          {badge && (
            <div className="mb-3 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest backdrop-blur">
              {badge}
            </div>
          )}
          <h2 className="text-4xl font-extrabold leading-[1.05]">
            <span className="text-gradient-brand">Digital excellence</span>, delivered.
          </h2>
          <p className="mt-4 text-sm text-white/75">
            Join thousands of clients, students and talents already building with NDH across Nigeria and the diaspora.
          </p>
        </div>
        <div className="relative z-10 overflow-hidden rounded-2xl border border-white/10 shadow-glow">
          <UnsplashImg q={illustration} alt={illustrationAlt} w={800} h={500} className="h-full w-full object-cover" />
        </div>
      </div>

      {/* Right form panel */}
      <div className="relative flex flex-col px-6 py-6 sm:px-12">
        {/* Slim top bar with mobile logo + Back link, never overlaps content */}
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 lg:invisible">
            <Logo className="h-9 w-9" />
            <span className="text-sm font-extrabold tracking-tight">NDH</span>
          </Link>
          <Link
            to="/"
            className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground backdrop-blur transition hover:border-foreground/30 hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to Homepage
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-elegant"
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