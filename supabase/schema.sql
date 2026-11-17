-- ============================================================================
-- SEUCONTROLE — Schema do banco de dados (Supabase / Postgres)
-- Rode este arquivo inteiro no SQL Editor do seu projeto Supabase.
-- Todas as tabelas usam user_id + Row Level Security (RLS): cada usuário só
-- enxerga e altera os próprios registros. Isso é reforçado no BANCO, não
-- apenas no front-end.
-- ============================================================================

-- Extensão para gerar UUIDs
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. PROFILES — dados de onboarding/perfil (1:1 com auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  company_name text,
  modes text[] not null default '{personal}',      -- 'business' | 'personal' (pode ter os dois)
  default_currency text not null default 'BRL',
  theme text not null default 'dark',               -- 'dark' | 'light'
  active_mode text not null default 'personal',      -- 'business' | 'personal'
  onboarding_completed boolean not null default false,
  -- Assistente via WhatsApp (ver netlify/functions/whatsapp.ts)
  whatsapp_number text unique,                       -- formato E.164, ex: +5511999999999
  whatsapp_verified boolean not null default false,
  whatsapp_verify_code text,
  whatsapp_verify_expires timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create index if not exists profiles_whatsapp_number_idx on public.profiles (whatsapp_number);

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = id);

-- Cria automaticamente um profile ao registrar um novo usuário
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 2. CATEGORIES — categorias / centros de custo (por modo)
-- ----------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('business','personal')),
  name text not null,
  type text not null check (type in ('income','expense')),
  color text not null default '#0EA5E9',
  is_cost_center boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "categories_all_own" on public.categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 3. TRANSACTIONS — lançamentos (receitas e despesas)
-- ----------------------------------------------------------------------------
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('business','personal')),
  type text not null check (type in ('income','expense')),
  description text not null,
  amount numeric(14,2) not null check (amount >= 0),
  date date not null default current_date,
  category_id uuid references public.categories(id) on delete set null,
  tags text[] default '{}',
  status text not null default 'confirmed' check (status in ('confirmed','pending')),
  attachment_url text,
  client_or_supplier text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "transactions_all_own" on public.transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists transactions_user_date_idx on public.transactions (user_id, date desc);
create index if not exists transactions_user_mode_idx on public.transactions (user_id, mode);

-- ----------------------------------------------------------------------------
-- 4. ACCOUNTS_PAYABLE_RECEIVABLE — contas a pagar/receber (Business)
--    e contas fixas/assinaturas (Pessoal)
-- ----------------------------------------------------------------------------
create table if not exists public.accounts_payable_receivable (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('business','personal')),
  kind text not null check (kind in ('payable','receivable')), -- pagar | receber
  description text not null,
  amount numeric(14,2) not null check (amount >= 0),
  due_date date not null,
  paid_date date,
  status text not null default 'open' check (status in ('open','paid','overdue')),
  counterparty text,          -- cliente/fornecedor (Business) ou credor (Pessoal)
  category_id uuid references public.categories(id) on delete set null,
  recurring boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.accounts_payable_receivable enable row level security;

create policy "apr_all_own" on public.accounts_payable_receivable
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists apr_user_due_idx on public.accounts_payable_receivable (user_id, due_date);

-- ----------------------------------------------------------------------------
-- 5. GOALS — metas financeiras
-- ----------------------------------------------------------------------------
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('business','personal')),
  name text not null,
  target_amount numeric(14,2) not null check (target_amount > 0),
  current_amount numeric(14,2) not null default 0,
  deadline date,
  kind text, -- ex: 'reserva_emergencia' | 'viagem' | 'faturamento' | 'reducao_custo' | 'outro'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.goals enable row level security;

create policy "goals_all_own" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 6. BUDGETS — orçamento por categoria (usado principalmente no Pessoal)
-- ----------------------------------------------------------------------------
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('business','personal')),
  category_id uuid references public.categories(id) on delete cascade,
  month date not null, -- primeiro dia do mês de referência, ex: 2026-09-01
  planned_amount numeric(14,2) not null check (planned_amount >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, category_id, month)
);

alter table public.budgets enable row level security;

create policy "budgets_all_own" on public.budgets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Trigger genérico para manter updated_at em dia
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at_profiles on public.profiles;
create trigger set_updated_at_profiles before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_transactions on public.transactions;
create trigger set_updated_at_transactions before update on public.transactions
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_apr on public.accounts_payable_receivable;
create trigger set_updated_at_apr before update on public.accounts_payable_receivable
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_goals on public.goals;
create trigger set_updated_at_goals before update on public.goals
  for each row execute procedure public.set_updated_at();

-- ============================================================================
-- Fim do schema. Todas as 6 tabelas (profiles, categories, transactions,
-- accounts_payable_receivable, goals, budgets) têm RLS habilitado com
-- política "auth.uid() = user_id" cobrindo SELECT/INSERT/UPDATE/DELETE.
-- ============================================================================
