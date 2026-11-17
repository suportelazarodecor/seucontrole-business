import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { useUIStore } from '@/store/uiStore'
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  TrendingUp,
  FileText,
  Target,
  Tag,
  SettingsIcon,
  X,
} from '@/components/ui/icons'

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()

  const items = [
    { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/app/lancamentos', label: 'Lançamentos', icon: Receipt },
    { to: '/app/contas', label: 'Contas a Pagar/Receber', icon: Wallet },
    { to: '/app/fornecedores', label: 'Fornecedores', icon: Tag },
    { to: '/app/fechamento-fornecedores', label: 'Fechamento fornecedores', icon: TrendingUp },
    { to: '/app/assinaturas', label: 'Assinaturas', icon: Receipt },
    { to: '/app/fluxo-caixa', label: 'Fluxo de Caixa', icon: TrendingUp },
    { to: '/app/relatorios', label: 'DRE / Relatórios', icon: FileText },
    { to: '/app/metas', label: 'Metas', icon: Target },
    { to: '/app/categorias', label: 'Categorias / Centros de Custo', icon: Tag },
    { to: '/app/configuracoes', label: 'Configurações', icon: SettingsIcon },
  ]

  return (
    <>
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={toggleSidebar} />}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 w-64 shrink-0 border-r bg-surface transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex h-16 items-center justify-between border-b px-5 md:hidden" style={{ borderColor: 'var(--color-border)' }}>
          <span className="text-sm font-bold">SEUCONTROLE</span>
          <button onClick={toggleSidebar}>
            <X size={18} />
          </button>
        </div>
        <nav className="flex flex-col gap-0.5 p-3">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => sidebarOpen && toggleSidebar()}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-petroleo/10 text-petroleo' : 'text-muted hover:bg-black/5 hover:text-text dark:hover:bg-white/5'
                )
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
