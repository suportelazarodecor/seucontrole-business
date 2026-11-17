import { ReactNode } from 'react'
import clsx from 'clsx'

export function Card({ children, className, ...rest }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx('rounded-xl border bg-surface shadow-card', className)}
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
