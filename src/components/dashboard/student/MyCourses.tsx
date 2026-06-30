import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

type Enrollment = {
  id: string;
  progress: number;
  status: string;
  payment_status: string | null;
  created_at: string;
  course: { id: string; slug: string; program_name: string; cover_image: string | null; program_type: string; duration: string | null } | null;
};

export function MyCourses() {
  const { user } = useAuth();
  const [enrolls, setEnrolls] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("enrollments")
      .select("id,progress,status,payment_status,created_at,course:courses(id,slug,program_name,cover_image,program_type,duration)")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setEnrolls((data as unknown as Enrollment[]) || []);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <div className="text-sm text-muted-foreground">Loading your courses…</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">My Courses</h1>
      {enrolls.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
          No enrollments yet. Visit <Link to="/academy" className="text-primary underline">/academy</Link> to apply.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {enrolls.map((e) => e.course && (
            <div key={e.id} className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex gap-4 p-4">
                <div
                  className="h-24 w-32 shrink-0 rounded-xl bg-cover bg-center"
                  style={{ backgroundImage: `url(${e.course.cover_image || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400"})` }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-primary">{e.course.program_type}</div>
                      <div className="truncate font-bold">{e.course.program_name}</div>
                    </div>
                    <Badge variant={e.status === "active" ? "default" : "secondary"}>{e.status}</Badge>
                  </div>
                  <Progress value={e.progress || 0} className="mt-3" />
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{e.progress}% complete</span>
                    {e.status === "active" ? (
                      <Link to="/dashboard/student/course/$id" params={{ id: e.course.id }} className="font-semibold text-primary hover:underline">
                        Continue →
                      </Link>
                    ) : (
                      <span>Payment: {e.payment_status || "pending"}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}