-- Hosts (managed people who appear on property pages)
create table if not exists public.hosts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar_url text,
  email text,
  phone text,
  bio text default '',
  joined_year text,
  is_superhost boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.properties
  add column if not exists host_id uuid references public.hosts(id) on delete set null;

alter table public.hosts enable row level security;

drop policy if exists "Anyone can read active hosts" on public.hosts;
create policy "Anyone can read active hosts"
  on public.hosts for select
  using (is_active = true or public.is_admin());

drop policy if exists "Admins manage hosts" on public.hosts;
create policy "Admins manage hosts"
  on public.hosts for all
  using (public.is_admin());

-- Optional: seed from existing property host fields (unique by name)
insert into public.hosts (name, avatar_url, joined_year, is_superhost)
select distinct on (host_name)
  host_name,
  nullif(host_avatar, ''),
  nullif(host_joined, ''),
  coalesce(is_superhost, false)
from public.properties
where host_name is not null and host_name <> ''
on conflict do nothing;
