import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Field } from '@/pages/auth/AuthLayout'
import { Building2 } from '@/components/ui/icons'

const STEPS = ['Sobre você', 'Como vai usar', 'Moeda padrão']

export default function Onboarding() {
  const { updateProfile } = useAuthStore()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [currency, setCurrency] = useState('BRL')
  const [saving, setSaving] = useState(false)

  async function finish() {
    setSaving(true)
    await updateProfile({
      full_name: fullName,
      company_name: companyName,
      modes: ['business'],
      default_currency: currency,
      active_mode: 'business',
      onboarding_completed: true,
    })
    setSaving(false)
    navigate('/app/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md rounded-2xl border bg-surface p-6 shadow-card" style={{ borderColor: 'var(--color-border)' }}>
        <div className="mb-6 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div
                className={clsx(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  i <= step ? 'bg-petroleo text-white' : 'bg-black/5 text-muted dark:bg-white/10'
                )}
              >
                {i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={clsx('h-0.5 flex-1', i < step ? 'bg-petroleo' : 'bg-black/10 dark:bg-white/10')} />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-text">Bem-vindo(a)! Como podemos te chamar?</h2>
            <Field label="Seu nome" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ex: Maria Silva" />
            <Field label="Nome da empresa (opcional)" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Ex: Zaro Comércio LTDA" />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-text">Seu painel está configurado para a gestão Business.</h2>
            <div className="flex items-center gap-3 rounded-xl border p-5 text-sm font-semibold text-petroleo" style={{borderColor:'var(--color-border)'}}>
              <Building2 size={22}/> Gestão financeira e operacional da empresa
            </div>
            <p className="text-xs text-muted">Você poderá ajustar os dados da empresa nas configurações.</p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-text">Qual sua moeda padrão?</h2>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm text-text outline-none focus:border-petroleo"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <option value="BRL">R$ Real brasileiro (BRL)</option>
              <option value="USD">$ Dólar americano (USD)</option>
              <option value="EUR">€ Euro (EUR)</option>
            </select>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            Voltar
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={step === 0 && !fullName}>
              Continuar
            </Button>
          ) : (
            <Button onClick={finish} disabled={saving}>
              {saving ? 'Salvando…' : 'Começar a usar'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
