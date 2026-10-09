-- NestStay schema for Supabase
-- Run this in Supabase SQL Editor

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  role text not null default 'guest' check (role in ('guest', 'host', 'admin')),
  avatar_url text,
  country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Properties
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location text not null,
  city text not null,
  country text not null,
  type text not null check (type in ('villa', 'apartment', 'cabin', 'hotel', 'cottage')),
  price_per_night_usd numeric(12,2) not null,
  rating numeric(3,2) default 0,
  review_count int default 0,
  guests int not null default 2,
  bedrooms int not null default 1,
  beds int not null default 1,
  baths int not null default 1,
  description text not null default '',
  amenities text[] default '{}',
  images text[] default '{}',
  highlights text[] default '{}',
  host_name text,
  host_avatar text,
  host_joined text,
  is_superhost boolean default false,
  is_published boolean default true,
  lat numeric(10,6),
  lng numeric(10,6),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Bookings
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,
  guest_name text not null,
  guest_email text not null,
  guest_phone text,
  check_in date not null,
  check_out date not null,
  guests int not null default 1,
  nights int not null,
  price_per_night_usd numeric(12,2) not null,
  cleaning_fee_usd numeric(12,2) not null default 75,
  service_fee_usd numeric(12,2) not null default 0,
  total_usd numeric(12,2) not null,
  currency text not null default 'USD' check (currency in ('USD', 'NGN')),
  total_display numeric(14,2),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_properties_published on public.properties(is_published);
create index if not exists idx_properties_type on public.properties(type);
create index if not exists idx_bookings_status on public.bookings(status);
create index if not exists idx_bookings_property on public.bookings(property_id);
create index if not exists idx_profiles_role on public.profiles(role);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'guest')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.bookings enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Admins can manage profiles"
  on public.profiles for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Properties: public read published; admin full access
create policy "Anyone can view published properties"
  on public.properties for select using (is_published = true or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));
create policy "Admins can insert properties"
  on public.properties for insert with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
create policy "Admins can update properties"
  on public.properties for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
create policy "Admins can delete properties"
  on public.properties for delete using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Bookings
create policy "Anyone can create a booking"
  on public.bookings for insert with check (true);
create policy "Users see own bookings; admins see all"
  on public.bookings for select using (
    auth.uid() = user_id
    or guest_email = (select email from public.profiles where id = auth.uid())
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
create policy "Admins can update bookings"
  on public.bookings for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
create policy "Admins can delete bookings"
  on public.bookings for delete using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Seed sample properties (prices in USD)
insert into public.properties (
  title, location, city, country, type, price_per_night_usd, rating, review_count,
  guests, bedrooms, beds, baths, description, amenities, images, highlights,
  host_name, host_avatar, host_joined, is_superhost, is_published, lat, lng
) values
(
  'Sunset Cliff Villa with Infinity Pool',
  'Santorini, Greece', 'Oia', 'Greece', 'villa', 420, 4.97, 128,
  6, 3, 4, 3,
  'Perched on the cliffs of Oia, this whitewashed villa offers breathtaking caldera views and a private infinity pool.',
  array['Infinity pool','Ocean view','Wifi','Kitchen','Air conditioning','Parking'],
  array['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80','https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80'],
  array['Caldera views','Private infinity pool'],
  'Elena M.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80', '2019', true, true, 36.4618, 25.3753
),
(
  'Modern Loft in Lagos Island',
  'Lagos, Nigeria', 'Lagos', 'Nigeria', 'apartment', 85, 4.82, 64,
  3, 1, 2, 1,
  'Stylish loft in the heart of Lagos Island with city views and fast wifi. Perfect for business or leisure.',
  array['Wifi','Kitchen','Air conditioning','Workspace','Elevator','Smart TV'],
  array['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80'],
  array['City centre','Fast wifi'],
  'Ada O.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80', '2021', true, true, 6.4541, 3.3947
),
(
  'Forest Cabin with Hot Tub',
  'Banff, Canada', 'Banff', 'Canada', 'cabin', 265, 4.94, 73,
  4, 2, 3, 1,
  'Secluded log cabin deep in the Rockies with outdoor hot tub and trail access.',
  array['Hot tub','Fireplace','Mountain view','Wifi','Kitchen','BBQ'],
  array['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=80','https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&q=80'],
  array['Outdoor hot tub','Wildlife viewing'],
  'Sarah K.', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80', '2019', true, true, 51.1784, -115.5708
);
