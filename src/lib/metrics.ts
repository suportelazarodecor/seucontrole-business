import { format, startOfMonth, subMonths } from 'date-fns'
import type { AccountEntry, Category, Goal, Mode, Transaction } from '@/types'

export function inMonth(dateIso: string, monthDate: Date) {
  const d = new Date(dateIso + 'T00:00:00')
  return d.getFullYear() === monthDate.getFullYear() && d.getMonth() === monthDate.getMonth()
}

export function sum(rows: Transaction[]) {
  return rows.reduce((acc, r) => acc + r.amount, 0)
}

export function monthTransactions(all: Transaction[], mode: Mode, monthDate: Date) {
  return all.filter((t) => t.mode === mode && inMonth(t.date, monthDate))
}

export interface KpiSet {
  income: number
  expense: number
  net: number
  netMargin: number
  prevIncome: number
  prevExpense: number
  prevNet: number
  incomeDelta: number
  expenseDelta: number
  netDelta: number
}

export function pctDelta(curr: number, prev: number) {
  if (prev === 0) return curr === 0 ? 0 : 100
  return ((curr - prev) / Math.abs(prev)) * 100
}

export function computeKpis(all: Transaction[], mode: Mode, refDate = new Date()): KpiSet {
  const curr = monthTransactions(all, mode, refDate)
  const prev = monthTransactions(all, mode, subMonths(refDate, 1))
  const income = sum(curr.filter((t) => t.type === 'income'))
  const expense = sum(curr.filter((t) => t.type === 'expense'))
  const prevIncome = sum(prev.filter((t) => t.type === 'income'))
  const prevExpense = sum(prev.filter((t) => t.type === 'expense'))
  const net = income - expense
  const prevNet = prevIncome - prevExpense
  return {
    income,
    expense,
    net,
    netMargin: income > 0 ? (net / income) * 100 : 0,
    prevIncome,
    prevExpense,
    prevNet,
    incomeDelta: pctDelta(income, prevIncome),
    expenseDelta: pctDelta(expense, prevExpense),
    netDelta: pctDelta(net, prevNet),
  }
}

export function cashFlowSeries(all: Transaction[], mode: Mode, months = 6, refDate = new Date()) {
  const points: { month: string; label: string; income: number; expense: number; net: number }[] = []
  for (let i = months - 1; i >= 0; i--) {
    const d = subMonths(refDate, i)
    const rows = monthTransactions(all, mode, d)
    const income = sum(rows.filter((t) => t.type === 'income'))
    const expense = sum(rows.filter((t) => t.type === 'expense'))
    points.push({
      month: format(startOfMonth(d), 'yyyy-MM'),
      label: format(d, 'MMM/yy'),
      income,
      expense,
      net: income - expense,
    })
  }
  return points
}

export function projectedCashFlow(series: ReturnType<typeof cashFlowSeries>, periods = 3) {
  if (series.length < 2) return []
  const lastN = series.slice(-3)
  const avgNet = lastN.reduce((a, p) => a + p.net, 0) / lastN.length
  const last = series[series.length - 1]
  const out: { label: string; projected: number }[] = []
  let running = last.net
  for (let i = 1; i <= periods; i++) {
    running += avgNet
    out.push({ label: `+${i * 30}d`, projected: Math.round(running) })
  }
  return out
}

export function byCategory(all: Transaction[], categories: Category[], mode: Mode, type: 'income' | 'expense', refDate = new Date()) {
  const rows = monthTransactions(all, mode, refDate).filter((t) => t.type === type)
  const map = new Map<string, number>()
  for (const r of rows) {
    const key = r.category_id ?? 'sem-categoria'
    map.set(key, (map.get(key) ?? 0) + r.amount)
  }
  return Array.from(map.entries())
    .map(([catId, value]) => {
      const cat = categories.find((c) => c.id === catId)
      return { name: cat?.name ?? 'Sem categoria', value, color: cat?.color ?? '#6b7280' }
    })
    .sort((a, b) => b.value - a.value)
}

export function topCounterparties(all: Transaction[], mode: Mode, refDate = new Date(), n = 5) {
  const rows = monthTransactions(all, mode, refDate).filter((t) => t.type === 'income' && t.client_or_supplier)
  const map = new Map<string, number>()
  for (const r of rows) map.set(r.client_or_supplier as string, (map.get(r.client_or_supplier as string) ?? 0) + r.amount)
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, n)
}

export function openAccounts(accounts: AccountEntry[], mode: Mode, kind: 'payable' | 'receivable') {
  return accounts.filter((a) => a.mode === mode && a.kind === kind && a.status !== 'paid')
}

export function accountStatusLabel(a: AccountEntry): { label: string; tone: 'ok' | 'soon' | 'late' } {
  const due = new Date(a.due_date + 'T00:00:00')
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const diffDays = Math.round((due.getTime() - now.getTime()) / 86400000)
  if (a.status === 'paid') return { label: 'Pago', tone: 'ok' }
  if (diffDays < 0) return { label: `Atrasado ${Math.abs(diffDays)}d`, tone: 'late' }
  if (diffDays <= 5) return { label: `Vence em ${diffDays}d`, tone: 'soon' }
  return { label: 'Em dia', tone: 'ok' }
}

export function delinquencyRate(accounts: AccountEntry[], mode: Mode) {
  const receivables = accounts.filter((a) => a.mode === mode && a.kind === 'receivable')
  if (receivables.length === 0) return 0
  const overdue = receivables.filter((a) => accountStatusLabel(a).tone === 'late')
  const overdueSum = sum(overdue as unknown as Transaction[])
  const totalSum = sum(receivables as unknown as Transaction[])
  return totalSum > 0 ? (overdueSum / totalSum) * 100 : 0
}

export function goalsForMode(goals: Goal[], mode: Mode) {
  return goals.filter((g) => g.mode === mode)
}
