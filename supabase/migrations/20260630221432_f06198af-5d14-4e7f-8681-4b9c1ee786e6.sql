
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.platform_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.platform_settings TO anon, authenticated;
GRANT ALL ON public.platform_settings TO service_role;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "platform_settings public read" ON public.platform_settings FOR SELECT USING (true);
CREATE POLICY "platform_settings super admin write" ON public.platform_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE TRIGGER trg_platform_settings_updated BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.broadcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  audience text[] NOT NULL DEFAULT '{}'::text[],
  channels text[] NOT NULL DEFAULT '{in_app}'::text[],
  status text NOT NULL DEFAULT 'draft',
  sent_at timestamptz,
  recipient_count int NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.broadcasts TO authenticated;
GRANT ALL ON public.broadcasts TO service_role;
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "broadcasts admin read" ON public.broadcasts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "broadcasts super admin write" ON public.broadcasts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE public.site_pages (
  slug text PRIMARY KEY,
  title text NOT NULL,
  blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  published boolean NOT NULL DEFAULT true,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_pages TO anon, authenticated;
GRANT ALL ON public.site_pages TO service_role;
ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_pages public read" ON public.site_pages FOR SELECT
  USING (published = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "site_pages admin write" ON public.site_pages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE TRIGGER trg_site_pages_updated BEFORE UPDATE ON public.site_pages
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

INSERT INTO public.platform_settings (key, value, description) VALUES
  ('site.maintenance_mode', 'false'::jsonb, 'When true, public site shows maintenance notice'),
  ('site.support_email', '"support@ndh.com.ng"'::jsonb, 'Primary support inbox'),
  ('site.info_email', '"info@ndh.com.ng"'::jsonb, 'General info inbox'),
  ('site.whatsapp_number', '"+2348000000000"'::jsonb, 'WhatsApp click-to-chat number (E.164)'),
  ('site.office_address', '"Sokoto, Nigeria"'::jsonb, 'Public office address'),
  ('pricing.default_currency', '"NGN"'::jsonb, 'Default site currency when geo-IP fails'),
  ('features.escrow_enabled', 'true'::jsonb, 'Enable client escrow payments'),
  ('features.academy_enrollment_open', 'true'::jsonb, 'Allow public student enrollment')
ON CONFLICT (key) DO NOTHING;
