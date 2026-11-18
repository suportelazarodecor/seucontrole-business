import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import {
  LayoutDashboard, Receipt, Wallet, TrendingUp, FileText, Target, Tag, SettingsIcon, X,
} from '@/components/ui/icons'

const groups = [
  { title: 'Visão geral', items: [{ to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
  { title: 'Financeiro', items: [
    { to: '/app/lancamentos', label: 'Lançamentos', icon: Receipt },
    { to: '/app/contas', label: 'Contas a pagar e receber', icon: Wallet },
    { to: '/app/fluxo-caixa', label: 'Fluxo de caixa', icon: TrendingUp },
    { to: '/app/relatorios', label: 'DRE e relatórios', icon: FileText },
  ] },
  { title: 'Gestão da empresa', items: [
    { to: '/app/fornecedores', label: 'Fornecedores', icon: Tag },
    { to: '/app/fechamento-fornecedores', label: 'Fechamento de fornecedores', icon: TrendingUp },
    { to: '/app/assinaturas', label: 'Assinaturas', icon: Receipt },
    { to: '/app/folhas-pagamento', label: 'Folhas de pagamento', icon: Wallet },
    { to: '/app/metas', label: 'Metas', icon: Target },
    { to: '/app/categorias', label: 'Categorias e custos', icon: Tag },
  ] },
]

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const { profile } = useAuthStore()
  const firstName = profile?.full_name?.trim().split(/\s+/)[0] || 'Sua empresa'

  return <>
    {sidebarOpen && <button aria-label="Fechar menu" className="fixed inset-0 z-30 bg-slate-950/55 backdrop-blur-sm md:hidden" onClick={toggleSidebar} />}
    <aside className={clsx(
      'fixed inset-y-0 left-0 z-40 flex w-[276px] shrink-0 flex-col border-r bg-surface/95 shadow-[12px_0_38px_rgba(15,23,42,.06)] backdrop-blur-xl transition-transform duration-300 md:sticky md:top-0 md:h-screen md:translate-x-0 dark:shadow-[12px_0_40px_rgba(0,0,0,.22)]',
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    )} style={{ borderColor: 'var(--color-border)' }}>
      <div className="flex h-[78px] shrink-0 items-center justify-between border-b px-5" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <span className="palette-brand flex h-10 w-10 items-center justify-center rounded-2xl border border-white/40 text-sm font-black text-white">S</span>
          <div className="leading-tight"><p className="text-sm font-extrabold tracking-tight">SEUCONTROLE</p><p className="mt-1 text-[11px] text-muted">Gestão Business</p></div>
        </div>
        <button aria-label="Fechar menu" className="rounded-xl p-2 text-muted hover:bg-surface-soft md:hidden" onClick={toggleSidebar}><X size={18} /></button>
      </div>

      <nav className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {groups.map(group => <section key={group.title}>
          <p className="mb-1.5 px-3 text-[9px] font-bold uppercase tracking-[.16em] text-muted/80">{group.title}</p>
          <div className="space-y-0.5">{group.items.map(({ to, label, icon: Icon }) => <NavLink
            key={to}
            to={to}
            onClick={() => sidebarOpen && toggleSidebar()}
            className={({ isActive }) => clsx(
              'group flex min-h-10 items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-[12px] font-semibold transition-all duration-200',
              isActive
                ? 'palette-active text-white'
                : 'text-muted hover:translate-x-0.5 hover:bg-surface-soft hover:text-text'
            )}
          >{({ isActive }) => <><span className={clsx('flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] transition-colors', isActive ? 'bg-white/15' : 'bg-surface-soft text-muted group-hover:text-petroleo')}><Icon size={15} /></span><span className="leading-snug">{label}</span>{isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,.9)]" />}</>}</NavLink>)}</div>
        </section>)}
      </nav>

      <div className="border-t p-3" style={{ borderColor: 'var(--color-border)' }}>
        <NavLink to="/app/configuracoes" onClick={() => sidebarOpen && toggleSidebar()} className="palette-outline-hover group flex items-center gap-3 rounded-xl border bg-surface-soft px-3 py-3 transition-colors hover:bg-surface">
          <span className="palette-soft flex h-9 w-9 items-center justify-center rounded-xl border shadow-sm"><SettingsIcon size={16} /></span>
          <span className="min-w-0"><span className="block text-xs font-bold">Configurações</span><span className="mt-0.5 block truncate text-[11px] text-muted">{firstName}</span></span>
        </NavLink>
      </div>
    </aside>
  </>
}
