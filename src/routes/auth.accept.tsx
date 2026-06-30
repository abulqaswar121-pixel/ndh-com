import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/Logo";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/accept")({
  ssr: false,
  head: () => ({ meta: [{ title: "Accept invitation — NDH" }, { name: "robots", content: "noindex" }]}),
  component: AcceptInvitePage,
});

function AcceptInvitePage() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase handles the recovery/invite hash on load; wait for session.
    const id = setTimeout(() => setReady(true), 600);
    return () => clearTimeout(id);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (password !== confirm) { toast.error("Passwords do not match"); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Welcome to NDH! Finishing setup…");
    navigate({ to: "/dashboard/talent" });
  };

  return (
    <div className="grid min-h-screen place-items-center bg-secondary/30 px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-7 shadow-elegant">
        <div className="flex items-center gap-3">
          <Logo className="h-10 w-10" />
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">NDH Talent</div>
            <div className="text-lg font-extrabold">Set your password</div>
          </div>
        </div>
        {!ready ? (
          <div className="mt-8 grid place-items-center py-10"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <form onSubmit={submit} className="mt-6 grid gap-4">
            <p className="text-sm text-muted-foreground">Choose a secure password to activate your talent account.</p>
            <div>
              <label className="text-sm font-medium">New password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium">Confirm password</label>
              <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
            </div>
            <Button type="submit" variant="brand" size="lg" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Activate account"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}