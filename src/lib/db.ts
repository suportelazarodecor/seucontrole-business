import { supabase, isSupabaseConfigured } from './supabase'

// ----------------------------------------------------------------------------
// Camada de acesso a dados. Quando o Supabase está configurado (.env com
// VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY), todas as operações vão para o
// Postgres real, protegidas por Row Level Security (ver supabase/schema.sql).
// Sem Supabase configurado, a app roda em MODO DEMO: os mesmos dados ficam em
// localStorage, isolados por usuário demo — só para permitir visualizar a
// aplicação funcionando sem precisar criar um projeto Supabase primeiro.
// ----------------------------------------------------------------------------

type Table =
  | 'profiles'
  | 'categories'
  | 'transactions'
  | 'accounts_payable_receivable'
  | 'goals'
  | 'budgets'
  | 'suppliers'
  | 'subscriptions'
  | 'payroll_sheets'

function localKey(table: Table, userId: string) {
  return `seucontrole:${userId}:${table}`
}

function readLocal<T>(table: Table, userId: string): T[] {
  try {
    const raw = localStorage.getItem(localKey(table, userId))
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    return []
  }
}

function writeLocal<T>(table: Table, userId: string, rows: T[]) {
  localStorage.setItem(localKey(table, userId), JSON.stringify(rows))
}

function uuid() {
  return crypto.randomUUID()
}

export function dbErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const value = error as { message?: unknown; details?: unknown; hint?: unknown; code?: unknown }
    const message = typeof value.message === 'string' ? value.message : 'Falha de comunicação com o banco.'
    const code = typeof value.code === 'string' ? ` [${value.code}]` : ''
    const details = typeof value.details === 'string' && value.details ? ` ${value.details}` : ''
    const hint = typeof value.hint === 'string' && value.hint ? ` ${value.hint}` : ''
    return `${message}${code}${details}${hint}`
  }
  return error instanceof Error ? error.message : 'Falha inesperada ao acessar o banco.'
}

export const db = {
  isDemo: !isSupabaseConfigured,

  async list<T extends { id: string }>(table: Table, userId: string, filter?: (row: T) => boolean): Promise<T[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from(table).select('*').eq('user_id', userId)
      if (error) throw error
      return (filter ? (data as T[]).filter(filter) : (data as T[])) ?? []
    }
    const rows = readLocal<T>(table, userId)
    return filter ? rows.filter(filter) : rows
  },

  async insert<T extends object>(table: Table, userId: string, row: T): Promise<T & { id: string }> {
    const withId = { ...row, id: (row as any).id ?? uuid(), user_id: userId } as T & { id: string; user_id: string }
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from(table).insert(withId).select().single()
      if (error) throw error
      return data
    }
    const rows = readLocal<T & { id: string }>(table, userId)
    rows.unshift(withId)
    writeLocal(table, userId, rows)
    return withId
  },

  async update<T extends { id: string }>(table: Table, userId: string, id: string, patch: Partial<T>): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from(table).update(patch as any).eq('id', id).eq('user_id', userId)
      if (error) throw error
      return
    }
    const rows = readLocal<T>(table, userId)
    const idx = rows.findIndex((r) => r.id === id)
    if (idx >= 0) rows[idx] = { ...rows[idx], ...patch }
    writeLocal(table, userId, rows)
  },

  async remove(table: Table, userId: string, id: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from(table).delete().eq('id', id).eq('user_id', userId)
      if (error) throw error
      return
    }
    const rows = readLocal<{ id: string }>(table, userId)
    writeLocal(
      table,
      userId,
      rows.filter((r) => r.id !== id)
    )
  },

  async seedIfEmpty<T extends { id: string }>(table: Table, userId: string, seedRows: T[]) {
    if (isSupabaseConfigured) return // nunca semear dados fake no banco real
    const existing = readLocal<T>(table, userId)
    if (existing.length === 0) writeLocal(table, userId, seedRows)
  },
}
