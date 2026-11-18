import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { db } from '@/lib/db'
import { useDataStore } from '@/store/dataStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/format'
import { Plus, Trash } from '@/components/ui/icons'

type Supplier = { id: string; user_id: string; name: string; contact: string; address: string; supplies: string }
const databaseHint = 'Confira no Supabase se a migração 002_suppliers_subscriptions.sql foi executada.'
function errorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : 'Erro inesperado.'
  return `${message}${message.includes('does not exist') || message.includes('schema cache') ? ` ${databaseHint}` : ''}`
}

export default function Fornecedores() {
  const { userId } = useAuthStore()
  const { transactions } = useDataStore()
  const [rows, setRows] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [address, setAddress] = useState('')
  const [supplies, setSupplies] = useState('')

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    let active = true
    db.list<Supplier>('suppliers', userId)
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
      const row = await db.insert<Supplier>('suppliers', userId, { name: name.trim(), contact: contact.trim(), address: address.trim(), supplies: supplies.trim() } as Supplier)
      setRows(current => [row, ...current]); setName(''); setContact(''); setAddress(''); setSupplies('')
    } catch (e) { setError(errorMessage(e)) }
    finally { setSaving(false) }
  }

  async function remove(id: string) {
    if (!userId) return
    setError('')
    try { await db.remove('suppliers', userId, id); setRows(current => current.filter(row => row.id !== id)) }
    catch (e) { setError(errorMessage(e)) }
  }

  return <div className="space-y-4">
    <div><h1 className="text-xl font-bold">Fornecedores</h1><p className="text-sm text-muted">Contatos e insumos dos parceiros da empresa.</p></div>
    <Card className="p-4"><form onSubmit={add} className="grid gap-3 md:grid-cols-2">
      <input required placeholder="Nome do fornecedor" value={name} onChange={e => setName(e.target.value)} className="rounded-lg border bg-transparent p-2 text-sm" />
      <input placeholder="Contato (telefone/e-mail)" value={contact} onChange={e => setContact(e.target.value)} className="rounded-lg border bg-transparent p-2 text-sm" />
      <input placeholder="Endereço" value={address} onChange={e => setAddress(e.target.value)} className="rounded-lg border bg-transparent p-2 text-sm" />
      <input placeholder="Insumos vendidos (separe por vírgula)" value={supplies} onChange={e => setSupplies(e.target.value)} className="rounded-lg border bg-transparent p-2 text-sm" />
      <Button size="sm" type="submit" disabled={saving}><Plus size={14} /> {saving ? 'Salvando…' : 'Cadastrar fornecedor'}</Button>
    </form>{error && <p role="alert" className="mt-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-300">Não foi possível salvar/carregar: {error}</p>}</Card>
    <div className="grid gap-3 md:grid-cols-2">{rows.map(s => {
      const spend = transactions.filter(t => t.type === 'expense' && t.client_or_supplier?.toLowerCase() === s.name.toLowerCase()).reduce((n, t) => n + t.amount, 0)
      return <Card key={s.id} className="p-4"><div className="flex justify-between"><h2 className="font-semibold">{s.name}</h2><button onClick={() => void remove(s.id)} aria-label="Excluir"><Trash size={15} /></button></div><p className="mt-2 text-sm text-muted">{s.contact || 'Sem contato'} · {s.address || 'Sem endereço'}</p><p className="mt-1 text-sm">Insumos: {s.supplies || 'Não informado'}</p><p className="mt-3 text-sm font-semibold">Gastos registrados: {formatCurrency(spend, 'BRL')}</p></Card>
    })}{loading && <Card className="p-6 text-sm text-muted">Carregando fornecedores…</Card>}{!loading && rows.length === 0 && !error && <Card className="p-6 text-sm text-muted">Nenhum fornecedor cadastrado ainda.</Card>}</div>
  </div>
}
