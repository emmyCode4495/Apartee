alter table public.property_types
  add column if not exists show_in_nav boolean not null default false;

-- Seed a few for nav if none selected yet
update public.property_types
set show_in_nav = true
where slug in ('apartment', 'villa', 'hotel')
  and not exists (
    select 1 from public.property_types where show_in_nav = true
  );
