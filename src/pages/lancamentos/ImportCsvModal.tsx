import { useState } from 'react'
import Papa from 'papaparse'
import { useAuthStore } from '@/store/authStore'
import { useDataStore } from '@/store/dataStore'
import { useUIStore } from '@/store/uiStore'
import { Button } from '@/components/ui/Button'
import { X, Upload } from '@/components/ui/icons'
import { format } from 'date-fns'

interface Row {
  data: string
  descricao: string
  tipo: string
  valor: string
}

export function ImportCsvModal({ onClose }: { onClose: () => void }) {
  const { userId } = useAuthStore()
  const { mode } = useUIStore()
  const { addTransaction } = useDataStore()
  const [rows, setRows] = useState<Row[]>([])
  const [fileName, setFileName] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  function onFile(file: File) {
    setFileName(file.name)
    Papa.parse<Row>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => setRows(res.data.filter((r) => r.descricao)),
    })
  }

  async function confirmImport() {
    if (!userId) return
    setImporting(true)
    for (const r of rows) {
      const amount = parseFloat((r.valor || '0').toString().replace('R$', '').replace('.', '').replace(',', '.')) || 0
      const type = /receita|entrada|income/i.test(r.tipo || '') ? 'income' : 'expense'
      await addTransaction(userId, {
        mode,
        type,
        description: r.descricao,
        amount: Math.abs(amount),
        date: r.data && /\d{4}-\d{2}-\d{2}/.test(r.data) ? r.data : format(new Date(), 'yyyy-MM-dd'),
        category_id: null,
        tags: [],
        status: 'confirmed',
        attachment_url: null,
        client_or_supplier: null,
      })
    }
    setImporting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border bg-surface p-5 shadow-card"
        style={{ borderColor: 'var(--color-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-text">Importar extrato (CSV)</h2>
          <button onClick={onClose} className="rounded-md p-1 text-muted hover:text-text">
            <X size={18} />
          </button>
        </div>

        <p className="mb-3 text-xs text-muted">
          O arquivo deve ter colunas <code className="tabular">data, descricao, tipo, valor</code>. Colunas em outra ordem/nome ainda
          funcionam, mas confira o preview antes de importar.
        </p>

        <label
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-8 text-xs text-muted hover:border-petroleo hover:text-petroleo"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <Upload size={20} />
          {fileName ?? 'Selecionar arquivo .csv'}
          <input type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        </label>

        {rows.length > 0 && (
          <div className="mt-4 max-h-52 overflow-y-auto rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-left text-muted" style={{ borderColor: 'var(--color-border)' }}>
                  <th className="px-2 py-1.5">Data</th>
                  <th className="px-2 py-1.5">Descrição</th>
                  <th className="px-2 py-1.5">Tipo</th>
                  <th className="px-2 py-1.5 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 20).map((r, i) => (
                  <tr key={i} className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <td className="px-2 py-1.5 tabular">{r.data}</td>
                    <td className="px-2 py-1.5">{r.descricao}</td>
                    <td className="px-2 py-1.5">{r.tipo}</td>
                    <td className="px-2 py-1.5 text-right tabular">{r.valor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="px-2 py-1.5 text-[11px] text-muted">{rows.length} linhas detectadas.</p>
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="sm" disabled={rows.length === 0 || importing} onClick={confirmImport}>
            {importing ? 'Importando…' : `Importar ${rows.length || ''} lançamentos`}
          </Button>
        </div>
      </div>
    </div>
  )
}
