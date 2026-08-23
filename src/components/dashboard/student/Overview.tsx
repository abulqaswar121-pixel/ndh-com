import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, GraduationCap, Award, PlayCircle, Globe, ShieldCheck } from "lucide-react";
import { InstallAppBanner } from "@/components/site/InstallApp";
import { SetPasswordNudge } from "@/components/auth/SetPasswordNudge";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { verifyPaystackReference, verifyMyPendingPayments } from "@/lib/payments/verify.functions";
import { toast } from "sonner";

type EnrolledCourse = {
  id: string; progress: number; status: string; course_id: string;
  course: { id: string; slug: string; program_name: string; cover_image: string | null; program_type: string; duration: string | null } | null;
  academy_course: { id: string; slug: string; name: string } | null;
};

export function StudentOverview({ onBrowse }: { onBrowse: () => void }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [certCount, setCertCount] = useState(0);
  const verifyRef = useServerFn(verifyPaystackReference);
  const verifyPending = useServerFn(verifyMyPendingPayments);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("reference") || params.get("trxref");
      try {
        if (ref) {
          const res: any = await verifyRef({ data: { reference: ref } });
          if (res?.ok) { toast.success("Payment confirmed — course unlocked worldwide"); const url = new URL(window.location.href); url.searchParams.delete("reference"); url.searchParams.delete("trxref"); window.history.replaceState({}, "", url.toString()); setReloadKey((k) => k + 1); }
        } else { const res: any = await verifyPending({}); if (res?.updated > 0) { toast.success("Enrollment confirmed worldwide"); setReloadKey((k) => k + 1); } }
      } catch {}
    })();
  }, [user, verifyRef, verifyPending]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: profile }, { data: raw }, { count: certs }] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
        supabase.from("enrollments").select("id,progress,status,course_id").eq("student_id", user.id).eq("status", "active").order("created_at", { ascending: false }),
        supabase.from("certificates").select("*", { count: "exact", head: true }).eq("student_id", user.id),
      ]);
      setName(profile?.full_name || "there");
      const list = (raw as any[]) || [];
      if (!list.length) { setCourses([]); setCertCount(certs || 0); return; }
      const ids = list.map(r => r.course_id);
      const [{ data: acad }, { data: leg }] = await Promise.all([
        supabase.from("academy_courses").select("id,slug,name").in("id", ids),
        supabase.from("courses").select("id,slug,program_name,cover_image,program_type,duration").in("id", ids),
      ]);
      const acadMap = new Map((acad || []).map((c: any) => [c.id, c]));
      const legMap = new Map((leg || []).map((c: any) => [c.id, c]));
      const enriched = list.map(r => ({ id: r.id, progress: r.progress, status: r.status, course_id: r.course_id, academy_course: acadMap.get(r.course_id) || null, course: legMap.get(r.course_id) || null }));
      setCourses(enriched as any); setCertCount(certs || 0);
    })();
  }, [user, reloadKey]);

  const active = courses.length;
  const completed = courses.filter((c) => c.progress >= 100).length;
  const avgProgress = active ? Math.round(courses.reduce((s, c) => s + (c.progress || 0), 0) / active) : 0;

  const cards = [
    { label: "Active Courses", value: active, icon: BookOpen, color: "from-blue-500 to-indigo-600" },
    { label: "Completed", value: completed, icon: GraduationCap, color: "from-emerald-500 to-teal-600" },
    { label: "Avg. Progress", value: `${avgProgress}%`, icon: PlayCircle, color: "from-amber-500 to-orange-600" },
    { label: "Certificates — QR Verified Worldwide", value: certCount, icon: Award, color: "from-fuchsia-500 to-purple-600" },
  ];

  return (
    <div className="space-y-8">
      <InstallAppBanner />
      <SetPasswordNudge settingsHref="/dashboard/student/settings" />
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground"><Globe className="h-3.5 w-3.5" /> 40 AI Courses • QR-Verified • Talent Pipeline • Worldwide</div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Welcome back, {name.split(" ")[0]} Academy</h1>
            <p className="mt-1 text-sm text-muted-foreground">Continue your learning journey with NDH Academy — curated from YouTube, implement tomorrow, worldwide trusted, HQ Nigeria → Worldwide.</p>
          </div>
          <Button variant="brand" onClick={onBrowse}><BookOpen className="h-4 w-4" /> Browse Catalogue 40</Button>
        </div>
      </Reveal>

      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <StaggerItem key={c.label}>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md">
              <div className={`mb-3 inline-grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${c.color} text-white`}><c.icon className="h-5 w-5" /></div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</div>
              <div className="mt-1 text-2xl font-extrabold tracking-tight">{c.value}</div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal>
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><BookOpen className="h-5 w-5" /> Continue Learning • No Coming Soon, All 40 Available</h2>
          {courses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <GraduationCap className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium">You're not enrolled in any active courses yet</p>
              <p className="mt-1 text-xs text-muted-foreground">40 AI courses curated from YouTube, fair pricing NG ₦4,900-9,900 Global $9-19, QR-verified, talent pipeline worldwide.</p>
              <Button className="mt-4" variant="brand" onClick={onBrowse}><Globe className="mr-1 h-4 w-4" /> Browse 40 AI Courses Worldwide</Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((e) => {
                const isAcademy = !!e.academy_course;
                const title = isAcademy ? e.academy_course!.name : e.course?.program_name || "Course";
                const slug = isAcademy ? e.academy_course!.slug : e.course?.slug;
                const cover = e.course?.cover_image || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800";
                const type = isAcademy ? "AI Academy" : e.course?.program_type || "";
                if (!slug) return null;
                return (
                  <Link key={e.id} to={isAcademy ? "/academy/learn/$slug" : "/academy/course/$slug"} params={{ slug }} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md">
                    <div className="aspect-video w-full bg-cover bg-center" style={{ backgroundImage: `url(${cover})` }} />
                    <div className="p-4">
                      <div className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary"><ShieldCheck className="h-3 w-3" /> {type}</div>
                      <div className="font-bold leading-tight group-hover:text-primary">{title}</div>
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground"><span>{e.progress}% complete</span><span>QR Verified</span></div>
                      <Progress value={e.progress || 0} className="mt-2" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}

function ShieldCheck(props:any){return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>}
