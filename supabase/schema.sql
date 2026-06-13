-- Closet Collective — Supabase schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).

create extension if not exists pgcrypto;

-- ──────────────────────────────────────────────
-- Listings
-- ──────────────────────────────────────────────
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric not null check (price >= 0),
  condition text not null default '',
  size text not null default '',
  category text not null check (category in ('tops', 'bottoms', 'dresses', 'accessories')),
  seller text not null,
  status text not null default 'available' check (status in ('available', 'reserved', 'sold')),
  image text not null default '',
  images jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- If you created the table before multi-photo support, add the column:
alter table public.listings
  add column if not exists images jsonb not null default '[]'::jsonb;

-- ──────────────────────────────────────────────
-- Orders (website checkout)
-- ──────────────────────────────────────────────
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings (id) on delete set null,
  listing_name text not null,
  amount numeric not null check (amount >= 0),
  buyer_name text not null,
  buyer_email text not null,
  delivery_method text not null default '',
  notes text not null default '',
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled')),
  stripe_session_id text,
  stripe_payment_intent text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

-- ──────────────────────────────────────────────
-- Editable site content (single JSON row)
-- ──────────────────────────────────────────────
create table if not exists public.site_content (
  id text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- Row Level Security
-- The app's server uses the service-role key for writes (it bypasses RLS).
-- Anonymous visitors only ever need read access to listings + site content.
-- ──────────────────────────────────────────────
alter table public.listings enable row level security;
alter table public.orders enable row level security;
alter table public.site_content enable row level security;

drop policy if exists "Public can read listings" on public.listings;
create policy "Public can read listings"
  on public.listings for select
  using (true);

drop policy if exists "Public can read site content" on public.site_content;
create policy "Public can read site content"
  on public.site_content for select
  using (true);

-- No anon policies on orders: buyer details stay server-side only.

-- ──────────────────────────────────────────────
-- Storage bucket for listing photos (public read)
-- ──────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

drop policy if exists "Public can view listing photos" on storage.objects;
create policy "Public can view listing photos"
  on storage.objects for select
  using (bucket_id = 'listing-photos');
