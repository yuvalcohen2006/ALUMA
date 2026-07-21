-- Lock down contact_leads: only service_role can access. Revoke any inherited grants and add explicit deny-by-default policies.
REVOKE ALL ON public.contact_leads FROM anon;
REVOKE ALL ON public.contact_leads FROM authenticated;
REVOKE ALL ON public.contact_leads FROM PUBLIC;
GRANT ALL ON public.contact_leads TO service_role;

ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_leads FORCE ROW LEVEL SECURITY;

-- Explicit deny policies for anon and authenticated (defense in depth)
DROP POLICY IF EXISTS "Deny all access to anon" ON public.contact_leads;
CREATE POLICY "Deny all access to anon"
  ON public.contact_leads
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);
