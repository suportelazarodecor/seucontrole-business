import { useMemo } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useDataStore } from '@/store/dataStore'
import { KpiCard } from '@/components/ui/KpiCard'
import { Card, CardHeader } from '@/components/ui/Card'
import { CashFlowChart } from '@/components/charts/CashFlowChart'
import { DonutChart } from '@/components/charts/DonutChart'
import { ComparisonBarChart } from '@/components/charts/ComparisonBarChart'
import { ProgressBarLabeled } from '@/components/ui/ProgressBar'
import { formatCurrency, formatPercent } from '@/lib/format'
import { byCategory, cashFlowSeries, computeKpis, goalsForMode, sum } from '@/lib/metrics'
import { format } from 'date-fns'
import { EmptyState } from '@/components/ui/EmptyState'
import { Target } from '@/components/ui/icons'

export default function PersonalDashboard() {
  const { profile } = useAuthStore()
  const { transactions, categories, goals, budgets } = useDataStore()
  const currency = profile?.default_currency ?? 'BRL'

  const kpis = useMemo(() => computeKpis(transactions, 'personal'), [transactions])
  const series = useMemo(() => cashFlowSeries(transactions, 'personal', 8), [transactions])
  const catExpense = useMemo(() => byCategory(transactions, categories, 'personal', 'expense'), [transactions, categories])
  const fixedShare = useMemo(() => {
    const fixedNames = new Set(['Moradia', 'Saúde'])
    const fixed = catExpense.filter((c) => fixedNames.has(c.name)).reduce((a, c) => a + c.value, 0)
    return kpis.income > 0 ? (fixed / kpis.income) * 100 : 0
  }, [catExpense, kpis.income])

  const personalGoals = useMemo(() => goalsForMode(goals, 'personal'), [goals])
  const emergencyGoal = personalGoals.find((g) => g.kind === 'reserva_emergencia')

  const monthStart = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd')
  const budgetComparison = useMemo(() => {
    return categories
      .filter((c) => c.mode === 'personal' && c.type === 'expense')
      .map((c) => {
        const planned = budgets.find((b) => b.category_id === c.id && b.month === monthStart)?.planned_amount ?? 0
        const realized = catExpense.find((x) => x.name === c.name)?.value ?? 0
        return { name: c.name, Orçado: planned, Realizado: realized, overBudget: realized > planned && planned > 0 }
      })
      .filter((r) => r.Orçado > 0 || r.Realizado > 0)
  }, [categories, budgets, catExpense, monthStart])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-text">Dashboard — Pessoal</h1>
        <p className="text-sm text-muted">Visão geral das suas finanças pessoais no mês atual.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <KpiCard label="Receitas do mês" value={formatCurrency(kpis.income, currency)} delta={kpis.incomeDelta} accent="esmeralda" hint="vs. mês anterior" />
        <KpiCard label="Despesas do mês" value={formatCurrency(kpis.expense, currency)} delta={kpis.expenseDelta} deltaGoodWhenUp={false} accent="coral" hint="vs. mês anterior" />
        <KpiCard label="Economia do mês" value={formatCurrency(kpis.net, currency)} delta={kpis.netDelta} accent="petroleo" hint="quanto sobrou" />
        <KpiCard label="% renda comprometida" value={formatPercent(fixedShare)} accent="ambar" hint="despesas fixas / receita" />
        {emergencyGoal && (
          <KpiCard
            label="Reserva de emergência"
            value={formatPercent((emergencyGoal.current_amount / emergencyGoal.target_amount) * 100)}
            accent="indigo"
            hint={`${formatCurrency(emergencyGoal.current_amount, currency)} de ${formatCurrency(emergencyGoal.target_amount, currency)}`}
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Evolução do saldo" subtitle="Entradas, saídas e saldo — últimos 8 meses" />
          <div className="px-3 pb-4">
            <CashFlowChart data={series} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Gastos por categoria" subtitle="Mês atual" />
          <div className="px-3 pb-4">
            <DonutChart data={catExpense} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Orçado x Realizado" subtitle="Por categoria — mês atual" />
          <div className="px-3 pb-4">
            <ComparisonBarChart data={budgetComparison} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Metas" subtitle="Progresso atual" />
          <div className="space-y-4 px-5 pb-5">
            {personalGoals.length === 0 ? (
              <EmptyState icon={<Target size={26} />} title="Nenhuma meta cadastrada" description="Crie metas para acompanhar seu progresso." />
            ) : (
              personalGoals.map((g) => (
                <ProgressBarLabeled
                  key={g.id}
                  label={g.name}
                  value={g.current_amount}
                  max={g.target_amount}
                  color="#10B981"
                  format={(n) => formatCurrency(n, currency)}
                />
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
