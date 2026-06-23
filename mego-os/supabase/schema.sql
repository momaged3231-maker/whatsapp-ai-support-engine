-- Mego OS (ميجو) — Supabase schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists "pgcrypto";
create extension if not exists pg_trgm;

-- ============================================================
-- ENUMS
-- ============================================================
create type user_role as enum ('admin', 'staff');
create type customer_type as enum ('individual', 'student', 'business', 'real_estate');
create type customer_source as enum ('walk_in', 'facebook', 'whatsapp', 'referral', 'other');
create type device_type as enum ('laptop', 'pc', 'mobile', 'receiver', 'printer', 'router', 'camera', 'other');
create type order_status as enum (
  'new', 'checking', 'waiting_customer_approval', 'waiting_part',
  'in_progress', 'ready', 'delivered', 'cancelled'
);
create type order_priority as enum ('normal', 'urgent');
create type service_category as enum (
  'repair', 'printing', 'student', 'business', 'cctv', 'network',
  'receiver', 'ads', 'signage', 'accessory', 'other'
);
create type sale_type as enum ('service', 'product', 'mixed');
create type payment_method as enum ('cash', 'instapay', 'vodafone_cash', 'bank', 'other');
create type item_type as enum ('service', 'product');
create type expense_category as enum (
  'rent', 'tools', 'paint', 'electricity', 'internet', 'ads', 'stock', 'transport', 'other'
);
create type subscription_package as enum ('Start', 'Business', 'Pro', 'Custom');
create type subscription_status as enum ('active', 'paused', 'cancelled', 'expired');
create type followup_status as enum ('pending', 'done', 'cancelled');
create type print_job_type as enum (
  'print', 'copy', 'scan', 'pdf', 'cv', 'banner', 'signage', 'led', 'sticker', 'other'
);
create type print_job_status as enum ('new', 'in_progress', 'ready', 'delivered', 'cancelled');

-- ============================================================
-- TABLES
-- ============================================================

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role user_role not null default 'staff',
  created_at timestamptz not null default now()
);

create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  phone2 text,
  area text,
  address text,
  customer_type customer_type not null default 'individual',
  source customer_source not null default 'walk_in',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index customers_phone_idx on customers (phone);
create index customers_name_idx on customers using gin (name gin_trgm_ops);

create table repair_orders (
  id uuid primary key default gen_random_uuid(),
  order_no text unique,
  customer_id uuid not null references customers (id) on delete restrict,
  device_type device_type not null default 'other',
  device_brand text,
  device_model text,
  problem_description text not null,
  received_accessories text,
  device_condition text,
  data_privacy_note text,
  estimated_price numeric(10, 2),
  final_price numeric(10, 2),
  paid_amount numeric(10, 2) not null default 0,
  status order_status not null default 'new',
  priority order_priority not null default 'normal',
  received_at timestamptz not null default now(),
  expected_delivery_at timestamptz,
  delivered_at timestamptz,
  technician_notes text,
  customer_notes text,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index repair_orders_order_no_idx on repair_orders (order_no);
create index repair_orders_status_idx on repair_orders (status);
create index repair_orders_created_at_idx on repair_orders (created_at);
create index repair_orders_customer_idx on repair_orders (customer_id);

create table services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category service_category not null default 'other',
  starting_price numeric(10, 2),
  cost_estimate numeric(10, 2),
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  sku text,
  quantity integer not null default 0,
  purchase_price numeric(10, 2),
  selling_price numeric(10, 2),
  min_quantity integer not null default 1,
  supplier_name text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index inventory_items_sku_idx on inventory_items (sku);

create table sales (
  id uuid primary key default gen_random_uuid(),
  sale_no text unique,
  customer_id uuid references customers (id) on delete set null,
  order_id uuid references repair_orders (id) on delete set null,
  sale_type sale_type not null default 'product',
  total_amount numeric(10, 2) not null default 0,
  paid_amount numeric(10, 2) not null default 0,
  payment_method payment_method not null default 'cash',
  notes text,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);
create index sales_sale_no_idx on sales (sale_no);
create index sales_created_at_idx on sales (created_at);

create table sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales (id) on delete cascade,
  item_type item_type not null default 'product',
  item_name text not null,
  inventory_item_id uuid references inventory_items (id),
  quantity numeric(10, 2) not null default 1,
  unit_price numeric(10, 2) not null default 0,
  total_price numeric(10, 2) not null default 0
);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category expense_category not null default 'other',
  amount numeric(10, 2) not null,
  payment_method payment_method not null default 'cash',
  expense_date date not null default current_date,
  notes text,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);
create index expenses_date_idx on expenses (expense_date);
create index expenses_category_idx on expenses (category);

create table business_subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers (id) on delete restrict,
  business_name text not null,
  package_name subscription_package not null default 'Start',
  monthly_price numeric(10, 2) not null default 0,
  start_date date not null default current_date,
  renewal_date date not null,
  status subscription_status not null default 'active',
  included_visits integer not null default 0,
  used_visits integer not null default 0,
  included_remote_support boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index business_subscriptions_status_idx on business_subscriptions (status);
create index business_subscriptions_renewal_idx on business_subscriptions (renewal_date);

create table followups (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers (id) on delete cascade,
  order_id uuid references repair_orders (id) on delete set null,
  title text not null,
  followup_date date not null default current_date,
  status followup_status not null default 'pending',
  notes text,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);
create index followups_status_idx on followups (status);
create index followups_date_idx on followups (followup_date);

create table print_jobs (
  id uuid primary key default gen_random_uuid(),
  job_no text unique,
  customer_id uuid references customers (id) on delete set null,
  job_type print_job_type not null default 'print',
  description text not null,
  quantity numeric(10, 2) not null default 1,
  unit_price numeric(10, 2) not null default 0,
  total_price numeric(10, 2) not null default 0,
  paid_amount numeric(10, 2) not null default 0,
  status print_job_status not null default 'new',
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index print_jobs_job_no_idx on print_jobs (job_no);
create index print_jobs_status_idx on print_jobs (status);

-- Payment ledger: records each individual payment event against an order,
-- print job, or subscription so daily/monthly income reports stay accurate
-- even though paid_amount on the parent record is a running total.
create table payments (
  id uuid primary key default gen_random_uuid(),
  repair_order_id uuid references repair_orders (id) on delete cascade,
  print_job_id uuid references print_jobs (id) on delete cascade,
  business_subscription_id uuid references business_subscriptions (id) on delete cascade,
  amount numeric(10, 2) not null,
  payment_method payment_method not null default 'cash',
  paid_at timestamptz not null default now(),
  notes text,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  constraint payments_one_target check (
    (repair_order_id is not null)::int + (print_job_id is not null)::int + (business_subscription_id is not null)::int = 1
  )
);
create index payments_paid_at_idx on payments (paid_at);

create table settings (
  id int primary key default 1,
  shop_name text not null default 'ميجو',
  phone text,
  whatsapp text,
  address text,
  slogan text,
  receipt_footer text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint settings_singleton check (id = 1)
);

-- ============================================================
-- AUTO NUMBERING (order_no / sale_no / job_no)
-- ============================================================

create sequence repair_order_seq start 1;
create sequence sale_seq start 1;
create sequence print_job_seq start 1;

create or replace function set_order_no() returns trigger as $$
begin
  if new.order_no is null then
    new.order_no := 'MGO-' || lpad(nextval('repair_order_seq')::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

create or replace function set_sale_no() returns trigger as $$
begin
  if new.sale_no is null then
    new.sale_no := 'SL-' || lpad(nextval('sale_seq')::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

create or replace function set_job_no() returns trigger as $$
begin
  if new.job_no is null then
    new.job_no := 'PJ-' || lpad(nextval('print_job_seq')::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_set_order_no before insert on repair_orders
  for each row execute function set_order_no();

create trigger trg_set_sale_no before insert on sales
  for each row execute function set_sale_no();

create trigger trg_set_job_no before insert on print_jobs
  for each row execute function set_job_no();

-- updated_at maintenance
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger trg_customers_updated_at before update on customers
  for each row execute function set_updated_at();
create trigger trg_repair_orders_updated_at before update on repair_orders
  for each row execute function set_updated_at();
create trigger trg_inventory_items_updated_at before update on inventory_items
  for each row execute function set_updated_at();
create trigger trg_business_subscriptions_updated_at before update on business_subscriptions
  for each row execute function set_updated_at();
create trigger trg_print_jobs_updated_at before update on print_jobs
  for each row execute function set_updated_at();
create trigger trg_settings_updated_at before update on settings
  for each row execute function set_updated_at();

-- auto-create profile row on signup
create or replace function handle_new_user() returns trigger as $$
begin
  insert into profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'staff');
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- Any authenticated user (every shop staff member has a Supabase login)
-- can read/write operational data. Only admins can delete financial
-- records (sales, expenses, orders, subscriptions) or manage settings.
-- ============================================================

alter table profiles enable row level security;
alter table customers enable row level security;
alter table repair_orders enable row level security;
alter table services enable row level security;
alter table inventory_items enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table expenses enable row level security;
alter table business_subscriptions enable row level security;
alter table followups enable row level security;
alter table print_jobs enable row level security;
alter table payments enable row level security;
alter table settings enable row level security;

create or replace function is_admin() returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

create policy "profiles_select" on profiles for select using (auth.uid() is not null);
create policy "profiles_update_self" on profiles for update using (id = auth.uid());

create policy "customers_all" on customers for all using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "repair_orders_select" on repair_orders for select using (auth.uid() is not null);
create policy "repair_orders_insert" on repair_orders for insert with check (auth.uid() is not null);
create policy "repair_orders_update" on repair_orders for update using (auth.uid() is not null);
create policy "repair_orders_delete" on repair_orders for delete using (is_admin());

create policy "services_all" on services for all using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "inventory_items_all" on inventory_items for all using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "sales_select" on sales for select using (auth.uid() is not null);
create policy "sales_insert" on sales for insert with check (auth.uid() is not null);
create policy "sales_update" on sales for update using (auth.uid() is not null);
create policy "sales_delete" on sales for delete using (is_admin());

create policy "sale_items_select" on sale_items for select using (auth.uid() is not null);
create policy "sale_items_insert" on sale_items for insert with check (auth.uid() is not null);
create policy "sale_items_update" on sale_items for update using (auth.uid() is not null);
create policy "sale_items_delete" on sale_items for delete using (is_admin());

create policy "expenses_select" on expenses for select using (auth.uid() is not null);
create policy "expenses_insert" on expenses for insert with check (auth.uid() is not null);
create policy "expenses_update" on expenses for update using (is_admin());
create policy "expenses_delete" on expenses for delete using (is_admin());

create policy "business_subscriptions_select" on business_subscriptions for select using (auth.uid() is not null);
create policy "business_subscriptions_insert" on business_subscriptions for insert with check (auth.uid() is not null);
create policy "business_subscriptions_update" on business_subscriptions for update using (auth.uid() is not null);
create policy "business_subscriptions_delete" on business_subscriptions for delete using (is_admin());

create policy "followups_all" on followups for all using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "print_jobs_select" on print_jobs for select using (auth.uid() is not null);
create policy "print_jobs_insert" on print_jobs for insert with check (auth.uid() is not null);
create policy "print_jobs_update" on print_jobs for update using (auth.uid() is not null);
create policy "print_jobs_delete" on print_jobs for delete using (is_admin());

create policy "payments_select" on payments for select using (auth.uid() is not null);
create policy "payments_insert" on payments for insert with check (auth.uid() is not null);
create policy "payments_delete" on payments for delete using (is_admin());

create policy "settings_select" on settings for select using (auth.uid() is not null);
create policy "settings_update" on settings for update using (is_admin());
create policy "settings_insert" on settings for insert with check (is_admin());
