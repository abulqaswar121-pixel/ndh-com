
-- 1. Schema additions
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS deliverables jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed boolean DEFAULT false;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS welcome_sent boolean DEFAULT false;

-- 2. Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pm_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  overall_rating smallint NOT NULL,
  quality_rating smallint NOT NULL,
  communication_rating smallint NOT NULL,
  speed_rating smallint NOT NULL,
  written_review text,
  would_hire_again boolean,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (task_id, client_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients view own reviews" ON public.reviews
  FOR SELECT TO authenticated
  USING (client_id = auth.uid() OR pm_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

CREATE POLICY "Clients write own reviews" ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients update own reviews" ON public.reviews
  FOR UPDATE TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- 3. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS notifications_user_idx ON public.notifications (user_id, created_at DESC);

-- 4. PM picker
CREATE OR REPLACE FUNCTION public.pick_pm_for_department(_dept_id uuid)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  picked uuid;
BEGIN
  IF _dept_id IS NULL THEN RETURN NULL; END IF;

  -- PMs in this department (defined by either user_roles + dept membership via departments.pm_id,
  -- or any user with role 'pm' for now). Choose one with fewest active tasks.
  SELECT ur.user_id INTO picked
  FROM public.user_roles ur
  LEFT JOIN public.tasks t
    ON t.assigned_pm_id = ur.user_id
   AND t.status NOT IN ('completed','cancelled')
  WHERE ur.role = 'pm'
  GROUP BY ur.user_id
  ORDER BY COUNT(t.id) ASC, MIN(ur.created_at) ASC
  LIMIT 1;

  -- Fallback: department's own pm_id field
  IF picked IS NULL THEN
    SELECT d.pm_id INTO picked FROM public.departments d WHERE d.id = _dept_id;
  END IF;

  RETURN picked;
END;
$$;

-- 5. Auto-routing trigger
CREATE OR REPLACE FUNCTION public.tasks_autoroute()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  dept uuid;
BEGIN
  IF NEW.department_id IS NULL THEN
    SELECT id INTO dept FROM public.departments WHERE slug = NEW.service_category::text LIMIT 1;
    NEW.department_id := dept;
  END IF;

  IF NEW.assigned_pm_id IS NULL THEN
    NEW.assigned_pm_id := public.pick_pm_for_department(NEW.department_id);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_tasks_autoroute ON public.tasks;
CREATE TRIGGER trg_tasks_autoroute
  BEFORE INSERT ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.tasks_autoroute();

-- 6. Notification triggers
CREATE OR REPLACE FUNCTION public.notify_task_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Notify client
  INSERT INTO public.notifications (user_id, type, title, body, link, task_id)
  VALUES (NEW.client_id, 'task_submitted', 'Task submitted',
          'Your task "' || NEW.title || '" was received. We will respond shortly.',
          '/dashboard/client?tab=tasks&task=' || NEW.id::text, NEW.id);

  -- Notify PM
  IF NEW.assigned_pm_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body, link, task_id)
    VALUES (NEW.assigned_pm_id, 'task_assigned', 'New task assigned',
            'A new ' || NEW.service_category || ' task "' || NEW.title || '" has been assigned to you.',
            '/dashboard/pm?task=' || NEW.id::text, NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_task_created ON public.tasks;
CREATE TRIGGER trg_notify_task_created
  AFTER INSERT ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.notify_task_created();

CREATE OR REPLACE FUNCTION public.notify_payment_paid()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pm uuid;
  ttitle text;
BEGIN
  IF NEW.status = 'paid' AND (OLD.status IS DISTINCT FROM 'paid') THEN
    INSERT INTO public.notifications (user_id, type, title, body, link, task_id)
    VALUES (NEW.client_id, 'payment_received', 'Payment confirmed',
            'We received your payment. Work is starting now.',
            CASE WHEN NEW.task_id IS NOT NULL THEN '/dashboard/client?tab=tasks&task=' || NEW.task_id::text ELSE '/dashboard/client?tab=billing' END,
            NEW.task_id);
    IF NEW.task_id IS NOT NULL THEN
      SELECT assigned_pm_id, title INTO pm, ttitle FROM public.tasks WHERE id = NEW.task_id;
      IF pm IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, type, title, body, link, task_id)
        VALUES (pm, 'payment_received', 'Payment received from client',
                'Payment received for task "' || ttitle || '". You can begin work.',
                '/dashboard/pm?task=' || NEW.task_id::text, NEW.task_id);
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_payment_paid ON public.payments;
CREATE TRIGGER trg_notify_payment_paid
  AFTER UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.notify_payment_paid();

CREATE OR REPLACE FUNCTION public.notify_task_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status IS DISTINCT FROM 'delivered' THEN
    NEW.delivered_at := COALESCE(NEW.delivered_at, now());
    INSERT INTO public.notifications (user_id, type, title, body, link, task_id)
    VALUES (NEW.client_id, 'task_delivered', 'Your task is ready for review',
            'Your task "' || NEW.title || '" has been delivered.',
            '/dashboard/client?tab=tasks&task=' || NEW.id::text, NEW.id);
  END IF;
  IF NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed' THEN
    NEW.completed_at := COALESCE(NEW.completed_at, now());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_task_status ON public.tasks;
CREATE TRIGGER trg_notify_task_status
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.notify_task_status_change();

-- 7. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 8. Messages — allow PM <-> client both ways by allowing read access via task involvement
DROP POLICY IF EXISTS "Task participants read messages" ON public.messages;
CREATE POLICY "Task participants read messages" ON public.messages
  FOR SELECT TO authenticated
  USING (
    sender_id = auth.uid()
    OR receiver_id = auth.uid()
    OR (task_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = messages.task_id
        AND (t.client_id = auth.uid() OR t.assigned_pm_id = auth.uid())
    ))
  );

-- Allow chat-attachments storage bucket policies later if needed; messages.attachments already exists.
