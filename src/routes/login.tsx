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

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [
    { title: "Sign in — NDH" },
    { name: "description", content: "Sign in to your NDH account — client, talent, student, instructor or admin." },
    { property: "og:url", content: "/login" },
  ], links: [{ rel: "canonical", href: "/login" }]}),
  component: LoginPage,
});

function LoginPage() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const nextPath = (() => {
    if (typeof window === "undefined") return null;
    const raw = new URLSearchParams(window.location.search).get("next");
    return raw && raw.startsWith("/") ? raw : null;
  })();

  useEffect(() => {
    if (user && role) navigate({ to: nextPath || roleHome(role) });
  }, [user, role, navigate, nextPath]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Signed in");
  };

  const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/login" });
    if (result?.error) toast.error((result.error as Error).message ?? "Google sign-in failed");
  };

  return (
    <AuthShell
      title="Welcome back."
      subtitle="Sign in to your NDH dashboard."
      illustration="african professional laptop happy"
      illustrationAlt="Sign in to NDH"
      badge="Sign in"
    >
      <button onClick={handleGoogle} className="w-full"><GoogleButton /></button>
      <Divider />
      <form onSubmit={handleEmailLogin} className="grid gap-4">
        <div>
          <label className="text-sm font-medium">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm transition focus:border-[oklch(0.65_0.19_252)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.65_0.19_252)]/30" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Password</label>
            <Link to="/forgot-password" className="text-xs font-semibold text-[oklch(0.65_0.19_252)]">Forgot?</Link>
          </div>
          <div className="relative mt-1">
            <input type={show ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm transition focus:border-[oklch(0.65_0.19_252)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.65_0.19_252)]/30" />
            <button type="button" onClick={() => setShow((v) => !v)} className="absolute inset-y-0 right-2 grid place-items-center text-muted-foreground">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" variant="brand" size="lg" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account? <Link to="/signup" className="font-semibold text-foreground">Create one</Link>
        </p>
      </form>
    </AuthShell>
  );
}