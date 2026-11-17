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

export default function BusinessDashboard() {
  const { profile, userId } = useAuthStore()
  const [subscriptions, setSubscriptions] = useState<Array<{id:string;name:string;day:number}>>([])
  useEffect(() => { if (userId) void db.list<{id:string;name:string;day:number}>('subscriptions',userId).then(setSubscriptions) }, [userId])
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-text">Dashboard — Business</h1>
        <p className="text-sm text-muted">Visão consolidada do desempenho financeiro da empresa no mês atual.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3"><Card className="p-5"><p className="text-sm text-muted">Gasto diário médio</p><p className="mt-1 text-2xl font-bold">{formatCurrency(dailyAverage,currency)}</p><p className="mt-1 text-xs text-muted">Despesas deste mês ÷ {elapsedDays} dias decorridos.</p></Card><Card className="p-5 lg:col-span-2"><p className="mb-3 font-semibold">Avisos importantes</p>{dueAlerts.length===0&&subscriptions.length===0?<p className="text-sm text-muted">Nenhum vencimento próximo cadastrado.</p>:<div className="space-y-2">{dueAlerts.map(({a,days})=><p key={a.id} className="rounded-lg bg-ambar/10 px-3 py-2 text-sm">{a.description}: {days<0?'vencida há '+Math.abs(days)+' dia(s)':days===0?'vence hoje':'vence em '+days+' dia(s)'}.</p>)}{subscriptions.map(s=>{const date=new Date(now.getFullYear(),now.getMonth(),Math.min(s.day,new Date(now.getFullYear(),now.getMonth()+1,0).getDate()));if(date<now)date.setMonth(date.getMonth()+1);const days=differenceInCalendarDays(date,new Date(now.toDateString()));return days<=7?<p key={s.id} className="rounded-lg bg-petroleo/10 px-3 py-2 text-sm">{s.name}: vence em {days===0?'hoje':days+' dia(s)'}.</p>:null})}</div>}</Card></div>

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
