
-- ============ COURSES: extend ============
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS overview text,
  ADD COLUMN IF NOT EXISTS what_youll_learn jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS learning_outcomes jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS entry_requirements text,
  ADD COLUMN IF NOT EXISTS schedule_text text,
  ADD COLUMN IF NOT EXISTS certification_text text,
  ADD COLUMN IF NOT EXISTS duration_months int,
  ADD COLUMN IF NOT EXISTS rating numeric(3,2) DEFAULT 4.8,
  ADD COLUMN IF NOT EXISTS students_count int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS courses_slug_idx ON public.courses(slug);
CREATE INDEX IF NOT EXISTS courses_program_type_idx ON public.courses(program_type);

DROP TRIGGER IF EXISTS courses_set_updated_at ON public.courses;
CREATE TRIGGER courses_set_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ MODULES ============
CREATE TABLE IF NOT EXISTS public.modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.modules TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.modules TO authenticated;
GRANT ALL ON public.modules TO service_role;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads modules of published courses" ON public.modules
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.is_published = true)
  );
CREATE POLICY "Instructor/admin manages modules" ON public.modules
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id
            AND (c.instructor_id = auth.uid()
                 OR public.has_role(auth.uid(),'admin')
                 OR public.has_role(auth.uid(),'super_admin')
                 OR public.has_role(auth.uid(),'hod')))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id
            AND (c.instructor_id = auth.uid()
                 OR public.has_role(auth.uid(),'admin')
                 OR public.has_role(auth.uid(),'super_admin')
                 OR public.has_role(auth.uid(),'hod')))
  );

DROP TRIGGER IF EXISTS modules_set_updated_at ON public.modules;
CREATE TRIGGER modules_set_updated_at BEFORE UPDATE ON public.modules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS modules_course_id_idx ON public.modules(course_id);

-- ============ LESSONS ============
DO $$ BEGIN
  CREATE TYPE public.lesson_type AS ENUM ('video','pdf','text','quiz');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  type public.lesson_type NOT NULL DEFAULT 'video',
  content_url text,
  content_text text,
  duration_minutes int,
  position int NOT NULL DEFAULT 0,
  is_preview boolean NOT NULL DEFAULT false,
  resources jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lessons TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lessons TO authenticated;
GRANT ALL ON public.lessons TO service_role;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Lesson metadata readable to anyone (titles, durations) for public curriculum view.
CREATE POLICY "Anyone reads lessons of published courses" ON public.lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.courses c ON c.id = m.course_id
      WHERE m.id = module_id AND c.is_published = true
    )
  );
CREATE POLICY "Instructor/admin manages lessons" ON public.lessons
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.courses c ON c.id = m.course_id
      WHERE m.id = module_id
        AND (c.instructor_id = auth.uid()
             OR public.has_role(auth.uid(),'admin')
             OR public.has_role(auth.uid(),'super_admin')
             OR public.has_role(auth.uid(),'hod'))
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.courses c ON c.id = m.course_id
      WHERE m.id = module_id
        AND (c.instructor_id = auth.uid()
             OR public.has_role(auth.uid(),'admin')
             OR public.has_role(auth.uid(),'super_admin')
             OR public.has_role(auth.uid(),'hod'))
    )
  );

DROP TRIGGER IF EXISTS lessons_set_updated_at ON public.lessons;
CREATE TRIGGER lessons_set_updated_at BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS lessons_module_id_idx ON public.lessons(module_id);

-- Server-side function to fetch full lesson content (enforces enrollment).
CREATE OR REPLACE FUNCTION public.get_lesson_content(_lesson_id uuid)
RETURNS public.lessons
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  l public.lessons;
  cid uuid;
  is_preview boolean;
BEGIN
  SELECT * INTO l FROM public.lessons WHERE id = _lesson_id;
  IF l.id IS NULL THEN RETURN NULL; END IF;
  SELECT m.course_id, l.is_preview INTO cid, is_preview FROM public.modules m WHERE m.id = l.module_id;
  IF l.is_preview THEN RETURN l; END IF;
  IF EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.student_id = auth.uid() AND e.course_id = cid AND e.status = 'active'
  ) THEN
    RETURN l;
  END IF;
  IF public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin')
     OR public.has_role(auth.uid(),'hod') OR public.has_role(auth.uid(),'instructor') THEN
    RETURN l;
  END IF;
  RETURN NULL;
END $$;

-- ============ LESSON PROGRESS ============
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  completed boolean NOT NULL DEFAULT false,
  notes text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, lesson_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_progress TO authenticated;
GRANT ALL ON public.lesson_progress TO service_role;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Student manages own progress" ON public.lesson_progress
  FOR ALL TO authenticated
  USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

DROP TRIGGER IF EXISTS lesson_progress_set_updated_at ON public.lesson_progress;
CREATE TRIGGER lesson_progress_set_updated_at BEFORE UPDATE ON public.lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ ENROLLMENTS: extend ============
ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending_payment',
  ADD COLUMN IF NOT EXISTS motivation_essay text,
  ADD COLUMN IF NOT EXISTS personal_info jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS education_background jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Default new enrollments to 'pending_payment' until paid (existing default of 'active' was wrong for academy flow).
ALTER TABLE public.enrollments ALTER COLUMN status SET DEFAULT 'pending_payment';

DROP TRIGGER IF EXISTS enrollments_set_updated_at ON public.enrollments;
CREATE TRIGGER enrollments_set_updated_at BEFORE UPDATE ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS enrollments_student_idx ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS enrollments_course_idx ON public.enrollments(course_id);

-- ============ CERTIFICATES: extend ============
ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS pdf_url text,
  ADD COLUMN IF NOT EXISTS verification_token text UNIQUE DEFAULT replace(gen_random_uuid()::text,'-','');

CREATE INDEX IF NOT EXISTS certificates_token_idx ON public.certificates(verification_token);
CREATE INDEX IF NOT EXISTS certificates_student_idx ON public.certificates(student_id);

GRANT SELECT ON public.certificates TO anon;  -- public verify by token
