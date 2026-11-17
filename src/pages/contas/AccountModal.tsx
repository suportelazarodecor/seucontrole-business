import { FormEvent, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useDataStore } from '@/store/dataStore'
import { useUIStore } from '@/store/uiStore'
import { Button } from '@/components/ui/Button'
import { Field } from '@/pages/auth/AuthLayout'
import { X, Trash } from '@/components/ui/icons'
import type { AccountEntry, APRKind } from '@/types'
import { format } from 'date-fns'

export function AccountModal({ account, onClose }: { account: AccountEntry | null; onClose: () => void }) {
  const { userId } = useAuthStore()
  const { mode } = useUIStore()
  const { addAccount, updateAccount, removeAccount } = useDataStore()
  const isBusiness = mode === 'business'

  const [kind, setKind] = useState<APRKind>(account?.kind ?? 'payable')
  const [description, setDescription] = useState(account?.description ?? '')
  const [amount, setAmount] = useState(account?.amount?.toString() ?? '')
  const [dueDate, setDueDate] = useState(account?.due_date ?? format(new Date(), 'yyyy-MM-dd'))
  const [counterparty, setCounterparty] = useState(account?.counterparty ?? '')
  const [recurring, setRecurring] = useState(account?.recurring ?? false)
  const [saving, setSaving] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!userId) return
    setSaving(true)
    const payload = {
      mode,
      kind: isBusiness ? kind : ('payable' as APRKind),
      description,
      amount: parseFloat(amount.replace(',', '.')) || 0,
      due_date: dueDate,
      paid_date: account?.paid_date ?? null,
      status: account?.status ?? ('open' as const),
      counterparty: counterparty || null,
      category_id: account?.category_id ?? null,
      recurring,
    }
    if (account) await updateAccount(userId, account.id, payload)
    else await addAccount(userId, payload)
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
          <h2 className="text-base font-bold text-text">{account ? 'Editar conta' : isBusiness ? 'Nova conta a pagar/receber' : 'Nova conta fixa'}</h2>
          <button onClick={onClose} className="rounded-md p-1 text-muted hover:text-text">
            <X size={18} />
          </button>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          {isBusiness && (
            <div className="flex rounded-lg border p-0.5 text-sm font-semibold" style={{ borderColor: 'var(--color-border)' }}>
              <button type="button" onClick={() => setKind('payable')} className={`flex-1 rounded-md py-1.5 ${kind === 'payable' ? 'bg-coral text-white' : 'text-muted'}`}>
                A pagar
              </button>
              <button type="button" onClick={() => setKind('receivable')} className={`flex-1 rounded-md py-1.5 ${kind === 'receivable' ? 'bg-esmeralda text-white' : 'text-muted'}`}>
                A receber
              </button>
            </div>
          )}

          <Field label="Descrição" required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Aluguel, Fornecedor X" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Valor (R$)" required type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" />
            <Field label="Vencimento" required type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <Field
            label={isBusiness ? 'Cliente / Fornecedor' : 'Credor (opcional)'}
            value={counterparty}
            onChange={(e) => setCounterparty(e.target.value)}
            placeholder="Ex: Fornecedor ABC"
          />
          <label className="flex items-center gap-2 text-sm text-text">
            <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} className="h-4 w-4 rounded" />
            Conta recorrente (mensal)
          </label>

          <div className="flex items-center justify-between gap-2 pt-2">
            {account ? (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={async () => {
                  if (userId) await removeAccount(userId, account.id)
                  onClose()
                }}
              >
                <Trash size={13} /> Excluir
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? 'Salvando…' : 'Salvar'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
