
-- 1. Extend talents
ALTER TABLE public.talents
  ADD COLUMN IF NOT EXISTS availability text NOT NULL DEFAULT 'available' CHECK (availability IN ('available','busy','away')),
  ADD COLUMN IF NOT EXISTS max_active_tasks int NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS invited_at timestamptz,
  ADD COLUMN IF NOT EXISTS joined_at timestamptz,
  ADD COLUMN IF NOT EXISTS invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tasks_completed int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS approval_rate numeric(5,2) NOT NULL DEFAULT 100;

-- Allow 'invited' status
ALTER TABLE public.talents DROP CONSTRAINT IF EXISTS talents_status_check;
ALTER TABLE public.talents ADD CONSTRAINT talents_status_check
  CHECK (status IN ('invited','active','suspended','inactive'));

-- 2. Extend tasks for talent flow
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS talent_pay_rate numeric(14,2),
  ADD COLUMN IF NOT EXISTS talent_response text CHECK (talent_response IN ('pending','accepted','declined')),
  ADD COLUMN IF NOT EXISTS talent_response_deadline timestamptz,
  ADD COLUMN IF NOT EXISTS talent_assigned_at timestamptz,
  ADD COLUMN IF NOT EXISTS revision_notes text,
  ADD COLUMN IF NOT EXISTS revision_count int NOT NULL DEFAULT 0;

-- Allow new status values
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON e.enumtypid=t.oid WHERE t.typname='task_status' AND e.enumlabel='submitted_qa') THEN
    ALTER TYPE task_status ADD VALUE 'submitted_qa';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON e.enumtypid=t.oid WHERE t.typname='task_status' AND e.enumlabel='revision_required') THEN
    ALTER TYPE task_status ADD VALUE 'revision_required';
  END IF;
END $$;

-- 3. Tighten task RLS: talents no longer read tasks directly
DROP POLICY IF EXISTS "PM reads assigned" ON public.tasks;
DROP POLICY IF EXISTS "PM updates assigned" ON public.tasks;

CREATE POLICY "PM reads assigned tasks" ON public.tasks FOR SELECT TO authenticated
  USING (auth.uid() = assigned_pm_id);
CREATE POLICY "PM updates assigned tasks" ON public.tasks FOR UPDATE TO authenticated
  USING (auth.uid() = assigned_pm_id)
  WITH CHECK (auth.uid() = assigned_pm_id);

-- Talents can update ONLY their response columns + status moves they're allowed (handled by RPCs).
-- We grant a narrow UPDATE policy that allows them to set status to submitted_qa / accepted / declined for own assigned task.
CREATE POLICY "Talent updates own assigned" ON public.tasks FOR UPDATE TO authenticated
  USING (auth.uid() = assigned_talent_id)
  WITH CHECK (auth.uid() = assigned_talent_id);

-- 4. Safe view for talents (security_invoker=off → runs as definer, base RLS bypassed for selected cols)
CREATE OR REPLACE VIEW public.talent_tasks
WITH (security_invoker = off) AS
SELECT
  t.id,
  t.title,
  t.description,
  t.service_category,
  t.tier,
  t.status,
  t.files,
  t.deliverables,
  t.deadline,
  t.assigned_pm_id,
  t.assigned_talent_id,
  t.talent_pay_rate,
  t.talent_response,
  t.talent_response_deadline,
  t.talent_assigned_at,
  t.revision_notes,
  t.revision_count,
  t.delivered_at,
  t.completed_at,
  t.created_at,
  t.updated_at
FROM public.tasks t
WHERE t.assigned_talent_id = auth.uid();

GRANT SELECT ON public.talent_tasks TO authenticated;

-- 5. Talent invitations
CREATE TABLE IF NOT EXISTS public.talent_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  email text NOT NULL,
  full_name text NOT NULL,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  tier int NOT NULL DEFAULT 1 CHECK (tier BETWEEN 1 AND 5),
  skills text[] NOT NULL DEFAULT '{}',
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  accepted_at timestamptz,
  accepted_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.talent_invitations TO authenticated;
GRANT ALL ON public.talent_invitations TO service_role;

ALTER TABLE public.talent_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manage invitations" ON public.talent_invitations FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'pm') OR has_role(auth.uid(), 'hod') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'))
  WITH CHECK (has_role(auth.uid(), 'pm') OR has_role(auth.uid(), 'hod') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Invitee reads own" ON public.talent_invitations FOR SELECT TO authenticated
  USING (accepted_user_id = auth.uid());

-- 6. Talent reviews (PM → talent)
CREATE TABLE IF NOT EXISTS public.talent_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  talent_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pm_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  quality_rating smallint NOT NULL CHECK (quality_rating BETWEEN 1 AND 5),
  communication_rating smallint NOT NULL CHECK (communication_rating BETWEEN 1 AND 5),
  timeliness_rating smallint NOT NULL CHECK (timeliness_rating BETWEEN 1 AND 5),
  notes text,
  approved boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (task_id, talent_id)
);
GRANT SELECT, INSERT, UPDATE ON public.talent_reviews TO authenticated;
GRANT ALL ON public.talent_reviews TO service_role;

ALTER TABLE public.talent_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff write talent reviews" ON public.talent_reviews FOR INSERT TO authenticated
  WITH CHECK (pm_id = auth.uid() AND (has_role(auth.uid(),'pm') OR has_role(auth.uid(),'hod') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin')));

CREATE POLICY "Staff and talent read own reviews" ON public.talent_reviews FOR SELECT TO authenticated
  USING (talent_id = auth.uid() OR pm_id = auth.uid() OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'hod'));

-- 7. Talent self-update RPC for safe status transitions
CREATE OR REPLACE FUNCTION public.talent_respond_to_task(_task_id uuid, _accept boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  UPDATE public.tasks
     SET talent_response = CASE WHEN _accept THEN 'accepted' ELSE 'declined' END,
         status = CASE WHEN _accept THEN 'in_progress'::task_status ELSE status END,
         assigned_talent_id = CASE WHEN _accept THEN assigned_talent_id ELSE NULL END
   WHERE id = _task_id AND assigned_talent_id = auth.uid();
END $$;
GRANT EXECUTE ON FUNCTION public.talent_respond_to_task(uuid, boolean) TO authenticated;

CREATE OR REPLACE FUNCTION public.talent_submit_work(_task_id uuid, _deliverables jsonb, _notes text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  pm uuid;
  ttitle text;
BEGIN
  UPDATE public.tasks
     SET deliverables = COALESCE(deliverables,'[]'::jsonb) || _deliverables,
         status = 'submitted_qa'::task_status,
         delivered_by = auth.uid(),
         delivered_at = now()
   WHERE id = _task_id AND assigned_talent_id = auth.uid()
  RETURNING assigned_pm_id, title INTO pm, ttitle;

  IF pm IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body, link, task_id)
    VALUES (pm, 'work_submitted', 'Work submitted for QA',
            'Talent submitted work on "' || ttitle || '". Review and deliver to client.',
            '/dashboard/pm?task=' || _task_id::text, _task_id);

    IF _notes IS NOT NULL AND length(_notes) > 0 THEN
      INSERT INTO public.messages (sender_id, receiver_id, task_id, content)
      VALUES (auth.uid(), pm, _task_id, _notes);
    END IF;
  END IF;
END $$;
GRANT EXECUTE ON FUNCTION public.talent_submit_work(uuid, jsonb, text) TO authenticated;

-- 8. Notify talent on assignment + revision
CREATE OR REPLACE FUNCTION public.notify_talent_assignment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.assigned_talent_id IS DISTINCT FROM OLD.assigned_talent_id AND NEW.assigned_talent_id IS NOT NULL THEN
    NEW.talent_assigned_at := now();
    NEW.talent_response := 'pending';
    NEW.talent_response_deadline := COALESCE(NEW.talent_response_deadline, now() + interval '24 hours');
    INSERT INTO public.notifications (user_id, type, title, body, link, task_id)
    VALUES (NEW.assigned_talent_id, 'task_assigned', 'New task assigned to you',
            'A ' || NEW.service_category || ' (' || NEW.tier || ') task "' || NEW.title || '" was assigned. Please accept within 24h.',
            '/dashboard/talent?tab=tasks&task=' || NEW.id::text, NEW.id);
  END IF;
  IF NEW.status = 'revision_required' AND OLD.status IS DISTINCT FROM 'revision_required' AND NEW.assigned_talent_id IS NOT NULL THEN
    NEW.revision_count := COALESCE(OLD.revision_count, 0) + 1;
    INSERT INTO public.notifications (user_id, type, title, body, link, task_id)
    VALUES (NEW.assigned_talent_id, 'revision_required', 'Revision requested',
            'Your PM requested a revision on "' || NEW.title || '".',
            '/dashboard/talent?tab=tasks&task=' || NEW.id::text, NEW.id);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_talent_assignment ON public.tasks;
CREATE TRIGGER trg_notify_talent_assignment
BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.notify_talent_assignment();

-- 9. Aggregate talent performance after review
CREATE OR REPLACE FUNCTION public.update_talent_perf()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  avg_score numeric;
  approve_rate numeric;
  done int;
BEGIN
  SELECT ROUND(AVG((quality_rating+communication_rating+timeliness_rating)/3.0)::numeric, 2),
         ROUND(100.0 * SUM(CASE WHEN approved THEN 1 ELSE 0 END) / NULLIF(COUNT(*),0), 2),
         COUNT(*)
    INTO avg_score, approve_rate, done
    FROM public.talent_reviews
   WHERE talent_id = NEW.talent_id;

  UPDATE public.talents
     SET performance_score = COALESCE(avg_score, 0),
         approval_rate = COALESCE(approve_rate, 100),
         tasks_completed = COALESCE(done, 0)
   WHERE user_id = NEW.talent_id;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_update_talent_perf ON public.talent_reviews;
CREATE TRIGGER trg_update_talent_perf
AFTER INSERT OR UPDATE ON public.talent_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_talent_perf();
