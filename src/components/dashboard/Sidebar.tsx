import { Link, useRouterState } from "@tanstack/react-router";
import { Logo } from "@/components/site/Logo";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, ArrowLeft, type LucideIcon } from "lucide-react";

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
  const [name, setName] = useState<string>("");
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
    <div className="flex min-h-screen bg-secondary/30">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col border-r border-border bg-card transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-5">
          <Logo className="h-9 w-9" />
          <div>
            <div className="text-sm font-extrabold tracking-tight">NDH</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{title}</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 pb-4">
          <div className="grid gap-1">
          {items.map((it) => (
            <Link
              key={it.label}
              to={it.to}
              search={it.search as never}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive(it)
                  ? "bg-gradient-brand text-white shadow-glow"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <it.icon className="h-4 w-4" />
              {it.label}
            </Link>
          ))}
          </div>
        </nav>
        <div className="shrink-0 border-t border-border bg-card p-3">
          <Link
            to="/"
            className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to site
          </Link>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex w-full flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-5 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="rounded-md border border-border p-2 lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <span className="block h-0.5 w-4 bg-foreground" />
              <span className="mt-1 block h-0.5 w-4 bg-foreground" />
              <span className="mt-1 block h-0.5 w-4 bg-foreground" />
            </button>
            <div className="text-sm font-semibold">{title}</div>
          </div>
          <div className="hidden sm:block text-sm text-muted-foreground">{name}</div>
        </header>
        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}