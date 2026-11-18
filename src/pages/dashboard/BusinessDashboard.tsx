import { useMemo, useState, useEffect } from 'react'
import { db } from '@/lib/db'
import { differenceInCalendarDays } from 'date-fns'
import { useAuthStore } from '@/store/authStore'
import { useDataStore } from '@/store/dataStore'
import { KpiCard } from '@/components/ui/KpiCard'
import { Card, CardHeader } from '@/components/ui/Card'
import { CashFlowChart } from '@/components/charts/CashFlowChart'
import { DonutChart } from '@/components/charts/DonutChart'
import { MarginLineChart } from '@/components/charts/MarginLineChart'
import { HorizontalBarChart } from '@/components/charts/HorizontalBarChart'
import { DueDatesTable } from '@/components/DueDatesTable'
import { formatCurrency, formatPercent } from '@/lib/format'
import {
  byCategory,
  cashFlowSeries,
  computeKpis,
  delinquencyRate,
  openAccounts,
  projectedCashFlow,
  sum,
  topCounterparties,
} from '@/lib/metrics'
import { subMonths } from 'date-fns'
import { Link } from 'react-router-dom'
import { Plus, Tag, Wallet, TrendingUp } from '@/components/ui/icons'

export default function BusinessDashboard() {
  const { profile, userId } = useAuthStore()
  const [subscriptions, setSubscriptions] = useState<Array<{id:string;name:string;day:number}>>([])
  const [suppliers, setSuppliers] = useState<Array<{id:string;name:string}>>([])
  useEffect(() => {
    if (!userId) return
    let active = true
    void Promise.all([
      db.list<{id:string;name:string;day:number}>('subscriptions', userId).catch(() => []),
      db.list<{id:string;name:string}>('suppliers', userId).catch(() => []),
    ]).then(([subscriptionRows, supplierRows]) => {
      if (active) { setSubscriptions(subscriptionRows); setSuppliers(supplierRows) }
    })
    return () => { active = false }
  }, [userId])
  const { transactions, categories, accounts } = useDataStore()
  const currency = profile?.default_currency ?? 'BRL'

  const kpis = useMemo(() => computeKpis(transactions, 'business'), [transactions])
  const series = useMemo(() => cashFlowSeries(transactions, 'business', 8), [transactions])
  const projection = useMemo(() => projectedCashFlow(series, 3), [series])
  const catExpense = useMemo(() => byCategory(transactions, categories, 'business', 'expense'), [transactions, categories])
  const marginSeries = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => {
        const d = subMonths(new Date(), 7 - i)
        const k = computeKpis(transactions, 'business', d)
        return { label: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''), margin: Math.round(k.netMargin * 10) / 10 }
      }),
    [transactions]
  )
  const topClients = useMemo(() => topCounterparties(transactions, 'business'), [transactions])
  const receivables = useMemo(() => openAccounts(accounts, 'business', 'receivable'), [accounts])
  const payables = useMemo(() => openAccounts(accounts, 'business', 'payable'), [accounts])
  const upcoming = useMemo(() => [...receivables, ...payables], [receivables, payables])
  const inadimplencia = useMemo(() => delinquencyRate(accounts, 'business'), [accounts])
  const incomeCount = transactions.filter((t) => t.mode === 'business' && t.type === 'income').length
  const ticketMedio = incomeCount > 0 ? kpis.income / incomeCount : 0
  const now = new Date()
  const elapsedDays = now.getDate()
  const dailyAverage = transactions.filter(t=>t.mode==='business'&&t.type==='expense'&&new Date(t.date+'T00:00:00').getMonth()===now.getMonth()&&new Date(t.date+'T00:00:00').getFullYear()===now.getFullYear()).reduce((n,t)=>n+t.amount,0)/elapsedDays
  const dueAlerts = accounts.filter(a=>a.mode==='business'&&a.kind==='payable'&&a.status!=='paid').map(a=>({a,days:differenceInCalendarDays(new Date(a.due_date+'T00:00:00'),new Date(now.toDateString()))})).filter(x=>x.days<=7).sort((a,b)=>a.days-b.days)
  const unusualSupplierSpend = useMemo(() => {
    const start = new Date(now); start.setDate(start.getDate() - 7); start.setHours(0,0,0,0)
    const previousStart = new Date(start); previousStart.setDate(previousStart.getDate() - 7)
    return suppliers.map(supplier => {
      const matching = transactions.filter(t => t.mode === 'business' && t.type === 'expense' && t.client_or_supplier?.toLowerCase() === supplier.name.toLowerCase())
      const recent = matching.filter(t => new Date(t.date + 'T00:00:00') >= start).reduce((n,t) => n + t.amount, 0)
      const previous = matching.filter(t => { const d = new Date(t.date + 'T00:00:00'); return d >= previousStart && d < start }).reduce((n,t) => n + t.amount, 0)
      return { ...supplier, recent, previous }
    }).filter(supplier => supplier.recent >= 500 && supplier.recent > supplier.previous * 1.5)
      .sort((a,b) => b.recent - a.recent).slice(0, 3)
  }, [suppliers, transactions])
  const totalAlerts = dueAlerts.length + subscriptions.filter(s => {
    const date = new Date(now.getFullYear(), now.getMonth(), Math.min(s.day, new Date(now.getFullYear(), now.getMonth()+1, 0).getDate()))
    if (date < now) date.setMonth(date.getMonth() + 1)
    return differenceInCalendarDays(date, new Date(now.toDateString())) <= 7
  }).length + unusualSupplierSpend.length

  return (
    <div className="space-y-6 sm:space-y-7">
      <Card className="hero-panel relative overflow-hidden p-5 sm:p-7">
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full blur-3xl" style={{ background: 'var(--color-accent-glow)' }} />
        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="lg:max-w-[430px]">
            <div className="palette-soft mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-[.14em]" style={{ borderColor: 'color-mix(in srgb, var(--color-accent) 25%, transparent)' }}><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Resumo financeiro</div>
            <h1 className="text-2xl font-extrabold tracking-tight text-text sm:text-3xl">Olá, {profile?.full_name?.trim().split(/\s+/)[0] || 'bem-vindo(a)'} 👋</h1>
            <p className="mt-2 text-sm font-semibold text-petroleo">{profile?.company_name || 'Sua empresa'}</p>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">Acompanhe o desempenho do mês e encontre rapidamente o que precisa para manter a operação em dia.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/app/lancamentos" className="palette-primary inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3.5 text-xs font-bold text-white transition hover:-translate-y-0.5 active:translate-y-[2px]"><Plus size={15} /> Novo lançamento</Link>
            <Link to="/app/contas" className="palette-outline-hover inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border bg-gradient-to-b from-white to-slate-100 px-3.5 text-xs font-bold text-text shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_2px_0_#cbd5e1,0_5px_10px_rgba(15,23,42,.07)] transition hover:-translate-y-0.5 dark:from-slate-700 dark:to-slate-800 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,.08),0_2px_0_#0b1220,0_5px_10px_rgba(0,0,0,.2)]"><Wallet size={15} /> Contas</Link>
            <Link to="/app/fornecedores" className="palette-outline-hover inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border bg-gradient-to-b from-white to-slate-100 px-3.5 text-xs font-bold text-text shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_2px_0_#cbd5e1,0_5px_10px_rgba(15,23,42,.07)] transition hover:-translate-y-0.5 dark:from-slate-700 dark:to-slate-800 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,.08),0_2px_0_#0b1220,0_5px_10px_rgba(0,0,0,.2)]"><Tag size={15} /> Fornecedores</Link>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="hero-panel relative overflow-hidden p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-muted">Gasto diário médio</p><p className="tabular mt-2 text-3xl font-extrabold tracking-tight text-text">{formatCurrency(dailyAverage,currency)}</p></div><span className="palette-brand flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 text-white"><TrendingUp size={20} /></span></div>
          <p className="mt-3 text-xs leading-relaxed text-muted">Média calculada com as despesas registradas neste mês ({elapsedDays} dias).</p>
        </Card>
        <Card className="p-5 lg:col-span-2 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-sm font-bold tracking-tight">Avisos importantes</h2><p className="mt-1 text-xs text-muted">Contas próximas e mudanças fora do padrão</p></div><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${totalAlerts ? 'bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-200' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200'}`}>{totalAlerts ? `${totalAlerts} ${totalAlerts === 1 ? 'aviso' : 'avisos'}` : 'Tudo em dia'}</span></div>
          {dueAlerts.length===0&&subscriptions.length===0&&unusualSupplierSpend.length===0?<div className="flex items-center gap-3 rounded-xl border border-dashed bg-surface-soft px-4 py-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">✓</span><p className="text-sm text-muted">Nenhum vencimento próximo ou gasto acima do padrão identificado.</p></div>:<div className="grid gap-2 sm:grid-cols-2">{dueAlerts.map(({a,days})=><p key={a.id} className="rounded-xl border border-amber-200/60 bg-amber-50/70 px-3.5 py-3 text-sm text-amber-900 dark:border-amber-400/15 dark:bg-amber-400/5 dark:text-amber-100"><span className="font-bold">{a.description}</span><span className="block mt-1 text-xs opacity-80">{days<0?'Vencida há '+Math.abs(days)+' dia(s)':days===0?'Vence hoje':'Vence em '+days+' dia(s)'}.</span></p>)}{subscriptions.map(s=>{const date=new Date(now.getFullYear(),now.getMonth(),Math.min(s.day,new Date(now.getFullYear(),now.getMonth()+1,0).getDate()));if(date<now)date.setMonth(date.getMonth()+1);const days=differenceInCalendarDays(date,new Date(now.toDateString()));return days<=7?<p key={s.id} className="rounded-xl border border-sky-200/60 bg-sky-50/70 px-3.5 py-3 text-sm text-sky-900 dark:border-sky-400/15 dark:bg-sky-400/5 dark:text-sky-100"><span className="font-bold">{s.name}</span><span className="block mt-1 text-xs opacity-80">Vence {days===0?'hoje':'em '+days+' dia(s)'}.</span></p>:null})}{unusualSupplierSpend.map(s=><p key={s.id} className="rounded-xl border border-rose-200/70 bg-rose-50/70 px-3.5 py-3 text-sm text-rose-900 dark:border-rose-400/15 dark:bg-rose-400/5 dark:text-rose-100"><span className="font-bold">Gasto acima do padrão · {s.name}</span><span className="block mt-1 text-xs opacity-80">{formatCurrency(s.recent,currency)} nos últimos 7 dias, ante {formatCurrency(s.previous,currency)} nos 7 anteriores.</span></p>)}</div>}
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <KpiCard label="Receita do mês" value={formatCurrency(kpis.income, currency)} delta={kpis.incomeDelta} accent="esmeralda" hint="vs. mês anterior" />
        <KpiCard label="Despesas do mês" value={formatCurrency(kpis.expense, currency)} delta={kpis.expenseDelta} deltaGoodWhenUp={false} accent="coral" hint="vs. mês anterior" />
        <KpiCard label="Resultado líquido" value={formatCurrency(kpis.net, currency)} delta={kpis.netDelta} accent="petroleo" hint="vs. mês anterior" />
        <KpiCard label="Margem líquida" value={formatPercent(kpis.netMargin)} accent="indigo" hint="receita − despesa / receita" />
        <KpiCard label="Contas a receber" value={formatCurrency(sum(receivables as any), currency)} accent="esmeralda" hint={`${receivables.length} em aberto`} />
        <KpiCard label="Contas a pagar" value={formatCurrency(sum(payables as any), currency)} accent="coral" hint={`${payables.length} em aberto`} />
        <KpiCard label="Ticket médio" value={formatCurrency(ticketMedio, currency)} accent="petroleo" hint={`${incomeCount} recebimentos`} />
        <KpiCard label="Inadimplência" value={formatPercent(inadimplencia)} accent="ambar" hint="sobre contas a receber" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Fluxo de Caixa" subtitle="Últimos 8 meses, com projeção para os próximos 90 dias" />
          <div className="px-3 pb-4">
            <CashFlowChart data={series} projected={projection} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Despesas por categoria" subtitle="Mês atual" />
          <div className="px-3 pb-4">
            <DonutChart data={catExpense} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Próximos vencimentos" subtitle="Contas a pagar e a receber" />
          <div className="px-5 pb-5">
            <DueDatesTable rows={upcoming} currency={currency} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Top clientes" subtitle="Receita do mês por cliente" />
          <div className="px-3 pb-4">
            <HorizontalBarChart data={topClients} color="#10B981" />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Evolução da margem líquida" subtitle="Últimos 8 meses" />
        <div className="px-3 pb-4">
          <MarginLineChart data={marginSeries} />
        </div>
      </Card>
    </div>
  )
}
