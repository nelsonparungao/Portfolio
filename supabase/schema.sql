-- Portfolio CMS schema for Supabase.
-- Run this once in Supabase Dashboard -> SQL Editor.

-- ------------------------------------------------------------------
-- 1. Tables
-- ------------------------------------------------------------------
create table if not exists public.site_content (
  id integer primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

alter table public.site_content enable row level security;
alter table public.admins enable row level security;

-- Public visitors may read content; only listed admins may write.
drop policy if exists "Public read site content" on public.site_content;
create policy "Public read site content"
  on public.site_content for select
  using (true);

drop policy if exists "Admins manage site content" on public.site_content;
create policy "Admins manage site content"
  on public.site_content for all
  to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- An admin may check their own membership row.
drop policy if exists "Admins read own row" on public.admins;
create policy "Admins read own row"
  on public.admins for select
  to authenticated
  using (user_id = auth.uid());

-- Keep updated_at accurate.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_content_touch on public.site_content;
create trigger site_content_touch
  before update on public.site_content
  for each row execute function public.touch_updated_at();

-- The editor upserts row id = 1.
insert into public.site_content (id, data)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

-- ------------------------------------------------------------------
-- 2. Permissions
-- ------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.site_content to anon, authenticated;
grant insert, update on public.site_content to authenticated;
grant select on public.admins to authenticated;

-- ------------------------------------------------------------------
-- 3. Storage bucket for uploaded images
-- ------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read media" on storage.objects;
create policy "Public read media"
  on storage.objects for select
  using (bucket_id = 'media');

drop policy if exists "Admins upload media" on storage.objects;
create policy "Admins upload media"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'media'
    and exists (select 1 from public.admins a where a.user_id = auth.uid())
  );

drop policy if exists "Admins update media" on storage.objects;
create policy "Admins update media"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'media'
    and exists (select 1 from public.admins a where a.user_id = auth.uid())
  )
  with check (
    bucket_id = 'media'
    and exists (select 1 from public.admins a where a.user_id = auth.uid())
  );

drop policy if exists "Admins delete media" on storage.objects;
create policy "Admins delete media"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'media'
    and exists (select 1 from public.admins a where a.user_id = auth.uid())
  );

-- ------------------------------------------------------------------
-- 4. Create your admin account
-- ------------------------------------------------------------------
-- A) Dashboard -> Authentication -> Users -> Add user.
--    Set an email + password and confirm the user.
--
-- B) Then run this, replacing the email:
--
--    insert into public.admins (user_id, email)
--    select id, email from auth.users where email = 'you@example.com'
--    on conflict (user_id) do nothing;
--
-- C) Optional: disable public sign-ups in Authentication -> Providers -> Email
--    so only you can create accounts.
