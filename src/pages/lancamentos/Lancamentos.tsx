import { useMemo, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useDataStore } from '@/store/dataStore'
import { useUIStore } from '@/store/uiStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency, formatDate } from '@/lib/format'
import { Plus, Receipt, Search, Trash, Upload, Download } from '@/components/ui/icons'
import { TransactionModal } from './TransactionModal'
import { ImportCsvModal } from './ImportCsvModal'
import Papa from 'papaparse'
import type { Transaction } from '@/types'

export default function Lancamentos() {
  const { userId, profile } = useAuthStore()
  const { mode } = useUIStore()
  const { transactions, categories, removeTransaction } = useDataStore()
  const currency = profile?.default_currency ?? 'BRL'

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)

  const modeCategories = categories.filter((c) => c.mode === mode)

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => t.mode === mode)
      .filter((t) => (typeFilter === 'all' ? true : t.type === typeFilter))
      .filter((t) => (categoryFilter === 'all' ? true : t.category_id === categoryFilter))
      .filter((t) => t.description.toLowerCase().includes(search.toLowerCase()))
  }, [transactions, mode, typeFilter, categoryFilter, search])

  function exportCsv() {
    const rows = filtered.map((t) => ({
      data: t.date,
      descricao: t.description,
      tipo: t.type === 'income' ? 'Receita' : 'Despesa',
      valor: t.amount,
      categoria: categories.find((c) => c.id === t.category_id)?.name ?? '',
      status: t.status,
    }))
    const csv = Papa.unparse(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `seucontrole-lancamentos-${mode}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text">Lançamentos</h1>
          <p className="text-sm text-muted">Receitas e despesas do modo {mode === 'business' ? 'Business' : 'Pessoal'}.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => setImportOpen(true)}>
            <Upload size={14} /> Importar CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={exportCsv}>
            <Download size={14} /> Exportar CSV
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditing(null)
              setModalOpen(true)
            }}
          >
            <Plus size={14} /> Novo lançamento
          </Button>
        </div>
      </div>

      <Card className="p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por descrição…"
              className="w-full rounded-lg border bg-transparent py-2 pl-8 pr-3 text-sm outline-none focus:border-petroleo"
              style={{ borderColor: 'var(--color-border)' }}
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="rounded-lg border bg-transparent px-3 py-2 text-sm outline-none"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <option value="all">Todos os tipos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border bg-transparent px-3 py-2 text-sm outline-none"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <option value="all">Todas as categorias</option>
            {modeCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card>
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<Receipt size={28} />}
              title="Nenhum lançamento encontrado"
              description="Ajuste os filtros ou cadastre um novo lançamento para começar."
              action={
                <Button size="sm" onClick={() => setModalOpen(true)}>
                  <Plus size={14} /> Novo lançamento
                </Button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Data</th>
                  <th className="px-2 py-3 font-medium">Descrição</th>
                  <th className="px-2 py-3 font-medium">Categoria</th>
                  <th className="px-2 py-3 font-medium">Status</th>
                  <th className="px-2 py-3 text-right font-medium">Valor</th>
                  <th className="px-5 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const cat = categories.find((c) => c.id === t.category_id)
                  return (
                    <tr
                      key={t.id}
                      className="cursor-pointer border-t hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                      style={{ borderColor: 'var(--color-border)' }}
                      onClick={() => {
                        setEditing(t)
                        setModalOpen(true)
                      }}
                    >
                      <td className="px-5 py-3 tabular text-muted">{formatDate(t.date)}</td>
                      <td className="px-2 py-3 font-medium text-text">{t.description}</td>
                      <td className="px-2 py-3">
                        {cat && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                            <span className="h-2 w-2 rounded-full" style={{ background: cat.color }} />
                            {cat.name}
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-3">
                        <Badge tone={t.status === 'confirmed' ? 'ok' : 'soon'}>{t.status === 'confirmed' ? 'Confirmado' : 'Pendente'}</Badge>
                      </td>
                      <td className={`px-2 py-3 text-right tabular font-semibold ${t.type === 'income' ? 'text-esmeralda' : 'text-coral'}`}>
                        {t.type === 'income' ? '+' : '−'} {formatCurrency(t.amount, currency)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (userId) removeTransaction(userId, t.id)
                          }}
                          className="rounded-md p-1.5 text-muted hover:text-coral"
                        >
                          <Trash size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {modalOpen && <TransactionModal transaction={editing} onClose={() => setModalOpen(false)} />}
      {importOpen && <ImportCsvModal onClose={() => setImportOpen(false)} />}
    </div>
  )
}
