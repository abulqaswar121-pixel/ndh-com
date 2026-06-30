
-- Phase 3B: Academy enrolment payment linkage

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS enrollment_id uuid REFERENCES public.enrollments(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS payments_enrollment_id_idx ON public.payments(enrollment_id);

-- Allow students to insert + read their own enrolment row (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='enrollments' AND policyname='Students insert own enrollment'
  ) THEN
    CREATE POLICY "Students insert own enrollment" ON public.enrollments
      FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='enrollments' AND policyname='Students update own enrollment'
  ) THEN
    CREATE POLICY "Students update own enrollment" ON public.enrollments
      FOR UPDATE TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
  END IF;
END $$;

-- Auto-notify on enrolment activation
CREATE OR REPLACE FUNCTION public.notify_enrollment_active()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cname text;
BEGIN
  IF NEW.status = 'active' AND COALESCE(OLD.status,'') IS DISTINCT FROM 'active' THEN
    SELECT program_name INTO cname FROM public.courses WHERE id = NEW.course_id;
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (NEW.student_id, 'enrollment_active',
            'Welcome to ' || COALESCE(cname,'NDH Academy'),
            'Your enrolment is confirmed. Your course is now unlocked.',
            '/dashboard/student?course=' || NEW.course_id::text);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS enrollment_active_notify ON public.enrollments;
CREATE TRIGGER enrollment_active_notify
  AFTER UPDATE ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.notify_enrollment_active();
