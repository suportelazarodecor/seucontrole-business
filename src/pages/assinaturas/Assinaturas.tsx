import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { db } from '@/lib/db'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/format'
import { Plus, Trash } from '@/components/ui/icons'

type Subscription = { id: string; user_id: string; name: string; provider: string; amount: number; day: number; active: boolean }
const migrationHint = 'Confira no Supabase se a migração 002_suppliers_subscriptions.sql foi executada.'
function errorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : 'Erro inesperado.'
  return `${message}${message.includes('does not exist') || message.includes('schema cache') ? ` ${migrationHint}` : ''}`
}

export default function Assinaturas() {
  const { userId, profile } = useAuthStore()
  const [rows, setRows] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [provider, setProvider] = useState('')
  const [amount, setAmount] = useState('')
  const [day, setDay] = useState('15')

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    let active = true
    db.list<Subscription>('subscriptions', userId)
      .then(data => { if (active) setRows(data) })
      .catch((e: unknown) => { if (active) setError(errorMessage(e)) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [userId])

  async function add(e: React.FormEvent) {
    e.preventDefault()
    if (!userId || !name.trim()) return
    setSaving(true); setError('')
    try {
      const row = await db.insert<Subscription>('subscriptions', userId, { name: name.trim(), provider: provider.trim(), amount: Number(amount) || 0, day: Number(day), active: true } as Subscription)
      setRows(current => [row, ...current]); setName(''); setProvider(''); setAmount('')
    } catch (e) { setError(errorMessage(e)) }
    finally { setSaving(false) }
  }

  async function remove(id: string) {
    if (!userId) return
    setError('')
    try { await db.remove('subscriptions', userId, id); setRows(current => current.filter(row => row.id !== id)) }
    catch (e) { setError(errorMessage(e)) }
  }

  const currency = profile?.default_currency || 'BRL'
  return <div className="space-y-4">
    <div><h1 className="text-xl font-bold">Assinaturas e contas recorrentes</h1><p className="text-sm text-muted">Acompanhe serviços e compromissos mensais da empresa.</p></div>
    <Card className="p-4"><form onSubmit={add} className="grid gap-3 md:grid-cols-2">
      <input required placeholder="Nome da conta (ERP, Internet…)" value={name} onChange={e => setName(e.target.value)} className="rounded-lg border bg-transparent p-2 text-sm" />
      <input placeholder="Fornecedor/prestador" value={provider} onChange={e => setProvider(e.target.value)} className="rounded-lg border bg-transparent p-2 text-sm" />
      <input type="number" min="0" step="0.01" placeholder="Valor mensal (opcional)" value={amount} onChange={e => setAmount(e.target.value)} className="rounded-lg border bg-transparent p-2 text-sm" />
      <label className="text-sm">Vence no dia <input required type="number" min="1" max="31" value={day} onChange={e => setDay(e.target.value)} className="ml-2 w-20 rounded-lg border bg-transparent p-2" /></label>
      <Button size="sm" type="submit" disabled={saving}><Plus size={14} /> {saving ? 'Salvando…' : 'Adicionar conta'}</Button>
    </form>{error && <p role="alert" className="mt-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-300">Não foi possível salvar/carregar: {error}</p>}</Card>
    <div className="grid gap-3 md:grid-cols-2">{rows.map(row => <Card key={row.id} className="flex items-center justify-between p-4"><div><b>{row.name}</b><p className="text-sm text-muted">{row.provider || 'Prestador não informado'} · vence todo dia {row.day}</p><p className="mt-1 text-sm">{row.amount ? formatCurrency(row.amount, currency) : 'Valor não informado'}</p></div><button onClick={() => void remove(row.id)} aria-label="Excluir"><Trash size={15} /></button></Card>)}{loading && <Card className="p-5 text-sm text-muted">Carregando contas…</Card>}{!loading && rows.length === 0 && !error && <Card className="p-5 text-sm text-muted">Nenhuma conta recorrente cadastrada.</Card>}</div>
  </div>
}
