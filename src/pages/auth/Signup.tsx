import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { AuthLayout, Field } from './AuthLayout'
import { Button } from '@/components/ui/Button'

export default function Signup() {
  const { signUp } = useAuthStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 6) return setError('A senha precisa ter ao menos 6 caracteres.')
    if (password !== confirm) return setError('As senhas não coincidem.')
    setLoading(true)
    const { error } = await signUp(email, password)
    setLoading(false)
    if (error) setError(error)
    else navigate('/onboarding')
  }

  return (
    <AuthLayout title="Criar sua conta" subtitle="Leva menos de 1 minuto">
      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label="E-mail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@empresa.com" />
        <Field label="Senha" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
        <Field label="Confirmar senha" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
        {error && <p className="text-xs font-medium text-coral">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Criando conta…' : 'Criar conta'}
        </Button>
      </form>
      <p className="mt-5 text-center text-xs text-muted">
        Já tem conta?{' '}
        <Link to="/login" className="font-semibold text-petroleo hover:underline">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  )
}
