export function formatCurrency(value: number, currency = 'BRL') {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value)
}

export function formatCompact(value: number) {
  return new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

export function formatPercent(value: number, digits = 1) {
  return `${value >= 0 ? '' : ''}${value.toFixed(digits)}%`
}

export function formatDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function monthLabel(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '')
}
