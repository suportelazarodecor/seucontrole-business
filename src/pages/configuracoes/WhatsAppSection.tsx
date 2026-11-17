import { FormEvent, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field } from '@/pages/auth/AuthLayout'
import { Badge } from '@/components/ui/Badge'
import { isSupabaseConfigured } from '@/lib/supabase'

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function WhatsAppSection() {
  const { profile, updateProfile } = useAuthStore()
  const [phone, setPhone] = useState(profile?.whatsapp_number ?? '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const isVerified = !!profile?.whatsapp_verified
  const hasPendingCode = !!profile?.whatsapp_verify_code && !isVerified
  const isLinked = !!profile?.whatsapp_number

  async function generate(e: FormEvent) {
    e.preventDefault()
    setMessage(null)
    const normalized = phone.trim()
    if (!/^\+\d{10,15}$/.test(normalized)) {
      setMessage('Use o formato internacional, ex: +5511999999999.')
      return
    }
    setSaving(true)
    const code = generateCode()
    await updateProfile({
      whatsapp_number: normalized,
      whatsapp_verified: false,
      whatsapp_verify_code: code,
      whatsapp_verify_expires: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    })
    setSaving(false)
  }

  async function unlink() {
    setSaving(true)
    await updateProfile({ whatsapp_number: null, whatsapp_verified: false, whatsapp_verify_code: null, whatsapp_verify_expires: null })
    setPhone('')
    setSaving(false)
  }

  return (
    <Card>
      <CardHeader
        title="Assistente via WhatsApp"
        subtitle='Envie "Gasto mercado 12 reais" ou "Recebimento 100 reais" direto pelo WhatsApp para lançar automaticamente.'
        action={isVerified ? <Badge tone="ok">Vinculado</Badge> : isLinked ? <Badge tone="soon">Aguardando verificação</Badge> : undefined}
      />
      <div className="space-y-4 px-5 pb-5">
        {!isSupabaseConfigured && (
          <p className="rounded-lg bg-ambar/10 p-2.5 text-[11px] leading-relaxed text-ambar">
            O assistente de WhatsApp depende de uma Netlify Function conectada ao Supabase real — em modo demonstração
            você pode gerar o código aqui, mas a verificação e os lançamentos automáticos só funcionam depois do
            deploy com o Supabase configurado (veja o README).
          </p>
        )}

        <form onSubmit={generate} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Field label="Seu número de WhatsApp" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+5511999999999" />
          </div>
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? 'Gerando…' : isLinked ? 'Gerar novo código' : 'Vincular número'}
          </Button>
        </form>
        {message && <p className="text-xs font-medium text-coral">{message}</p>}

        {hasPendingCode && (
          <div className="rounded-lg border p-3 text-sm" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-text">
              Envie pelo WhatsApp para o número do assistente:{' '}
              <span className="tabular font-bold text-petroleo">verificar {profile?.whatsapp_verify_code}</span>
            </p>
            <p className="mt-1 text-xs text-muted">O código expira em 15 minutos.</p>
          </div>
        )}

        {isVerified && (
          <div className="flex items-center justify-between rounded-lg border p-3 text-sm" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-text">
              Número vinculado: <span className="tabular font-semibold">{profile?.whatsapp_number}</span>
            </span>
            <Button variant="secondary" size="sm" onClick={unlink} disabled={saving}>
              Desvincular
            </Button>
          </div>
        )}

        <div className="rounded-lg bg-black/[0.03] p-3 text-xs leading-relaxed text-muted dark:bg-white/[0.03]">
          <p className="mb-1 font-semibold text-text">Exemplos de mensagens:</p>
          <p>"Gasto mercado 12 reais" · "Paguei 45,90 na farmácia" · "Recebimento 100 reais" · "recebi 100 de salário"</p>
          <p className="mt-1">Comandos: "saldo", "modo business" / "modo pessoal", "ajuda"</p>
        </div>
      </div>
    </Card>
  )
}
