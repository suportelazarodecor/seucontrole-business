import { FormEvent, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useDataStore } from '@/store/dataStore'
import { useUIStore } from '@/store/uiStore'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field } from '@/pages/auth/AuthLayout'
import { EmptyState } from '@/components/ui/EmptyState'
import { Tag, Trash, Plus } from '@/components/ui/icons'
import type { EntryType } from '@/types'

const PALETTE = ['#0EA5E9', '#10B981', '#EF4444', '#F59E0B', '#6366F1']

export default function Categorias() {
  const { userId } = useAuthStore()
  const { mode } = useUIStore()
  const { categories, addCategory, removeCategory } = useDataStore()

  const [name, setName] = useState('')
  const [type, setType] = useState<EntryType>('expense')
  const [color, setColor] = useState(PALETTE[0])
  const [isCostCenter, setIsCostCenter] = useState(false)
  const [saving, setSaving] = useState(false)

  const modeCategories = categories.filter((c) => c.mode === mode)
  const income = modeCategories.filter((c) => c.type === 'income')
  const expense = modeCategories.filter((c) => c.type === 'expense')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!userId || !name.trim()) return
    setSaving(true)
    await addCategory(userId, { mode, name: name.trim(), type, color, is_cost_center: isCostCenter })
    setName('')
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-text">Categorias {mode === 'business' && '/ Centros de Custo'}</h1>
        <p className="text-sm text-muted">Organize seus lançamentos com categorias personalizadas.</p>
      </div>

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold text-text">Nova categoria</h3>
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
          <Field label="Nome" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Alimentação" />
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">Tipo</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as EntryType)}
              className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">Cor</span>
            <div className="flex gap-1.5">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="h-8 w-8 rounded-full ring-offset-2"
                  style={{ background: c, boxShadow: color === c ? `0 0 0 2px ${c}` : undefined }}
                />
              ))}
            </div>
          </label>
          <Button type="submit" disabled={saving}>
            <Plus size={14} /> Adicionar
          </Button>
        </form>
        {mode === 'business' && (
          <label className="mt-3 flex items-center gap-2 text-sm text-text">
            <input type="checkbox" checked={isCostCenter} onChange={(e) => setIsCostCenter(e.target.checked)} className="h-4 w-4 rounded" />
            Marcar como centro de custo
          </label>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Receitas" />
          <CategoryList rows={income} userId={userId} onRemove={removeCategory} />
        </Card>
        <Card>
          <CardHeader title="Despesas" />
          <CategoryList rows={expense} userId={userId} onRemove={removeCategory} />
        </Card>
      </div>
    </div>
  )
}

function CategoryList({
  rows,
  userId,
  onRemove,
}: {
  rows: { id: string; name: string; color: string; is_cost_center: boolean }[]
  userId: string | null
  onRemove: (userId: string, id: string) => void
}) {
  if (rows.length === 0) {
    return (
      <div className="p-5">
        <EmptyState icon={<Tag size={24} />} title="Nenhuma categoria" description="Adicione categorias no formulário acima." />
      </div>
    )
  }
  return (
    <ul className="divide-y px-5 pb-3" style={{ borderColor: 'var(--color-border)' }}>
      {rows.map((c) => (
        <li key={c.id} className="flex items-center justify-between py-2.5">
          <span className="flex items-center gap-2 text-sm text-text">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
            {c.name}
            {c.is_cost_center && <span className="rounded-full bg-indigo/10 px-2 py-0.5 text-[10px] font-semibold text-indigo">centro de custo</span>}
          </span>
          <button onClick={() => userId && onRemove(userId, c.id)} className="rounded-md p-1.5 text-muted hover:text-coral">
            <Trash size={14} />
          </button>
        </li>
      ))}
    </ul>
  )
}
