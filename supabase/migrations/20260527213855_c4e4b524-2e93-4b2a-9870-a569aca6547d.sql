
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_hash TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'waiting_payment',
  payment_method TEXT,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  customer_document TEXT,
  raw_payload JSONB,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX sales_created_at_idx ON public.sales (created_at DESC);
CREATE INDEX sales_status_idx ON public.sales (status);

GRANT ALL ON public.sales TO service_role;

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Sem políticas para anon/authenticated: acesso somente via service_role (server functions).
