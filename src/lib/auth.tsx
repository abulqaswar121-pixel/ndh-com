import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type AppRole =
  | "client"
  | "talent"
  | "student"
  | "instructor"
  | "pm"
  | "hod"
  | "admin"
  | "super_admin";

export const ROLE_HOME: Record<AppRole, string> = {
  client: "/dashboard/client",
  talent: "/dashboard/talent",
  student: "/dashboard/student",
  instructor: "/dashboard/instructor",
  pm: "/dashboard/pm",
  hod: "/dashboard/hod",
  admin: "/dashboard/admin",
  super_admin: "/dashboard/super-admin",
};

type AuthState = {
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthState>({
  session: null,
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
});

const ROLE_PRIORITY: AppRole[] = [
  "super_admin",
  "admin",
  "hod",
  "pm",
  "instructor",
  "talent",
  "student",
  "client",
];

async function fetchPrimaryRole(userId: string): Promise<AppRole | null> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error || !data?.length) return null;
  const roles = data.map((r) => r.role as AppRole);
  return ROLE_PRIORITY.find((r) => roles.includes(r)) ?? roles[0];
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        setTimeout(() => {
          fetchPrimaryRole(s.user.id).then(setRole);
        }, 0);
      } else {
        setRole(null);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) fetchPrimaryRole(data.session.user.id).then(setRole);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value: AuthState = {
    session,
    user: session?.user ?? null,
    role,
    loading,
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}

export function roleHome(role: AppRole | null | undefined): string {
  return role ? ROLE_HOME[role] : "/dashboard/client";
}