
-- 1. academy_lesson_progress: watched lessons per student
CREATE TABLE public.academy_lesson_progress (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.academy_lessons(id) ON DELETE CASCADE,
  watched_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);
GRANT SELECT, INSERT, DELETE ON public.academy_lesson_progress TO authenticated;
GRANT ALL ON public.academy_lesson_progress TO service_role;
ALTER TABLE public.academy_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lesson_progress_own_select" ON public.academy_lesson_progress
  FOR SELECT TO authenticated
  USING (user_id = auth.uid()
    OR public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'hod'));
CREATE POLICY "lesson_progress_own_insert" ON public.academy_lesson_progress
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "lesson_progress_own_delete" ON public.academy_lesson_progress
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 2. academy_exam_attempts
CREATE TABLE public.academy_exam_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.academy_courses(id) ON DELETE CASCADE,
  paper jsonb NOT NULL,           -- generated questions (no correct answers to leak; store separately in server memory only)
  answer_key jsonb,                -- mcq correct indices, kept server-side for grading
  answers jsonb,                   -- student answers
  mcq_score numeric,
  ai_short_score numeric,
  ai_essay_score numeric,
  total_score numeric,
  passed boolean,
  started_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.academy_exam_attempts TO authenticated;
GRANT ALL ON public.academy_exam_attempts TO service_role;
ALTER TABLE public.academy_exam_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exam_attempts_own_rw" ON public.academy_exam_attempts
  FOR SELECT TO authenticated
  USING (user_id = auth.uid()
    OR public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'hod'));
CREATE POLICY "exam_attempts_own_insert" ON public.academy_exam_attempts
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "exam_attempts_own_update" ON public.academy_exam_attempts
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX academy_exam_attempts_user_course_idx
  ON public.academy_exam_attempts(user_id, course_id, created_at DESC);

-- 3. academy_project_submissions
CREATE TABLE public.academy_project_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.academy_courses(id) ON DELETE CASCADE,
  brief text NOT NULL,
  content text,
  file_url text,
  ai_score numeric,
  ai_feedback jsonb,
  ai_verdict text,                 -- 'pass' | 'revise' | 'fail'
  status text NOT NULL DEFAULT 'draft',   -- 'draft' | 'submitted' | 'approved' | 'rejected'
  director_note text,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.academy_project_submissions TO authenticated;
GRANT ALL ON public.academy_project_submissions TO service_role;
ALTER TABLE public.academy_project_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_own_select" ON public.academy_project_submissions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid()
    OR public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'hod'));
CREATE POLICY "project_own_insert" ON public.academy_project_submissions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "project_own_update" ON public.academy_project_submissions
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid()
    OR public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'hod'))
  WITH CHECK (user_id = auth.uid()
    OR public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'hod'));

CREATE TRIGGER project_submissions_updated
  BEFORE UPDATE ON public.academy_project_submissions
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 4. Extend academy_courses with objectives + project theme
ALTER TABLE public.academy_courses
  ADD COLUMN IF NOT EXISTS learning_objectives text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS project_theme text;

-- 5. Extend certificates with pipeline status (safe default: existing certs treated as issued)
ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS pipeline_status text NOT NULL DEFAULT 'issued';
-- pipeline_status ∈ ('pending_countersign','director_signed','founder_signed','issued')
