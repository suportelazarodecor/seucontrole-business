import { useMemo, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useDataStore } from '@/store/dataStore'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatPercent } from '@/lib/format'
import { byCategory, computeKpis } from '@/lib/metrics'
import { Download } from '@/components/ui/icons'
import Papa from 'papaparse'
import { format } from 'date-fns'

export default function DRE() {
  const { profile } = useAuthStore()
  const { transactions, categories } = useDataStore()
  const currency = profile?.default_currency ?? 'BRL'
  const [refMonth] = useState(new Date())

  const kpis = useMemo(() => computeKpis(transactions, 'business', refMonth), [transactions, refMonth])
  const expensesByCategory = useMemo(() => byCategory(transactions, categories, 'business', 'expense', refMonth), [transactions, categories, refMonth])
  const revenueByCategory = useMemo(() => byCategory(transactions, categories, 'business', 'income', refMonth), [transactions, categories, refMonth])

  const custosVariaveis = expensesByCategory.filter((c) => ['Fornecedores', 'Marketing e vendas'].includes(c.name)).reduce((a, c) => a + c.value, 0)
  const custosFixos = kpis.expense - custosVariaveis
  const margemContribuicao = kpis.income - custosVariaveis
  const margemContribuicaoPct = kpis.income > 0 ? (margemContribuicao / kpis.income) * 100 : 0
  const pontoEquilibrio = margemContribuicaoPct > 0 ? custosFixos / (margemContribuicaoPct / 100) : 0

  function exportCsv() {
    const rows = [
      { linha: 'Receita bruta', valor: kpis.income },
      ...revenueByCategory.map((r) => ({ linha: `  ${r.name}`, valor: r.value })),
      { linha: 'Custos variáveis', valor: -custosVariaveis },
      { linha: 'Margem de contribuição', valor: margemContribuicao },
      { linha: 'Custos fixos', valor: -custosFixos },
      ...expensesByCategory.map((r) => ({ linha: `  ${r.name}`, valor: -r.value })),
      { linha: 'Resultado líquido', valor: kpis.net },
    ]
    const csv = Papa.unparse(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `seucontrole-dre-${format(refMonth, 'yyyy-MM')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const Line = ({ label, value, bold, indent }: { label: string; value: number; bold?: boolean; indent?: boolean }) => (
    <div className={`flex items-center justify-between border-t py-2.5 ${indent ? 'pl-4' : ''}`} style={{ borderColor: 'var(--color-border)' }}>
      <span className={bold ? 'font-semibold text-text' : 'text-sm text-muted'}>{label}</span>
      <span className={`tabular ${bold ? 'font-bold text-text' : 'text-sm text-text'} ${value < 0 ? 'text-coral' : ''}`}>{formatCurrency(value, currency)}</span>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text">DRE Simplificado</h1>
          <p className="text-sm text-muted">Demonstrativo de resultado do mês — {format(refMonth, 'MMMM/yyyy')}.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={exportCsv}>
          <Download size={14} /> Exportar CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Demonstrativo de Resultado" />
          <div className="px-5 pb-5">
            <Line label="Receita bruta" value={kpis.income} bold />
            {revenueByCategory.map((r) => (
              <Line key={r.name} label={r.name} value={r.value} indent />
            ))}
            <Line label="(−) Custos variáveis" value={-custosVariaveis} bold />
            <Line label="= Margem de contribuição" value={margemContribuicao} bold />
            <Line label="(−) Custos fixos" value={-custosFixos} bold />
            {expensesByCategory.map((r) => (
              <Line key={r.name} label={r.name} value={-r.value} indent />
            ))}
            <div className="flex items-center justify-between border-t-2 py-3" style={{ borderColor: 'var(--color-border)' }}>
              <span className="text-base font-bold text-text">Resultado líquido</span>
              <span className={`tabular text-lg font-extrabold ${kpis.net >= 0 ? 'text-esmeralda' : 'text-coral'}`}>{formatCurrency(kpis.net, currency)}</span>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Margem de contribuição</p>
            <p className="tabular mt-1 text-2xl font-bold text-indigo">{formatPercent(margemContribuicaoPct)}</p>
            <p className="mt-1 text-xs text-muted">Receita menos custos variáveis, em % da receita.</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Ponto de equilíbrio</p>
            <p className="tabular mt-1 text-2xl font-bold text-ambar">{formatCurrency(pontoEquilibrio, currency)}</p>
            <p className="mt-1 text-xs text-muted">Receita mínima necessária para cobrir custos fixos.</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Margem líquida</p>
            <p className="tabular mt-1 text-2xl font-bold text-petroleo">{formatPercent(kpis.netMargin)}</p>
            <p className="mt-1 text-xs text-muted">Resultado líquido sobre receita bruta.</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
