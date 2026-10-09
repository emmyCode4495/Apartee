-- Property types (admin-managed categories)
create table if not exists public.property_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  description text default '',
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

insert into public.property_types (slug, label, sort_order) values
  ('apartment', 'Apartment', 1),
  ('villa', 'Villa', 2),
  ('hotel', 'Hotel', 3),
  ('cabin', 'Cabin', 4),
  ('cottage', 'Cottage', 5)
on conflict (slug) do nothing;

-- Real estate agencies (verified companies)
create table if not exists public.agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  registration_number text,
  registration_docs text[] default '{}',
  contact_email text not null,
  contact_phone text,
  website text,
  address text,
  city text,
  country text default 'Nigeria',
  logo_url text,
  verified_contact_emails text[] default '{}',
  status text not null default 'pending'
    check (status in ('pending', 'verified', 'rejected', 'suspended')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Link properties to agency + free-form type slug
alter table public.properties
  add column if not exists agency_id uuid references public.agencies(id) on delete set null;

alter table public.properties
  add column if not exists type_slug text;

-- Relax old type check if present (Postgres: drop constraint by name if exists)
do $$
begin
  alter table public.properties drop constraint if exists properties_type_check;
exception when undefined_object then null;
end $$;

-- Backfill type_slug from type
update public.properties set type_slug = type where type_slug is null;

-- RLS
alter table public.property_types enable row level security;
alter table public.agencies enable row level security;

drop policy if exists "Anyone can read active types" on public.property_types;
create policy "Anyone can read active types"
  on public.property_types for select using (is_active = true or public.is_admin());

drop policy if exists "Admins manage types" on public.property_types;
create policy "Admins manage types"
  on public.property_types for all using (public.is_admin());

drop policy if exists "Anyone can read verified agencies" on public.agencies;
create policy "Anyone can read verified agencies"
  on public.agencies for select using (status = 'verified' or public.is_admin());

drop policy if exists "Admins manage agencies" on public.agencies;
create policy "Admins manage agencies"
  on public.agencies for all using (public.is_admin());

-- Storage buckets (run in dashboard or via API; documented here)
-- property-images, agency-docs — public read, authenticated upload
