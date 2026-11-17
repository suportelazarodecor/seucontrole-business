import clsx from 'clsx'

type Tone = 'ok' | 'soon' | 'late' | 'neutral'

const tones: Record<Tone, string> = {
  ok: 'bg-esmeralda/10 text-esmeralda',
  soon: 'bg-ambar/10 text-ambar',
  late: 'bg-coral/10 text-coral',
  neutral: 'bg-indigo/10 text-indigo',
}

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: React.ReactNode }) {
  return <span className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold', tones[tone])}>{children}</span>
}
