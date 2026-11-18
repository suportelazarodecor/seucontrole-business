import { ReactNode } from 'react'
import clsx from 'clsx'

export function Card({ children, className, ...rest }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx('rounded-2xl border bg-surface shadow-[0_1px_0_rgba(255,255,255,.75)_inset,0_8px_22px_rgba(15,23,42,.08)] dark:shadow-[0_1px_0_rgba(255,255,255,.06)_inset,0_10px_25px_rgba(0,0,0,.24)]', className)}
      style={{ borderColor: 'var(--color-border)' }}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-2">
      <div>
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
