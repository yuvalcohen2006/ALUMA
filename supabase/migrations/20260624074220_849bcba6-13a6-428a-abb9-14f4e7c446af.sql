DROP POLICY IF EXISTS "admin assets read all" ON storage.objects;
CREATE POLICY "admin assets read all"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = ANY (ARRAY['site-projects'::text, 'site-hero'::text, 'blog-images'::text])
  AND has_role(auth.uid(), 'admin'::app_role)
);