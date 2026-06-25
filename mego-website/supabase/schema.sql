-- Mego website — Supabase schema
-- Run this in the Supabase SQL editor.

create extension if not exists "pgcrypto";

create type request_status as enum ('new', 'contacted', 'booked', 'done', 'cancelled');

create table if not exists service_requests (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  customer_type text not null,
  service_type text not null,
  service_place text not null,
  area text not null,
  description text not null,
  preferred_time text,
  status request_status not null default 'new',
  source text not null default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists service_requests_status_idx on service_requests (status);
create index if not exists service_requests_created_at_idx on service_requests (created_at desc);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists service_requests_set_updated_at on service_requests;
create trigger service_requests_set_updated_at
  before update on service_requests
  for each row
  execute function set_updated_at();

alter table service_requests enable row level security;

-- Allow anonymous website visitors to submit requests only.
create policy "Public can insert service requests"
  on service_requests for insert
  to anon
  with check (true);

-- Reads/updates are restricted to the service role (used by the admin page server-side).
create policy "Service role can read service requests"
  on service_requests for select
  to service_role
  using (true);

create policy "Service role can update service requests"
  on service_requests for update
  to service_role
  using (true);
