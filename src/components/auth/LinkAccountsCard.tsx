import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Check, Link2 } from "lucide-react";

/**
 * Account linking UI: shows which providers are connected to the current user
 * and lets them link Google (if only email) or set a password (if only Google).
 */
export function LinkAccountsCard() {
  const [providers, setProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pwd, setPwd] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const { data } = await supabase.auth.getUser();
    const ids = (data.user?.identities || []).map((i) => i.provider).filter(Boolean) as string[];
    setProviders(Array.from(new Set(ids)));
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const hasGoogle = providers.includes("google");
  const hasEmail = providers.includes("email");

  const linkGoogle = async () => {
    setBusy(true);
    const { data, error } = await supabase.auth.linkIdentity({
      provider: "google",
      options: { redirectTo: window.location.href },
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    if (data?.url) window.location.href = data.url;
  };

  const setPassword = async () => {
    if (pwd.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password set — you can now sign in with email too");
    setPwd("");
    refresh();
  };

  if (loading) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 text-sm font-bold">Sign-in methods</div>
      <ul className="mb-4 grid gap-2 text-sm">
        <li className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2">
          <span>Email &amp; password</span>
          {hasEmail
            ? <span className="inline-flex items-center gap-1 text-emerald-600"><Check className="h-4 w-4" /> Connected</span>
            : <span className="text-muted-foreground">Not set</span>}
        </li>
        <li className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2">
          <span>Google</span>
          {hasGoogle
            ? <span className="inline-flex items-center gap-1 text-emerald-600"><Check className="h-4 w-4" /> Connected</span>
            : <span className="text-muted-foreground">Not linked</span>}
        </li>
      </ul>

      {!hasEmail && (
        <div className="mb-3 rounded-xl border border-border bg-secondary/30 p-3">
          <p className="mb-2 text-sm text-muted-foreground">
            Set a password to also enable email login on this account.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="New password (min 8 chars)"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <Button variant="brand" size="sm" onClick={setPassword} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Set password"}
            </Button>
          </div>
        </div>
      )}

      {!hasGoogle && (
        <Button variant="outline" onClick={linkGoogle} disabled={busy} className="w-full">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Link2 className="mr-2 h-4 w-4" /> Link Google account</>}
        </Button>
      )}
    </section>
  );
}
