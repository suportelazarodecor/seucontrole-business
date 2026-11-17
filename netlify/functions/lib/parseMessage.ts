// ----------------------------------------------------------------------------
// Interpretação das mensagens recebidas via WhatsApp. Regras simples e
// previsíveis (não é um LLM) — cobre o caso de uso principal: registrar um
// gasto ou recebimento em uma frase curta, em português.
//
// Exemplos que este parser entende:
//   "Gasto mercado 12 reais"        -> despesa, R$ 12,00, "Mercado"
//   "gastei 45,90 na farmácia"      -> despesa, R$ 45,90, "Farmácia"
//   "Recebimento 100 reais"         -> receita, R$ 100,00
//   "recebi 100 de salário"         -> receita, R$ 100,00, "Salário"
//   "saldo" / "resumo"              -> comando: resumo do mês
//   "modo business" / "modo pessoal" -> comando: troca o modo ativo
//   "ajuda"                          -> comando: instruções
// ----------------------------------------------------------------------------

export type EntryType = 'income' | 'expense'

export interface ParsedTransaction {
  kind: 'transaction'
  type: EntryType
  amount: number
  description: string
}

export interface ParsedCommand {
  kind: 'command'
  command: 'saldo' | 'ajuda' | 'modo_business' | 'modo_pessoal' | 'verificar'
  code?: string
}

export interface ParsedUnknown {
  kind: 'unknown'
}

export type ParsedMessage = ParsedTransaction | ParsedCommand | ParsedUnknown

const EXPENSE_KEYWORDS = ['gasto', 'gastei', 'despesa', 'paguei', 'compra', 'comprei', 'saída', 'saida']
const INCOME_KEYWORDS = ['recebimento', 'recebi', 'ganho', 'ganhei', 'entrada', 'venda', 'vendi', 'salário', 'salario', 'faturamento']
const LEADING_STOPWORDS = ['de', 'da', 'do', 'na', 'no', 'em', 'com', 'pra', 'para', 'e', 'reais', 'real']

function stripAccents(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function norm(s: string) {
  return stripAccents(s.toLowerCase().trim())
}

export function parseMessage(raw: string): ParsedMessage {
  const text = raw.trim()
  const normalized = norm(text)

  if (/^ajuda$|^help$|^\?$/.test(normalized)) {
    return { kind: 'command', command: 'ajuda' }
  }
  if (/^saldo$|^resumo$/.test(normalized)) {
    return { kind: 'command', command: 'saldo' }
  }
  if (/^modo (business|empresa|empresarial)$/.test(normalized)) {
    return { kind: 'command', command: 'modo_business' }
  }
  if (/^modo (pessoal|casa)$/.test(normalized)) {
    return { kind: 'command', command: 'modo_pessoal' }
  }
  const verifyMatch = normalized.match(/^verificar\s+(\d{4,8})$/)
  if (verifyMatch) {
    return { kind: 'command', command: 'verificar', code: verifyMatch[1] }
  }

  // Detecta o tipo (receita/despesa) pela primeira palavra-chave que aparecer
  let type: EntryType | null = null
  let matchedKeyword = ''
  let earliestIndex = Infinity
  for (const kw of EXPENSE_KEYWORDS) {
    const idx = normalized.indexOf(kw)
    if (idx !== -1 && idx < earliestIndex) {
      earliestIndex = idx
      type = 'expense'
      matchedKeyword = kw
    }
  }
  for (const kw of INCOME_KEYWORDS) {
    const idx = normalized.indexOf(kw)
    if (idx !== -1 && idx < earliestIndex) {
      earliestIndex = idx
      type = 'income'
      matchedKeyword = kw
    }
  }

  // Extrai o valor: primeiro número da mensagem, aceitando vírgula ou ponto decimal
  const amountMatch = text.match(/(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?|\d+(?:\.\d{1,2})?)/)
  if (!amountMatch) return { kind: 'unknown' }

  const amountStr = amountMatch[1].replace(/\.(?=\d{3})/g, '').replace(',', '.')
  const amount = parseFloat(amountStr)
  if (isNaN(amount) || amount <= 0) return { kind: 'unknown' }

  // Sem palavra-chave de tipo: assume despesa (caso de uso mais comum de lançamento rápido)
  if (!type) type = 'expense'

  // Monta a descrição removendo a palavra-chave, o valor e palavras de ligação
  let description = text
  if (matchedKeyword) {
    description = description.replace(new RegExp(matchedKeyword, 'i'), ' ')
  }
  description = description.replace(amountMatch[1], ' ')
  description = description.replace(/r\$/gi, ' ').replace(/reais?/gi, ' ')

  const words = description
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean)
  while (words.length && LEADING_STOPWORDS.includes(norm(words[0]))) words.shift()
  while (words.length && LEADING_STOPWORDS.includes(norm(words[words.length - 1]))) words.pop()

  const cleanDescription = words.join(' ').trim()
  const finalDescription = cleanDescription
    ? cleanDescription.charAt(0).toUpperCase() + cleanDescription.slice(1)
    : type === 'income'
      ? 'Recebimento'
      : 'Despesa'

  return { kind: 'transaction', type, amount, description: finalDescription }
}

export function matchCategory(description: string, categories: { id: string; name: string }[]): string | null {
  const d = norm(description)
  for (const c of categories) {
    const n = norm(c.name)
    if (d.includes(n) || n.includes(d)) return c.id
  }
  return null
}
