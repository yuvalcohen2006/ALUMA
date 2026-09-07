-- English names, tile emblems, and an explicit home-page selection.
--
-- Three changes that arrived together because they are one job: making the
-- home page and the English site say what the owner chose, instead of what the
-- database happened to return.
--
-- Safe to run twice.

-- ─────────────────────────────────────────────────────────── 1. English names
--
-- site_collections has had name_en since the CMS was built and NOTHING has ever
-- rendered it — the query selected it and every component read name_he, so /en
-- showed English headings wrapped around Hebrew catalogue names. Nothing else
-- had an English name at all.
--
-- Nullable, and staying nullable. The rule that a published item needs both
-- names is enforced in the admin, where it can explain itself; a NOT NULL here
-- would fail 47 existing rows on the next save with a Postgres error the owner
-- cannot act on.

alter table public.site_collection_products
  add column if not exists name_en text;

alter table public.site_projects
  add column if not exists title_en text;

alter table public.blog_posts
  add column if not exists title_en text;

comment on column public.site_collection_products.name_en is
  'The product name in English. The site falls back to the Hebrew name when this is blank.';
comment on column public.site_projects.title_en is
  'The project title in English. Falls back to the Hebrew title when blank.';
comment on column public.blog_posts.title_en is
  'The article title in English. Falls back to the Hebrew title when blank.';

-- ─────────────────────────────────────────────────────────────── 2. Emblems
--
-- An enum, not free text. The existing `tag` column is a free-text field the
-- admin edits with a plain input, so it can hold anything — and an emblem whose
-- value is whatever someone typed cannot be styled, translated, counted or
-- capped. Three values, checked by the database.
--
-- `published_at` is what drives "new", and it is deliberately NOT created_at:
-- created_at is when the ROW was inserted, so a seeded or bulk-imported
-- catalogue would turn new on the same day and stop being new on the same day.

alter table public.site_collection_products
  add column if not exists emblem text,
  add column if not exists published_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'site_collection_products_emblem_check'
  ) then
    alter table public.site_collection_products
      add constraint site_collection_products_emblem_check
      check (emblem is null or emblem in ('popular', 'hot', 'new'));
  end if;
end $$;

comment on column public.site_collection_products.emblem is
  'One of popular | hot | new, or null. Shown as a single word under the tile name.';
comment on column public.site_collection_products.published_at is
  'When this product first went live. Drives the "new" emblem; not created_at, which is when the row was inserted.';

-- Backfill: everything already live has been live for a while, so nothing is
-- retroactively "new".
update public.site_collection_products
  set published_at = created_at
  where published_at is null and published = true;

-- ──────────────────────────────────────────────────── 3. Home page highlights
--
-- The home page had no notion of "featured". It took the first six published
-- products ordered by sort_order — but sort_order is only ever written as an
-- index WITHIN a collection, so globally it is full of ties that Postgres
-- breaks arbitrarily and two visits could show different products. Worse, a new
-- product is saved with sort_order 0, so anything just added jumped straight to
-- the front of the home page.
--
-- A join table rather than a column: the count IS the row count, so "exactly
-- three" is a constraint rather than a convention, and the cascade means
-- deleting a product cannot silently shorten the strip.
--
-- `slot`, not `position` — position() is a SQL function and the column would
-- need quoting forever.

create table if not exists public.site_home_highlights (
  product_id uuid primary key
    references public.site_collection_products(id) on delete cascade,
  slot smallint not null unique check (slot between 1 and 3),
  created_at timestamptz not null default now()
);

comment on table public.site_home_highlights is
  'The products the owner picked for the home page strip. At most three rows, one per slot.';

alter table public.site_home_highlights enable row level security;

drop policy if exists "Public reads home highlights" on public.site_home_highlights;
create policy "Public reads home highlights" on public.site_home_highlights
  for select to anon, authenticated using (true);

drop policy if exists "Admins write home highlights" on public.site_home_highlights;
create policy "Admins write home highlights" on public.site_home_highlights
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

grant select on public.site_home_highlights to anon, authenticated;
grant insert, update, delete on public.site_home_highlights to authenticated;
