
-- Roles enum + table
create type public.app_role as enum ('admin', 'editor', 'customer');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Users view own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users view own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "Admins manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- updated_at helper
create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create trigger update_profiles_updated_at before update on public.profiles
for each row execute function public.update_updated_at_column();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone')
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role)
  values (new.id, 'customer')
  on conflict do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Blog posts
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text not null,
  cover_image_url text,
  tag text,
  read_minutes int default 5,
  author_id uuid references auth.users(id) on delete set null,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.blog_posts to anon, authenticated;
grant insert, update, delete on public.blog_posts to authenticated;
grant all on public.blog_posts to service_role;
alter table public.blog_posts enable row level security;
create policy "Anyone reads published posts" on public.blog_posts for select using (published = true);
create policy "Admins/editors read all posts" on public.blog_posts for select to authenticated using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));
create policy "Admins/editors manage posts" on public.blog_posts for all to authenticated using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor')) with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));
create trigger update_blog_posts_updated_at before update on public.blog_posts for each row execute function public.update_updated_at_column();

-- Customer projects
create type public.project_status as enum ('lead','design','production','installation','completed','on_hold');
create table public.customer_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  location text,
  status public.project_status not null default 'lead',
  progress int not null default 0,
  next_milestone text,
  next_milestone_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.customer_projects to authenticated;
grant all on public.customer_projects to service_role;
alter table public.customer_projects enable row level security;
create policy "Users view own projects" on public.customer_projects for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "Admins manage projects" on public.customer_projects for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger update_customer_projects_updated_at before update on public.customer_projects for each row execute function public.update_updated_at_column();

-- Smart questionnaire responses
create table public.questionnaire_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  contact_name text,
  contact_phone text,
  contact_email text,
  space_type text,
  space_size text,
  style text,
  budget text,
  timeline text,
  features jsonb default '[]'::jsonb,
  recommendation text,
  created_at timestamptz not null default now()
);
grant insert on public.questionnaire_responses to anon, authenticated;
grant select on public.questionnaire_responses to authenticated;
grant all on public.questionnaire_responses to service_role;
alter table public.questionnaire_responses enable row level security;
create policy "Anyone can submit questionnaire" on public.questionnaire_responses for insert to anon, authenticated with check (true);
create policy "Users view own responses" on public.questionnaire_responses for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
