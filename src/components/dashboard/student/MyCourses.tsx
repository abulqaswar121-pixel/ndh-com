import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Loader2 } from "lucide-react";
import { issueCertificate } from "@/lib/academy/certificate.functions";
import { toast } from "sonner";

type Enrollment = {
  id: string;
  progress: number;
  status: string;
  payment_status: string | null;
  created_at: string;
  course_id: string;
  course?: { id: string; slug: string; program_name: string; cover_image: string | null; program_type: string; duration: string | null } | null;
  academy_course?: { id: string; slug: string; name: string; description: string | null } | null;
};

export function MyCourses() {
  const { user } = useAuth();
  const [enrolls, setEnrolls] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [certByCourse, setCertByCourse] = useState<Record<string, string>>({});
  const issueFn = useServerFn(issueCertificate);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Fetch raw enrollments
      const { data: raw } = await supabase
        .from("enrollments")
        .select("id,progress,status,payment_status,created_at,course_id")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });

      const list = (raw as any[]) || [];
      if (!list.length) { setEnrolls([]); setLoading(false); return; }

      // Try to resolve each course_id to academy_courses first, then legacy courses
      const academyIds = list.map(r => r.course_id);
      const [{ data: acad }, { data: leg }] = await Promise.all([
        supabase.from("academy_courses").select("id,slug,name,description").in("id", academyIds),
        supabase.from("courses").select("id,slug,program_name,cover_image,program_type,duration").in("id", academyIds),
      ]);

      const acadMap = new Map((acad || []).map((c: any) => [c.id, c]));
      const legMap = new Map((leg || []).map((c: any) => [c.id, c]));

      const enriched: Enrollment[] = list.map(r => ({
        ...r,
        academy_course: acadMap.get(r.course_id) || null,
        course: legMap.get(r.course_id) || null,
      }));
      setEnrolls(enriched);
      setLoading(false);
    })();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    supabase.from("certificates").select("course_id, certificate_number").eq("student_id", user.id)
      .then(({ data }) => {
        const map: Record<string, string> = {};
        for (const r of data || []) if (r.course_id) map[r.course_id] = r.certificate_number;
        setCertByCourse(map);
      });
  }, [user, claiming]);

  async function claim(enrollmentId: string) {
    setClaiming(enrollmentId);
    try {
      await issueFn({ data: { enrollmentId } });
      toast.success("Certificate issued! Check your Certificates tab.");
      navigate({ to: "/dashboard/student", search: { tab: "certificates" } });
    } catch (err: any) {
      toast.error(err?.message || "Could not issue certificate");
    } finally {
      setClaiming(null);
    }
  }

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
          {enrolls.map((e) => {
            const isAcademy = !!e.academy_course;
            const title = isAcademy ? e.academy_course!.name : e.course?.program_name || "Course";
            const slug = isAcademy ? e.academy_course!.slug : e.course?.slug;
            const cover = e.course?.cover_image || null;
            const type = isAcademy ? "AI Academy" : e.course?.program_type || "Course";
            return (
              <div key={e.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="flex gap-4 p-4">
                  <div
                    className="h-24 w-32 shrink-0 rounded-xl bg-cover bg-center bg-secondary"
                    style={{ backgroundImage: `url(${cover || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400"})` }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-primary">{type}</div>
                        <div className="truncate font-bold">{title}</div>
                      </div>
                      <Badge variant={e.status === "active" ? "default" : "secondary"}>{e.status}</Badge>
                    </div>
                    <Progress value={e.progress || 0} className="mt-3" />
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{e.progress}% complete</span>
                      {e.status === "active" && slug ? (
                        <Link to="/academy/learn/$slug" params={{ slug }} className="font-semibold text-primary hover:underline">
                          Continue →
                        </Link>
                      ) : (
                        <span>Payment: {e.payment_status || "pending"}</span>
                      )}
                    </div>
                    {e.status === "active" && (e.progress ?? 0) >= 100 && (
                      <div className="mt-3">
                        {certByCourse[e.course_id] ? (
                          <Link to="/dashboard/student" search={{ tab: "certificates" }} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                            <Award className="h-3.5 w-3.5" /> View certificate {certByCourse[e.course_id]}
                          </Link>
                        ) : (
                          <Button size="sm" variant="brand" onClick={() => claim(e.id)} disabled={claiming === e.id}>
                            {claiming === e.id ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Issuing…</> : <><Award className="mr-2 h-3.5 w-3.5" /> Claim certificate</>}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
