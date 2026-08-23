import { Link, useRouterState } from "@tanstack/react-router";
import { Logo } from "@/components/site/Logo";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, ArrowLeft, type LucideIcon, Globe, ShieldCheck } from "lucide-react";

export type NavItem = { label: string; to: string; search?: Record<string, string>; icon: LucideIcon };

export function DashboardShell({
  title,
  items,
  children,
}: {
  title: string;
  items: NavItem[];
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const search = useRouterState({ select: (r) => r.location.search as Record<string, string> });
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle().then(({ data }) => {
      setName(data?.full_name || user.email || "");
    });
  }, [user]);

  const isActive = (item: NavItem) => {
    if (item.search) {
      return pathname === item.to && search.tab === item.search.tab;
    }
    return pathname === item.to && !search.tab;
  };

  return (
    <div className="flex min-h-screen bg-secondary/20">
      {/* Sidebar — Professional Worldwide */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col border-r border-border bg-[#0A0E2A] text-white transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-5">
          <Logo className="h-9 w-9" />
          <div>
            <div className="text-sm font-extrabold tracking-tight">NDH • Official</div>
            <div className="text-[10px] uppercase tracking-widest text-white/50">{title} • Worldwide</div>
          </div>
        </div>
        <div className="border-b border-white/5 bg-white/5 px-3 py-2 text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-2"><Globe className="h-3 w-3" /> Worldwide • Worldwide • 80 Services • 40 Courses • Official</div>
        <nav className="flex-1 overflow-y-auto p-3 pb-4">
          <div className="grid gap-1">
          {items.map((it) => (
            <Link
              key={it.label}
              to={it.to}
              search={it.search as never}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive(it) ? "bg-white text-black" : "text-white/60 hover:bg-white/10 hover:text-white"}`}
            >
              <it.icon className="h-4 w-4" />
              {it.label}
            </Link>
          ))}
          </div>
          <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="text-xs font-semibold text-white/80">Trusted Worldwide</div>
            <div className="mt-1 text-[11px] leading-relaxed text-white/50">Escrow Paystack • QA on every task • NDA • QR-verified certificates • Fast Response • Fixed-Quote Guarantee • Worldwide</div>
          </div>
        </nav>
        <div className="shrink-0 border-t border-white/10 bg-[#0A0E2A] p-3">
          <Link to="/" className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/10 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to site • Worldwide Official
          </Link>
          <button onClick={signOut} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/10 hover:text-white">
            <LogOut className="h-4 w-4" /> Sign out — Worldwide Secure
          </button>
        </div>
      </aside>

      {/* Main — Professional */}
      <div className="flex w-full flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/90 px-5 backdrop-blur-xl lg:px-8">
          <div className="flex items-center gap-3">
            <button className="rounded-md border border-border p-2 lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
              <span className="block h-0.5 w-4 bg-foreground" />
              <span className="mt-1 block h-0.5 w-4 bg-foreground" />
              <span className="mt-1 block h-0.5 w-4 bg-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <div className="text-sm font-bold tracking-tight">{title} — Official • Worldwide</div>
              <span className="hidden items-center gap-1 rounded-full border border-border bg-secondary/50 px-2 py-0.5 text-[10px] text-muted-foreground sm:inline-flex"><Globe className="h-3 w-3" /> Worldwide • Escrow • QA</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><ShieldCheck className="h-3.5 w-3.5 text-green-600" /> Trusted Worldwide • Fixed-Quote Guarantee</div>
            <div className="hidden sm:block text-sm font-medium text-muted-foreground">{name} • Worldwide</div>
          </div>
        </header>
        <main className="flex-1 bg-secondary/20 p-5 lg:p-8">{children}</main>
      </div>

      {open && <div className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}
    </div>
  );
}
