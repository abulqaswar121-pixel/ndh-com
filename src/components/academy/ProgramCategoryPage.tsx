import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { CourseCard, type CourseCardData } from "./CourseCard";
import { supabase } from "@/integrations/supabase/client";
import { AnimatedBlobs } from "@/components/site/AnimatedBlobs";
import { GraduationCap } from "lucide-react";

export function ProgramCategoryPage({
  programType, tier, duration, blurb,
}: {
  programType: "certificate" | "diploma" | "professional";
  tier: string; duration: string; blurb: string;
}) {
  const [courses, setCourses] = useState<CourseCardData[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from("courses")
      .select("id,slug,program_name,description,duration,tuition_ngn,cover_image,rating,students_count")
      .eq("program_type", programType).eq("is_published", true)
      .order("program_name").then(({ data }) => {
        setCourses((data as CourseCardData[]) || []);
        setLoading(false);
      });
  }, [programType]);

  return (
    <SiteLayout>
      <section className="relative isolate overflow-hidden bg-hero py-20 text-white">
        <AnimatedBlobs />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest backdrop-blur">
            <GraduationCap className="h-3.5 w-3.5" /> {duration} programs
          </div>
          <h1 className="mt-4 max-w-4xl text-4xl font-extrabold sm:text-5xl">{tier}</h1>
          <p className="mt-3 max-w-2xl text-white/80">{blurb}</p>
        </div>
      </section>
      <Section>
        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-secondary/40" />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
        )}
      </Section>
    </SiteLayout>
  );
}