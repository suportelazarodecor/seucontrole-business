import { useNavigate } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { ModeSwitch } from './ModeSwitch'
import { Menu, Moon, Sun, LogOut } from '@/components/ui/icons'

export function Header() {
  const { theme, toggleTheme, mode, toggleSidebar } = useUIStore()
  const { profile, signOut, isDemo } = useAuthStore()
  const navigate = useNavigate()

  return (
    <header
      className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-surface/80 px-4 backdrop-blur md:px-6"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center gap-3">
        <button className="rounded-md p-2 hover:bg-black/5 dark:hover:bg-white/5 md:hidden" onClick={toggleSidebar}>
          <Menu size={18} />
        </button>
        <div className="hidden items-center gap-2 md:flex">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-extrabold text-white"
            style={{ background: mode === 'business' ? '#0EA5E9' : '#10B981' }}
          >
            S
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight text-text">SEUCONTROLE</p>
            <p className="text-[11px] text-muted">Gestão Business</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {isDemo && (
          <span className="hidden rounded-full bg-ambar/10 px-2.5 py-1 text-[11px] font-semibold text-ambar sm:inline-block">
            Modo demonstração
          </span>
        )}
        <ModeSwitch />
        <button
          aria-label="Alternar tema"
          onClick={toggleTheme}
          className="rounded-full border p-2 text-text transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button
          onClick={() => navigate('/app/configuracoes')}
          className="hidden h-8 w-8 items-center justify-center rounded-full bg-indigo/10 text-xs font-bold text-indigo sm:flex"
          title={profile?.full_name || 'Perfil'}
        >
          {(profile?.full_name || 'U').slice(0, 1).toUpperCase()}
        </button>
        <button
          onClick={async () => {
            await signOut()
            navigate('/login')
          }}
          className="rounded-full border p-2 text-muted transition-colors hover:text-coral"
          style={{ borderColor: 'var(--color-border)' }}
          title="Sair"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  )
}
