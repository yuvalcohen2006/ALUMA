-- Customer reviews as real, editable content.
--
-- The home page shipped with fabricated testimonials hardcoded in
-- src/data/testimonials.ts, behind a "do not ship as real reviews" banner —
-- publishing invented, named customer reviews is deceptive advertising. The
-- reviews band reads this table and falls back to those placeholders only
-- while it is empty, so entering three real rows here retires them.
create table if not exists public.site_reviews (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  name text not null,
  -- City, or the product they bought. Shown under the name.
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

-- Visitors read published reviews only; a draft must never leak to the site.
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
