import { createClient } from '@supabase/supabase-js'

// ----------------------------------------------------------------------------
// Cliente Supabase com a SERVICE ROLE KEY — só existe no lado servidor
// (variável de ambiente da Netlify, nunca prefixada com VITE_, então nunca
// entra no bundle do front-end). Essa chave ignora RLS por design, então o
// isolamento por usuário aqui é garantido pela lógica da function: toda
// consulta/escrita é sempre filtrada por user_id resolvido a partir do
// número de WhatsApp verificado.
// ----------------------------------------------------------------------------
// Tipagem solta de propósito: esta function não usa os tipos gerados do
// Supabase (fora do escopo do bundle do front-end), então tratamos as linhas
// como registros genéricos e confiamos no schema definido em supabase/schema.sql.
let cached: any = null

export function getSupabaseAdmin(): any {
  if (cached) return cached
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar configuradas nas variáveis de ambiente da Netlify.')
  }
  cached = createClient(url, key, { auth: { persistSession: false } })
  return cached
}
