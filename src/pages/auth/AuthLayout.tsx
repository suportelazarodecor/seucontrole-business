import { ReactNode } from 'react'

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-petroleo/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-esmeralda/10 blur-3xl" />
      </div>
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-petroleo to-esmeralda text-lg font-extrabold text-white">
            S
          </span>
          <h1 className="text-xl font-bold tracking-tight text-text">SEUCONTROLE</h1>
          <p className="text-xs text-muted">Controle financeiro pessoal e empresarial</p>
        </div>
        <div className="rounded-2xl border bg-surface p-6 shadow-card" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="text-lg font-bold text-text">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </div>
  )
}

export function Field({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      <input
        className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm text-text outline-none focus:border-petroleo"
        style={{ borderColor: 'var(--color-border)' }}
        {...rest}
      />
    </label>
  )
}
