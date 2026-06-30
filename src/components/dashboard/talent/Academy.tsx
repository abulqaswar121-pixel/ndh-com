import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap } from "lucide-react";

export function TalentAcademy() {
  const [courses, setCourses] = useState<any[]>([]);
  useEffect(() => { supabase.from("courses").select("*").limit(12).then(({ data }) => setCourses(data || [])); }, []);
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">NDH Academy</h1>
        <p className="text-sm text-muted-foreground">Free and discounted courses for talents — upgrade your skills, raise your tier.</p>
      </div>
      {courses.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-border p-16 text-center">
          <GraduationCap className="h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Course catalogue launching with Phase 3. Stay tuned.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.level || "Course"}</div>
              <div className="mt-1 text-base font-bold">{c.title}</div>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{c.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}