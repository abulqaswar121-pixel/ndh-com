import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@tanstack/react-router";
import { X, KeyRound } from "lucide-react";

const DISMISS_KEY = "ndh_set_password_nudge_dismissed";

/**
 * Dismissible banner shown when the user signed up via Google only and has
 * not set an email password yet.
 */
export function SetPasswordNudge({ settingsHref }: { settingsHref: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(DISMISS_KEY) === "1") return;
    supabase.auth.getUser().then(({ data }) => {
      const ids = (data.user?.identities || []).map((i) => i.provider);
      if (ids.includes("google") && !ids.includes("email")) setShow(true);
    });
  }, []);

  if (!show) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-[oklch(0.65_0.19_252)]/30 bg-gradient-to-r from-[oklch(0.65_0.19_252)]/10 to-[oklch(0.62_0.2_300)]/10 p-4">
      <KeyRound className="mt-0.5 h-5 w-5 text-[oklch(0.65_0.19_252)]" />
      <div className="flex-1 text-sm">
        <div className="font-semibold">Set a password to also enable email login</div>
        <p className="mt-0.5 text-muted-foreground">
          You signed in with Google. Add a password so you can also sign in with email.{" "}
          <Link to={settingsHref} className="font-semibold text-foreground underline">Open Settings</Link>
        </p>
      </div>
      <button
        onClick={() => { window.localStorage.setItem(DISMISS_KEY, "1"); setShow(false); }}
        className="rounded-md p-1 text-muted-foreground hover:bg-secondary"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
