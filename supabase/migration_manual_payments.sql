-- Manual bank-transfer payments (tamper-resistant references)
alter table public.bookings
  add column if not exists payment_ref text unique,
  add column if not exists payment_status text default 'awaiting_transfer'
    check (payment_status in (
      'awaiting_transfer',
      'claimed_paid',
      'confirmed',
      'rejected',
      'expired'
    )),
  add column if not exists payment_claimed_at timestamptz,
  add column if not exists payment_confirmed_at timestamptz,
  add column if not exists payment_confirmed_by uuid,
  add column if not exists payment_amount_usd numeric(12,2),
  add column if not exists payment_amount_display numeric(14,2),
  add column if not exists payment_currency text default 'NGN',
  add column if not exists payment_signature text,
  add column if not exists bank_account_snapshot jsonb;

create index if not exists bookings_payment_ref_idx on public.bookings (payment_ref);
create index if not exists bookings_payment_status_idx on public.bookings (payment_status);
