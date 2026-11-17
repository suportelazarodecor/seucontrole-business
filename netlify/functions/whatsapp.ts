import type { Handler } from '@netlify/functions'
import { randomUUID } from 'node:crypto'
import { getSupabaseAdmin } from './lib/supabaseAdmin'
import { matchCategory, parseMessage } from './lib/parseMessage'
import { validateTwilioSignature } from './lib/twilioSignature'
import { formatCurrency } from '../../src/lib/format'

// ----------------------------------------------------------------------------
// Webhook do assistente de WhatsApp (Twilio WhatsApp API).
//
// Configuração no console da Twilio: aponte o "WHEN A MESSAGE COMES IN" do
// seu Sender/Sandbox de WhatsApp para:
//   https://SEU-SITE.netlify.app/.netlify/functions/whatsapp
// método POST.
//
// Variáveis de ambiente necessárias (Netlify → Site settings → Environment):
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY   (Project Settings → API → service_role — NUNCA
//                                 use a chave anon aqui, e nunca exponha esta
//                                 chave no front-end)
//   TWILIO_AUTH_TOKEN            (para validar que a requisição vem da Twilio)
// ----------------------------------------------------------------------------

function twiml(message: string) {
  const escaped = message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
    body: `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escaped}</Message></Response>`,
  }
}

function normalizePhone(twilioFrom: string) {
  // Twilio manda "whatsapp:+5511999999999"
  return twilioFrom.replace(/^whatsapp:/i, '').trim()
}

const HELP_TEXT = [
  '🤖 *SEUCONTROLE — Assistente de WhatsApp*',
  '',
  'Registrar um lançamento:',
  '• "Gasto mercado 12 reais"',
  '• "Recebimento 100 reais"',
  '• "Paguei 45,90 na farmácia"',
  '',
  'Comandos:',
  '• "saldo" — resumo do mês atual',
  '• "modo business" / "modo pessoal" — troca o modo ativo',
  '• "ajuda" — mostra esta mensagem',
].join('\n')

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const rawBody = event.isBase64Encoded ? Buffer.from(event.body ?? '', 'base64').toString('utf-8') : (event.body ?? '')
  const params = Object.fromEntries(new URLSearchParams(rawBody))

  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (authToken) {
    const proto = event.headers['x-forwarded-proto'] || 'https'
    const host = event.headers.host || event.headers.Host
    const url = `${proto}://${host}${event.path}`
    const signature = event.headers['x-twilio-signature'] || event.headers['X-Twilio-Signature']
    if (!signature || !validateTwilioSignature(authToken, signature, url, params)) {
      return { statusCode: 403, body: 'Assinatura inválida.' }
    }
  }

  const from = params.From
  const body = (params.Body || '').trim()
  if (!from || !body) return twiml('Não entendi sua mensagem. Envie "ajuda" para ver os comandos.')

  const phone = normalizePhone(from)
  const supabase = getSupabaseAdmin()

  const { data: profile } = await supabase.from('profiles').select('*').eq('whatsapp_number', phone).maybeSingle()

  const parsed = parseMessage(body)

  // Verificação de vínculo do número (funciona mesmo sem o número já estar "verified")
  if (parsed.kind === 'command' && parsed.command === 'verificar') {
    if (!profile) {
      return twiml('Não há nenhum vínculo pendente para este número. Gere um código de verificação em Configurações no app SEUCONTROLE.')
    }
    const expired = !profile.whatsapp_verify_expires || new Date(profile.whatsapp_verify_expires as string) < new Date()
    if (profile.whatsapp_verify_code !== parsed.code || expired) {
      return twiml('Código inválido ou expirado. Gere um novo código em Configurações no app.')
    }
    await supabase
      .from('profiles')
      .update({ whatsapp_verified: true, whatsapp_verify_code: null, whatsapp_verify_expires: null })
      .eq('id', profile.id as string)
    return twiml('✅ WhatsApp vinculado com sucesso! Agora você pode registrar gastos e receitas por aqui. Envie "ajuda" para ver como.')
  }

  if (!profile || !profile.whatsapp_verified) {
    return twiml(
      'Este número ainda não está vinculado a nenhuma conta do SEUCONTROLE. Acesse Configurações no app, informe seu WhatsApp e envie o código de verificação que aparecer lá (ex: "verificar 123456").'
    )
  }

  const userId = profile.id as string
  const currency = (profile.default_currency as string) || 'BRL'
  const activeMode = (profile.active_mode as 'business' | 'personal') || 'personal'

  if (parsed.kind === 'command') {
    if (parsed.command === 'ajuda') return twiml(HELP_TEXT)

    if (parsed.command === 'modo_business' || parsed.command === 'modo_pessoal') {
      const newMode = parsed.command === 'modo_business' ? 'business' : 'personal'
      await supabase.from('profiles').update({ active_mode: newMode }).eq('id', userId)
      return twiml(`✅ Modo ativo alterado para ${newMode === 'business' ? 'Business' : 'Pessoal'}.`)
    }

    if (parsed.command === 'saldo') {
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
      const { data: rows } = await supabase
        .from('transactions')
        .select('type, amount, date')
        .eq('user_id', userId)
        .eq('mode', activeMode)
        .gte('date', monthStart)
      const rowsList: any[] = rows ?? []
      const income = rowsList.filter((r) => r.type === 'income').reduce((a, r) => a + Number(r.amount), 0)
      const expense = rowsList.filter((r) => r.type === 'expense').reduce((a, r) => a + Number(r.amount), 0)
      const modeLabel = activeMode === 'business' ? 'Business' : 'Pessoal'
      return twiml(
        `📊 *Resumo do mês — ${modeLabel}*\nReceitas: ${formatCurrency(income, currency)}\nDespesas: ${formatCurrency(expense, currency)}\nSaldo: ${formatCurrency(income - expense, currency)}`
      )
    }

    return twiml(HELP_TEXT)
  }

  if (parsed.kind === 'unknown') {
    return twiml('Não entendi o valor do lançamento. Exemplo: "Gasto mercado 12 reais". Envie "ajuda" para mais exemplos.')
  }

  // parsed.kind === 'transaction'
  const { data: categories } = await supabase.from('categories').select('id, name').eq('user_id', userId).eq('mode', activeMode).eq('type', parsed.type)
  const categoryId = matchCategory(parsed.description, categories ?? [])

  const today = new Date().toISOString().slice(0, 10)
  await supabase.from('transactions').insert({
    id: randomUUID(),
    user_id: userId,
    mode: activeMode,
    type: parsed.type,
    description: parsed.description,
    amount: parsed.amount,
    date: today,
    category_id: categoryId,
    tags: [],
    status: 'confirmed',
    attachment_url: null,
    client_or_supplier: null,
  })

  const categoryName = (categories as any[] | null)?.find((c) => c.id === categoryId)?.name
  const emoji = parsed.type === 'income' ? '💰' : '💸'
  const label = parsed.type === 'income' ? 'Receita' : 'Despesa'
  const modeLabel = activeMode === 'business' ? 'Business' : 'Pessoal'
  return twiml(
    `${emoji} ${label} registrada: *${parsed.description}* — ${formatCurrency(parsed.amount, currency)}${categoryName ? ` (${categoryName})` : ''}\nModo: ${modeLabel}`
  )
}
