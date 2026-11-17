import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Em ambiente de demonstração (sem .env configurado), a app roda em modo
// "mock" com dados de exemplo locais. Em produção, configure VITE_SUPABASE_URL
// e VITE_SUPABASE_ANON_KEY (veja .env.example) para ligar ao Supabase real.
export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : (null as unknown as ReturnType<typeof createClient>)
