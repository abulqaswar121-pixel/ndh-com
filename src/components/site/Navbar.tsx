import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Moon, Sun } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";

const primary = [
  { to: "/services", label: "Services" },
  { to: "/academy", label: "Academy" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

const secondary = [
  { to: "/faq", label: "How it works" },
  { to: "/verify", label: "Verify Certificate" },
  { to: "/trust", label: "Trust & Safety" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("ndh-theme");
    const prefersDark = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("ndh-theme", next ? "dark" : "light");
  };

  return (
    <>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 50s linear infinite;
        }
        .animate-marquee:hover { animation-play-state: paused; }
      `}</style>

      {/* Top bar — Moving, not sticky, moderate — not scattering worldwide everywhere */}
      <div className="relative z-30 w-full overflow-hidden border-b border-white/5 bg-[#0A0E2A] text-white">
        <div className="animate-marquee py-1.5 text-xs tracking-wide">
          <div className="flex items-center gap-6 px-4">
            <span>Official Bureau • Est. 2024 • Nigeria • Fast Response</span>
            <span className="opacity-30">•</span>
            <span>Escrow Secured • QA on Every Task • NDA • Fixed-Quote Guarantee</span>
            <span className="opacity-30">•</span>
            <span>80 Services • 40 AI Courses • Vetted Talents • QR-Verified Certificates</span>
            <span className="opacity-30">•</span>
          </div>
          <div className="flex items-center gap-6 px-4" aria-hidden>
            <span>Official Bureau • Est. 2024 • Nigeria • Fast Response</span>
            <span className="opacity-30">•</span>
            <span>Escrow Secured • QA on Every Task • NDA • Fixed-Quote Guarantee</span>
            <span className="opacity-30">•</span>
            <span>80 Services • 40 AI Courses • Vetted Talents • QR-Verified Certificates</span>
            <span className="opacity-30">•</span>
          </div>
        </div>
      </div>

      <header className={`sticky top-0 z-40 border-b transition-all ${scrolled ? "border-border bg-background/90 backdrop-blur-xl shadow-sm" : "border-border/50 bg-background/80 backdrop-blur"}`}>
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <Logo className="h-9 w-9 shrink-0" />
            <div className="min-w-0">
              <div className="truncate text-sm font-bold leading-tight tracking-tight">Najeeb Digital Hub</div>
              <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">NDH • Official</div>
            </div>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {primary.map((l) => (
              <Link key={l.to} to={l.to} activeOptions={{ exact: false }} activeProps={{ className: "text-foreground bg-secondary" }} inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-secondary/50" }} className="rounded-md px-3.5 py-2 text-sm font-medium transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button aria-label="Toggle theme" onClick={toggleTheme} className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground transition">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link to="/login" className="hidden md:block"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link to="/start-project" className="hidden md:block"><Button variant="brand" size="sm">Start a Project</Button></Link>
            <button aria-label="Open menu" onClick={() => setOpen(true)} className="grid h-9 w-9 place-items-center rounded-md border border-border lg:hidden"><Menu className="h-5 w-5" /></button>
          </div>
        </nav>
      </header>

      {open && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-[85%] max-w-[360px] flex-col border-l border-border bg-background shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2"><Logo className="h-8 w-8" /><span className="text-sm font-bold">NDH</span></div>
              <button aria-label="Close menu" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-md border border-border"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Menu</div>
              <div className="mt-3 grid gap-2">
                {primary.map((l) => (
                  <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 text-base font-semibold transition hover:border-primary/20 hover:bg-secondary/50">
                    {l.label}<span className="text-muted-foreground">→</span>
                  </Link>
                ))}
              </div>
              <div className="mt-8 text-xs font-bold uppercase tracking-widest text-muted-foreground">Support</div>
              <div className="mt-3 grid gap-1">
                {secondary.map((l) => (
                  <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">{l.label}</Link>
                ))}
              </div>
            </div>
            <div className="border-t border-border p-5">
              <Link to="/login" onClick={() => setOpen(false)} className="block"><Button variant="outline" className="w-full">Sign in</Button></Link>
              <Link to="/start-project" onClick={() => setOpen(false)} className="mt-2 block"><Button variant="brand" className="w-full">Start a Project</Button></Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
