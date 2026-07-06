
CREATE TABLE public.project_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  project_type TEXT NOT NULL,
  services TEXT[] DEFAULT '{}',
  budget_range TEXT,
  timeline TEXT,
  description TEXT,
  extra JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'new',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  converted_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_quotes TO authenticated;
GRANT INSERT ON public.project_quotes TO anon;
GRANT ALL ON public.project_quotes TO service_role;

ALTER TABLE public.project_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a quote request"
  ON public.project_quotes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Owners can view their own quote requests"
  ON public.project_quotes FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can view all quote requests"
  ON public.project_quotes FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins can update quote requests"
  ON public.project_quotes FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER project_quotes_updated_at BEFORE UPDATE ON public.project_quotes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.talents
  ADD COLUMN IF NOT EXISTS public_slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS headline TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
  ADD COLUMN IF NOT EXISTS github_url TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC,
  ADD COLUMN IF NOT EXISTS years_experience INT,
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE public.talent_portfolio_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  talent_id UUID NOT NULL REFERENCES public.talents(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  tags TEXT[] DEFAULT '{}',
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.talent_portfolio_items TO authenticated;
GRANT SELECT ON public.talent_portfolio_items TO anon;
GRANT ALL ON public.talent_portfolio_items TO service_role;

ALTER TABLE public.talent_portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public portfolio items"
  ON public.talent_portfolio_items FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.talents t WHERE t.user_id = talent_id AND t.is_public = true));
CREATE POLICY "Talents can manage their own portfolio"
  ON public.talent_portfolio_items FOR ALL TO authenticated
  USING (talent_id = auth.uid()) WITH CHECK (talent_id = auth.uid());
CREATE POLICY "Admins can view all portfolio items"
  ON public.talent_portfolio_items FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER talent_portfolio_items_updated_at BEFORE UPDATE ON public.talent_portfolio_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Anyone can view public talent profiles"
  ON public.talents FOR SELECT TO anon, authenticated USING (is_public = true);
GRANT SELECT ON public.talents TO anon;

CREATE POLICY "Anyone can view profile of public talents"
  ON public.profiles FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.talents t WHERE t.user_id = id AND t.is_public = true));
GRANT SELECT ON public.profiles TO anon;
