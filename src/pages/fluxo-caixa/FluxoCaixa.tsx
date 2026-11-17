import { useMemo, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useDataStore } from '@/store/dataStore'
import { useUIStore } from '@/store/uiStore'
import { Card, CardHeader } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { CashFlowChart } from '@/components/charts/CashFlowChart'
import { formatCurrency } from '@/lib/format'
import { cashFlowSeries, projectedCashFlow } from '@/lib/metrics'

const PERIODS = [
  { label: '6 meses', value: 6 },
  { label: '12 meses', value: 12 },
]
const PROJECTIONS = [
  { label: '30 dias', value: 1 },
  { label: '60 dias', value: 2 },
  { label: '90 dias', value: 3 },
]

export default function FluxoCaixa() {
  const { profile } = useAuthStore()
  const { mode } = useUIStore()
  const { transactions } = useDataStore()
  const currency = profile?.default_currency ?? 'BRL'
  const [months, setMonths] = useState(6)
  const [proj, setProj] = useState(3)

  const series = useMemo(() => cashFlowSeries(transactions, mode, months), [transactions, mode, months])
  const projection = useMemo(() => projectedCashFlow(series, proj), [series, proj])

  const totalIncome = series.reduce((a, s) => a + s.income, 0)
  const totalExpense = series.reduce((a, s) => a + s.expense, 0)
  const totalNet = totalIncome - totalExpense
  const projectedEnd = projection[projection.length - 1]?.projected ?? series[series.length - 1]?.net ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text">Fluxo de Caixa</h1>
          <p className="text-sm text-muted">Entradas x saídas ao longo do tempo, com projeção futura.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-lg border p-0.5 text-xs font-semibold" style={{ borderColor: 'var(--color-border)' }}>
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setMonths(p.value)}
                className={`rounded-md px-3 py-1.5 ${months === p.value ? 'bg-petroleo text-white' : 'text-muted'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex rounded-lg border p-0.5 text-xs font-semibold" style={{ borderColor: 'var(--color-border)' }}>
            {PROJECTIONS.map((p) => (
              <button
                key={p.value}
                onClick={() => setProj(p.value)}
                className={`rounded-md px-3 py-1.5 ${proj === p.value ? 'bg-indigo text-white' : 'text-muted'}`}
              >
                Projeção {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Entradas no período" value={formatCurrency(totalIncome, currency)} accent="esmeralda" />
        <KpiCard label="Saídas no período" value={formatCurrency(totalExpense, currency)} accent="coral" />
        <KpiCard label="Resultado no período" value={formatCurrency(totalNet, currency)} accent="petroleo" />
        <KpiCard label="Saldo projetado" value={formatCurrency(projectedEnd, currency)} accent="indigo" hint={`em ${proj * 30} dias`} />
      </div>

      <Card>
        <CardHeader title="Entradas x Saídas" subtitle="Linha tracejada = projeção baseada na média dos últimos 3 meses" />
        <div className="px-3 pb-5">
          <CashFlowChart data={series} projected={projection} />
        </div>
      </Card>
    </div>
  )
}
