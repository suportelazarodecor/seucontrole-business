import { useNavigate } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { ModeSwitch } from './ModeSwitch'
import { Menu, Moon, Sun, LogOut } from '@/components/ui/icons'

export function Header() {
  const { theme, toggleTheme, toggleSidebar } = useUIStore()
  const { profile, signOut, isDemo } = useAuthStore()
  const navigate = useNavigate()
  const firstName = profile?.full_name?.trim().split(/\s+/)[0] || 'Usuário'
  const initial = firstName.slice(0, 1).toUpperCase()

  return <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b bg-surface/80 px-4 shadow-[0_5px_22px_rgba(15,23,42,.035)] backdrop-blur-xl md:px-7 dark:shadow-[0_5px_24px_rgba(0,0,0,.12)]" style={{ borderColor: 'var(--color-border)' }}>
    <div className="flex min-w-0 items-center gap-3">
      <button aria-label="Abrir menu" className="rounded-xl border bg-surface p-2.5 text-muted shadow-sm transition hover:-translate-y-0.5 hover:text-petroleo md:hidden" onClick={toggleSidebar}><Menu size={18} /></button>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold tracking-tight text-text">Painel da empresa</p>
        <p className="hidden text-[11px] text-muted sm:block">Seu financeiro, organizado em um só lugar</p>
      </div>
    </div>

    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
      {isDemo && <span className="hidden rounded-full border border-amber-300/50 bg-amber-100/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:border-amber-300/20 dark:bg-amber-400/10 dark:text-amber-200 sm:inline-flex">Demonstração</span>}
      <ModeSwitch />
      <button aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'} onClick={toggleTheme} className="flex h-10 w-10 items-center justify-center rounded-xl border bg-surface-soft text-text shadow-[inset_0_1px_1px_rgba(255,255,255,.65),0_2px_0_rgba(148,163,184,.35),0_5px_12px_rgba(15,23,42,.06)] transition hover:-translate-y-0.5 hover:border-sky-300 hover:text-petroleo active:translate-y-0 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,.06),0_2px_0_rgba(0,0,0,.3),0_5px_12px_rgba(0,0,0,.15)]" style={{ borderColor: 'var(--color-border)' }}>
        {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      </button>
      <button onClick={() => navigate('/app/configuracoes')} className="group flex items-center gap-2 rounded-xl border bg-surface px-1.5 py-1.5 pr-2.5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300" style={{ borderColor: 'var(--color-border)' }} title={`Perfil de ${firstName}`}>
        <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-indigo-400 via-violet-500 to-purple-700 text-xs font-extrabold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,.5),0_3px_8px_rgba(99,102,241,.25)]">{initial}</span>
        <span className="hidden text-left sm:block"><span className="block text-xs font-bold leading-tight">{firstName}</span><span className="block text-[10px] text-muted">Administrador</span></span>
      </button>
      <button onClick={async () => { await signOut(); navigate('/login') }} className="flex h-10 w-10 items-center justify-center rounded-xl border bg-surface text-muted shadow-sm transition hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10" style={{ borderColor: 'var(--color-border)' }} title="Sair" aria-label="Sair">
        <LogOut size={16} />
      </button>
    </div>
  </header>
}
