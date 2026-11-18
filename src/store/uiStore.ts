import { create } from 'zustand'
import type { Theme } from '@/types'

const THEME_KEY = 'seucontrole:theme'
const PALETTE_KEY = 'seucontrole:palette'
export type Palette = 'green' | 'blue' | 'red'

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}

function applyPalette(palette: Palette) {
  document.documentElement.dataset.palette = palette
}

interface UIState {
  theme: Theme
  palette: Palette
  mode: 'business'
  sidebarOpen: boolean
  toggleTheme: () => void
  setTheme: (t: Theme) => void
  setPalette: (palette: Palette) => void
  toggleSidebar: () => void
}

const initialTheme = (localStorage.getItem(THEME_KEY) as Theme) || 'dark'
const storedPalette = localStorage.getItem(PALETTE_KEY)
const initialPalette: Palette = storedPalette === 'green' || storedPalette === 'red' ? storedPalette : 'blue'
applyTheme(initialTheme)
applyPalette(initialPalette)

export const useUIStore = create<UIState>((set, get) => ({
  theme: initialTheme,
  palette: initialPalette,
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
  setPalette: (palette) => {
    localStorage.setItem(PALETTE_KEY, palette)
    applyPalette(palette)
    set({ palette })
  },
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
}))
