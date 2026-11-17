import { useMemo, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useDataStore } from '@/store/dataStore'
import { useUIStore } from '@/store/uiStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency, formatDate } from '@/lib/format'
import { accountStatusLabel } from '@/lib/metrics'
import { Plus, Wallet, Trash, CheckCircle } from '@/components/ui/icons'
import { AccountModal } from './AccountModal'
import type { AccountEntry, APRKind } from '@/types'

export default function Contas() {
  const { userId, profile } = useAuthStore()
  const { mode } = useUIStore()
  const { accounts, updateAccount, removeAccount } = useDataStore()
  const currency = profile?.default_currency ?? 'BRL'
  const [kindFilter, setKindFilter] = useState<'all' | APRKind>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AccountEntry | null>(null)

  const rows = useMemo(() => {
    return accounts
      .filter((a) => a.mode === mode)
      .filter((a) => (kindFilter === 'all' ? true : a.kind === kindFilter))
      .sort((a, b) => (a.due_date < b.due_date ? -1 : 1))
  }, [accounts, mode, kindFilter])

  const isBusiness = mode === 'business'

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text">{isBusiness ? 'Contas a Pagar / Receber' : 'Contas Fixas / Assinaturas'}</h1>
          <p className="text-sm text-muted">
            {isBusiness ? 'Controle de obrigações e recebimentos da empresa.' : 'Suas contas fixas e assinaturas recorrentes.'}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
        >
          <Plus size={14} /> Nova conta
        </Button>
      </div>

      {isBusiness && (
        <div className="flex gap-2">
          {(['all', 'payable', 'receivable'] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKindFilter(k)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                kindFilter === k ? 'border-petroleo bg-petroleo/10 text-petroleo' : 'text-muted'
              }`}
              style={{ borderColor: kindFilter === k ? undefined : 'var(--color-border)' }}
            >
              {k === 'all' ? 'Todas' : k === 'payable' ? 'A pagar' : 'A receber'}
            </button>
          ))}
        </div>
      )}

      <Card>
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<Wallet size={28} />}
              title="Nenhuma conta cadastrada"
              description={isBusiness ? 'Cadastre contas a pagar e a receber para acompanhar vencimentos.' : 'Cadastre suas contas fixas para não perder nenhum vencimento.'}
              action={
                <Button size="sm" onClick={() => setModalOpen(true)}>
                  <Plus size={14} /> Nova conta
                </Button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Descrição</th>
                  {isBusiness && <th className="px-2 py-3 font-medium">Tipo</th>}
                  <th className="px-2 py-3 font-medium">Vencimento</th>
                  <th className="px-2 py-3 text-right font-medium">Valor</th>
                  <th className="px-2 py-3 text-right font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => {
                  const st = accountStatusLabel(a)
                  return (
                    <tr
                      key={a.id}
                      className="cursor-pointer border-t hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                      style={{ borderColor: 'var(--color-border)' }}
                      onClick={() => {
                        setEditing(a)
                        setModalOpen(true)
                      }}
                    >
                      <td className="px-5 py-3 font-medium text-text">
                        {a.description}
                        {a.recurring && <span className="ml-2 text-[10px] text-muted">recorrente</span>}
                      </td>
                      {isBusiness && <td className="px-2 py-3 text-muted">{a.kind === 'payable' ? 'A pagar' : 'A receber'}</td>}
                      <td className="px-2 py-3 tabular text-muted">{formatDate(a.due_date)}</td>
                      <td className="px-2 py-3 text-right tabular font-semibold text-text">{formatCurrency(a.amount, currency)}</td>
                      <td className="px-2 py-3 text-right">
                        <Badge tone={a.status === 'paid' ? 'ok' : st.tone}>{a.status === 'paid' ? 'Pago' : st.label}</Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          {a.status !== 'paid' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (userId) updateAccount(userId, a.id, { status: 'paid', paid_date: new Date().toISOString().slice(0, 10) })
                              }}
                              className="rounded-md p-1.5 text-muted hover:text-esmeralda"
                              title="Marcar como pago"
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (userId) removeAccount(userId, a.id)
                            }}
                            className="rounded-md p-1.5 text-muted hover:text-coral"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {modalOpen && <AccountModal account={editing} onClose={() => setModalOpen(false)} />}
    </div>
  )
}
