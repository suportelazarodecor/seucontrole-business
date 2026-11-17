import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { AuthLayout, Field } from './AuthLayout'
import { Button } from '@/components/ui/Button'

export default function ForgotPassword() {
  const { resetPassword } = useAuthStore()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await resetPassword(email)
    setLoading(false)
    if (error) setError(error)
    else setSent(true)
  }

  return (
    <AuthLayout title="Recuperar senha" subtitle="Enviaremos um link de redefinição para o seu e-mail">
      {sent ? (
        <p className="rounded-lg bg-esmeralda/10 p-3 text-sm text-esmeralda">
          Se o e-mail existir em nossa base, você receberá as instruções em instantes.
        </p>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          <Field label="E-mail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@empresa.com" />
          {error && <p className="text-xs font-medium text-coral">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Enviando…' : 'Enviar link'}
          </Button>
        </form>
      )}
      <p className="mt-5 text-center text-xs text-muted">
        <Link to="/login" className="font-semibold text-petroleo hover:underline">
          Voltar para o login
        </Link>
      </p>
    </AuthLayout>
  )
}
