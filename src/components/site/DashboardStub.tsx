import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock } from "lucide-react";
import { AnimatedBlobs } from "./AnimatedBlobs";

/**
 * Stub for portal/dashboard pages. Real role-based dashboards (with
 * Lovable Cloud auth, RLS, and live data) ship in the next phase.
 */
export function DashboardStub({
  title,
  role,
  description,
  features,
  accent = "blue",
}: {
  title: string;
  role: string;
  description: string;
  features: string[];
  accent?: "blue" | "purple" | "teal" | "navy";
}) {
  const ring =
    accent === "purple" ? "from-[oklch(0.62_0.21_290)]" :
    accent === "teal" ? "from-[oklch(0.78_0.13_180)]" :
    accent === "navy" ? "from-[oklch(0.2_0.1_268)]" : "from-[oklch(0.65_0.19_252)]";

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background">
      <AnimatedBlobs />
      <div className="relative mx-auto max-w-5xl px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to site
        </Link>

        <div className="mt-8 flex items-center gap-3">
          <Logo className="h-12 w-12" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{role}</div>
            <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-muted-foreground">{description}</p>

        <div className={`mt-8 overflow-hidden rounded-3xl border border-border bg-card shadow-elegant`}>
          <div className={`h-1 bg-gradient-to-r ${ring} to-[oklch(0.62_0.21_290)]`} />
          <div className="p-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Lock className="h-3.5 w-3.5" /> Preview · Authentication coming in Phase 2
            </div>
            <h2 className="text-xl font-bold">What this dashboard includes</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3 rounded-xl border border-border bg-background/50 p-4">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gradient-brand" />
                  <span className="text-sm">{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login"><Button variant="brand">Go to sign in</Button></Link>
              <Link to="/contact"><Button variant="outline">Request access</Button></Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}