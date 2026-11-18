import { ReactNode } from 'react'
import clsx from 'clsx'

export function Card({ children, className, ...rest }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx('rounded-2xl border bg-surface shadow-[inset_0_1px_0_rgba(255,255,255,.78),0_9px_25px_rgba(15,23,42,.055)] transition-[border-color,box-shadow] duration-200 hover:border-sky-300/60 hover:shadow-[inset_0_1px_0_rgba(255,255,255,.8),0_13px_30px_rgba(15,23,42,.085)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,.055),0_11px_28px_rgba(0,0,0,.20)] dark:hover:border-sky-400/30 dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,.07),0_14px_32px_rgba(0,0,0,.28)]', className)}
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
