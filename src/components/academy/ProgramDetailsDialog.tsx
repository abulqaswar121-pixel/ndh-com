import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, Award, CheckCircle2, GraduationCap, BookOpen, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/lib/currency";
import { useAuth } from "@/lib/auth";

type Course = {
  id: string; slug: string; program_name: string; program_type: string;
  description: string | null; overview: string | null;
  duration: string | null; tuition_ngn: number; cover_image: string | null;
  what_youll_learn: string[] | null; entry_requirements: string | null;
  schedule_text: string | null; certification_text: string | null;
};

export function ProgramDetailsDialog({ slug, open, onOpenChange }: { slug: string | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { format } = useCurrency();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!slug || !open) return;
    setLoading(true); setCourse(null);
    supabase.from("courses").select("*").eq("slug", slug).maybeSingle().then(({ data }) => {
      setCourse(data as Course | null); setLoading(false);
    });
  }, [slug, open]);

  const learn = (course?.what_youll_learn as string[] | null) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {loading || !course ? (
          <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            {course.cover_image && (
              <div className="-m-6 mb-0 h-40 overflow-hidden rounded-t-lg">
                <img src={course.cover_image} alt="" className="h-full w-full object-cover" />
              </div>
            )}
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="capitalize"><GraduationCap className="mr-1 h-3 w-3" />{course.program_type}</Badge>
                {course.duration && <Badge variant="outline"><Clock className="mr-1 h-3 w-3" />{course.duration}</Badge>}
              </div>
              <DialogTitle className="text-2xl">{course.program_name}</DialogTitle>
              <DialogDescription>{course.overview || course.description}</DialogDescription>
            </DialogHeader>

            <div className="grid gap-5">
              <div className="rounded-2xl border border-border bg-gradient-to-br from-secondary/60 to-secondary/20 p-5">
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tuition</div>
                <div className="mt-1 text-3xl font-extrabold text-gradient-brand">{format(Number(course.tuition_ngn))}</div>
                <div className="text-xs text-muted-foreground">Geo-priced · pay in your local currency · installment plans available</div>
              </div>

              {learn.length > 0 && (
                <div>
                  <h4 className="font-bold"><BookOpen className="mr-1 inline h-4 w-4" />What you'll acquire</h4>
                  <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                    {learn.map((x, i) => (
                      <li key={i} className="flex items-start gap-2 rounded-lg border border-border bg-card p-3 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.78_0.13_180)]" />
                        <span>{x}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {course.entry_requirements && (
                <div>
                  <h4 className="font-bold">Entry criteria</h4>
                  <p className="mt-2 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground whitespace-pre-line">{course.entry_requirements}</p>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                {course.schedule_text && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[oklch(0.65_0.19_252)]"><Calendar className="h-3.5 w-3.5" />Schedule</div>
                    <p className="mt-1.5 text-sm">{course.schedule_text}</p>
                  </div>
                )}
                {course.certification_text && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[oklch(0.65_0.19_252)]"><Award className="h-3.5 w-3.5" />Certification</div>
                    <p className="mt-1.5 text-sm">{course.certification_text}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/academy/course/$slug" params={{ slug: course.slug }} className="flex-1">
                  <Button variant="outline" className="w-full">View full page</Button>
                </Link>
                {user ? (
                  <Link to="/academy/apply/$slug" params={{ slug: course.slug }} className="flex-1">
                    <Button variant="brand" className="w-full">Apply now</Button>
                  </Link>
                ) : (
                  <a href={`/signup?role=student&next=${encodeURIComponent(`/academy/apply/${course.slug}`)}`} className="flex-1">
                    <Button variant="brand" className="w-full">Sign up to apply</Button>
                  </a>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}