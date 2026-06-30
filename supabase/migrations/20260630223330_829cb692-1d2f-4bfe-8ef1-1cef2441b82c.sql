
-- Phase 8: Instructor portal — assignments, submissions, live classes

CREATE TABLE IF NOT EXISTS public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id uuid REFERENCES public.modules(id) ON DELETE SET NULL,
  title text NOT NULL,
  instructions text,
  max_score integer NOT NULL DEFAULT 100,
  due_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS assignments_course_idx ON public.assignments(course_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignments TO authenticated;
GRANT ALL ON public.assignments TO service_role;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students read assignments of enrolled courses" ON public.assignments
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.enrollments e WHERE e.course_id = assignments.course_id AND e.student_id = auth.uid() AND e.status='active')
    OR EXISTS (SELECT 1 FROM public.courses c WHERE c.id = assignments.course_id AND (c.instructor_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'hod')))
  );
CREATE POLICY "instructor manages assignments" ON public.assignments
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.courses c WHERE c.id = assignments.course_id AND (c.instructor_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'hod')))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.courses c WHERE c.id = assignments.course_id AND (c.instructor_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'hod')))
  );

CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text,
  files jsonb DEFAULT '[]'::jsonb,
  score integer,
  feedback text,
  status text NOT NULL DEFAULT 'submitted',
  graded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  graded_at timestamptz,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);
CREATE INDEX IF NOT EXISTS sub_assignment_idx ON public.assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS sub_student_idx ON public.assignment_submissions(student_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignment_submissions TO authenticated;
GRANT ALL ON public.assignment_submissions TO service_role;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "student manages own submission" ON public.assignment_submissions
  FOR ALL TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
CREATE POLICY "instructor reads & grades submissions" ON public.assignment_submissions
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.assignments a JOIN public.courses c ON c.id=a.course_id
            WHERE a.id = assignment_submissions.assignment_id
              AND (c.instructor_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'hod')))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.assignments a JOIN public.courses c ON c.id=a.course_id
            WHERE a.id = assignment_submissions.assignment_id
              AND (c.instructor_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'hod')))
  );

CREATE TABLE IF NOT EXISTS public.live_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  meeting_url text,
  starts_at timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  recording_url text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS lc_course_idx ON public.live_classes(course_id);
CREATE INDEX IF NOT EXISTS lc_starts_idx ON public.live_classes(starts_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.live_classes TO authenticated;
GRANT ALL ON public.live_classes TO service_role;
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "enrolled students read live classes" ON public.live_classes
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.enrollments e WHERE e.course_id = live_classes.course_id AND e.student_id = auth.uid() AND e.status='active')
    OR EXISTS (SELECT 1 FROM public.courses c WHERE c.id = live_classes.course_id AND (c.instructor_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'hod')))
  );
CREATE POLICY "instructor manages live classes" ON public.live_classes
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.courses c WHERE c.id = live_classes.course_id AND (c.instructor_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'hod')))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.courses c WHERE c.id = live_classes.course_id AND (c.instructor_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'hod')))
  );

CREATE TRIGGER trg_assignments_updated BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_assignment_submissions_updated BEFORE UPDATE ON public.assignment_submissions FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_live_classes_updated BEFORE UPDATE ON public.live_classes FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Instructor roster RPC: list enrolled students for an instructor's course
CREATE OR REPLACE FUNCTION public.get_course_roster(_course_id uuid)
RETURNS TABLE(student_id uuid, full_name text, email text, progress integer, enrolled_at timestamptz, status text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT e.student_id, p.full_name, p.email, COALESCE(e.progress,0), e.created_at, e.status
    FROM public.enrollments e
    JOIN public.profiles p ON p.id = e.student_id
   WHERE e.course_id = _course_id
     AND (
       EXISTS (SELECT 1 FROM public.courses c WHERE c.id = _course_id AND c.instructor_id = auth.uid())
       OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'hod')
     )
   ORDER BY e.created_at DESC;
$$;
