-- Availability for listings (manual + auto on platform bookings)
alter table public.properties
  add column if not exists availability_status text not null default 'available'
    check (availability_status in ('available', 'booked'));

alter table public.properties
  add column if not exists available_from date;

comment on column public.properties.availability_status is 'available | booked';
comment on column public.properties.available_from is 'When booked: first date the stay is free again (usually checkout date)';


