import clsx from 'clsx'
import { ArrowDownRight, ArrowUpRight } from './icons'
import { Card } from './Card'

interface KpiCardProps {
  label: string
  value: string
  delta?: number
  deltaGoodWhenUp?: boolean
  hint?: string
  accent?: 'petroleo' | 'esmeralda' | 'coral' | 'ambar' | 'indigo'
}

export function KpiCard({ label, value, delta, deltaGoodWhenUp = true, hint, accent = 'petroleo' }: KpiCardProps) {
  const isUp = (delta ?? 0) >= 0
  const isGood = deltaGoodWhenUp ? isUp : !isUp
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <span className={clsx('h-1.5 w-1.5 rounded-full', accentDot[accent])} />
      </div>
      <p className="tabular mt-2 text-2xl font-bold text-text">{value}</p>
      <div className="mt-1.5 flex items-center gap-1.5">
        {typeof delta === 'number' && (
          <span
            className={clsx(
              'flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold tabular',
              isGood ? 'bg-esmeralda/10 text-esmeralda' : 'bg-coral/10 text-coral'
            )}
          >
            {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </div>
    </Card>
  )
}

const accentDot: Record<string, string> = {
  petroleo: 'bg-petroleo',
  esmeralda: 'bg-esmeralda',
  coral: 'bg-coral',
  ambar: 'bg-ambar',
  indigo: 'bg-indigo',
}
