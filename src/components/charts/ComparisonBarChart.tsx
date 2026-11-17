import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCompact, formatCurrency } from '@/lib/format'

export interface ComparisonRow {
  name: string
  Orçado: number
  Realizado: number
  overBudget?: boolean
}

export function ComparisonBarChart({ data }: { data: ComparisonRow[] }) {
  if (data.length === 0) return null
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 34)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }} barCategoryGap={12}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
        <XAxis type="number" tickFormatter={(v) => formatCompact(v)} tick={{ fontSize: 11, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12, fill: 'var(--color-text)' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
          formatter={(v: number) => formatCurrency(v)}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Orçado" fill="#6366F1" opacity={0.35} radius={[0, 6, 6, 0]} barSize={12} />
        <Bar dataKey="Realizado" radius={[0, 6, 6, 0]} barSize={12}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.overBudget ? '#EF4444' : '#10B981'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
