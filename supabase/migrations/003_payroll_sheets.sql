-- Additive payroll log table. Existing financial data remains untouched.
create table if not exists public.payroll_sheets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  amount numeric(14,2) not null check (amount > 0),
  sheet_count integer not null default 1 check (sheet_count > 0),
  note text not null default '',
  created_at timestamptz not null default now()
);
alter table public.payroll_sheets enable row level security;
drop policy if exists payroll_sheets_all_own on public.payroll_sheets;
create policy payroll_sheets_all_own on public.payroll_sheets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists payroll_sheets_user_date_idx on public.payroll_sheets (user_id, date desc);
