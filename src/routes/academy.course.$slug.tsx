import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/lib/currency";
import { useAuth } from "@/lib/auth";
import { Clock, Award, CheckCircle2, GraduationCap, PlayCircle, Lock, BookOpen, Calendar, Star } from "lucide-react";

type CourseRow = {
  id: string; slug: string; program_name: string; program_type: string;
  description: string | null; overview: string | null;
  duration: string | null; duration_months: number | null;
  tuition_ngn: number; cover_image: string | null;
  what_youll_learn: string[] | null;
  entry_requirements: string | null; schedule_text: string | null;
  certification_text: string | null; rating: number | null; students_count: number | null;
};
type ModuleRow = { id: string; title: string; description: string | null; position: number };
type LessonRow = { id: string; module_id: string; title: string; type: string; duration_minutes: number | null; position: number; is_preview: boolean };

export const Route = createFileRoute("/academy/course/$slug")({
  component: CourseDetail,
  errorComponent: ({ error }) => (
    <SiteLayout><div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-foreground">{(error as Error).message}</p>
      <Link to="/academy" className="mt-4 inline-block text-[oklch(0.65_0.19_252)] underline">Back to Academy</Link>
    </div></SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout><div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="text-2xl font-bold">Course not found</h1>
      <Link to="/academy" className="mt-4 inline-block text-[oklch(0.65_0.19_252)] underline">Back to Academy</Link>
    </div></SiteLayout>
  ),
});

function CourseDetail() {
  const { slug } = Route.useParams();
  const { format } = useCurrency();
  const { user } = useAuth();
  const [course, setCourse] = useState<CourseRow | null>(null);
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [lessonsByModule, setLessonsByModule] = useState<Record<string, LessonRow[]>>({});
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: c } = await supabase.from("courses").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
      if (cancelled) return;
      if (!c) { setMissing(true); setLoading(false); return; }
      setCourse(c as CourseRow);
      const { data: mods } = await supabase.from("modules").select("id,title,description,position").eq("course_id", c.id).order("position");
      const modList = (mods as ModuleRow[]) || [];
      setModules(modList);
      if (modList.length) {
        const { data: lessons } = await supabase.from("lessons")
          .select("id,module_id,title,type,duration_minutes,position,is_preview")
          .in("module_id", modList.map(m => m.id)).order("position");
        const grouped: Record<string, LessonRow[]> = {};
        ((lessons as LessonRow[]) || []).forEach((l) => { (grouped[l.module_id] ||= []).push(l); });
        setLessonsByModule(grouped);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (missing) throw notFound();
  if (loading || !course) {
    return <SiteLayout><div className="mx-auto max-w-6xl px-6 py-24">
      <div className="h-96 animate-pulse rounded-3xl bg-secondary/40" />
    </div></SiteLayout>;
  }

  const totalLessons = Object.values(lessonsByModule).reduce((a, b) => a + b.length, 0);
  const totalMinutes = Object.values(lessonsByModule).flat().reduce((a, b) => a + (b.duration_minutes || 0), 0);
  const learn = (course.what_youll_learn as unknown as string[]) || [];

  const ApplyButton = ({ className }: { className?: string }) =>
    user ? (
      <Link to="/academy/apply/$slug" params={{ slug: course.slug }} className={className}>
        <Button variant="brand" size="lg" className="w-full">Apply for this course</Button>
      </Link>
    ) : (
      <a
        href={`/signup?role=student&next=${encodeURIComponent(`/academy/apply/${course.slug}`)}`}
        className={className}
      >
        <Button variant="brand" size="lg" className="w-full">Sign up to apply</Button>
      </a>
    );

  return (
    <SiteLayout>
      <section className="relative isolate overflow-hidden bg-hero text-white">
        {course.cover_image && (
          <img src={course.cover_image} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, oklch(0.1 0.06 268 / 0.85), oklch(0.08 0.05 268 / 0.95))" }} />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest backdrop-blur">
              <GraduationCap className="h-3.5 w-3.5" /> {course.program_type} Program
            </div>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">{course.program_name}</h1>
            <p className="mt-4 max-w-2xl text-white/80">{course.overview || course.description}</p>
            <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-white/80">
              {course.duration && <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {course.duration}</span>}
              <span className="inline-flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> {modules.length} modules · {totalLessons} lessons</span>
              {course.rating && <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 fill-current text-amber-400" /> {course.rating} rating</span>}
            </div>
          </div>
          <aside className="self-start rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur">
            <div className="text-xs uppercase tracking-widest text-white/70">Tuition</div>
            <div className="mt-1 text-4xl font-extrabold">{format(Number(course.tuition_ngn))}</div>
            <div className="text-xs text-white/60">Geo-priced · pay in your local currency</div>
            <div className="mt-5"><ApplyButton className="block" /></div>
            <ul className="mt-5 space-y-2 text-sm text-white/80">
              <li className="flex items-center gap-2"><Award className="h-4 w-4 text-[oklch(0.78_0.13_180)]" /> Verifiable certificate (QR)</li>
              <li className="flex items-center gap-2"><PlayCircle className="h-4 w-4 text-[oklch(0.78_0.13_180)]" /> Live + recorded classes</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[oklch(0.78_0.13_180)]" /> Talent pool pipeline</li>
            </ul>
          </aside>
        </div>
      </section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-10">
            {learn.length > 0 && (
              <div>
                <h2 className="text-2xl font-extrabold">What you'll learn</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {learn.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 rounded-xl border border-border bg-card p-4 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.78_0.13_180)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h2 className="text-2xl font-extrabold">Curriculum</h2>
              <p className="mt-1 text-sm text-muted-foreground">{modules.length} modules · {totalLessons} lessons · ~{Math.round(totalMinutes/60)} hours</p>
              <Accordion type="single" collapsible className="mt-4 rounded-2xl border border-border bg-card px-4">
                {modules.map((m) => (
                  <AccordionItem key={m.id} value={m.id}>
                    <AccordionTrigger>
                      <span className="flex-1 text-left">
                        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Module {m.position + 1}</span>
                        <span className="block font-bold">{m.title}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-3 text-sm text-muted-foreground">{m.description}</p>
                      <ul className="space-y-2">
                        {(lessonsByModule[m.id] || []).map((l) => (
                          <li key={l.id} className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/60 p-3 text-sm">
                            {l.is_preview ? <PlayCircle className="h-4 w-4 text-[oklch(0.65_0.19_252)]" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                            <span className="flex-1">{l.title}</span>
                            {l.duration_minutes && <span className="text-xs text-muted-foreground">{l.duration_minutes} min</span>}
                            {l.is_preview && <span className="rounded-full bg-[oklch(0.65_0.19_252)]/10 px-2 py-0.5 text-xs font-semibold text-[oklch(0.65_0.19_252)]">Preview</span>}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {course.entry_requirements && (
              <div>
                <h2 className="text-2xl font-extrabold">Entry requirements</h2>
                <p className="mt-3 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">{course.entry_requirements}</p>
              </div>
            )}
          </div>

          <aside className="space-y-5">
            {course.schedule_text && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[oklch(0.65_0.19_252)]"><Calendar className="h-4 w-4" /> Schedule</div>
                <p className="mt-2 text-sm">{course.schedule_text}</p>
              </div>
            )}
            {course.certification_text && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[oklch(0.65_0.19_252)]"><Award className="h-4 w-4" /> Certification</div>
                <p className="mt-2 text-sm">{course.certification_text}</p>
              </div>
            )}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="text-xs font-semibold uppercase tracking-widest text-[oklch(0.65_0.19_252)]">Instructor</div>
              <p className="mt-2 text-sm text-muted-foreground">An NDH industry instructor will be assigned to your cohort. Profile published 2 weeks before cohort start.</p>
            </div>
            <ApplyButton className="block" />
          </aside>
        </div>
      </Section>
    </SiteLayout>
  );
}