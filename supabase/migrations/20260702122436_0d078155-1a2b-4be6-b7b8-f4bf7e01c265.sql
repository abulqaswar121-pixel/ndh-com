
-- 1. certificates
DROP POLICY IF EXISTS "Anyone verifies certificate" ON public.certificates;

CREATE OR REPLACE FUNCTION public.verify_certificate(_code text)
RETURNS TABLE(holder text, program text, grade text, issued date, number text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(p.full_name, 'NDH Graduate'),
         COALESCE(co.program_name, 'NDH Program'),
         c.grade, c.issue_date, c.certificate_number
    FROM public.certificates c
    LEFT JOIN public.profiles p ON p.id = c.student_id
    LEFT JOIN public.courses co ON co.id = c.course_id
   WHERE (c.verification_token IS NOT NULL AND c.verification_token = _code)
      OR c.certificate_number = _code
   LIMIT 1;
$$;
REVOKE EXECUTE ON FUNCTION public.verify_certificate(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon, authenticated;

-- 2. lessons
DROP POLICY IF EXISTS "Anyone reads lessons of published courses" ON public.lessons;
CREATE POLICY "Anyone reads preview lessons of published courses"
  ON public.lessons FOR SELECT TO anon, authenticated
  USING (is_preview = true AND EXISTS (
    SELECT 1 FROM public.modules m JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = lessons.module_id AND c.is_published = true));
CREATE POLICY "Enrolled students read all lessons"
  ON public.lessons FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.modules m
    JOIN public.enrollments e ON e.course_id = m.course_id
    WHERE m.id = lessons.module_id AND e.student_id = auth.uid() AND e.status = 'active'));

-- 3. platform_settings
DROP POLICY IF EXISTS "platform_settings public read" ON public.platform_settings;
CREATE POLICY "Public reads site.* keys only"
  ON public.platform_settings FOR SELECT TO anon, authenticated
  USING (key LIKE 'site.%');
CREATE POLICY "Admins read all settings"
  ON public.platform_settings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'super_admin'::app_role));

-- 4. pm_invitations
DROP POLICY IF EXISTS "Admins manage PM invitations" ON public.pm_invitations;
CREATE POLICY "Admins manage all PM invitations"
  ON public.pm_invitations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "HODs manage PM invitations in own department"
  ON public.pm_invitations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'hod'::app_role) AND department_id = public.my_department())
  WITH CHECK (public.has_role(auth.uid(), 'hod'::app_role) AND department_id = public.my_department());

-- 5. talent_invitations
DROP POLICY IF EXISTS "Staff manage invitations" ON public.talent_invitations;
CREATE POLICY "Admins read talent invitations"
  ON public.talent_invitations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'super_admin'::app_role)
      OR invited_by = auth.uid());
CREATE POLICY "Staff create talent invitations"
  ON public.talent_invitations FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'pm'::app_role)
           OR public.has_role(auth.uid(), 'hod'::app_role)
           OR public.has_role(auth.uid(), 'admin'::app_role)
           OR public.has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Staff update own talent invitations"
  ON public.talent_invitations FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'super_admin'::app_role)
      OR invited_by = auth.uid());
CREATE POLICY "Admins delete talent invitations"
  ON public.talent_invitations FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'super_admin'::app_role));

-- 6. task-files storage
DROP POLICY IF EXISTS "task-files: task collaborators read" ON storage.objects;
CREATE POLICY "task-files: task collaborators read"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'task-files' AND EXISTS (
    SELECT 1 FROM public.tasks t
     WHERE (storage.foldername(name))[1] = t.client_id::text
       AND (t.assigned_talent_id = auth.uid() OR t.assigned_pm_id = auth.uid())));

-- 7. SECURITY DEFINER function EXECUTE grants
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_enrollment_active() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_payment_paid() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_talent_assignment() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_task_created() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_task_status_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tasks_autoroute() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tasks_log_events() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tasks_set_sla() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_talent_perf() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_wake() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.pick_pm_for_department(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.next_certificate_number() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.next_invoice_number() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.compute_talent_payroll(date, date) FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.primary_role(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_hod_of(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_finance_staff(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.pm_department(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.my_department() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_lesson_content(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_talent_task(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_talent_tasks() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_course_roster(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.talent_respond_to_task(uuid, boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.talent_submit_work(uuid, jsonb, text) FROM PUBLIC, anon;
