
create policy "admin assets read all" on storage.objects for select using (bucket_id in ('site-projects','site-hero','blog-images'));
create policy "admin assets write" on storage.objects for insert to authenticated with check (bucket_id in ('site-projects','site-hero','blog-images') and public.has_role(auth.uid(),'admin'));
create policy "admin assets update" on storage.objects for update to authenticated using (bucket_id in ('site-projects','site-hero','blog-images') and public.has_role(auth.uid(),'admin')) with check (bucket_id in ('site-projects','site-hero','blog-images') and public.has_role(auth.uid(),'admin'));
create policy "admin assets delete" on storage.objects for delete to authenticated using (bucket_id in ('site-projects','site-hero','blog-images') and public.has_role(auth.uid(),'admin'));
