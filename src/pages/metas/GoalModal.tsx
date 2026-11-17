import { FormEvent, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useDataStore } from '@/store/dataStore'
import { useUIStore } from '@/store/uiStore'
import { Button } from '@/components/ui/Button'
import { Field } from '@/pages/auth/AuthLayout'
import { X } from '@/components/ui/icons'
import type { Goal } from '@/types'

export function GoalModal({ goal, onClose }: { goal: Goal | null; onClose: () => void }) {
  const { userId } = useAuthStore()
  const { mode } = useUIStore()
  const { addGoal, updateGoal } = useDataStore()

  const [name, setName] = useState(goal?.name ?? '')
  const [target, setTarget] = useState(goal?.target_amount?.toString() ?? '')
  const [current, setCurrent] = useState(goal?.current_amount?.toString() ?? '0')
  const [deadline, setDeadline] = useState(goal?.deadline ?? '')
  const [saving, setSaving] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!userId) return
    setSaving(true)
    const payload = {
      mode,
      name,
      target_amount: parseFloat(target.replace(',', '.')) || 0,
      current_amount: parseFloat(current.replace(',', '.')) || 0,
      deadline: deadline || null,
      kind: goal?.kind ?? 'outro',
    }
    if (goal) await updateGoal(userId, goal.id, payload)
    else await addGoal(userId, payload)
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl border bg-surface p-5 shadow-card sm:rounded-2xl"
        style={{ borderColor: 'var(--color-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-text">{goal ? 'Atualizar meta' : 'Nova meta'}</h2>
          <button onClick={onClose} className="rounded-md p-1 text-muted hover:text-text">
            <X size={18} />
          </button>
        </div>
        <form className="space-y-4" onSubmit={onSubmit}>
          <Field label="Nome da meta" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Reserva de emergência" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Valor alvo (R$)" required type="number" step="0.01" value={target} onChange={(e) => setTarget(e.target.value)} />
            <Field label="Valor atual (R$)" type="number" step="0.01" value={current} onChange={(e) => setCurrent(e.target.value)} />
          </div>
          <Field label="Prazo (opcional)" type="date" value={deadline ?? ''} onChange={(e) => setDeadline(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? 'Salvando…' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
