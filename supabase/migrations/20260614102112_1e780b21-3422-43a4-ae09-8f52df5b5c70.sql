
-- Site projects (admin-managed)
create table public.site_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  location text,
  category text,
  cover_url text,
  gallery jsonb not null default '[]'::jsonb,
  meta_description text,
  sort_order integer not null default 0,
  views integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.site_projects to anon, authenticated;
grant insert, update, delete on public.site_projects to authenticated;
grant all on public.site_projects to service_role;
alter table public.site_projects enable row level security;
create policy "site_projects public read" on public.site_projects for select using (published = true or public.has_role(auth.uid(),'admin'));
create policy "site_projects admin write" on public.site_projects for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger trg_site_projects_updated before update on public.site_projects for each row execute function public.update_updated_at_column();

-- Site settings (key/value JSONB) for hero, contact info, etc.
create table public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "site_settings public read" on public.site_settings for select using (true);
create policy "site_settings admin write" on public.site_settings for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger trg_site_settings_updated before update on public.site_settings for each row execute function public.update_updated_at_column();

-- Page views (analytics)
create table public.page_views (
  id bigserial primary key,
  session_id text not null,
  path text not null,
  referrer text,
  user_agent text,
  project_slug text,
  created_at timestamptz not null default now()
);
grant insert on public.page_views to anon, authenticated;
grant select on public.page_views to authenticated;
grant all on public.page_views to service_role;
alter table public.page_views enable row level security;
create policy "page_views public insert" on public.page_views for insert to anon, authenticated with check (true);
create policy "page_views admin read" on public.page_views for select to authenticated using (public.has_role(auth.uid(),'admin'));
create index idx_page_views_created_at on public.page_views(created_at desc);
create index idx_page_views_path on public.page_views(path);
create index idx_page_views_project on public.page_views(project_slug);

-- Active sessions (heartbeat-based live visitors)
create table public.active_sessions (
  session_id text primary key,
  path text,
  last_seen timestamptz not null default now()
);
grant insert, update on public.active_sessions to anon, authenticated;
grant select on public.active_sessions to authenticated;
grant all on public.active_sessions to service_role;
alter table public.active_sessions enable row level security;
create policy "active_sessions public upsert" on public.active_sessions for insert to anon, authenticated with check (true);
create policy "active_sessions public update" on public.active_sessions for update to anon, authenticated using (true) with check (true);
create policy "active_sessions admin read" on public.active_sessions for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- Allow admins to read leads
create policy "contact_leads admin read" on public.contact_leads for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "questionnaire admin read" on public.questionnaire_responses for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- Allow admins to manage blog
create policy "blog_posts admin write" on public.blog_posts for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Seed default hero settings
insert into public.site_settings(key, value) values
  ('hero', '{"title_he":"Aluma — סלוני חוץ ופרגולות בעיצוב אישי","subtitle":"Where Outdoor Becomes Lifestyle","desktop_image":"","mobile_image":"","cta_text":"","cta_link":""}'::jsonb),
  ('contact', '{"phone":"","whatsapp":"","email":"","address":"","instagram":"","facebook":"","hours":""}'::jsonb)
on conflict (key) do nothing;
