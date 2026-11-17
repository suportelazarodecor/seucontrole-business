import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { useAuthStore } from '@/store/authStore'
import { useDataStore } from '@/store/dataStore'
import { Card, CardHeader } from '@/components/ui/Card'
import { Field } from '@/pages/auth/AuthLayout'
import { Button } from '@/components/ui/Button'
import { ProgressBarLabeled } from '@/components/ui/ProgressBar'
import { formatCurrency } from '@/lib/format'
import { byCategory } from '@/lib/metrics'
import { EmptyState } from '@/components/ui/EmptyState'
import { FileText } from '@/components/ui/icons'

export default function OrcamentoCategoria() {
  const { userId, profile } = useAuthStore()
  const { categories, transactions, budgets, upsertBudget } = useDataStore()
  const currency = profile?.default_currency ?? 'BRL'
  const monthStart = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd')

  const expenseCats = categories.filter((c) => c.mode === 'personal' && c.type === 'expense')
  const realized = useMemo(() => byCategory(transactions, categories, 'personal', 'expense'), [transactions, categories])

  const [drafts, setDrafts] = useState<Record<string, string>>({})

  function plannedFor(catId: string) {
    return budgets.find((b) => b.category_id === catId && b.month === monthStart)?.planned_amount ?? 0
  }

  async function save(catId: string) {
    if (!userId) return
    const value = parseFloat((drafts[catId] ?? '').replace(',', '.'))
    if (isNaN(value)) return
    await upsertBudget(userId, { mode: 'personal', category_id: catId, month: monthStart, planned_amount: value })
    setDrafts((d) => ({ ...d, [catId]: '' }))
  }

  const totalPlanned = expenseCats.reduce((a, c) => a + plannedFor(c.id), 0)
  const totalRealized = realized.reduce((a, r) => a + r.value, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-text">Orçamento por Categoria</h1>
        <p className="text-sm text-muted">Defina quanto planeja gastar em cada categoria e acompanhe o realizado.</p>
      </div>

      <Card className="p-5">
        <ProgressBarLabeled label="Total do orçamento" value={totalRealized} max={totalPlanned || 1} color="#0EA5E9" format={(n) => formatCurrency(n, currency)} />
      </Card>

      <Card>
        <CardHeader title="Categorias" subtitle="Mês atual" />
        {expenseCats.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={<FileText size={26} />} title="Nenhuma categoria de despesa" description="Cadastre categorias na tela de Categorias." />
          </div>
        ) : (
          <div className="space-y-5 px-5 pb-5">
            {expenseCats.map((c) => {
              const planned = plannedFor(c.id)
              const value = realized.find((r) => r.name === c.name)?.value ?? 0
              return (
                <div key={c.id} className="space-y-2">
                  <ProgressBarLabeled label={c.name} value={value} max={planned || 1} color={c.color} format={(n) => formatCurrency(n, currency)} />
                  <div className="flex items-center gap-2">
                    <input
                      value={drafts[c.id] ?? ''}
                      onChange={(e) => setDrafts((d) => ({ ...d, [c.id]: e.target.value }))}
                      placeholder={`Orçamento atual: ${formatCurrency(planned, currency)}`}
                      className="w-48 rounded-lg border bg-transparent px-2.5 py-1.5 text-xs outline-none focus:border-petroleo"
                      style={{ borderColor: 'var(--color-border)' }}
                    />
                    <Button size="sm" variant="secondary" onClick={() => save(c.id)}>
                      Definir orçamento
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
