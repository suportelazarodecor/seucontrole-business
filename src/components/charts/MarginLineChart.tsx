import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export function MarginLineChart({ data }: { data: { label: string; margin: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} width={40} />
        <Tooltip
          contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
          formatter={(v: number) => `${v.toFixed(1)}%`}
        />
        <Line type="monotone" dataKey="margin" name="Margem líquida" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
