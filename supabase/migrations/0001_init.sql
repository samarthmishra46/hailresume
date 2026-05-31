-- Resume Builder — initial schema, RLS, signup trigger, storage buckets.
-- Run in the Supabase SQL editor (or via `supabase db push`).

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  role        text not null default 'client' check (role in ('client', 'admin')),
  created_at  timestamptz not null default now()
);

create table if not exists public.templates (
  id              uuid primary key default gen_random_uuid(),
  name            text not null default 'Untitled template',
  status          text not null default 'draft' check (status in ('draft', 'published')),
  created_by      uuid references auth.users (id) on delete set null,
  source_pdf_path text,                 -- path within the `resume-pdfs` bucket
  html_template   text not null default '',  -- Handlebars HTML
  schema          jsonb not null default '{"sections": []}'::jsonb,
  thumbnail_path  text,                 -- path within the `logos` (public) bucket
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.resumes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  template_id uuid not null references public.templates (id) on delete cascade,
  title       text not null default 'My Resume',
  data        jsonb not null default '{}'::jsonb,  -- filled values, toggles, custom fields, asset URLs
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists resumes_user_id_idx on public.resumes (user_id);
create index if not exists templates_status_idx on public.templates (status);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists templates_set_updated_at on public.templates;
create trigger templates_set_updated_at before update on public.templates
  for each row execute function public.set_updated_at();

drop trigger if exists resumes_set_updated_at on public.resumes;
create trigger resumes_set_updated_at before update on public.resumes
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-create a profile row when a new auth user signs up
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Admin helper (used by RLS). SECURITY DEFINER avoids recursive RLS on profiles.
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles  enable row level security;
alter table public.templates enable row level security;
alter table public.resumes   enable row level security;

-- profiles: a user can read/update their own row; admins can read all.
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- templates: clients read only published; admins do everything.
drop policy if exists templates_select_published on public.templates;
create policy templates_select_published on public.templates
  for select using (status = 'published' or public.is_admin());

drop policy if exists templates_admin_write on public.templates;
create policy templates_admin_write on public.templates
  for all using (public.is_admin()) with check (public.is_admin());

-- resumes: each user fully owns their own rows.
drop policy if exists resumes_owner_all on public.resumes;
create policy resumes_owner_all on public.resumes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('resume-pdfs', 'resume-pdfs', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

-- resume-pdfs (private): only admins may read/write.
drop policy if exists "resume-pdfs admin read" on storage.objects;
create policy "resume-pdfs admin read" on storage.objects
  for select using (bucket_id = 'resume-pdfs' and public.is_admin());

drop policy if exists "resume-pdfs admin write" on storage.objects;
create policy "resume-pdfs admin write" on storage.objects
  for insert with check (bucket_id = 'resume-pdfs' and public.is_admin());

-- logos (public bucket): anyone can read; any authenticated user can upload
-- their own files (logos, photos) and admins can upload thumbnails.
drop policy if exists "logos public read" on storage.objects;
create policy "logos public read" on storage.objects
  for select using (bucket_id = 'logos');

drop policy if exists "logos auth upload" on storage.objects;
create policy "logos auth upload" on storage.objects
  for insert with check (bucket_id = 'logos' and auth.role() = 'authenticated');

drop policy if exists "logos owner update" on storage.objects;
create policy "logos owner update" on storage.objects
  for update using (bucket_id = 'logos' and owner = auth.uid());

-- ---------------------------------------------------------------------------
-- Grant yourself admin (run AFTER you have logged in once with Google):
--   update public.profiles set role = 'admin' where email = 'you@example.com';
-- ---------------------------------------------------------------------------
