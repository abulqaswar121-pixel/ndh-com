
-- =========================================================
-- ENUMS
-- =========================================================
CREATE TYPE public.app_role AS ENUM ('client','talent','student','instructor','pm','hod','admin','super_admin');
CREATE TYPE public.task_status AS ENUM ('pending','quoted','in_progress','in_review','revision','delivered','completed','cancelled');
CREATE TYPE public.task_tier AS ENUM ('basic','professional','premium');
CREATE TYPE public.service_category AS ENUM ('design','development','content','marketing','media','ai');
CREATE TYPE public.payment_status AS ENUM ('pending','paid','failed','refunded');
CREATE TYPE public.program_type AS ENUM ('certificate','diploma','professional');

-- =========================================================
-- PROFILES (mirrors auth.users)
-- =========================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  country TEXT DEFAULT 'NG',
  currency TEXT DEFAULT 'NGN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- =========================================================
-- USER ROLES (separate, security definer)
-- =========================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.primary_role(_user_id UUID)
RETURNS public.app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id
  ORDER BY CASE role
    WHEN 'super_admin' THEN 1 WHEN 'admin' THEN 2 WHEN 'hod' THEN 3
    WHEN 'pm' THEN 4 WHEN 'instructor' THEN 5 WHEN 'talent' THEN 6
    WHEN 'student' THEN 7 WHEN 'client' THEN 8 END
  LIMIT 1
$$;

-- =========================================================
-- updated_at trigger helper
-- =========================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- handle_new_user: create profile + default 'client' role
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'client'))
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- DEPARTMENTS
-- =========================================================
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  hod_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  pm_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.departments TO authenticated, anon;
GRANT ALL ON public.departments TO service_role;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads departments" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Admins manage departments" ON public.departments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

INSERT INTO public.departments (name, slug) VALUES
  ('Design','design'),('Development','development'),('Content','content'),
  ('Marketing','marketing'),('Media','media'),('AI','ai');

-- =========================================================
-- CLIENTS
-- =========================================================
CREATE TABLE public.clients (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  business_type TEXT,
  phone TEXT,
  address TEXT,
  billing_info JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Client manages self" ON public.clients FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff read clients" ON public.clients FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'pm') OR public.has_role(auth.uid(),'hod') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER trg_clients_updated BEFORE UPDATE ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- TALENTS
-- =========================================================
CREATE TABLE public.talents (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tier INT NOT NULL DEFAULT 1 CHECK (tier BETWEEN 1 AND 5),
  department_id UUID REFERENCES public.departments(id),
  skills TEXT[] DEFAULT '{}',
  bank_details JSONB DEFAULT '{}'::jsonb,
  performance_score NUMERIC(4,2) DEFAULT 0,
  total_earnings NUMERIC(14,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.talents TO authenticated;
GRANT ALL ON public.talents TO service_role;
ALTER TABLE public.talents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Talent self" ON public.talents FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff read talents" ON public.talents FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'pm') OR public.has_role(auth.uid(),'hod') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

-- =========================================================
-- STUDENTS
-- =========================================================
CREATE TABLE public.students (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  program_type public.program_type,
  program_name TEXT,
  enrollment_date TIMESTAMPTZ DEFAULT now(),
  current_module TEXT,
  progress_percentage INT DEFAULT 0,
  grades JSONB DEFAULT '{}'::jsonb
);
GRANT SELECT, INSERT, UPDATE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Student self" ON public.students FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- INSTRUCTORS
-- =========================================================
CREATE TABLE public.instructors (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id),
  bio TEXT,
  qualifications TEXT
);
GRANT SELECT ON public.instructors TO authenticated, anon;
GRANT INSERT, UPDATE ON public.instructors TO authenticated;
GRANT ALL ON public.instructors TO service_role;
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads instructors" ON public.instructors FOR SELECT USING (true);
CREATE POLICY "Instructor self" ON public.instructors FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- =========================================================
-- TASKS
-- =========================================================
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_category public.service_category NOT NULL,
  tier public.task_tier NOT NULL DEFAULT 'basic',
  title TEXT NOT NULL,
  description TEXT,
  files JSONB DEFAULT '[]'::jsonb,
  budget_min NUMERIC(14,2),
  budget_max NUMERIC(14,2),
  budget_currency TEXT DEFAULT 'NGN',
  open_to_negotiation BOOLEAN DEFAULT true,
  deadline DATE,
  status public.task_status NOT NULL DEFAULT 'pending',
  department_id UUID REFERENCES public.departments(id),
  assigned_pm_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_talent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Client manages own tasks" ON public.tasks FOR ALL TO authenticated
  USING (auth.uid() = client_id) WITH CHECK (auth.uid() = client_id);
CREATE POLICY "PM reads assigned" ON public.tasks FOR SELECT TO authenticated
  USING (auth.uid() = assigned_pm_id OR auth.uid() = assigned_talent_id);
CREATE POLICY "PM updates assigned" ON public.tasks FOR UPDATE TO authenticated
  USING (auth.uid() = assigned_pm_id OR auth.uid() = assigned_talent_id);
CREATE POLICY "Staff sees all tasks" ON public.tasks FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'hod') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER trg_tasks_updated BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- QUOTES
-- =========================================================
CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  pm_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount NUMERIC(14,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.quotes TO authenticated;
GRANT ALL ON public.quotes TO service_role;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quote visible to task client" ON public.quotes FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_id AND t.client_id = auth.uid()));
CREATE POLICY "Client responds to quote" ON public.quotes FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_id AND t.client_id = auth.uid()));
CREATE POLICY "PM manages quote" ON public.quotes FOR ALL TO authenticated
  USING (auth.uid() = pm_id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (auth.uid() = pm_id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

-- =========================================================
-- PAYMENTS
-- =========================================================
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  amount NUMERIC(14,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  gateway TEXT,
  transaction_ref TEXT,
  status public.payment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Client sees own payments" ON public.payments FOR SELECT TO authenticated
  USING (auth.uid() = client_id);
CREATE POLICY "Client creates payment" ON public.payments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Finance sees payments" ON public.payments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

-- =========================================================
-- PAYROLL
-- =========================================================
CREATE TABLE public.payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  tasks_completed JSONB DEFAULT '[]'::jsonb,
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'NGN',
  status TEXT NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payroll TO authenticated;
GRANT ALL ON public.payroll TO service_role;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Talent sees own payroll" ON public.payroll FOR SELECT TO authenticated
  USING (auth.uid() = talent_id);
CREATE POLICY "Finance sees payroll" ON public.payroll FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

-- =========================================================
-- COURSES
-- =========================================================
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_type public.program_type NOT NULL,
  program_name TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  duration TEXT,
  tuition_ngn NUMERIC(14,2) NOT NULL DEFAULT 0,
  description TEXT,
  modules JSONB DEFAULT '[]'::jsonb,
  instructor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  cover_image TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.courses TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads published courses" ON public.courses FOR SELECT USING (is_published = true);
CREATE POLICY "Instructor manages course" ON public.courses FOR ALL TO authenticated
  USING (auth.uid() = instructor_id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (auth.uid() = instructor_id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

-- =========================================================
-- ENROLLMENTS
-- =========================================================
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active',
  progress INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.enrollments TO authenticated;
GRANT ALL ON public.enrollments TO service_role;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Student sees own enrollment" ON public.enrollments FOR ALL TO authenticated
  USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

-- =========================================================
-- CERTIFICATES
-- =========================================================
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  certificate_number TEXT NOT NULL UNIQUE,
  qr_code TEXT,
  issue_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  grade TEXT
);
GRANT SELECT ON public.certificates TO authenticated, anon;
GRANT ALL ON public.certificates TO service_role;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone verifies certificate" ON public.certificates FOR SELECT USING (true);

-- =========================================================
-- MESSAGES (real-time chat)
-- =========================================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Messages: participants read" ON public.messages FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Messages: sender insert" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Messages: receiver mark read" ON public.messages FOR UPDATE TO authenticated
  USING (auth.uid() = receiver_id);

ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;

-- =========================================================
-- STORAGE policies for task-files bucket (bucket created via tool)
-- =========================================================
-- Policies are added after bucket creation.
