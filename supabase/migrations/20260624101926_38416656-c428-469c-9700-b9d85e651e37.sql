
create table public.site_collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_he text not null,
  name_en text,
  intro text,
  image_url text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.site_collections to anon, authenticated;
grant insert, update, delete on public.site_collections to authenticated;
grant all on public.site_collections to service_role;
alter table public.site_collections enable row level security;
create policy "site_collections public read" on public.site_collections for select using (published = true or public.has_role(auth.uid(),'admin'));
create policy "site_collections admin write" on public.site_collections for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger trg_site_collections_updated before update on public.site_collections for each row execute function public.update_updated_at_column();

create table public.site_collection_products (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.site_collections(id) on delete cascade,
  slug text not null unique,
  name text not null,
  tag text,
  tagline text,
  description jsonb not null default '[]'::jsonb,
  highlights jsonb not null default '[]'::jsonb,
  materials jsonb not null default '[]'::jsonb,
  dimensions text,
  cover_url text,
  gallery jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.site_collection_products to anon, authenticated;
grant insert, update, delete on public.site_collection_products to authenticated;
grant all on public.site_collection_products to service_role;
alter table public.site_collection_products enable row level security;
create policy "site_collection_products public read" on public.site_collection_products for select using (published = true or public.has_role(auth.uid(),'admin'));
create policy "site_collection_products admin write" on public.site_collection_products for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger trg_site_collection_products_updated before update on public.site_collection_products for each row execute function public.update_updated_at_column();
create index idx_site_collection_products_collection on public.site_collection_products(collection_id, sort_order);
