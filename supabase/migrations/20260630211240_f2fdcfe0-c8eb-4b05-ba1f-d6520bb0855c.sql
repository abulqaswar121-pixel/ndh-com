
-- Phase 5A: HOD foundation (corrected)

ALTER TABLE public.departments
  ADD COLUMN IF NOT EXISTS hod_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

DO $$ BEGIN
  CREATE TYPE public.curriculum_status AS ENUM ('draft','pending_approval','approved','needs_revision');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS curriculum_status public.curriculum_status NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS curriculum_approved_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS curriculum_approved_at timestamptz;

CREATE OR REPLACE FUNCTION public.my_department()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT department_id FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_hod_of(_dept uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.department_id = _dept
      AND public.has_role(auth.uid(), 'hod')
  )
$$;

-- graduate_recommendations
CREATE TABLE IF NOT EXISTS public.graduate_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  recommended_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recommended_tier text NOT NULL DEFAULT 'starter',
  justification text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  decided_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.graduate_recommendations TO authenticated;
GRANT ALL ON public.graduate_recommendations TO service_role;
ALTER TABLE public.graduate_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "grec_select" ON public.graduate_recommendations FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin')
  OR (public.has_role(auth.uid(),'hod') AND department_id = public.my_department())
  OR recommended_by = auth.uid() OR student_id = auth.uid()
);
CREATE POLICY "grec_insert" ON public.graduate_recommendations FOR INSERT TO authenticated WITH CHECK (
  recommended_by = auth.uid() AND (
    public.has_role(auth.uid(),'hod') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin')
  )
);
CREATE POLICY "grec_update" ON public.graduate_recommendations FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin')
  OR (public.has_role(auth.uid(),'hod') AND department_id = public.my_department())
);

-- department_reports
CREATE TABLE IF NOT EXISTS public.department_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id uuid NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  generated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.department_reports TO authenticated;
GRANT ALL ON public.department_reports TO service_role;
ALTER TABLE public.department_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deprep_read" ON public.department_reports FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin')
  OR (public.has_role(auth.uid(),'hod') AND department_id = public.my_department())
);
CREATE POLICY "deprep_write" ON public.department_reports FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin')
  OR (public.has_role(auth.uid(),'hod') AND department_id = public.my_department())
);

-- curriculum_change_requests
CREATE TABLE IF NOT EXISTS public.curriculum_change_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  requested_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  change_summary text NOT NULL,
  diff jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  review_notes text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.curriculum_change_requests TO authenticated;
GRANT ALL ON public.curriculum_change_requests TO service_role;
ALTER TABLE public.curriculum_change_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ccr_read" ON public.curriculum_change_requests FOR SELECT TO authenticated USING (
  requested_by = auth.uid()
  OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin')
  OR (public.has_role(auth.uid(),'hod') AND EXISTS (
    SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.department_id = public.my_department()
  ))
);
CREATE POLICY "ccr_insert" ON public.curriculum_change_requests FOR INSERT TO authenticated WITH CHECK (
  requested_by = auth.uid() AND (
    public.has_role(auth.uid(),'instructor') OR public.has_role(auth.uid(),'hod')
  )
);
CREATE POLICY "ccr_update" ON public.curriculum_change_requests FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin')
  OR (public.has_role(auth.uid(),'hod') AND EXISTS (
    SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.department_id = public.my_department()
  ))
);

DROP TRIGGER IF EXISTS trg_grec_updated ON public.graduate_recommendations;
CREATE TRIGGER trg_grec_updated BEFORE UPDATE ON public.graduate_recommendations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_ccr_updated ON public.curriculum_change_requests;
CREATE TRIGGER trg_ccr_updated BEFORE UPDATE ON public.curriculum_change_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- HOD courses access
DROP POLICY IF EXISTS "hod_update_dept_courses" ON public.courses;
CREATE POLICY "hod_update_dept_courses" ON public.courses
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'admin')
    OR (public.has_role(auth.uid(),'hod') AND department_id = public.my_department())
  );
