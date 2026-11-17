-- ============================================================================
-- Migração: Assistente via WhatsApp
-- Rode este arquivo se você já executou supabase/schema.sql anteriormente e
-- só precisa adicionar o suporte ao assistente de WhatsApp. Se está criando
-- o projeto do zero, basta rodar supabase/schema.sql (já inclui isto).
-- ============================================================================

alter table public.profiles
  add column if not exists whatsapp_number text unique,
  add column if not exists whatsapp_verified boolean not null default false,
  add column if not exists whatsapp_verify_code text,
  add column if not exists whatsapp_verify_expires timestamptz;

create index if not exists profiles_whatsapp_number_idx on public.profiles (whatsapp_number);
