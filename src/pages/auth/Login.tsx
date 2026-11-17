import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { AuthLayout, Field } from './AuthLayout'
import { Button } from '@/components/ui/Button'

export default function Login() {
  const { signIn, isDemo } = useAuthStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) setError(error)
    else navigate('/app/dashboard')
  }

  return (
    <AuthLayout title="Entrar na sua conta" subtitle="Acesse seu painel financeiro">
      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label="E-mail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@empresa.com" />
        <Field label="Senha" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        {error && <p className="text-xs font-medium text-coral">{error}</p>}
        <div className="flex items-center justify-between text-xs">
          <Link to="/recuperar-senha" className="font-medium text-petroleo hover:underline">
            Esqueci minha senha
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
      {isDemo && (
        <p className="mt-4 rounded-lg bg-ambar/10 p-2.5 text-[11px] leading-relaxed text-ambar">
          Modo demonstração: sem Supabase configurado, os dados ficam salvos localmente neste navegador. Configure
          o .env para ligar a um banco real.
        </p>
      )}
      <p className="mt-5 text-center text-xs text-muted">
        Ainda não tem conta?{' '}
        <Link to="/cadastro" className="font-semibold text-petroleo hover:underline">
          Criar conta
        </Link>
      </p>
    </AuthLayout>
  )
}
