import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '@/lib/format'

export function DonutChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  if (data.length === 0) return null
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} stroke="var(--color-surface)" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
          formatter={(v: number) => formatCurrency(v)}
        />
        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="right"
          wrapperStyle={{ fontSize: 12, color: 'var(--color-muted)' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
