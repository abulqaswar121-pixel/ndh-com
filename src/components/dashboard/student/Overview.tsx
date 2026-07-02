import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, GraduationCap, Award, PlayCircle } from "lucide-react";
import { InstallAppBanner } from "@/components/site/InstallApp";
import {
  verifyPaystackReference,
  verifyMyPendingPayments,
} from "@/lib/payments/verify.functions";
import { toast } from "sonner";

type EnrolledCourse = {
  id: string;
  progress: number;
  status: string;
  course: { id: string; slug: string; program_name: string; cover_image: string | null; program_type: string; duration: string | null } | null;
};

export function StudentOverview({ onBrowse }: { onBrowse: () => void }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [certCount, setCertCount] = useState(0);
  const verifyRef = useServerFn(verifyPaystackReference);
  const verifyPending = useServerFn(verifyMyPendingPayments);
  const [reloadKey, setReloadKey] = useState(0);

  // Reconcile any Paystack payment that landed us here via callback
  useEffect(() => {
    if (!user) return;
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("reference") || params.get("trxref");
      try {
        if (ref) {
          const res: any = await verifyRef({ data: { reference: ref } });
          if (res?.ok) {
            toast.success("Payment confirmed — course unlocked");
            const url = new URL(window.location.href);
            url.searchParams.delete("reference");
            url.searchParams.delete("trxref");
            window.history.replaceState({}, "", url.toString());
            setReloadKey((k) => k + 1);
          }
        } else {
          const res: any = await verifyPending({});
          if (res?.updated > 0) {
            toast.success("Enrollment confirmed");
            setReloadKey((k) => k + 1);
          }
        }
      } catch {/* ignore */}
    })();
  }, [user, verifyRef, verifyPending]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: profile }, { data: enrolls }, { count: certs }] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
        supabase
          .from("enrollments")
          .select("id,progress,status,course:courses(id,slug,program_name,cover_image,program_type,duration)")
          .eq("student_id", user.id)
          .eq("status", "active")
          .order("created_at", { ascending: false }),
        supabase.from("certificates").select("*", { count: "exact", head: true }).eq("student_id", user.id),
      ]);
      setName(profile?.full_name || "there");
      setCourses((enrolls as unknown as EnrolledCourse[]) || []);
      setCertCount(certs || 0);
    })();
  }, [user, reloadKey]);

  const active = courses.length;
  const completed = courses.filter((c) => c.progress >= 100).length;
  const avgProgress = active ? Math.round(courses.reduce((s, c) => s + (c.progress || 0), 0) / active) : 0;

  const cards = [
    { label: "Active Courses", value: active, icon: BookOpen, color: "from-blue-500 to-indigo-600" },
    { label: "Completed", value: completed, icon: GraduationCap, color: "from-emerald-500 to-teal-600" },
    { label: "Avg. Progress", value: `${avgProgress}%`, icon: PlayCircle, color: "from-amber-500 to-orange-600" },
    { label: "Certificates", value: certCount, icon: Award, color: "from-fuchsia-500 to-purple-600" },
  ];

  return (
    <div className="space-y-8">
      <InstallAppBanner />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Welcome back, {name.split(" ")[0]}.</h1>
          <p className="mt-1 text-sm text-muted-foreground">Continue your learning journey with NDH Academy.</p>
        </div>
        <Button variant="brand" onClick={onBrowse}><BookOpen className="h-4 w-4" /> Browse Catalogue</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-5">
            <div className={`mb-3 inline-grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${c.color} text-white`}>
              <c.icon className="h-5 w-5" />
            </div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</div>
            <div className="mt-1 text-2xl font-extrabold">{c.value}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold">Continue Learning</h2>
        {courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <GraduationCap className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">You're not enrolled in any active courses yet.</p>
            <Button className="mt-4" variant="brand" onClick={onBrowse}>Browse Academy</Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((e) => e.course && (
              <Link
                key={e.id}
                to="/dashboard/student/course/$id"
                params={{ id: e.course.id }}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-glow"
              >
                <div
                  className="aspect-video w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${e.course.cover_image || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800"})` }}
                />
                <div className="p-4">
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-primary">{e.course.program_type}</div>
                  <div className="font-bold leading-tight group-hover:text-primary">{e.course.program_name}</div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{e.progress}% complete</span>
                    <span>{e.course.duration}</span>
                  </div>
                  <Progress value={e.progress || 0} className="mt-2" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}