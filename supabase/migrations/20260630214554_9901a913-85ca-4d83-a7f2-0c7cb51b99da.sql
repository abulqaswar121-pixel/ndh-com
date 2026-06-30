
CREATE OR REPLACE FUNCTION public.is_finance_staff(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT public.has_role(_uid,'finance') OR public.has_role(_uid,'admin') OR public.has_role(_uid,'super_admin');
$$;

CREATE TABLE public.invoices(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  client_id uuid REFERENCES auth.users ON DELETE SET NULL,
  task_id uuid REFERENCES public.tasks ON DELETE SET NULL,
  currency text NOT NULL DEFAULT 'NGN',
  subtotal numeric(14,2) NOT NULL DEFAULT 0,
  tax numeric(14,2) NOT NULL DEFAULT 0,
  total numeric(14,2) NOT NULL DEFAULT 0,
  amount_paid numeric(14,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  due_date date,
  issued_at timestamptz,
  paid_at timestamptz,
  line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  created_by uuid REFERENCES auth.users ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "finance manages invoices" ON public.invoices FOR ALL TO authenticated
  USING (public.is_finance_staff(auth.uid())) WITH CHECK (public.is_finance_staff(auth.uid()));
CREATE POLICY "clients view own invoices" ON public.invoices FOR SELECT TO authenticated
  USING (client_id = auth.uid());
CREATE TRIGGER trg_invoices_updated BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq START 1000;
CREATE OR REPLACE FUNCTION public.next_invoice_number()
RETURNS text LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
  SELECT 'NDH-INV-' || to_char(now(),'YYYY') || '-' || lpad(nextval('public.invoice_number_seq')::text,6,'0');
$$;

CREATE TABLE public.expenses(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  vendor text,
  description text,
  amount numeric(14,2) NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  spent_on date NOT NULL DEFAULT CURRENT_DATE,
  receipt_url text,
  status text NOT NULL DEFAULT 'pending',
  submitted_by uuid REFERENCES auth.users ON DELETE SET NULL,
  approved_by uuid REFERENCES auth.users ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT ALL ON public.expenses TO service_role;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "finance manages expenses" ON public.expenses FOR ALL TO authenticated
  USING (public.is_finance_staff(auth.uid())) WITH CHECK (public.is_finance_staff(auth.uid()));
CREATE POLICY "submitter views own expenses" ON public.expenses FOR SELECT TO authenticated
  USING (submitted_by = auth.uid());
CREATE TRIGGER trg_expenses_updated BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.refunds(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid REFERENCES public.payments ON DELETE SET NULL,
  client_id uuid REFERENCES auth.users ON DELETE SET NULL,
  amount numeric(14,2) NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  reason text,
  status text NOT NULL DEFAULT 'requested',
  requested_by uuid REFERENCES auth.users ON DELETE SET NULL,
  processed_by uuid REFERENCES auth.users ON DELETE SET NULL,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.refunds TO authenticated;
GRANT ALL ON public.refunds TO service_role;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "finance manages refunds" ON public.refunds FOR ALL TO authenticated
  USING (public.is_finance_staff(auth.uid())) WITH CHECK (public.is_finance_staff(auth.uid()));
CREATE POLICY "clients view own refunds" ON public.refunds FOR SELECT TO authenticated
  USING (client_id = auth.uid());
CREATE TRIGGER trg_refunds_updated BEFORE UPDATE ON public.refunds
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.finance_ledger(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  type text NOT NULL,
  direction text NOT NULL,
  amount numeric(14,2) NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  reference_table text,
  reference_id uuid,
  memo text,
  created_by uuid REFERENCES auth.users ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.finance_ledger TO authenticated;
GRANT ALL ON public.finance_ledger TO service_role;
ALTER TABLE public.finance_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "finance manages ledger" ON public.finance_ledger FOR ALL TO authenticated
  USING (public.is_finance_staff(auth.uid())) WITH CHECK (public.is_finance_staff(auth.uid()));
