
DROP POLICY IF EXISTS "admin assets read all" ON storage.objects;
DROP POLICY IF EXISTS "admin assets write" ON storage.objects;
DROP POLICY IF EXISTS "admin assets update" ON storage.objects;
DROP POLICY IF EXISTS "admin assets delete" ON storage.objects;

CREATE POLICY "admin assets read all" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = ANY (ARRAY['site-projects','site-hero','blog-images','site-collections']) AND has_role(auth.uid(),'admin'));

CREATE POLICY "admin assets write" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = ANY (ARRAY['site-projects','site-hero','blog-images','site-collections']) AND has_role(auth.uid(),'admin'));

CREATE POLICY "admin assets update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = ANY (ARRAY['site-projects','site-hero','blog-images','site-collections']) AND has_role(auth.uid(),'admin'))
WITH CHECK (bucket_id = ANY (ARRAY['site-projects','site-hero','blog-images','site-collections']) AND has_role(auth.uid(),'admin'));

CREATE POLICY "admin assets delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = ANY (ARRAY['site-projects','site-hero','blog-images','site-collections']) AND has_role(auth.uid(),'admin'));
