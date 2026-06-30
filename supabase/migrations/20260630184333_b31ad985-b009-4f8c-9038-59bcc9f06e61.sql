
-- Replace view with security definer function
DROP VIEW IF EXISTS public.talent_tasks;

CREATE OR REPLACE FUNCTION public.get_talent_tasks()
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  service_category service_category,
  tier task_tier,
  status task_status,
  files jsonb,
  deliverables jsonb,
  deadline date,
  assigned_pm_id uuid,
  assigned_talent_id uuid,
  talent_pay_rate numeric,
  talent_response text,
  talent_response_deadline timestamptz,
  talent_assigned_at timestamptz,
  revision_notes text,
  revision_count int,
  delivered_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT t.id, t.title, t.description, t.service_category, t.tier, t.status,
         t.files, t.deliverables, t.deadline, t.assigned_pm_id, t.assigned_talent_id,
         t.talent_pay_rate, t.talent_response, t.talent_response_deadline, t.talent_assigned_at,
         t.revision_notes, t.revision_count, t.delivered_at, t.completed_at, t.created_at, t.updated_at
    FROM public.tasks t
   WHERE t.assigned_talent_id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.get_talent_tasks() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_talent_tasks() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_talent_task(_task_id uuid)
RETURNS SETOF public.tasks
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT * FROM public.tasks WHERE id = _task_id AND assigned_talent_id = auth.uid();
$$;
-- This returns full row; we will hand-pick safe columns in app code via .select()
REVOKE ALL ON FUNCTION public.get_talent_task(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_talent_task(uuid) TO authenticated;

-- Lock down execute on talent action functions to authenticated only
REVOKE ALL ON FUNCTION public.talent_respond_to_task(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.talent_respond_to_task(uuid, boolean) TO authenticated;

REVOKE ALL ON FUNCTION public.talent_submit_work(uuid, jsonb, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.talent_submit_work(uuid, jsonb, text) TO authenticated;

-- Set search_path on legacy queue/email helpers (lint warnings)
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public;
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public;
ALTER FUNCTION public.read_email_batch(text, int, int) SET search_path = public;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public;
