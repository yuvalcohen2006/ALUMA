
DROP POLICY IF EXISTS "Deny all access to anon" ON public.contact_leads;

CREATE POLICY "Admins can view contact leads"
ON public.contact_leads
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update contact leads"
ON public.contact_leads
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete contact leads"
ON public.contact_leads
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
