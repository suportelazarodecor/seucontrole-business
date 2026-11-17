import clsx from 'clsx'

export function ProgressBar({ value, max, color = '#0EA5E9' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  )
}

export function ProgressBarLabeled({
  label,
  value,
  max,
  color = '#0EA5E9',
  format,
}: {
  label: string
  value: number
  max: number
  color?: string
  format: (n: number) => string
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  const over = value > max
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-text">{label}</span>
        <span className={clsx('tabular font-semibold', over ? 'text-coral' : 'text-muted')}>
          {format(value)} / {format(max)}
        </span>
      </div>
      <ProgressBar value={value} max={max} color={over ? '#EF4444' : color} />
    </div>
  )
}
