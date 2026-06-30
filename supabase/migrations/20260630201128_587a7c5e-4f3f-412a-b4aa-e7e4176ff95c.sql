
-- Sequence for cert numbers
CREATE SEQUENCE IF NOT EXISTS public.certificate_number_seq START 1;

CREATE OR REPLACE FUNCTION public.next_certificate_number()
RETURNS text LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT 'NDH-CERT-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.certificate_number_seq')::text, 6, '0');
$$;

-- Students can read their own certificates
DROP POLICY IF EXISTS "Students read own certificates" ON public.certificates;
CREATE POLICY "Students read own certificates" ON public.certificates
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

-- Storage policies for certificates bucket: students can read their own files (path prefix = user id)
DROP POLICY IF EXISTS "Students read own certificate files" ON storage.objects;
CREATE POLICY "Students read own certificate files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'certificates' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Service role manages certificates bucket" ON storage.objects;
CREATE POLICY "Service role manages certificates bucket" ON storage.objects
  FOR ALL TO service_role
  USING (bucket_id = 'certificates') WITH CHECK (bucket_id = 'certificates');
