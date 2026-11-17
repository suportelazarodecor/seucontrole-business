import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Profile } from '@/types'

interface DemoUser {
  id: string
  email: string
  password: string
}

const DEMO_USERS_KEY = 'seucontrole:demo:users'
const DEMO_SESSION_KEY = 'seucontrole:demo:session'
const DEMO_PROFILE_PREFIX = 'seucontrole:demo:profile:'

function readDemoUsers(): DemoUser[] {
  try {
    return JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '[]')
  } catch {
    return []
  }
}
function writeDemoUsers(users: DemoUser[]) {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users))
}

function demoProfile(id: string): Profile {
  const raw = localStorage.getItem(DEMO_PROFILE_PREFIX + id)
  if (raw) return JSON.parse(raw)
  const p: Profile = {
    id,
    full_name: '',
    company_name: '',
    modes: ['personal'],
    default_currency: 'BRL',
    theme: 'dark',
    active_mode: 'personal',
    onboarding_completed: false,
    whatsapp_number: null,
    whatsapp_verified: false,
    whatsapp_verify_code: null,
    whatsapp_verify_expires: null,
  }
  localStorage.setItem(DEMO_PROFILE_PREFIX + id, JSON.stringify(p))
  return p
}
function saveDemoProfile(p: Profile) {
  localStorage.setItem(DEMO_PROFILE_PREFIX + p.id, JSON.stringify(p))
}

interface AuthState {
  loading: boolean
  userId: string | null
  email: string | null
  profile: Profile | null
  isDemo: boolean
  init: () => Promise<void>
  signUp: (email: string, password: string) => Promise<{ error?: string }>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error?: string }>
  updateProfile: (patch: Partial<Profile>) => Promise<void>
  refreshProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  loading: true,
  userId: null,
  email: null,
  profile: null,
  isDemo: !isSupabaseConfigured,

  init: async () => {
    if (!isSupabaseConfigured) {
      const sessionId = localStorage.getItem(DEMO_SESSION_KEY)
      if (sessionId) {
        const users = readDemoUsers()
        const u = users.find((x) => x.id === sessionId)
        if (u) {
          set({ userId: u.id, email: u.email, profile: demoProfile(u.id), loading: false })
          return
        }
      }
      set({ loading: false })
      return
    }
    const { data } = await supabase.auth.getSession()
    const session = data.session
    if (session?.user) {
      set({ userId: session.user.id, email: session.user.email ?? null })
      await get().refreshProfile()
    }
    set({ loading: false })
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        set({ userId: session.user.id, email: session.user.email ?? null })
        await get().refreshProfile()
      } else {
        set({ userId: null, email: null, profile: null })
      }
    })
  },

  signUp: async (email, password) => {
    if (!isSupabaseConfigured) {
      const users = readDemoUsers()
      if (users.some((u) => u.email === email)) return { error: 'Este e-mail já está cadastrado.' }
      const id = crypto.randomUUID()
      users.push({ id, email, password })
      writeDemoUsers(users)
      localStorage.setItem(DEMO_SESSION_KEY, id)
      set({ userId: id, email, profile: demoProfile(id) })
      return {}
    }
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message }
    return {}
  },

  signIn: async (email, password) => {
    if (!isSupabaseConfigured) {
      const users = readDemoUsers()
      const u = users.find((x) => x.email === email && x.password === password)
      if (!u) return { error: 'E-mail ou senha inválidos.' }
      localStorage.setItem(DEMO_SESSION_KEY, u.id)
      set({ userId: u.id, email: u.email, profile: demoProfile(u.id) })
      return {}
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return {}
  },

  signOut: async () => {
    if (!isSupabaseConfigured) {
      localStorage.removeItem(DEMO_SESSION_KEY)
      set({ userId: null, email: null, profile: null })
      return
    }
    await supabase.auth.signOut()
    set({ userId: null, email: null, profile: null })
  },

  resetPassword: async (email) => {
    if (!isSupabaseConfigured) {
      const users = readDemoUsers()
      if (!users.some((u) => u.email === email)) return { error: 'Não encontramos esse e-mail.' }
      return {}
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) return { error: error.message }
    return {}
  },

  updateProfile: async (patch) => {
    const { userId, profile } = get()
    if (!userId || !profile) return
    const updated = { ...profile, ...patch }
    if (!isSupabaseConfigured) {
      saveDemoProfile(updated)
      set({ profile: updated })
      return
    }
    const { error } = await supabase.from('profiles').update(patch).eq('id', userId)
    if (!error) set({ profile: updated })
  },

  refreshProfile: async () => {
    const { userId } = get()
    if (!userId) return
    if (!isSupabaseConfigured) {
      set({ profile: demoProfile(userId) })
      return
    }
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) set({ profile: data as Profile })
  },
}))
