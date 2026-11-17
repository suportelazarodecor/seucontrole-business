import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { db } from '@/lib/db'
import { useDataStore } from '@/store/dataStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/format'
import { Plus, Trash } from '@/components/ui/icons'

type Supplier = {id:string; user_id:string; name:string; contact:string; address:string; supplies:string}
export default function Fornecedores(){
 const {userId}=useAuthStore(); const {transactions}=useDataStore(); const [rows,setRows]=useState<Supplier[]>([]); const [ready,setReady]=useState(false); const [name,N]=useState(''); const [contact,C]=useState(''); const [address,A]=useState(''); const [supplies,S]=useState('');
 async function load(){if(!userId)return; setRows(await db.list<Supplier>('suppliers',userId));setReady(true)}
 if(!ready) void load()
 async function add(e:React.FormEvent){e.preventDefault();if(!userId||!name.trim())return; const r=await db.insert<Supplier>('suppliers',userId,{name:name.trim(),contact,address,supplies} as Supplier);setRows([r,...rows]);N('');C('');A('');S('')}
 async function del(id:string){if(!userId)return;await db.remove('suppliers',userId,id);setRows(rows.filter(x=>x.id!==id))}
 return <div className="space-y-4"><div><h1 className="text-xl font-bold">Fornecedores</h1><p className="text-sm text-muted">Contatos e insumos dos parceiros da empresa.</p></div><Card className="p-4"><form onSubmit={add} className="grid gap-3 md:grid-cols-2"><input required placeholder="Nome do fornecedor" value={name} onChange={e=>N(e.target.value)} className="rounded-lg border bg-transparent p-2 text-sm"/><input placeholder="Contato (telefone/e-mail)" value={contact} onChange={e=>C(e.target.value)} className="rounded-lg border bg-transparent p-2 text-sm"/><input placeholder="Endereço" value={address} onChange={e=>A(e.target.value)} className="rounded-lg border bg-transparent p-2 text-sm"/><input placeholder="Insumos vendidos (separe por vírgula)" value={supplies} onChange={e=>S(e.target.value)} className="rounded-lg border bg-transparent p-2 text-sm"/><Button size="sm" type="submit"><Plus size={14}/> Cadastrar fornecedor</Button></form></Card><div className="grid gap-3 md:grid-cols-2">{rows.map(s=>{const spend=transactions.filter(t=>t.type==='expense'&&t.client_or_supplier?.toLowerCase()===s.name.toLowerCase()).reduce((n,t)=>n+t.amount,0);return <Card key={s.id} className="p-4"><div className="flex justify-between"><h2 className="font-semibold">{s.name}</h2><button onClick={()=>void del(s.id)} aria-label="Excluir"><Trash size={15}/></button></div><p className="mt-2 text-sm text-muted">{s.contact||'Sem contato'} · {s.address||'Sem endereço'}</p><p className="mt-1 text-sm">Insumos: {s.supplies||'Não informado'}</p><p className="mt-3 text-sm font-semibold">Gastos registrados: {formatCurrency(spend,'BRL')}</p></Card>})}{ready&&rows.length===0&&<Card className="p-6 text-sm text-muted">Nenhum fornecedor cadastrado ainda.</Card>}</div></div>
}
