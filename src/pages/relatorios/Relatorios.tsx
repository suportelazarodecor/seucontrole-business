import { useUIStore } from '@/store/uiStore'
import DRE from './DRE'
import OrcamentoCategoria from './OrcamentoCategoria'

export default function Relatorios() {
  const { mode } = useUIStore()
  return mode === 'business' ? <DRE /> : <OrcamentoCategoria />
}
