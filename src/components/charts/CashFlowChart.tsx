import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCompact, formatCurrency } from '@/lib/format'

interface Point {
  label: string
  income: number
  expense: number
  net: number
}

export function CashFlowChart({ data, projected }: { data: Point[]; projected?: { label: string; projected: number }[] }) {
  const merged: any[] = data.map((d) => ({ label: d.label, Entradas: d.income, Saídas: d.expense, Saldo: d.net }))
  if (projected?.length) {
    projected.forEach((p) => merged.push({ label: p.label, Projeção: p.projected }))
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={merged} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v) => formatCompact(v)} tick={{ fontSize: 11, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} width={48} />
        <Tooltip
          contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
          formatter={(v: number) => formatCurrency(v)}
        />
        <Area type="monotone" dataKey="Entradas" stroke="#10B981" fill="url(#incomeGrad)" strokeWidth={2} />
        <Line type="monotone" dataKey="Saídas" stroke="#EF4444" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Saldo" stroke="#0EA5E9" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Projeção" stroke="#6366F1" strokeWidth={2} strokeDasharray="5 4" dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
