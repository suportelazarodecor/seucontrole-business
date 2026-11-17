import { create } from 'zustand'
import { db } from '@/lib/db'
import { seedAccounts, seedBudgets, seedCategories, seedGoals, seedTransactions } from '@/data/seed'
import type { AccountEntry, Budget, Category, Goal, Transaction } from '@/types'

interface DataState {
  loaded: boolean
  categories: Category[]
  transactions: Transaction[]
  accounts: AccountEntry[]
  goals: Goal[]
  budgets: Budget[]
  load: (userId: string) => Promise<void>

  addTransaction: (userId: string, t: Omit<Transaction, 'id' | 'user_id'>) => Promise<void>
  updateTransaction: (userId: string, id: string, patch: Partial<Transaction>) => Promise<void>
  removeTransaction: (userId: string, id: string) => Promise<void>

  addAccount: (userId: string, a: Omit<AccountEntry, 'id' | 'user_id'>) => Promise<void>
  updateAccount: (userId: string, id: string, patch: Partial<AccountEntry>) => Promise<void>
  removeAccount: (userId: string, id: string) => Promise<void>

  addCategory: (userId: string, c: Omit<Category, 'id' | 'user_id'>) => Promise<void>
  removeCategory: (userId: string, id: string) => Promise<void>

  addGoal: (userId: string, g: Omit<Goal, 'id' | 'user_id'>) => Promise<void>
  updateGoal: (userId: string, id: string, patch: Partial<Goal>) => Promise<void>
  removeGoal: (userId: string, id: string) => Promise<void>

  upsertBudget: (userId: string, b: Omit<Budget, 'id' | 'user_id'>) => Promise<void>
}

export const useDataStore = create<DataState>((set, get) => ({
  loaded: false,
  categories: [],
  transactions: [],
  accounts: [],
  goals: [],
  budgets: [],

  load: async (userId) => {
    // Semeia dados de exemplo apenas em modo demo (sem Supabase configurado)
    if (db.isDemo) {
      const cats = seedCategories(userId)
      await db.seedIfEmpty('categories', userId, cats)
      const storedCats = await db.list<Category>('categories', userId)
      const catsForSeed = storedCats.length ? storedCats : cats

      await db.seedIfEmpty('transactions', userId, seedTransactions(userId, catsForSeed))
      await db.seedIfEmpty('accounts_payable_receivable', userId, seedAccounts(userId, catsForSeed))
      await db.seedIfEmpty('goals', userId, seedGoals(userId))
      await db.seedIfEmpty('budgets', userId, seedBudgets(userId, catsForSeed))
    }

    const [categories, transactions, accounts, goals, budgets] = await Promise.all([
      db.list<Category>('categories', userId),
      db.list<Transaction>('transactions', userId),
      db.list<AccountEntry>('accounts_payable_receivable', userId),
      db.list<Goal>('goals', userId),
      db.list<Budget>('budgets', userId),
    ])
    set({ loaded: true, categories, transactions, accounts, goals, budgets })
  },

  addTransaction: async (userId, t) => {
    const row = await db.insert<Transaction>('transactions', userId, t as Transaction)
    set({ transactions: [row, ...get().transactions] })
  },
  updateTransaction: async (userId, id, patch) => {
    await db.update<Transaction>('transactions', userId, id, patch)
    set({ transactions: get().transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)) })
  },
  removeTransaction: async (userId, id) => {
    await db.remove('transactions', userId, id)
    set({ transactions: get().transactions.filter((t) => t.id !== id) })
  },

  addAccount: async (userId, a) => {
    const row = await db.insert<AccountEntry>('accounts_payable_receivable', userId, a as AccountEntry)
    set({ accounts: [row, ...get().accounts] })
  },
  updateAccount: async (userId, id, patch) => {
    await db.update<AccountEntry>('accounts_payable_receivable', userId, id, patch)
    set({ accounts: get().accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)) })
  },
  removeAccount: async (userId, id) => {
    await db.remove('accounts_payable_receivable', userId, id)
    set({ accounts: get().accounts.filter((a) => a.id !== id) })
  },

  addCategory: async (userId, c) => {
    const row = await db.insert<Category>('categories', userId, c as Category)
    set({ categories: [...get().categories, row] })
  },
  removeCategory: async (userId, id) => {
    await db.remove('categories', userId, id)
    set({ categories: get().categories.filter((c) => c.id !== id) })
  },

  addGoal: async (userId, g) => {
    const row = await db.insert<Goal>('goals', userId, g as Goal)
    set({ goals: [...get().goals, row] })
  },
  updateGoal: async (userId, id, patch) => {
    await db.update<Goal>('goals', userId, id, patch)
    set({ goals: get().goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) })
  },
  removeGoal: async (userId, id) => {
    await db.remove('goals', userId, id)
    set({ goals: get().goals.filter((g) => g.id !== id) })
  },

  upsertBudget: async (userId, b) => {
    const existing = get().budgets.find((x) => x.category_id === b.category_id && x.month === b.month)
    if (existing) {
      await db.update<Budget>('budgets', userId, existing.id, b)
      set({ budgets: get().budgets.map((x) => (x.id === existing.id ? { ...x, ...b } : x)) })
    } else {
      const row = await db.insert<Budget>('budgets', userId, b as Budget)
      set({ budgets: [...get().budgets, row] })
    }
  },
}))
