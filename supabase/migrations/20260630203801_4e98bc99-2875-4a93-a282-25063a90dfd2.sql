
-- 1. profiles.department_id
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL;

-- 2. pm_invitations
CREATE TABLE IF NOT EXISTS public.pm_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text NOT NULL,
  phone text,
  department_id uuid NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  status text NOT NULL DEFAULT 'pending', -- pending | accepted | revoked | expired
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pm_invitations_email_idx ON public.pm_invitations(lower(email));
CREATE INDEX IF NOT EXISTS pm_invitations_status_idx ON public.pm_invitations(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pm_invitations TO authenticated;
GRANT ALL ON public.pm_invitations TO service_role;
ALTER TABLE public.pm_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage PM invitations"
ON public.pm_invitations FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'hod'))
WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'hod'));

CREATE TRIGGER pm_invitations_set_updated_at BEFORE UPDATE ON public.pm_invitations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. quotes extensions
ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS delivery_days integer,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz DEFAULT (now() + interval '7 days'),
  ADD COLUMN IF NOT EXISTS responded_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.quotes ALTER COLUMN currency SET DEFAULT 'NGN';

DROP TRIGGER IF EXISTS quotes_set_updated_at ON public.quotes;
CREATE TRIGGER quotes_set_updated_at BEFORE UPDATE ON public.quotes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. task_events audit log
CREATE TABLE IF NOT EXISTS public.task_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS task_events_task_idx ON public.task_events(task_id, created_at DESC);

GRANT SELECT, INSERT ON public.task_events TO authenticated;
GRANT ALL ON public.task_events TO service_role;
ALTER TABLE public.task_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Task events: task participants read"
ON public.task_events FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t WHERE t.id = task_events.task_id AND (
      t.client_id = auth.uid()
      OR t.assigned_pm_id = auth.uid()
      OR t.assigned_talent_id = auth.uid()
      OR (t.department_id IS NOT NULL AND t.department_id = (SELECT department_id FROM public.profiles WHERE id = auth.uid()))
      OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'hod')
    )
  )
);

CREATE POLICY "Task events: staff insert"
ON public.task_events FOR INSERT TO authenticated
WITH CHECK (
  actor_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.tasks t WHERE t.id = task_events.task_id AND (
      t.client_id = auth.uid() OR t.assigned_pm_id = auth.uid() OR t.assigned_talent_id = auth.uid()
      OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'hod')
      OR (t.department_id IS NOT NULL AND t.department_id = (SELECT department_id FROM public.profiles WHERE id = auth.uid()))
    )
  )
);

-- 5. tasks SLA + quoted snapshot
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS first_response_due_at timestamptz,
  ADD COLUMN IF NOT EXISTS first_response_at timestamptz,
  ADD COLUMN IF NOT EXISTS quoted_amount numeric,
  ADD COLUMN IF NOT EXISTS quoted_currency text;

-- 6. helper: PM department
CREATE OR REPLACE FUNCTION public.pm_department(_uid uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT department_id FROM public.profiles WHERE id = _uid
$$;

-- 7. RLS additions for department-scoped PM access
DROP POLICY IF EXISTS "PM reads department tasks" ON public.tasks;
CREATE POLICY "PM reads department tasks"
ON public.tasks FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(),'pm')
  AND department_id IS NOT NULL
  AND department_id = public.pm_department(auth.uid())
);

DROP POLICY IF EXISTS "PM updates department tasks" ON public.tasks;
CREATE POLICY "PM updates department tasks"
ON public.tasks FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(),'pm')
  AND department_id IS NOT NULL
  AND department_id = public.pm_department(auth.uid())
);

DROP POLICY IF EXISTS "PM reads department quotes" ON public.quotes;
CREATE POLICY "PM reads department quotes"
ON public.quotes FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = quotes.task_id
      AND t.department_id IS NOT NULL
      AND t.department_id = public.pm_department(auth.uid())
      AND public.has_role(auth.uid(),'pm')
  )
);

DROP POLICY IF EXISTS "PM reads department messages" ON public.messages;
CREATE POLICY "PM reads department messages"
ON public.messages FOR SELECT TO authenticated
USING (
  task_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = messages.task_id
      AND t.department_id IS NOT NULL
      AND t.department_id = public.pm_department(auth.uid())
      AND public.has_role(auth.uid(),'pm')
  )
);

-- 8. auto-routing v2 — prefer PMs in matching department
CREATE OR REPLACE FUNCTION public.pick_pm_for_department(_dept_id uuid)
RETURNS uuid LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE picked uuid;
BEGIN
  IF _dept_id IS NULL THEN RETURN NULL; END IF;

  -- Prefer PMs bound to this department in profiles
  SELECT ur.user_id INTO picked
  FROM public.user_roles ur
  JOIN public.profiles p ON p.id = ur.user_id
  LEFT JOIN public.tasks t ON t.assigned_pm_id = ur.user_id AND t.status NOT IN ('completed','cancelled')
  WHERE ur.role = 'pm' AND p.department_id = _dept_id
  GROUP BY ur.user_id
  ORDER BY COUNT(t.id) ASC, MIN(ur.created_at) ASC
  LIMIT 1;

  -- Fallback: any PM
  IF picked IS NULL THEN
    SELECT ur.user_id INTO picked
    FROM public.user_roles ur
    LEFT JOIN public.tasks t ON t.assigned_pm_id = ur.user_id AND t.status NOT IN ('completed','cancelled')
    WHERE ur.role = 'pm'
    GROUP BY ur.user_id
    ORDER BY COUNT(t.id) ASC, MIN(ur.created_at) ASC
    LIMIT 1;
  END IF;

  -- Final fallback: department's pm_id field
  IF picked IS NULL THEN
    SELECT d.pm_id INTO picked FROM public.departments d WHERE d.id = _dept_id;
  END IF;

  RETURN picked;
END;
$$;

-- 9. SLA + event triggers
CREATE OR REPLACE FUNCTION public.tasks_set_sla()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.first_response_due_at IS NULL THEN
    NEW.first_response_due_at := now() + interval '24 hours';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS tasks_set_sla_trg ON public.tasks;
CREATE TRIGGER tasks_set_sla_trg BEFORE INSERT ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.tasks_set_sla();

CREATE OR REPLACE FUNCTION public.tasks_log_events()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.task_events(task_id, actor_id, type, payload)
    VALUES (NEW.id, NEW.client_id, 'task_created', jsonb_build_object('title', NEW.title, 'category', NEW.service_category, 'tier', NEW.tier));
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      INSERT INTO public.task_events(task_id, actor_id, type, payload)
      VALUES (NEW.id, auth.uid(), 'status_changed', jsonb_build_object('from', OLD.status, 'to', NEW.status));
    END IF;
    IF NEW.assigned_pm_id IS DISTINCT FROM OLD.assigned_pm_id AND NEW.assigned_pm_id IS NOT NULL THEN
      INSERT INTO public.task_events(task_id, actor_id, type, payload)
      VALUES (NEW.id, auth.uid(), 'pm_assigned', jsonb_build_object('pm_id', NEW.assigned_pm_id));
    END IF;
    IF NEW.assigned_talent_id IS DISTINCT FROM OLD.assigned_talent_id AND NEW.assigned_talent_id IS NOT NULL THEN
      INSERT INTO public.task_events(task_id, actor_id, type, payload)
      VALUES (NEW.id, auth.uid(), 'talent_assigned', jsonb_build_object('talent_id', NEW.assigned_talent_id));
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS tasks_log_events_trg ON public.tasks;
CREATE TRIGGER tasks_log_events_trg AFTER INSERT OR UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.tasks_log_events();

-- 10. realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quotes;
