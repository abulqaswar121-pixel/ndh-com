
CREATE TABLE public.admissions_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  applicant_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  intake TEXT,
  prior_education TEXT,
  documents JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'submitted',
  decision_notes TEXT,
  decided_by UUID REFERENCES auth.users(id),
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admissions_applications TO authenticated;
GRANT ALL ON public.admissions_applications TO service_role;
ALTER TABLE public.admissions_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Applicants view own application" ON public.admissions_applications FOR SELECT TO authenticated
  USING (applicant_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Submit own application" ON public.admissions_applications FOR INSERT TO authenticated
  WITH CHECK (applicant_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Staff update applications" ON public.admissions_applications FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Staff delete applications" ON public.admissions_applications FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

CREATE TABLE public.exam_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 90,
  venue TEXT,
  mode TEXT NOT NULL DEFAULT 'online',
  proctor TEXT,
  capacity INTEGER,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_schedules TO authenticated;
GRANT ALL ON public.exam_schedules TO service_role;
ALTER TABLE public.exam_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in view exams" ON public.exam_schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff insert exams" ON public.exam_schedules FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Staff update exams" ON public.exam_schedules FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Staff delete exams" ON public.exam_schedules FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

CREATE TABLE public.transcripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transcript_number TEXT NOT NULL UNIQUE,
  pdf_url TEXT,
  gpa NUMERIC(4,2),
  generated_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transcripts TO authenticated;
GRANT ALL ON public.transcripts TO service_role;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view own transcripts" ON public.transcripts FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Staff manage transcripts" ON public.transcripts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

CREATE TRIGGER admissions_set_updated BEFORE UPDATE ON public.admissions_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER exam_schedules_set_updated BEFORE UPDATE ON public.exam_schedules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER transcripts_set_updated BEFORE UPDATE ON public.transcripts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
