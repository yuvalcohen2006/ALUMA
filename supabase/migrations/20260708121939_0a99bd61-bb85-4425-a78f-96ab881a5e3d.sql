DROP POLICY IF EXISTS "site_collections public read" ON public.site_collections;
DROP POLICY IF EXISTS "site_collection_products public read" ON public.site_collection_products;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;

CREATE POLICY "site_collections published public read"
ON public.site_collections
FOR SELECT
TO anon, authenticated
USING (published = true);

CREATE POLICY "site_collections admin read all"
ON public.site_collections
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "site_collection_products published public read"
ON public.site_collection_products
FOR SELECT
TO anon, authenticated
USING (published = true);

CREATE POLICY "site_collection_products admin read all"
ON public.site_collection_products
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));