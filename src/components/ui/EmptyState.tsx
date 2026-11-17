import { ReactNode } from 'react'

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-14 text-center" style={{ borderColor: 'var(--color-border)' }}>
      {icon && <div className="mb-1 text-muted">{icon}</div>}
      <p className="text-sm font-semibold text-text">{title}</p>
      {description && <p className="max-w-sm text-xs text-muted">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
