
-- payroll_runs
CREATE TABLE public.payroll_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start date NOT NULL,
  period_end date NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  total_amount numeric(14,2) NOT NULL DEFAULT 0,
  talent_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft', -- draft | approved | processing | completed | failed
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payroll_runs TO authenticated;
GRANT ALL ON public.payroll_runs TO service_role;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "finance manages payroll_runs" ON public.payroll_runs
  FOR ALL TO authenticated
  USING (public.is_finance_staff(auth.uid()))
  WITH CHECK (public.is_finance_staff(auth.uid()));
CREATE TRIGGER trg_payroll_runs_updated BEFORE UPDATE ON public.payroll_runs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Extend payroll
ALTER TABLE public.payroll
  ADD COLUMN IF NOT EXISTS run_id uuid REFERENCES public.payroll_runs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS gross_amount numeric(14,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deductions numeric(14,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tasks_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paystack_recipient_code text,
  ADD COLUMN IF NOT EXISTS paystack_transfer_code text,
  ADD COLUMN IF NOT EXISTS transfer_status text,
  ADD COLUMN IF NOT EXISTS transfer_reference text,
  ADD COLUMN IF NOT EXISTS failure_reason text,
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS trg_payroll_updated ON public.payroll;
CREATE TRIGGER trg_payroll_updated BEFORE UPDATE ON public.payroll
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP POLICY IF EXISTS "Finance sees payroll" ON public.payroll;
DROP POLICY IF EXISTS "Talent sees own payroll" ON public.payroll;
CREATE POLICY "finance manages payroll" ON public.payroll
  FOR ALL TO authenticated
  USING (public.is_finance_staff(auth.uid()))
  WITH CHECK (public.is_finance_staff(auth.uid()));
CREATE POLICY "talent views own payroll" ON public.payroll
  FOR SELECT TO authenticated
  USING (auth.uid() = talent_id);

-- talent_payout_accounts
CREATE TABLE public.talent_payout_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_code text NOT NULL,
  bank_name text,
  account_number text NOT NULL,
  account_name text NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  paystack_recipient_code text,
  is_default boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (talent_id, account_number, bank_code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.talent_payout_accounts TO authenticated;
GRANT ALL ON public.talent_payout_accounts TO service_role;
ALTER TABLE public.talent_payout_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "talent manages own payout accounts" ON public.talent_payout_accounts
  FOR ALL TO authenticated
  USING (auth.uid() = talent_id)
  WITH CHECK (auth.uid() = talent_id);
CREATE POLICY "finance views payout accounts" ON public.talent_payout_accounts
  FOR SELECT TO authenticated
  USING (public.is_finance_staff(auth.uid()));
CREATE TRIGGER trg_payout_accounts_updated BEFORE UPDATE ON public.talent_payout_accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Aggregator RPC: completed tasks per talent in period
CREATE OR REPLACE FUNCTION public.compute_talent_payroll(_start date, _end date)
RETURNS TABLE(talent_id uuid, tasks_count integer, gross_amount numeric, currency text, task_ids uuid[])
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.assigned_talent_id AS talent_id,
         COUNT(*)::int AS tasks_count,
         COALESCE(SUM(t.talent_pay_rate),0)::numeric AS gross_amount,
         'NGN'::text AS currency,
         array_agg(t.id) AS task_ids
    FROM public.tasks t
   WHERE t.assigned_talent_id IS NOT NULL
     AND t.status = 'completed'
     AND t.completed_at::date BETWEEN _start AND _end
     AND NOT EXISTS (
       SELECT 1 FROM public.payroll p
        WHERE p.talent_id = t.assigned_talent_id
          AND (p.tasks_completed ? t.id::text)
     )
   GROUP BY t.assigned_talent_id;
$$;
