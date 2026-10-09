# Apartee — Accommodation Booking

Modern accommodation booking platform with **Next.js 16**, **Supabase**, multi-currency (₦ / $), and a full **admin dashboard**.

## Features

### Public site
- Search, listings, property detail, booking flow
- **Currency**: auto-detect Nigeria → **₦ Naira**; elsewhere → **$ USD**
- Manual toggle in the navbar ($ USD / ₦ NGN)

### Admin dashboard (`/admin`)
- Overview stats (properties, bookings, revenue, users)
- Properties CRUD (create, edit, publish/draft, delete)
- Bookings management (status: pending → confirmed → completed / cancelled)
- Users list (roles: guest, host, admin)
- Settings (FX rate notes, Supabase setup)

### Backend
- Supabase Auth + Postgres (schema in `supabase/schema.sql`)
- Works in **demo mode** without Supabase (static data + demo admin login)

## Quick start

```bash
npm install
cp .env.example .env.local   # optional: add Supabase keys
npm run dev
```

- Site: http://localhost:3000  
- Admin: http://localhost:3000/admin/login  

**Demo admin:** `admin@neststay.com` / `admin123`

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Put keys in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

3. Run `supabase/schema.sql` in the SQL Editor  
4. Auth → create user → set `profiles.role = 'admin'` for that user  

## Currency

| Region | Display currency |
|--------|------------------|
| Nigeria (detected via IP / headers) | ₦ NGN |
| Rest of world | $ USD |

Base prices are always stored in **USD**. Conversion rate: `USD_TO_NGN` in `src/lib/currency.ts` (default 1600).

Force currency for testing:

```env
NEXT_PUBLIC_FORCE_CURRENCY=NGN
```

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19 + TypeScript
- Tailwind CSS 4
- Supabase (Auth, Postgres, RLS)
- Lucide icons

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm start` | Start production server |
