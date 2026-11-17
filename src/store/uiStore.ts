import { create } from 'zustand'
import type { Theme } from '@/types'

const THEME_KEY = 'seucontrole:theme'

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}

interface UIState {
  theme: Theme
  mode: 'business'
  sidebarOpen: boolean
  toggleTheme: () => void
  setTheme: (t: Theme) => void
  toggleSidebar: () => void
}

const initialTheme = (localStorage.getItem(THEME_KEY) as Theme) || 'dark'
applyTheme(initialTheme)

export const useUIStore = create<UIState>((set, get) => ({
  theme: initialTheme,
  mode: 'business',
  sidebarOpen: false,
  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem(THEME_KEY, next)
    applyTheme(next)
    set({ theme: next })
  },
  setTheme: (t) => {
    localStorage.setItem(THEME_KEY, t)
    applyTheme(t)
    set({ theme: t })
  },
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
}))
