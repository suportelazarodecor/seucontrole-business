export type Mode = 'business' | 'personal'
export type Theme = 'dark' | 'light'
export type EntryType = 'income' | 'expense'
export type APRKind = 'payable' | 'receivable'
export type APRStatus = 'open' | 'paid' | 'overdue'

export interface Profile {
  id: string
  full_name: string | null
  company_name: string | null
  modes: Mode[]
  default_currency: string
  theme: Theme
  active_mode: Mode
  onboarding_completed: boolean
  whatsapp_number: string | null
  whatsapp_verified: boolean
  whatsapp_verify_code: string | null
  whatsapp_verify_expires: string | null
}

export interface Category {
  id: string
  user_id: string
  mode: Mode
  name: string
  type: EntryType
  color: string
  is_cost_center: boolean
}

export interface Transaction {
  id: string
  user_id: string
  mode: Mode
  type: EntryType
  description: string
  amount: number
  date: string
  category_id: string | null
  tags: string[]
  status: 'confirmed' | 'pending'
  attachment_url: string | null
  client_or_supplier: string | null
}

export interface AccountEntry {
  id: string
  user_id: string
  mode: Mode
  kind: APRKind
  description: string
  amount: number
  due_date: string
  paid_date: string | null
  status: APRStatus
  counterparty: string | null
  category_id: string | null
  recurring: boolean
}

export interface Goal {
  id: string
  user_id: string
  mode: Mode
  name: string
  target_amount: number
  current_amount: number
  deadline: string | null
  kind: string | null
}

export interface Budget {
  id: string
  user_id: string
  mode: Mode
  category_id: string | null
  month: string
  planned_amount: number
}
