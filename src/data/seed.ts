import { addDays, format, subDays, subMonths } from 'date-fns'
import type { AccountEntry, Budget, Category, Goal, Transaction } from '@/types'

const uid = () => crypto.randomUUID()
const iso = (d: Date) => format(d, 'yyyy-MM-dd')
const today = new Date()

// ---------------------------------------------------------------------------
// Categorias
// ---------------------------------------------------------------------------
export function seedCategories(userId: string): Category[] {
  const business: Array<[string, 'income' | 'expense', string, boolean]> = [
    ['Vendas de produtos', 'income', '#10B981', false],
    ['Prestação de serviços', 'income', '#0EA5E9', false],
    ['Folha de pagamento', 'expense', '#EF4444', true],
    ['Fornecedores', 'expense', '#F59E0B', true],
    ['Marketing e vendas', 'expense', '#6366F1', true],
    ['Infraestrutura / SaaS', 'expense', '#EF4444', true],
    ['Impostos', 'expense', '#F59E0B', true],
    ['Aluguel e ocupação', 'expense', '#EF4444', true],
  ]
  const personal: Array<[string, 'income' | 'expense', string, boolean]> = [
    ['Salário', 'income', '#10B981', false],
    ['Freelas / renda extra', 'income', '#0EA5E9', false],
    ['Moradia', 'expense', '#EF4444', false],
    ['Alimentação', 'expense', '#F59E0B', false],
    ['Transporte', 'expense', '#6366F1', false],
    ['Lazer', 'expense', '#0EA5E9', false],
    ['Saúde', 'expense', '#EF4444', false],
    ['Educação', 'expense', '#10B981', false],
  ]
  const mk = (mode: 'business' | 'personal', arr: typeof business) =>
    arr.map(([name, type, color, isCC]) => ({
      id: uid(),
      user_id: userId,
      mode,
      name,
      type,
      color,
      is_cost_center: isCC,
    }))
  return [...mk('business', business), ...mk('personal', personal)]
}

// ---------------------------------------------------------------------------
// Lançamentos (últimos 6 meses, para os dois modos)
// ---------------------------------------------------------------------------
export function seedTransactions(userId: string, categories: Category[]): Transaction[] {
  const rows: Transaction[] = []
  const catFor = (mode: 'business' | 'personal', type: 'income' | 'expense') => {
    const opts = categories.filter((c) => c.mode === mode && c.type === type)
    return opts[Math.floor(Math.random() * opts.length)]
  }

  for (let m = 5; m >= 0; m--) {
    const base = subMonths(today, m)

    // Business
    const bizIncomeCount = 6 + Math.floor(Math.random() * 4)
    for (let i = 0; i < bizIncomeCount; i++) {
      const cat = catFor('business', 'income')
      rows.push({
        id: uid(),
        user_id: userId,
        mode: 'business',
        type: 'income',
        description: cat.name === 'Vendas de produtos' ? 'Venda #' + (1000 + rows.length) : 'Serviço prestado',
        amount: Math.round((800 + Math.random() * 6200) * 100) / 100,
        date: iso(addDays(base, Math.floor(Math.random() * 27))),
        category_id: cat.id,
        tags: [],
        status: 'confirmed',
        attachment_url: null,
        client_or_supplier: ['Cliente Alfa', 'Cliente Beta', 'Cliente Gama', 'Cliente Delta'][Math.floor(Math.random() * 4)],
      })
    }
    const bizExpenseCount = 8 + Math.floor(Math.random() * 5)
    for (let i = 0; i < bizExpenseCount; i++) {
      const cat = catFor('business', 'expense')
      rows.push({
        id: uid(),
        user_id: userId,
        mode: 'business',
        type: 'expense',
        description: cat.name,
        amount: Math.round((150 + Math.random() * 3200) * 100) / 100,
        date: iso(addDays(base, Math.floor(Math.random() * 27))),
        category_id: cat.id,
        tags: [],
        status: 'confirmed',
        attachment_url: null,
        client_or_supplier: null,
      })
    }

    // Pessoal
    rows.push({
      id: uid(),
      user_id: userId,
      mode: 'personal',
      type: 'income',
      description: 'Salário mensal',
      amount: 7200,
      date: iso(addDays(base, 5)),
      category_id: catFor('personal', 'income').id,
      tags: [],
      status: 'confirmed',
      attachment_url: null,
      client_or_supplier: null,
    })
    const persExpenseCount = 10 + Math.floor(Math.random() * 6)
    for (let i = 0; i < persExpenseCount; i++) {
      const cat = catFor('personal', 'expense')
      rows.push({
        id: uid(),
        user_id: userId,
        mode: 'personal',
        type: 'expense',
        description: cat.name,
        amount: Math.round((40 + Math.random() * 900) * 100) / 100,
        date: iso(addDays(base, Math.floor(Math.random() * 27))),
        category_id: cat.id,
        tags: [],
        status: 'confirmed',
        attachment_url: null,
        client_or_supplier: null,
      })
    }
  }
  return rows.sort((a, b) => (a.date < b.date ? 1 : -1))
}

// ---------------------------------------------------------------------------
// Contas a pagar/receber (Business) e contas fixas (Pessoal)
// ---------------------------------------------------------------------------
export function seedAccounts(userId: string, categories: Category[]): AccountEntry[] {
  const rows: AccountEntry[] = []
  const bizExpCat = categories.find((c) => c.mode === 'business' && c.type === 'expense')
  const bizIncCat = categories.find((c) => c.mode === 'business' && c.type === 'income')
  const persExpCat = categories.find((c) => c.mode === 'personal' && c.type === 'expense')

  const bizPayables = ['Fornecedor de matéria-prima', 'Serviço de contabilidade', 'Assinatura SaaS', 'Aluguel do escritório', 'Folha de pagamento']
  bizPayables.forEach((desc, i) => {
    const due = addDays(today, [-5, -2, 3, 8, 20][i])
    const status = due < today ? 'overdue' : due < addDays(today, 5) ? 'open' : 'open'
    rows.push({
      id: uid(),
      user_id: userId,
      mode: 'business',
      kind: 'payable',
      description: desc,
      amount: Math.round((300 + Math.random() * 4000) * 100) / 100,
      due_date: iso(due),
      paid_date: null,
      status,
      counterparty: desc,
      category_id: bizExpCat?.id ?? null,
      recurring: i >= 2,
    })
  })
  const bizReceivables = ['Cliente Alfa — NF 1021', 'Cliente Beta — NF 1030', 'Cliente Gama — NF 1042']
  bizReceivables.forEach((desc, i) => {
    const due = addDays(today, [-3, 6, 15][i])
    rows.push({
      id: uid(),
      user_id: userId,
      mode: 'business',
      kind: 'receivable',
      description: desc,
      amount: Math.round((900 + Math.random() * 5000) * 100) / 100,
      due_date: iso(due),
      paid_date: null,
      status: due < today ? 'overdue' : 'open',
      counterparty: desc.split(' — ')[0],
      category_id: bizIncCat?.id ?? null,
      recurring: false,
    })
  })

  const persFixed = ['Aluguel', 'Internet + streaming', 'Academia', 'Plano de saúde', 'Financiamento do carro']
  persFixed.forEach((desc, i) => {
    const due = addDays(today, [2, -1, 10, 18, 25][i])
    rows.push({
      id: uid(),
      user_id: userId,
      mode: 'personal',
      kind: 'payable',
      description: desc,
      amount: Math.round((60 + Math.random() * 1800) * 100) / 100,
      due_date: iso(due),
      paid_date: null,
      status: due < today ? 'overdue' : 'open',
      counterparty: null,
      category_id: persExpCat?.id ?? null,
      recurring: true,
    })
  })

  return rows
}

// ---------------------------------------------------------------------------
// Metas
// ---------------------------------------------------------------------------
export function seedGoals(userId: string): Goal[] {
  return [
    {
      id: uid(),
      user_id: userId,
      mode: 'personal',
      name: 'Reserva de emergência',
      target_amount: 20000,
      current_amount: 12400,
      deadline: iso(addDays(today, 180)),
      kind: 'reserva_emergencia',
    },
    {
      id: uid(),
      user_id: userId,
      mode: 'personal',
      name: 'Viagem para o Chile',
      target_amount: 8000,
      current_amount: 3200,
      deadline: iso(addDays(today, 120)),
      kind: 'viagem',
    },
    {
      id: uid(),
      user_id: userId,
      mode: 'business',
      name: 'Meta de faturamento — Q4',
      target_amount: 150000,
      current_amount: 96000,
      deadline: iso(addDays(today, 90)),
      kind: 'faturamento',
    },
    {
      id: uid(),
      user_id: userId,
      mode: 'business',
      name: 'Redução de custos fixos',
      target_amount: 12000,
      current_amount: 5400,
      deadline: iso(addDays(today, 60)),
      kind: 'reducao_custo',
    },
  ]
}

// ---------------------------------------------------------------------------
// Orçamento (mês atual, modo pessoal principalmente)
// ---------------------------------------------------------------------------
export function seedBudgets(userId: string, categories: Category[]): Budget[] {
  const monthStart = iso(new Date(today.getFullYear(), today.getMonth(), 1))
  const rows: Budget[] = []
  categories
    .filter((c) => c.type === 'expense')
    .forEach((c) => {
      rows.push({
        id: uid(),
        user_id: userId,
        mode: c.mode,
        category_id: c.id,
        month: monthStart,
        planned_amount: c.mode === 'personal' ? Math.round(300 + Math.random() * 1200) : Math.round(1500 + Math.random() * 6000),
      })
    })
  return rows
}

export const _helpers = { subDays }
