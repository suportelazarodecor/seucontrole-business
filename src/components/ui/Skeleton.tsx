export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />
}

export function KpiSkeleton() {
  return (
    <div className="rounded-xl border bg-surface p-4" style={{ borderColor: 'var(--color-border)' }}>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-7 w-32" />
      <Skeleton className="mt-2 h-4 w-16" />
    </div>
  )
}
