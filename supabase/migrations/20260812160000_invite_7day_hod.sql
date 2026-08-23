-- Handoff 5B: Invite-only signup for PM/Talent/Director via single-use 7-day tokens
-- Ensure pm_invitations and talent_invitations have proper defaults and create hod_invitations

-- ================= PM INVITATIONS: ensure defaults =================
ALTER TABLE public.pm_invitations 
  ALTER COLUMN token SET DEFAULT encode(gen_random_bytes(32), 'hex'),
  ALTER COLUMN expires_at SET DEFAULT (now() + interval '7 days'),
  ALTER COLUMN status SET DEFAULT 'pending';

-- Index for token lookup
CREATE INDEX IF NOT EXISTS pm_invitations_token_idx ON public.pm_invitations(token);
CREATE INDEX IF NOT EXISTS pm_invitations_expires_at_idx ON public.pm_invitations(expires_at);

-- ================= TALENT INVITATIONS: ensure defaults =================
ALTER TABLE public.talent_invitations
  ALTER COLUMN token SET DEFAULT encode(gen_random_bytes(32), 'hex'),
  ALTER COLUMN expires_at SET DEFAULT (now() + interval '7 days');

CREATE INDEX IF NOT EXISTS talent_invitations_token_idx ON public.talent_invitations(token);
CREATE INDEX IF NOT EXISTS talent_invitations_expires_at_idx ON public.talent_invitations(expires_at);

-- ================= HOD/DIRECTOR INVITATIONS: new table =================
CREATE TABLE IF NOT EXISTS public.hod_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','expired','revoked')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  accepted_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS hod_invitations_set_updated_at ON public.hod_invitations;
CREATE TRIGGER hod_invitations_set_updated_at BEFORE UPDATE ON public.hod_invitations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hod_invitations TO authenticated;
GRANT ALL ON public.hod_invitations TO service_role;
ALTER TABLE public.hod_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage hod invitations" ON public.hod_invitations;
CREATE POLICY "Admins manage hod invitations" ON public.hod_invitations FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "HOD invitations public read by token" ON public.hod_invitations;
CREATE POLICY "HOD invitations public read by token" ON public.hod_invitations FOR SELECT TO anon, authenticated
USING (true);

CREATE INDEX IF NOT EXISTS hod_invitations_token_idx ON public.hod_invitations(token);
CREATE INDEX IF NOT EXISTS hod_invitations_email_idx ON public.hod_invitations(lower(email));
CREATE INDEX IF NOT EXISTS hod_invitations_expires_at_idx ON public.hod_invitations(expires_at);

-- ================= PUBLIC READ POLICIES FOR INVITE TOKENS (needed for /invite/$token anon) =================
-- Allow anon to read own invite by token for validation (safe because token is secret)
DROP POLICY IF EXISTS "Public can validate PM invitations by token" ON public.pm_invitations;
CREATE POLICY "Public can validate PM invitations by token" ON public.pm_invitations FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public can validate talent invitations by token" ON public.talent_invitations;
CREATE POLICY "Public can validate talent invitations by token" ON public.talent_invitations FOR SELECT TO anon, authenticated USING (true);

-- ================= FUNCTION: validate invite token =================
CREATE OR REPLACE FUNCTION public.validate_invite_token(_token TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check PM invitations
  SELECT jsonb_build_object('type','pm','email',email,'full_name',full_name,'department_id',department_id,'expires_at',expires_at,'status',status)
  INTO result FROM public.pm_invitations WHERE token = _token LIMIT 1;
  IF FOUND THEN RETURN result; END IF;

  -- Talent
  SELECT jsonb_build_object('type','talent','email',email,'full_name',full_name,'department_id',department_id,'tier',tier,'skills',skills,'expires_at',expires_at,'status',status)
  INTO result FROM public.talent_invitations WHERE token = _token LIMIT 1;
  IF FOUND THEN RETURN result; END IF;

  -- HOD
  SELECT jsonb_build_object('type','hod','email',email,'full_name',full_name,'department_id',department_id,'expires_at',expires_at,'status',status)
  INTO result FROM public.hod_invitations WHERE token = _token LIMIT 1;
  IF FOUND THEN RETURN result; END IF;

  RETURN NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_invite_token(TEXT) TO anon, authenticated, service_role;
