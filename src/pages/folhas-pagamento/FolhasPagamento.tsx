import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { db, dbErrorMessage } from '@/lib/db'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/format'
import { Plus, Trash } from '@/components/ui/icons'

type PayrollSheet = { id: string; user_id: string; date: string; amount: number; sheet_count: number; note: string }
const today = new Date().toISOString().slice(0, 10)

export default function FolhasPagamento() {
  const { userId, profile } = useAuthStore()
  const [rows, setRows] = useState<PayrollSheet[]>([])
  const [date, setDate] = useState(today)
  const [amount, setAmount] = useState('')
  const [sheetCount, setSheetCount] = useState('10')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const currency = profile?.default_currency ?? 'BRL'

  useEffect(() => {
    if (!userId) return
    db.list<PayrollSheet>('payroll_sheets', userId)
      .then(setRows)
      .catch((e: unknown) => setError(dbErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [userId])
  const totalPaid = useMemo(() => rows.reduce((sum, row) => sum + Number(row.amount), 0), [rows])

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!userId) return
    setSaving(true); setError('')
    try {
      const row = await db.insert<PayrollSheet>('payroll_sheets', userId, {
        date, amount: Number(amount.replace(',', '.')), sheet_count: Number(sheetCount), note: note.trim(),
      } as PayrollSheet)
      setRows(current => [row, ...current]); setAmount(''); setNote('')
    } catch (e) {
      setError(`${dbErrorMessage(e)} Confira se a migração 003_payroll_sheets.sql foi executada no Supabase.`)
    } finally { setSaving(false) }
  }
  async function remove(id: string) {
    if (!userId) return
    try { await db.remove('payroll_sheets', userId, id); setRows(current => current.filter(row => row.id !== id)) }
    catch (e) { setError(dbErrorMessage(e)) }
  }

  return <div className="space-y-5">
    <div><h1 className="text-xl font-bold tracking-tight">Folhas de pagamento</h1><p className="text-sm text-muted">Registre o valor pago e quantas folhas foram pagas na data.</p></div>
    <Card className="p-4 sm:p-5"><form onSubmit={submit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <label className="text-xs font-medium text-muted">Data da folha<input required type="date" value={date} onChange={e=>setDate(e.target.value)} className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2.5 text-sm text-text" /></label>
      <label className="text-xs font-medium text-muted">Valor total<input required min="0.01" step="0.01" type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="20000" className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2.5 text-sm text-text" /></label>
      <label className="text-xs font-medium text-muted">Quantidade de folhas<input required min="1" step="1" type="number" value={sheetCount} onChange={e=>setSheetCount(e.target.value)} className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2.5 text-sm text-text" /></label>
      <label className="text-xs font-medium text-muted">Observação (opcional)<input value={note} onChange={e=>setNote(e.target.value)} placeholder="Ex.: Folha 20/10" className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2.5 text-sm text-text" /></label>
      <Button type="submit" disabled={saving} className="sm:col-span-2 lg:col-span-4 sm:justify-self-start"><Plus size={15}/>{saving?'Salvando…':'Registrar pagamento'}</Button>
    </form>{error&&<p role="alert" className="mt-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-300">{error}</p>}</Card>
    <div className="grid gap-3 sm:grid-cols-2"><Card className="p-4"><p className="text-xs text-muted">Total registrado</p><p className="mt-1 text-2xl font-bold">{formatCurrency(totalPaid,currency)}</p></Card><Card className="p-4"><p className="text-xs text-muted">Folhas registradas</p><p className="mt-1 text-2xl font-bold">{rows.reduce((n,r)=>n+Number(r.sheet_count),0)}</p></Card></div>
    <Card><CardHeader title="Histórico de pagamentos" subtitle="Lançamentos mais recentes primeiro"/>{loading?<p className="px-5 pb-5 text-sm text-muted">Carregando…</p>:rows.length===0?<p className="px-5 pb-5 text-sm text-muted">Nenhum pagamento de folha registrado.</p>:<div className="divide-y" style={{borderColor:'var(--color-border)'}}>{rows.map(row=><div key={row.id} className="flex items-center justify-between gap-3 px-5 py-4"><div><p className="font-semibold">Folha {formatDate(row.date)} · {formatCurrency(Number(row.amount),currency)}</p><p className="mt-1 text-xs text-muted">{row.sheet_count} folhas{row.note?' · '+row.note:''}</p></div><button type="button" onClick={()=>void remove(row.id)} aria-label="Excluir registro" className="rounded-lg p-2 text-muted hover:bg-rose-500/10 hover:text-rose-500"><Trash size={15}/></button></div>)}</div>}</Card>
  </div>
}
