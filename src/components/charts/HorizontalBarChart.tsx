import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCompact, formatCurrency } from '@/lib/format'

export function HorizontalBarChart({ data, color = '#0EA5E9' }: { data: { name: string; value: number }[]; color?: string }) {
  if (data.length === 0) return null
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 42)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
        <XAxis type="number" tickFormatter={(v) => formatCompact(v)} tick={{ fontSize: 11, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fill: 'var(--color-text)' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
          formatter={(v: number) => formatCurrency(v)}
        />
        <Bar dataKey="value" fill={color} radius={[0, 6, 6, 0]} barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  )
}
