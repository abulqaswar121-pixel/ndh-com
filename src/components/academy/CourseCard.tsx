import { Link } from "@tanstack/react-router";
import { useCurrency } from "@/lib/currency";
import { ArrowRight, Clock, Star } from "lucide-react";

export type CourseCardData = {
  id: string;
  slug: string;
  program_name: string;
  description: string | null;
  duration: string | null;
  tuition_ngn: number;
  cover_image: string | null;
  rating: number | null;
  students_count: number | null;
};

export function CourseCard({ course }: { course: CourseCardData }) {
  const { format } = useCurrency();
  return (
    <Link
      to="/academy/course/$slug"
      params={{ slug: course.slug }}
      className="group block overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-[oklch(0.65_0.19_252)]/40 hover:shadow-elegant"
    >
      <div className="aspect-[16/10] overflow-hidden bg-secondary">
        {course.cover_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={course.cover_image} alt={course.program_name} loading="lazy"
               className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {course.duration && (<span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {course.duration}</span>)}
          {course.rating && (<span className="inline-flex items-center gap-1"><Star className="h-3 w-3 fill-current text-amber-500" /> {course.rating}</span>)}
        </div>
        <h3 className="mt-2 font-bold leading-snug">{course.program_name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-base font-extrabold text-gradient-brand">{format(Number(course.tuition_ngn))}</span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[oklch(0.65_0.19_252)]">
            Learn more <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}