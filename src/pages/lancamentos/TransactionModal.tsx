import { FormEvent, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useDataStore } from '@/store/dataStore'
import { useUIStore } from '@/store/uiStore'
import { Button } from '@/components/ui/Button'
import { Field } from '@/pages/auth/AuthLayout'
import { X, Paperclip, Trash } from '@/components/ui/icons'
import type { EntryType, Transaction } from '@/types'
import { format } from 'date-fns'
import { db } from '@/lib/db'

type SupplierOption = { id: string; name: string }

export function TransactionModal({ transaction, onClose }: { transaction: Transaction | null; onClose: () => void }) {
  const { userId } = useAuthStore()
  const { mode } = useUIStore()
  const { categories, addTransaction, updateTransaction, removeTransaction } = useDataStore()
  const modeCategories = categories.filter((c) => c.mode === mode)

  const [type, setType] = useState<EntryType>(transaction?.type ?? 'expense')
  const [description, setDescription] = useState(transaction?.description ?? '')
  const [amount, setAmount] = useState(transaction?.amount?.toString() ?? '')
  const [date, setDate] = useState(transaction?.date ?? format(new Date(), 'yyyy-MM-dd'))
  const [categoryId, setCategoryId] = useState(transaction?.category_id ?? modeCategories.find((c) => c.type === type)?.id ?? '')
  const [tagsInput, setTagsInput] = useState(transaction?.tags?.join(', ') ?? '')
  const [status, setStatus] = useState(transaction?.status ?? 'confirmed')
  const [attachmentName, setAttachmentName] = useState<string | null>(transaction?.attachment_url ?? null)
  const [saving, setSaving] = useState(false)
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([])
  const [supplierLoaded, setSupplierLoaded] = useState(false)
  if (!supplierLoaded && userId) void db.list<SupplierOption>('suppliers', userId).then(rows => { setSuppliers(rows); setSupplierLoaded(true) })
  const [supplier, setSupplier] = useState(transaction?.client_or_supplier ?? '')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!userId) return
    setSaving(true)
    const payload = {
      mode,
      type,
      description,
      amount: parseFloat(amount.replace(',', '.')) || 0,
      date,
      category_id: categoryId || null,
      tags: tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      status,
      attachment_url: attachmentName,
      client_or_supplier: supplier || null,
    }
    if (transaction) await updateTransaction(userId, transaction.id, payload)
    else await addTransaction(userId, payload)
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
          <h2 className="text-base font-bold text-text">{transaction ? 'Editar lançamento' : 'Novo lançamento'}</h2>
          <button onClick={onClose} className="rounded-md p-1 text-muted hover:text-text">
            <X size={18} />
          </button>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="flex rounded-lg border p-0.5 text-sm font-semibold" style={{ borderColor: 'var(--color-border)' }}>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 rounded-md py-1.5 ${type === 'income' ? 'bg-esmeralda text-white' : 'text-muted'}`}
            >
              Receita
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 rounded-md py-1.5 ${type === 'expense' ? 'bg-coral text-white' : 'text-muted'}`}
            >
              Despesa
            </button>
          </div>

          <Field label="Descrição" required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Pagamento de fornecedor" />
          {type === 'expense' && <label className="block"><span className="mb-1 block text-xs font-medium text-muted">Fornecedor</span><select value={supplier} onChange={e=>setSupplier(e.target.value)} className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm" style={{borderColor:'var(--color-border)'}}><option value="">Sem fornecedor associado</option>{suppliers.map(s=><option key={s.id} value={s.name}>{s.name}</option>)}</select></label>}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Valor (R$)" required type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" />
            <Field label="Data" required type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">Categoria</span>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <option value="">Sem categoria</option>
              {modeCategories
                .filter((c) => c.type === type)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </label>

          <Field label="Tags (separadas por vírgula)" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="urgente, recorrente" />

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <option value="confirmed">Confirmado</option>
              <option value="pending">Pendente</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">Comprovante</span>
            {attachmentName ? (
              <div className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-border)' }}>
                <span className="flex items-center gap-1.5 truncate text-text">
                  <Paperclip size={13} /> {attachmentName}
                </span>
                <button type="button" onClick={() => setAttachmentName(null)} className="text-muted hover:text-coral">
                  <Trash size={13} />
                </button>
              </div>
            ) : (
              <label
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-3 text-xs text-muted hover:border-petroleo hover:text-petroleo"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <Paperclip size={14} /> Anexar comprovante (PDF/imagem)
                <input type="file" className="hidden" onChange={(e) => setAttachmentName(e.target.files?.[0]?.name ?? null)} />
              </label>
            )}
          </label>

          <div className="flex items-center justify-between gap-2 pt-2">
            {transaction ? (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={async () => {
                  if (userId) await removeTransaction(userId, transaction.id)
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
