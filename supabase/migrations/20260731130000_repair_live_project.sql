-- Repair pass against the live project (jzqayfllojeqivwbbuyf).
--
-- Probing every table the app uses with the anon key showed the schema had
-- drifted from this repo in two places. Everything here is idempotent, so it is
-- safe to run more than once and safe to run on a database that is already
-- correct.
--
-- Findings:
--   • site_reviews did not exist   → the newest migration had never been applied
--   • site_projects rejected anon  → the public projects page could not read it
--   • contact_leads rejects anon   → CORRECT, left alone. Leads are written by
--                                     the edge function and must never be
--                                     publicly readable.

-- ---------------------------------------------------------------------------
-- 1. site_reviews (repeat of 20260731120000, written idempotently)
-- ---------------------------------------------------------------------------
create table if not exists public.site_reviews (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  name text not null,
  meta text,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site_reviews_published_order_idx
  on public.site_reviews (published, sort_order);

alter table public.site_reviews enable row level security;

grant select on public.site_reviews to anon, authenticated;
grant insert, update, delete on public.site_reviews to authenticated;

drop policy if exists "Public reads published reviews" on public.site_reviews;
create policy "Public reads published reviews" on public.site_reviews
  for select to anon, authenticated using (published = true);

drop policy if exists "Admins read all reviews" on public.site_reviews;
create policy "Admins read all reviews" on public.site_reviews
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins write reviews" on public.site_reviews;
create policy "Admins write reviews" on public.site_reviews
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------------
-- 2. site_projects — restore public read
-- ---------------------------------------------------------------------------
-- Anon was missing the table-level GRANT, which PostgREST rejects with a 401
-- before RLS is even consulted. So the public projects page got an error rather
-- than an empty list, and no policy change alone would have fixed it.
grant select on public.site_projects to anon, authenticated;

-- Split the visitor policy out from the admin one and scope it to anon.
-- The original combined `published = true or has_role(auth.uid(), 'admin')`
-- evaluates has_role with a NULL uid on every anonymous request, which is work
-- (and a failure mode) for no benefit — a logged-out visitor is never an admin.
drop policy if exists "site_projects public read" on public.site_projects;
create policy "site_projects public read" on public.site_projects
  for select to anon, authenticated using (published = true);

drop policy if exists "site_projects admin read" on public.site_projects;
create policy "site_projects admin read" on public.site_projects
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
