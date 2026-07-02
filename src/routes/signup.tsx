import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell, GoogleButton, Divider } from "@/components/site/AuthShell";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, roleHome } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { checkEmailProviders } from "@/lib/auth/account-linking.functions";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [
    { title: "Create your NDH account" },
    { name: "description", content: "Create a free NDH account as a client or academy student. Google sign-up supported." },
    { property: "og:url", content: "/signup" },
  ], links: [{ rel: "canonical", href: "/signup" }]}),
  component: SignupPage,
});

function SignupPage() {
  const [show, setShow] = useState(false);
  const [role, setRole] = useState<"client" | "student">("client");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, role: currentRole } = useAuth();
  const navigate = useNavigate();

  // Optional ?next=/safe/path to send the user somewhere specific after signup
  // (e.g. /academy/apply/<slug>). Same-origin paths only.
  const nextPath = (() => {
    if (typeof window === "undefined") return null;
    const raw = new URLSearchParams(window.location.search).get("next");
    if (!raw) return null;
    return raw.startsWith("/") ? raw : null;
  })();

  useEffect(() => {
    if (user && currentRole) navigate({ to: nextPath || roleHome(currentRole) });
  }, [user, currentRole, navigate, nextPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    // Pre-flight: if this email already exists via Google only, tell the user clearly.
    try {
      const info = await checkEmailProviders({ data: { email } });
      if (info.exists && info.providers.includes("google") && !info.providers.includes("email")) {
        setLoading(false);
        toast.error("This email is already registered with Google. Please sign in with Google — you can add a password afterwards in Settings.");
        return;
      }
    } catch {/* non-fatal; continue */}
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName, role },
      },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Account created — redirecting…");
  };

  const handleGoogle = async () => {
    // Remember the intended role so we can assign it after the OAuth round-trip.
    try { window.sessionStorage.setItem("ndh_pending_role", role); } catch {}
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/signup" });
    if (result?.error) toast.error((result.error as Error).message ?? "Google sign-up failed");
  };

  return (
    <AuthShell
      title="Create your account."
      subtitle="Free forever. Get going in 30 seconds."
      illustration="african student laptop online learning"
      illustrationAlt="Sign up for NDH"
      badge="Sign up"
    >
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl border border-border bg-secondary/40 p-1">
        {(["client", "student"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold capitalize transition ${role === r ? "bg-gradient-brand text-white shadow-glow" : "text-muted-foreground"}`}
          >
            I'm a {r}
          </button>
        ))}
      </div>
      <button onClick={handleGoogle} className="w-full"><GoogleButton label="Sign up with Google" /></button>
      <Divider />
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div>
          <label className="text-sm font-medium">Full name</label>
          <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm transition focus:border-[oklch(0.65_0.19_252)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.65_0.19_252)]/30" />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm transition focus:border-[oklch(0.65_0.19_252)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.65_0.19_252)]/30" />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <div className="relative mt-1">
            <input type={show ? "text" : "password"} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm transition focus:border-[oklch(0.65_0.19_252)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.65_0.19_252)]/30" />
            <button type="button" onClick={() => setShow((v) => !v)} className="absolute inset-y-0 right-2 grid place-items-center text-muted-foreground">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" variant="brand" size="lg" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="font-semibold text-foreground">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}