import { CSSProperties, FormEvent, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useDataStore } from '@/store/dataStore'
import { useUIStore } from '@/store/uiStore'
import type { Palette } from '@/store/uiStore'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field } from '@/pages/auth/AuthLayout'
import { Download, Moon, Sun, Trash } from '@/components/ui/icons'
import Papa from 'papaparse'
import { formatCurrency, formatDate } from '@/lib/format'
import { WhatsAppSection } from './WhatsAppSection'

export default function Configuracoes() {
  const { userId, email, profile, updateProfile, signOut } = useAuthStore()
  const { theme, setTheme, palette, setPalette } = useUIStore()
  const { transactions, accounts, goals, categories } = useDataStore()

  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [companyName, setCompanyName] = useState(profile?.company_name ?? '')
  const [currency, setCurrency] = useState(profile?.default_currency ?? 'BRL')
  const [savingProfile, setSavingProfile] = useState(false)

  const [newPassword, setNewPassword] = useState('')
  const [pwMessage, setPwMessage] = useState<string | null>(null)
  const [changingPw, setChangingPw] = useState(false)

  const [deleteConfirm, setDeleteConfirm] = useState('')

  async function saveProfile(e: FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    await updateProfile({ full_name: fullName, company_name: companyName, default_currency: currency })
    setSavingProfile(false)
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault()
    setPwMessage(null)
    if (newPassword.length < 6) return setPwMessage('A senha precisa ter ao menos 6 caracteres.')
    setChangingPw(true)
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      setPwMessage(error ? error.message : 'Senha atualizada com sucesso.')
    } else {
      setPwMessage('Em modo demonstração a senha não é persistida — configure o Supabase para essa funcionalidade real.')
    }
    setChangingPw(false)
    setNewPassword('')
  }

  function exportAllData() {
    const all = {
      lancamentos: transactions.map((t) => ({
        data: t.date,
        descricao: t.description,
        tipo: t.type,
        valor: t.amount,
        categoria: categories.find((c) => c.id === t.category_id)?.name ?? '',
        status: t.status,
      })),
    }
    const csv = Papa.unparse(all.lancamentos)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `seucontrole-exportacao-${formatDate(new Date().toISOString().slice(0, 10))}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function deleteAccount() {
    if (deleteConfirm !== 'EXCLUIR') return
    if (!isSupabaseConfigured) {
      // Modo demo: limpa dados locais do usuário
      Object.keys(localStorage)
        .filter((k) => userId && k.includes(userId))
        .forEach((k) => localStorage.removeItem(k))
      await signOut()
      return
    }
    // Em produção: chame uma Edge Function/RPC autenticada que remove o usuário
    // via Supabase Admin API (a exclusão de auth.users não pode ser feita direto do client).
    alert('Para excluir a conta em produção, configure uma função server-side (Supabase Edge Function) que remove o usuário com segurança.')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-text">Configurações e Perfil</h1>
        <p className="text-sm text-muted">Gerencie seus dados, aparência e conta.</p>
      </div>

      <Card>
        <CardHeader title="Dados da conta" />
        <form onSubmit={saveProfile} className="space-y-4 px-5 pb-5">
          <Field label="E-mail" value={email ?? ''} disabled />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nome completo" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <Field label="Nome da empresa" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <label className="block max-w-xs">
            <span className="mb-1 block text-xs font-medium text-muted">Moeda padrão</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <option value="BRL">R$ Real brasileiro (BRL)</option>
              <option value="USD">$ Dólar americano (USD)</option>
              <option value="EUR">€ Euro (EUR)</option>
            </select>
          </label>
          <Button type="submit" size="sm" disabled={savingProfile}>
            {savingProfile ? 'Salvando…' : 'Salvar alterações'}
          </Button>
        </form>
      </Card>

      <WhatsAppSection />

      <Card>
        <CardHeader title="Aparência" />
        <div className="flex items-center justify-between px-5 pb-5">
          <p className="text-sm text-muted">Tema {theme === 'dark' ? 'escuro' : 'claro'} ativo.</p>
          <div className="flex rounded-lg border p-0.5 text-xs font-semibold" style={{ borderColor: 'var(--color-border)' }}>
            <button onClick={() => setTheme('dark')} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 ${theme === 'dark' ? 'bg-petroleo text-white' : 'text-muted'}`}>
              <Moon size={13} /> Escuro
            </button>
            <button onClick={() => setTheme('light')} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 ${theme === 'light' ? 'bg-petroleo text-white' : 'text-muted'}`}>
              <Sun size={13} /> Claro
            </button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Paleta de cores" subtitle="Escolha o destaque visual do SEUCONTROLE. A paleta combina com os temas claro e escuro." />
        <div className="grid gap-3 px-5 pb-5 sm:grid-cols-3">
          {([
            { value: 'green', label: 'Verde', number: 'Paleta 01', color: '#16a34a' },
            { value: 'blue', label: 'Azul', number: 'Paleta 02', color: '#0284c7' },
            { value: 'red', label: 'Vermelho', number: 'Paleta 03', color: '#dc2626' },
          ] as const).map(option => {
            const selected = palette === option.value
            return <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => setPalette(option.value as Palette)}
              className={`rounded-2xl border p-3 text-left transition-all hover:-translate-y-0.5 ${selected ? 'bg-surface-soft shadow-md' : 'bg-surface hover:bg-surface-soft'}`}
              style={{ borderColor: selected ? option.color : 'var(--color-border)' }}
            >
              <span className="palette-swatch mb-3 flex h-12 items-center justify-between rounded-xl px-3 text-white" style={{ '--swatch': option.color } as CSSProperties}>
                <span className="text-xs font-bold">SEUCONTROLE</span><span className="rounded-lg border border-white/35 bg-white/20 px-2 py-1 text-[10px] font-bold">Ação</span>
              </span>
              <span className="flex items-center justify-between gap-2"><span><span className="block text-sm font-bold">{option.label}</span><span className="mt-0.5 block text-[11px] text-muted">{option.number}</span></span>{selected && <span className="rounded-full px-2 py-1 text-[10px] font-bold" style={{ backgroundColor: `${option.color}18`, color: option.color }}>Selecionada</span>}</span>
            </button>
          })}
        </div>
      </Card>

      <Card>
        <CardHeader title="Trocar senha" />
        <form onSubmit={changePassword} className="space-y-3 px-5 pb-5">
          <Field label="Nova senha" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
          {pwMessage && <p className="text-xs font-medium text-muted">{pwMessage}</p>}
          <Button type="submit" size="sm" variant="secondary" disabled={changingPw}>
            {changingPw ? 'Atualizando…' : 'Atualizar senha'}
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader title="Exportar dados" subtitle="Baixe todos os seus lançamentos em CSV" />
        <div className="px-5 pb-5">
          <Button variant="secondary" size="sm" onClick={exportAllData}>
            <Download size={14} /> Exportar CSV
          </Button>
        </div>
      </Card>

      <Card className="border-coral/30">
        <CardHeader title="Zona de risco" subtitle="Excluir sua conta é uma ação permanente e não pode ser desfeita" />
        <div className="space-y-3 px-5 pb-5">
          <Field label='Digite "EXCLUIR" para confirmar' value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="EXCLUIR" />
          <Button variant="danger" size="sm" disabled={deleteConfirm !== 'EXCLUIR'} onClick={deleteAccount}>
            <Trash size={14} /> Excluir minha conta
          </Button>
        </div>
      </Card>
    </div>
  )
}
