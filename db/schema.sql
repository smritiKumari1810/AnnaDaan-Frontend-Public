create extension if not exists "pgcrypto";

create table if not exists public.users (
  id          uuid primary key,
  name        text not null,
  email       text unique not null,
  role        text not null check (role in ('farmer', 'buyer', 'admin')),
  lat         double precision,
  lng         double precision,
  created_at  timestamptz not null default now()
);

create table if not exists public.listings (
  id             uuid primary key default gen_random_uuid(),
  farmer_id      uuid not null references public.users(id) on delete cascade,
  crop_name      text not null,
  quantity       numeric not null,
  price_per_unit numeric not null,
  location_name  text,
  lat            double precision,
  lng            double precision,
  photo_url      text,
  created_at     timestamptz not null default now()
);

create index if not exists listings_crop_idx on public.listings (lower(crop_name));

create table if not exists public.hubs (
  id    uuid primary key default gen_random_uuid(),
  name  text not null,
  lat   double precision not null,
  lng   double precision not null
);

create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  buyer_id        uuid not null references public.users(id) on delete cascade,
  listing_id      uuid not null references public.listings(id) on delete cascade,
  quantity        numeric not null default 1,
  status          text not null default 'confirmed'
                    check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  assigned_hub_id uuid references public.hubs(id),
  created_at      timestamptz not null default now()
);

insert into public.hubs (name, lat, lng) values
  ('Nashik Collection Hub',  19.9975, 73.7898),
  ('Pune Central Hub',       18.5204, 73.8567),
  ('Mumbai Distribution Hub',19.0760, 72.8777),
  ('Nagpur Regional Hub',    21.1458, 79.0882)
on conflict do nothing;

