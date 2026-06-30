
-- Phase 5B: Academy Director

-- 1) certificates dual-sign workflow
ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS director_signed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS director_signed_at timestamptz,
  ADD COLUMN IF NOT EXISTS founder_signed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS founder_signed_at timestamptz,
  ADD COLUMN IF NOT EXISTS issued_at timestamptz;

-- Director/founder/registrar can manage certificates
DROP POLICY IF EXISTS "cert_director_manage" ON public.certificates;
CREATE POLICY "cert_director_manage" ON public.certificates
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'admin')
  );

-- 2) academic_calendar
CREATE TABLE IF NOT EXISTS public.academic_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  kind text NOT NULL DEFAULT 'event', -- semester|exam|holiday|break|graduation|event
  starts_at date NOT NULL,
  ends_at date NOT NULL,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  notes text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academic_calendar TO authenticated;
GRANT SELECT ON public.academic_calendar TO anon;
GRANT ALL ON public.academic_calendar TO service_role;
ALTER TABLE public.academic_calendar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cal_read_all" ON public.academic_calendar FOR SELECT USING (true);
CREATE POLICY "cal_write_admin" ON public.academic_calendar
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin')
  );
CREATE POLICY "cal_update_admin" ON public.academic_calendar
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin')
  );
CREATE POLICY "cal_delete_admin" ON public.academic_calendar
  FOR DELETE TO authenticated USING (
    public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin')
  );

DROP TRIGGER IF EXISTS trg_cal_updated ON public.academic_calendar;
CREATE TRIGGER trg_cal_updated BEFORE UPDATE ON public.academic_calendar
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3) tuition_prices
CREATE TABLE IF NOT EXISTS public.tuition_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  country_code text NOT NULL DEFAULT 'default',
  currency text NOT NULL,
  amount numeric NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, country_code, currency)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tuition_prices TO authenticated;
GRANT SELECT ON public.tuition_prices TO anon;
GRANT ALL ON public.tuition_prices TO service_role;
ALTER TABLE public.tuition_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tp_read_all" ON public.tuition_prices FOR SELECT USING (active = true);
CREATE POLICY "tp_write_admin" ON public.tuition_prices
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin')
  );
CREATE POLICY "tp_update_admin" ON public.tuition_prices
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin')
  );
CREATE POLICY "tp_delete_admin" ON public.tuition_prices
  FOR DELETE TO authenticated USING (
    public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin')
  );

DROP TRIGGER IF EXISTS trg_tp_updated ON public.tuition_prices;
CREATE TRIGGER trg_tp_updated BEFORE UPDATE ON public.tuition_prices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
