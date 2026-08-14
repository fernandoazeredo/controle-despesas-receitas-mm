import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot, type DocumentData } from 'firebase/firestore'
import { CheckCircle2, ExternalLink, FileText, FolderArchive, Paperclip, Search } from 'lucide-react'
import { db } from '../lib/firebase'
import { WorkflowStatusBadge } from '../components/WorkflowStatusBadge'

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
type AnyRecord = { id: string } & DocumentData
type AttachmentMeta = { name?: string; url?: string; path?: string; size?: number; type?: string }

const expenseStatusLabels: Record<string, string> = {
  rascunho: 'Rascunho', enviado_aprovacao: 'Enviado para Aprovação', em_analise: 'Em Análise', aprovado: 'Aprovado', devolvido: 'Devolvido p/ Correção', rejeitado: 'Rejeitado', pago: 'Pago', arquivado: 'Arquivado',
}
const receivableStatusLabels: Record<string, string> = {
  rascunho: 'Rascunho', enviado_tesouraria: 'Enviado à Tesouraria', recebido_tesouraria: 'Recebido pela Tesouraria', devolvido: 'Devolvido para Correção', encerrado: 'Encerrado / Arquivado',
}

function useCollection(name: string) {
  const [records, setRecords] = useState<AnyRecord[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => onSnapshot(collection(db, name), (snapshot) => {
    setRecords(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
    setLoading(false)
  }, () => setLoading(false)), [name])
  return { records, loading }
}
function toNumber(value: unknown) { const number = Number(value); return Number.isFinite(number) ? number : 0 }
function attachmentsOf(item: AnyRecord): AttachmentMeta[] { return Array.isArray(item.attachments) ? item.attachments as AttachmentMeta[] : [] }

export function DocumentsPageStorage() {
  const { records: expenses, loading: loadingExpenses } = useCollection('expenses')
  const { records: receivables, loading: loadingReceivables } = useCollection('receivables')
  const [search, setSearch] = useState('')

  const dossiers = useMemo(() => [
    ...expenses.map((item) => ({ id: item.id, type: 'Despesa', title: item.nome || item.fornecedor || 'Despesa', subtitle: item.fornecedor || item.competencia || '', value: item.valorTotal, status: expenseStatusLabels[item.status] || item.status, statusCode: item.status, tone: 'expense', attachments: attachmentsOf(item) })),
    ...receivables.map((item) => ({ id: item.id, type: 'Recebimento', title: item.processo || item.reclamante || 'Recebimento', subtitle: item.reclamante || item.reclamada || '', value: item.valorAlvara, status: receivableStatusLabels[item.status] || item.status, statusCode: item.status, tone: 'revenue', attachments: attachmentsOf(item) })),
  ].filter((item) => `${item.type} ${item.title} ${item.subtitle} ${item.status} ${item.attachments.map((a) => a.name ?? '').join(' ')}`.toLowerCase().includes(search.toLowerCase())), [expenses, receivables, search])

  const totalAttachments = dossiers.reduce((sum, item) => sum + item.attachments.length, 0)
  const loading = loadingExpenses || loadingReceivables

  return <>
    <div className="page-heading"><div><span className="eyebrow">Dossiê digital</span><h1>Arquivo de Documentos</h1><p>Pesquisa centralizada de lançamentos e anexos armazenados no Firebase Storage.</p></div></div>
    <section className="page-card module-card storage-documents-card">
      <div className="module-toolbar"><div className="search-box"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar processo, fornecedor, cliente, status ou arquivo" /></div><span className="status-badge success"><CheckCircle2 size={14} /> Storage ativo · {totalAttachments} anexo(s)</span></div>
      {loading ? <div className="module-empty"><FolderArchive size={34} /><strong>Carregando dossiês</strong><span>Consultando Firestore e referências do Storage...</span></div> : dossiers.length === 0 ? <div className="module-empty"><FolderArchive size={34} /><strong>Arquivo ainda sem dossiês</strong><span>Os próximos lançamentos e anexos aparecerão aqui automaticamente.</span></div> : <div className="storage-dossier-grid">{dossiers.map((item) => <article key={`${item.type}-${item.id}`} className={`storage-dossier ${item.tone}`}>
        <div className="storage-dossier-heading"><div className={`dossier-icon ${item.tone}`}><FileText size={21} /></div><div><small>{item.type}</small><strong>{item.title}</strong><span>{item.subtitle}</span></div><b className={item.tone === 'expense' ? 'expense-text' : 'revenue-text'}>{money.format(toNumber(item.value))}</b></div>
        <div className="storage-dossier-meta"><WorkflowStatusBadge status={String(item.statusCode ?? '')} label={String(item.status ?? '—')} /><span><Paperclip size={14} /> {item.attachments.length} anexo(s)</span></div>
        {item.attachments.length > 0 && <div className="storage-dossier-files">{item.attachments.map((file, index) => file.url ? <a key={file.path || `${item.id}-${index}`} href={file.url} target="_blank" rel="noreferrer"><Paperclip size={14} /><span>{file.name || 'Documento'}</span><ExternalLink size={13} /></a> : <span key={`${item.id}-${index}`}><Paperclip size={14} /> {file.name || 'Documento'}</span>)}</div>}
      </article>)}</div>}
    </section>
  </>
}
