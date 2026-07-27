
-- Academy AI Schools rebuild schema
CREATE TABLE public.schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.schools TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.schools TO authenticated;
GRANT ALL ON public.schools TO service_role;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schools public read" ON public.schools FOR SELECT USING (true);
CREATE POLICY "schools admin write" ON public.schools FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'hod'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'hod'));

CREATE TABLE public.academy_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  region_prices jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_published boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.academy_courses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academy_courses TO authenticated;
GRANT ALL ON public.academy_courses TO service_role;
ALTER TABLE public.academy_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "academy_courses public read published" ON public.academy_courses FOR SELECT USING (is_published = true);
CREATE POLICY "academy_courses admin all" ON public.academy_courses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'hod'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'hod'));

CREATE TABLE public.academy_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.academy_courses(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  title text NOT NULL,
  video_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academy_lessons TO authenticated;
GRANT ALL ON public.academy_lessons TO service_role;
ALTER TABLE public.academy_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "academy_lessons admin all" ON public.academy_lessons FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'hod'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'hod'));
CREATE POLICY "academy_lessons enrolled read" ON public.academy_lessons FOR SELECT TO authenticated USING (true);

CREATE TABLE public.academy_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.academy_courses(id) ON DELETE CASCADE,
  instructions text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academy_assignments TO authenticated;
GRANT ALL ON public.academy_assignments TO service_role;
ALTER TABLE public.academy_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "academy_assignments admin all" ON public.academy_assignments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'hod'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'hod'));
CREATE POLICY "academy_assignments read" ON public.academy_assignments FOR SELECT TO authenticated USING (true);

CREATE TABLE public.academy_quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.academy_courses(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  question text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academy_quiz_questions TO authenticated;
GRANT ALL ON public.academy_quiz_questions TO service_role;
ALTER TABLE public.academy_quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "academy_quiz admin all" ON public.academy_quiz_questions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'hod'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'hod'));
CREATE POLICY "academy_quiz read" ON public.academy_quiz_questions FOR SELECT TO authenticated USING (true);

CREATE TABLE public.academy_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.academy_courses(id) ON DELETE CASCADE,
  brief text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academy_projects TO authenticated;
GRANT ALL ON public.academy_projects TO service_role;
ALTER TABLE public.academy_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "academy_projects admin all" ON public.academy_projects FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'hod'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'hod'));
CREATE POLICY "academy_projects read" ON public.academy_projects FOR SELECT TO authenticated USING (true);

CREATE TABLE public.academy_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region text NOT NULL,
  tier text NOT NULL,
  currency text NOT NULL,
  amount numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(region, tier)
);
GRANT SELECT ON public.academy_pricing TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academy_pricing TO authenticated;
GRANT ALL ON public.academy_pricing TO service_role;
ALTER TABLE public.academy_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pricing public read" ON public.academy_pricing FOR SELECT USING (true);
CREATE POLICY "pricing admin write" ON public.academy_pricing FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin'));

CREATE TRIGGER schools_updated BEFORE UPDATE ON public.schools FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER academy_courses_updated BEFORE UPDATE ON public.academy_courses FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER academy_lessons_updated BEFORE UPDATE ON public.academy_lessons FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER academy_assignments_updated BEFORE UPDATE ON public.academy_assignments FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER academy_projects_updated BEFORE UPDATE ON public.academy_projects FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Seed 6 schools
INSERT INTO public.schools (slug, name, description, icon, display_order) VALUES
('writing','School of AI Writing','Master AI-assisted writing, copywriting, and content strategy.','PenLine',1),
('design','School of AI Design','AI-powered design, branding, and visual creation.','Palette',2),
('media','School of AI Media','Video, audio, and image generation with AI.','Film',3),
('marketing','School of AI Marketing','AI-driven marketing, ads, and growth.','Megaphone',4),
('tech','School of AI Tech','Build with AI: prompt engineering, agents, and no-code apps.','Cpu',5),
('business_support','School of AI Business Support','AI for VA, ops, admin, and customer support.','Briefcase',6);

-- Seed 23 courses
WITH s AS (SELECT id, slug FROM public.schools)
INSERT INTO public.academy_courses (school_id, slug, name, description, region_prices, is_published, display_order)
SELECT s.id, x.slug, x.name, x.description, x.region_prices::jsonb, true, x.ord
FROM s JOIN (VALUES
  ('writing','ai-copywriting','AI Copywriting','Write high-converting copy with AI.', '{"NG":50000,"US":150,"UK":120,"EU":140,"CA":180}', 1),
  ('writing','ai-content-strategy','AI Content Strategy','Plan and scale content with AI.', '{"NG":60000,"US":180,"UK":150,"EU":170,"CA":220}', 2),
  ('writing','ai-blogging','AI Blogging & SEO','Rank on Google with AI-assisted articles.', '{"NG":55000,"US":160,"UK":130,"EU":150,"CA":200}', 3),
  ('writing','ai-scriptwriting','AI Scriptwriting','Scripts for video, podcasts, and shorts.', '{"NG":55000,"US":160,"UK":130,"EU":150,"CA":200}', 4),
  ('design','ai-graphic-design','AI Graphic Design','Designs with Midjourney, Figma AI, Canva AI.', '{"NG":70000,"US":200,"UK":170,"EU":190,"CA":250}', 1),
  ('design','ai-branding','AI Branding & Identity','Full brand systems with AI.', '{"NG":75000,"US":220,"UK":185,"EU":205,"CA":270}', 2),
  ('design','ai-ui-ux','AI UI/UX Design','Rapid prototyping with AI design tools.', '{"NG":80000,"US":240,"UK":200,"EU":225,"CA":295}', 3),
  ('design','ai-illustration','AI Illustration','Custom AI illustrations & art direction.', '{"NG":65000,"US":190,"UK":160,"EU":180,"CA":235}', 4),
  ('media','ai-video-editing','AI Video Editing','Descript, Runway, Opus Clip.', '{"NG":70000,"US":210,"UK":175,"EU":195,"CA":260}', 1),
  ('media','ai-video-generation','AI Video Generation','Sora, Runway, Kling.', '{"NG":80000,"US":250,"UK":210,"EU":235,"CA":310}', 2),
  ('media','ai-podcast-production','AI Podcast Production','Produce podcasts fast with AI tools.', '{"NG":60000,"US":180,"UK":150,"EU":170,"CA":220}', 3),
  ('media','ai-photography','AI Photography & Retouching','Retouch and generate photos with AI.', '{"NG":65000,"US":190,"UK":160,"EU":180,"CA":235}', 4),
  ('marketing','ai-social-media','AI Social Media Management','Run pages with AI-driven content & analytics.', '{"NG":60000,"US":180,"UK":150,"EU":170,"CA":220}', 1),
  ('marketing','ai-paid-ads','AI Paid Ads','Meta, Google, TikTok ads with AI.', '{"NG":75000,"US":220,"UK":185,"EU":205,"CA":270}', 2),
  ('marketing','ai-email-marketing','AI Email Marketing','AI-powered email campaigns & flows.', '{"NG":55000,"US":170,"UK":140,"EU":160,"CA":210}', 3),
  ('tech','prompt-engineering','Prompt Engineering','Master prompts for ChatGPT, Claude, Gemini.', '{"NG":70000,"US":210,"UK":175,"EU":195,"CA":260}', 1),
  ('tech','ai-agents','Build AI Agents','Autonomous agents with n8n, LangChain, Lovable.', '{"NG":100000,"US":300,"UK":250,"EU":280,"CA":370}', 2),
  ('tech','no-code-ai-apps','No-Code AI Apps','Ship products with Lovable + AI.', '{"NG":90000,"US":270,"UK":225,"EU":250,"CA":330}', 3),
  ('tech','ai-automation','AI Workflow Automation','Automate ops with Zapier, Make, n8n + AI.', '{"NG":80000,"US":240,"UK":200,"EU":225,"CA":295}', 4),
  ('business_support','ai-virtual-assistant','AI Virtual Assistant','Modern VA skills powered by AI.', '{"NG":50000,"US":150,"UK":120,"EU":140,"CA":180}', 1),
  ('business_support','ai-customer-support','AI Customer Support','Deploy AI chatbots & smart support.', '{"NG":55000,"US":170,"UK":140,"EU":160,"CA":210}', 2),
  ('business_support','ai-project-management','AI Project Management','PM with AI planning & reporting.', '{"NG":65000,"US":190,"UK":160,"EU":180,"CA":235}', 3),
  ('business_support','ai-data-entry-analysis','AI Data Entry & Analysis','Speed up data work with AI.', '{"NG":50000,"US":150,"UK":120,"EU":140,"CA":180}', 4)
) AS x(school_slug, slug, name, description, region_prices, ord)
ON s.slug = x.school_slug;

-- Seed pricing (5 regions × 3 tiers)
INSERT INTO public.academy_pricing (region, tier, currency, amount) VALUES
('NG','single','NGN',60000),('NG','school','NGN',180000),('NG','full','NGN',500000),
('US','single','USD',180),('US','school','USD',540),('US','full','USD',1500),
('UK','single','GBP',150),('UK','school','GBP',450),('UK','full','GBP',1250),
('EU','single','EUR',170),('EU','school','EUR',510),('EU','full','EUR',1400),
('CA','single','CAD',225),('CA','school','CAD',675),('CA','full','CAD',1850);
