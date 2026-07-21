-- Fix the admin lockout introduced by 20260716052325.
--
-- 1) That migration revoked EXECUTE on has_role() from `authenticated`. But
--    has_role() is called INSIDE many RLS policies (blog_posts, customer_projects,
--    site_collections, contact_leads, ...). Postgres checks EXECUTE against the
--    querying role even for SECURITY DEFINER functions, so the revoke breaks those
--    policies for every logged-in user. Restore the grant. (The client no longer
--    calls it directly — useIsAdmin now queries user_roles — so this is only for
--    in-policy use.)
grant execute on function public.has_role(uuid, public.app_role) to authenticated;

-- 2) The admin CMS (customers / orders / team screens) reads the full profiles
--    table, but profiles only had owner-scoped SELECT policies, so admins saw
--    only their own row. Add an admin-read policy.
drop policy if exists "Admins read all profiles" on public.profiles;
create policy "Admins read all profiles"
on public.profiles
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));
