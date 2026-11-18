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
    <Card className="relative min-h-[122px] overflow-hidden p-4 pt-5 sm:p-5">
      <span aria-hidden="true" className={clsx('absolute left-5 top-0 h-[3px] w-12 rounded-b-full opacity-90', accentDot[accent])} />
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[.12em] text-muted sm:text-[11px]">{label}</p>
        <span className={clsx('h-2 w-2 rounded-full ring-4 ring-opacity-10', accentDot[accent])} />
      </div>
      <p className="tabular mt-2.5 text-[22px] font-extrabold tracking-tight text-text sm:text-2xl">{value}</p>
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
