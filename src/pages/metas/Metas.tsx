import { useMemo, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useDataStore } from '@/store/dataStore'
import { useUIStore } from '@/store/uiStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressBarLabeled } from '@/components/ui/ProgressBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency, formatDate } from '@/lib/format'
import { goalsForMode } from '@/lib/metrics'
import { Plus, Target, Trash } from '@/components/ui/icons'
import { GoalModal } from './GoalModal'
import type { Goal } from '@/types'

export default function Metas() {
  const { userId, profile } = useAuthStore()
  const { mode } = useUIStore()
  const { goals, removeGoal } = useDataStore()
  const currency = profile?.default_currency ?? 'BRL'
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Goal | null>(null)

  const rows = useMemo(() => goalsForMode(goals, mode), [goals, mode])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text">Metas Financeiras</h1>
          <p className="text-sm text-muted">
            {mode === 'business' ? 'Metas de faturamento, redução de custos e crescimento.' : 'Reserva de emergência, viagens e outros objetivos.'}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
        >
          <Plus size={14} /> Nova meta
        </Button>
      </div>

      {rows.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={<Target size={28} />}
            title="Nenhuma meta cadastrada"
            description="Crie sua primeira meta financeira para começar a acompanhar o progresso."
            action={
              <Button size="sm" onClick={() => setModalOpen(true)}>
                <Plus size={14} /> Nova meta
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {rows.map((g) => (
            <Card key={g.id} className="p-5">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-text">{g.name}</p>
                  {g.deadline && <p className="text-xs text-muted">Prazo: {formatDate(g.deadline)}</p>}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditing(g)
                      setModalOpen(true)
                    }}
                    className="rounded-md px-2 py-1 text-xs text-petroleo hover:bg-petroleo/10"
                  >
                    Atualizar
                  </button>
                  <button onClick={() => userId && removeGoal(userId, g.id)} className="rounded-md p-1.5 text-muted hover:text-coral">
                    <Trash size={14} />
                  </button>
                </div>
              </div>
              <ProgressBarLabeled label="Progresso" value={g.current_amount} max={g.target_amount} color="#10B981" format={(n) => formatCurrency(n, currency)} />
              <p className="mt-2 text-xs text-muted">
                {formatCurrency(g.current_amount, currency)} de {formatCurrency(g.target_amount, currency)} (
                {((g.current_amount / g.target_amount) * 100).toFixed(0)}%)
              </p>
            </Card>
          ))}
        </div>
      )}

      {modalOpen && <GoalModal goal={editing} onClose={() => setModalOpen(false)} />}
    </div>
  )
}
