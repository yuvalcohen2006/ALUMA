
CREATE TABLE public.contact_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT,
  source TEXT,
  ip_hash TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contact_leads_created_at ON public.contact_leads (created_at DESC);
CREATE INDEX idx_contact_leads_ip_hash_created_at ON public.contact_leads (ip_hash, created_at DESC);

GRANT ALL ON public.contact_leads TO service_role;

ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;

-- No anon/authenticated policies: leads are only writable/readable by the edge function via service_role.
-- Explicit deny-by-default is enforced because no policies exist for anon/authenticated.
