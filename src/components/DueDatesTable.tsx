import type { AccountEntry } from '@/types'
import { formatCurrency, formatDate } from '@/lib/format'
import { accountStatusLabel } from '@/lib/metrics'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Wallet } from '@/components/ui/icons'

export function DueDatesTable({ rows, currency = 'BRL' }: { rows: AccountEntry[]; currency?: string }) {
  const sorted = [...rows].sort((a, b) => (a.due_date < b.due_date ? -1 : 1)).slice(0, 8)
  if (sorted.length === 0) {
    return <EmptyState icon={<Wallet size={28} />} title="Nenhum vencimento próximo" description="Cadastre contas a pagar ou receber para acompanhar aqui." />
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-muted">
            <th className="pb-2 font-medium">Descrição</th>
            <th className="pb-2 font-medium">Tipo</th>
            <th className="pb-2 font-medium">Vencimento</th>
            <th className="pb-2 text-right font-medium">Valor</th>
            <th className="pb-2 text-right font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => {
            const st = accountStatusLabel(r)
            return (
              <tr key={r.id} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                <td className="py-2.5 font-medium text-text">{r.description}</td>
                <td className="py-2.5 text-muted">{r.kind === 'payable' ? 'A pagar' : 'A receber'}</td>
                <td className="py-2.5 tabular text-muted">{formatDate(r.due_date)}</td>
                <td className="py-2.5 text-right tabular font-semibold text-text">{formatCurrency(r.amount, currency)}</td>
                <td className="py-2.5 text-right">
                  <Badge tone={st.tone}>{st.label}</Badge>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
