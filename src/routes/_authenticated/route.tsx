import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth, roleHome, type AppRole } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    // Optional: enforce role section match by reading current path
    const path = window.location.pathname;
    const expected = role ? roleHome(role as AppRole) : null;
    if (expected && path.startsWith("/dashboard/") && !path.startsWith(expected)) {
      // user landed on a section that isn't theirs — bounce to their home
      navigate({ to: expected });
    }
  }, [user, role, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  return <Outlet />;
}