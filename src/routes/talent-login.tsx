import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell, GoogleButton, Divider } from "@/components/site/AuthShell";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, roleHome } from "@/lib/auth";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/talent-login")({
  head: () => ({ meta: [
    { title: "Talent Sign In — NDH" },
    { name: "description", content: "Sign in to the NDH talent portal. Access is by invitation only." },
    { name: "robots", content: "noindex" },
  ]}),
  component: TalentLoginPage,
});

function TalentLoginPage() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (user && role) navigate({ to: roleHome(role) }); }, [user, role, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Signed in");
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/talent-login" });
    if (r?.error) toast.error((r.error as Error).message ?? "Google sign-in failed");
  };

  return (
    <AuthShell
      title="Talent Sign In"
      subtitle="Access to the talent portal is by invitation only. If you don't have an invite, ask your PM or admin to send one."
      illustration="african creative designer laptop"
      illustrationAlt="NDH talent sign in"
      badge="Talent"
    >
      <button onClick={google} className="w-full"><GoogleButton /></button>
      <Divider />
      <form onSubmit={submit} className="grid gap-4">
        <div>
          <label className="text-sm font-medium">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-[oklch(0.65_0.19_252)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.65_0.19_252)]/30" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Password</label>
            <Link to="/forgot-password" className="text-xs font-semibold text-[oklch(0.65_0.19_252)]">Forgot?</Link>
          </div>
          <div className="relative mt-1">
            <input type={show ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm focus:border-[oklch(0.65_0.19_252)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.65_0.19_252)]/30" />
            <button type="button" onClick={() => setShow((v) => !v)} className="absolute inset-y-0 right-2 grid place-items-center text-muted-foreground">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" variant="brand" size="lg" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
        </Button>
        <Link to="/" className="text-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 inline h-4 w-4" /> Back to homepage
        </Link>
      </form>
    </AuthShell>
  );
}