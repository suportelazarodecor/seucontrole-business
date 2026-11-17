import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { ProtectedRoute, FullScreenSpinner } from '@/components/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'

import Login from '@/pages/auth/Login'
import Signup from '@/pages/auth/Signup'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import Onboarding from '@/pages/onboarding/Onboarding'
import Dashboard from '@/pages/dashboard/Dashboard'
import Lancamentos from '@/pages/lancamentos/Lancamentos'
import Contas from '@/pages/contas/Contas'
import FluxoCaixa from '@/pages/fluxo-caixa/FluxoCaixa'
import Relatorios from '@/pages/relatorios/Relatorios'
import Metas from '@/pages/metas/Metas'
import Categorias from '@/pages/categorias/Categorias'
import Configuracoes from '@/pages/configuracoes/Configuracoes'
import Fornecedores from '@/pages/fornecedores/Fornecedores'
import FechamentoFornecedores from '@/pages/fornecedores/FechamentoFornecedores'
import Assinaturas from '@/pages/assinaturas/Assinaturas'

export default function App() {
  const { init, loading } = useAuthStore()

  useEffect(() => {
    init()
  }, [init])

  if (loading) return <FullScreenSpinner />

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Signup />} />
      <Route path="/recuperar-senha" element={<ForgotPassword />} />
      <Route path="/onboarding" element={<Onboarding />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/app/dashboard" element={<Dashboard />} />
          <Route path="/app/lancamentos" element={<Lancamentos />} />
          <Route path="/app/contas" element={<Contas />} />
          <Route path="/app/fornecedores" element={<Fornecedores />} />
          <Route path="/app/fechamento-fornecedores" element={<FechamentoFornecedores />} />
          <Route path="/app/assinaturas" element={<Assinaturas />} />
          <Route path="/app/fluxo-caixa" element={<FluxoCaixa />} />
          <Route path="/app/relatorios" element={<Relatorios />} />
          <Route path="/app/metas" element={<Metas />} />
          <Route path="/app/categorias" element={<Categorias />} />
          <Route path="/app/configuracoes" element={<Configuracoes />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
