-- Additive migration for supplier directory and recurring business accounts.
-- Existing tables and records are untouched.
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  contact text not null default '',
  address text not null default '',
  supplies text not null default '',
  created_at timestamptz not null default now()
);

alter table public.suppliers enable row level security;
drop policy if exists suppliers_all_own on public.suppliers;
create policy suppliers_all_own on public.suppliers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists suppliers_user_name_idx on public.suppliers (user_id, name);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  provider text not null default '',
  amount numeric(14,2) not null default 0 check (amount >= 0),
  day integer not null check (day between 1 and 31),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;
drop policy if exists subscriptions_all_own on public.subscriptions;
create policy subscriptions_all_own on public.subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists subscriptions_user_day_idx on public.subscriptions (user_id, day);
