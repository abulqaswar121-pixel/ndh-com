
-- 1. Grants for blog_posts (URGENT — this is why /blog shows "Loading articles...")
GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;

-- 2. Grants for case_studies (public listing works)
GRANT SELECT ON public.case_studies TO anon;
GRANT SELECT ON public.case_studies TO authenticated;
GRANT ALL ON public.case_studies TO service_role;

-- 3. Extend case_studies with unified schema fields
ALTER TABLE public.case_studies
  ADD COLUMN IF NOT EXISTS client_company text,
  ADD COLUMN IF NOT EXISTS client_photo_url text,
  ADD COLUMN IF NOT EXISTS client_logo_url text,
  ADD COLUMN IF NOT EXISTS client_quote text,
  ADD COLUMN IF NOT EXISTS service_category text,
  ADD COLUMN IF NOT EXISTS gallery_images jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS metrics jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS project_duration text,
  ADD COLUMN IF NOT EXISTS team_members jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS seo_og_image text;

-- 4. Team members CMS
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  role text NOT NULL,
  department text,
  bio_short text,
  bio_long text,
  photo_url text,
  linkedin_url text,
  email text,
  featured_home boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.team_members TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT ALL ON public.team_members TO service_role;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read published team" ON public.team_members FOR SELECT USING (published = true);
CREATE POLICY "admins manage team" ON public.team_members FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER team_members_set_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. Site content key/value CMS (homepage copy, hero, sections, CTA)
CREATE TABLE IF NOT EXISTS public.site_content (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read site content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "admins manage site content" ON public.site_content FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

-- 6. Homepage stats CMS
CREATE TABLE IF NOT EXISTS public.homepage_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  value text NOT NULL,
  suffix text,
  display_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.homepage_stats TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.homepage_stats TO authenticated;
GRANT ALL ON public.homepage_stats TO service_role;
ALTER TABLE public.homepage_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read stats" ON public.homepage_stats FOR SELECT USING (published = true);
CREATE POLICY "admins manage stats" ON public.homepage_stats FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER homepage_stats_set_updated_at BEFORE UPDATE ON public.homepage_stats FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7. Services CMS (6 service cards)
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  icon text,
  short_description text,
  long_description text,
  included jsonb NOT NULL DEFAULT '[]'::jsonb,
  image_url text,
  starting_price text,
  featured boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read services" ON public.services FOR SELECT USING (published = true);
CREATE POLICY "admins manage services" ON public.services FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER services_set_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 8. FAQ items CMS
CREATE TABLE IF NOT EXISTS public.faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text,
  display_order integer NOT NULL DEFAULT 0,
  featured_home boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faq_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faq_items TO authenticated;
GRANT ALL ON public.faq_items TO service_role;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read faq" ON public.faq_items FOR SELECT USING (published = true);
CREATE POLICY "admins manage faq" ON public.faq_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER faq_items_set_updated_at BEFORE UPDATE ON public.faq_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 9. Job openings CMS
CREATE TABLE IF NOT EXISTS public.job_openings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  department text,
  location text,
  employment_type text,
  description text,
  requirements text,
  responsibilities text,
  salary_range text,
  status text NOT NULL DEFAULT 'open',
  published boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.job_openings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_openings TO authenticated;
GRANT ALL ON public.job_openings TO service_role;
ALTER TABLE public.job_openings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read jobs" ON public.job_openings FOR SELECT USING (published = true AND status = 'open');
CREATE POLICY "admins manage jobs" ON public.job_openings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER job_openings_set_updated_at BEFORE UPDATE ON public.job_openings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 10. AI chat: settings + conversations + messages
CREATE TABLE IF NOT EXISTS public.chat_settings (
  id integer PRIMARY KEY DEFAULT 1,
  enabled boolean NOT NULL DEFAULT true,
  system_prompt text NOT NULL DEFAULT '',
  welcome_message text NOT NULL DEFAULT 'Hi! I''m the NDH assistant. Ask me anything about our services, Academy, or how to get started.',
  quick_replies jsonb NOT NULL DEFAULT '["I want to hire NDH","I want to learn","Pricing questions","Talk to a human"]'::jsonb,
  position text NOT NULL DEFAULT 'bottom-right',
  color_theme text NOT NULL DEFAULT 'brand',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chat_settings_singleton CHECK (id = 1)
);
INSERT INTO public.chat_settings (id) VALUES (1) ON CONFLICT DO NOTHING;
GRANT SELECT ON public.chat_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_settings TO authenticated;
GRANT ALL ON public.chat_settings TO service_role;
ALTER TABLE public.chat_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read chat settings" ON public.chat_settings FOR SELECT USING (true);
CREATE POLICY "admins manage chat settings" ON public.chat_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  visitor_email text,
  visitor_name text,
  flagged boolean NOT NULL DEFAULT false,
  message_count integer NOT NULL DEFAULT 0,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS chat_conversations_session_idx ON public.chat_conversations(session_id);
GRANT SELECT, INSERT, UPDATE ON public.chat_conversations TO anon;
GRANT SELECT, INSERT, UPDATE ON public.chat_conversations TO authenticated;
GRANT ALL ON public.chat_conversations TO service_role;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone insert conversation" ON public.chat_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "admins read all conversations" ON public.chat_conversations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "admins update conversations" ON public.chat_conversations FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS chat_messages_conv_idx ON public.chat_messages(conversation_id, created_at);
GRANT SELECT, INSERT ON public.chat_messages TO anon;
GRANT SELECT, INSERT ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone insert message" ON public.chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "admins read messages" ON public.chat_messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
