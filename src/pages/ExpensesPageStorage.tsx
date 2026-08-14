import { useEffect, useMemo, useState } from 'react'
import { addDoc, collection, doc, onSnapshot, serverTimestamp, setDoc, updateDoc, type DocumentData } from 'firebase/firestore'
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'
import { CheckCircle2, ExternalLink, FileText, Filter, Paperclip, Pencil, Plus, ReceiptText, RefreshCw, Search, Send, Trash2, Upload, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { db, storage } from '../lib/firebase'
import { useAuth } from '../auth/AuthContext'
import { AccountSelector } from '../components/AccountSelector'
import { WorkflowStatusBadge } from '../components/WorkflowStatusBadge'
import type { ChartOfAccount } from '../data/chartOfAccounts'

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
type AnyRecord = { id: string } & DocumentData
type ExpenseItem = { data: string; historico: string; valor: string }
type AttachmentMeta = { name: string; url: string; path: string; size: number; type: string; uploadedAt: string; uploadedBy: string }

const expenseStatusLabels: Record<string, string> = {
  rascunho: 'Rascunho', enviado_aprovacao: 'Enviado para Aprovação', em_analise: 'Em Análise', aprovado: 'Aprovado', devolvido: 'Devolvido p/ Correção', rejeitado: 'Rejeitado', pago: 'Pago', arquivado: 'Arquivado',
}

function useExpenses() {
  const [records, setRecords] = useState<AnyRecord[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => onSnapshot(collection(db, 'expenses'), (snapshot) => {
    setRecords(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
    setLoading(false)
  }, () => setLoading(false)), [])
  return { records, loading }
}

function toNumber(value: unknown) { const number = Number(value); return Number.isFinite(number) ? number : 0 }
function parseBRL(value: string) {
  const cleaned = value.replace(/\s/g, '').replace(/R\$/g, '')
  if (!cleaned) return 0
  const normalized = cleaned.includes(',') ? cleaned.replace(/\./g, '').replace(',', '.') : cleaned
  const number = Number(normalized)
  return Number.isFinite(number) ? number : 0
}
function formatCurrencyFromDigits(value: string) { const digits = value.replace(/\D/g, ''); return digits ? money.format(Number(digits) / 100) : '' }
function asCurrencyInput(value: unknown) { const number = toNumber(value); return number ? money.format(number) : '' }
function safeFileName(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'arquivo' }
function existingAttachments(record?: AnyRecord | null): AttachmentMeta[] { return Array.isArray(record?.attachments) ? record.attachments as AttachmentMeta[] : [] }

async function writeAudit(profile: ReturnType<typeof useAuth>['profile'], action: string, detail: string, entityId?: string) {
  if (!profile) return
  await addDoc(collection(db, 'auditLogs'), { action, module: 'Despesas', detail, entityId: entityId ?? null, userId: profile.uid, userName: profile.displayName, userEmail: profile.email, createdAt: serverTimestamp() })
}

function Header({ onNew }: { onNew: () => void }) {
  return <div className="page-heading"><div><span className="eyebrow">Tesouraria</span><h1>Despesas</h1><p>Criação, Plano de Contas, anexos no Firebase Storage, correção e acompanhamento do demonstrativo.</p></div><div className="quick-actions"><button className="outline-expense-button" type="button"><FileText size={18} /> Extrato de Despesas</button><button className="expense-button" type="button" onClick={onNew}><Plus size={18} /> Nova Despesa</button></div></div>
}

function ExpenseModal({ record, onClose }: { record?: AnyRecord | null; onClose: () => void }) {
  const { profile } = useAuth()
  const editing = Boolean(record)
  const [busy, setBusy] = useState(false)
  const [unidade, setUnidade] = useState<'RJ' | 'SP'>((record?.unidade as 'RJ' | 'SP') || 'RJ')
  const [nome, setNome] = useState(String(record?.nome ?? ''))
  const [competencia, setCompetencia] = useState(String(record?.competencia ?? new Date().toISOString().slice(0, 7)))
  const [fornecedor, setFornecedor] = useState(String(record?.fornecedor ?? ''))
  const [documento, setDocumento] = useState(String(record?.documento ?? ''))
  const [subcategoria, setSubcategoria] = useState(String(record?.subcategoria ?? ''))
  const [observacoes, setObservacoes] = useState(String(record?.observacoes ?? ''))
  const [account, setAccount] = useState<ChartOfAccount | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const initialAccountCode = String(record?.expenseAccountCode ?? record?.classificacaoContabil ?? '')
  const initialItems = Array.isArray(record?.items) && record?.items.length
    ? record.items.map((item: DocumentData) => ({ data: String(item.data ?? ''), historico: String(item.historico ?? ''), valor: asCurrencyInput(item.valor) }))
    : [{ data: new Date().toISOString().slice(0, 10), historico: '', valor: '' }, { data: '', historico: '', valor: '' }, { data: '', historico: '', valor: '' }]
  const [items, setItems] = useState<ExpenseItem[]>(initialItems)
  const total = useMemo(() => items.reduce((sum, item) => sum + parseBRL(item.valor), 0), [items])
  const previousAttachments = existingAttachments(record)

  function updateItem(index: number, field: keyof ExpenseItem, value: string) { setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item)) }

  async function uploadSelected(expenseId: string): Promise<AttachmentMeta[]> {
    if (!profile?.uid || !files.length) return []
    const uploaded: AttachmentMeta[] = []
    for (const file of files) {
      if (file.size > 20 * 1024 * 1024) throw new Error(`O arquivo ${file.name} ultrapassa o limite de 20 MB.`)
      const path = `despesas/${profile.uid}/${expenseId}/${Date.now()}-${safeFileName(file.name)}`
      const target = storageRef(storage, path)
      await uploadBytes(target, file, { contentType: file.type || 'application/octet-stream' })
      uploaded.push({ name: file.name, url: await getDownloadURL(target), path, size: file.size, type: file.type || 'application/octet-stream', uploadedAt: new Date().toISOString(), uploadedBy: profile.uid })
    }
    return uploaded
  }

  async function save(status: 'rascunho' | 'devolvido' | 'enviado_aprovacao') {
    const validItems = items.filter((item) => item.historico.trim() || parseBRL(item.valor) > 0)
    if (!nome.trim() || !validItems.length || total <= 0) { window.alert('Preencha o nome/responsável e pelo menos uma linha de despesa com histórico e valor.'); return }
    setBusy(true)
    try {
      const expenseRef = record ? doc(db, 'expenses', record.id) : doc(collection(db, 'expenses'))
      const uploaded = await uploadSelected(expenseRef.id)
      const attachments = [...previousAttachments, ...uploaded]
      const chosenCode = account?.code || initialAccountCode || null
      const chosenName = account?.name || String(record?.expenseAccountName ?? '') || null
      const chosenDre = account?.dre || String(record?.expenseAccountDre ?? '') || null
      const payload = {
        unidade, nome: nome.trim(), competencia, fornecedor: fornecedor.trim(), documento: documento.trim(),
        categoria: chosenCode && chosenName ? `${chosenCode} - ${chosenName}` : String(record?.categoria ?? ''),
        subcategoria: subcategoria.trim(), classificacaoContabil: chosenCode, expenseAccountCode: chosenCode, expenseAccountName: chosenName, expenseAccountDre: chosenDre,
        planoConta: chosenCode ? { code: chosenCode, name: chosenName, dre: chosenDre, category: 'Despesa' } : null,
        observacoes: observacoes.trim(), items: validItems.map((item) => ({ ...item, valor: parseBRL(item.valor) })), valorTotal: total, status,
        attachments, attachmentCount: attachments.length, storageStatus: 'active', updatedAt: serverTimestamp(),
        correctedBy: editing ? profile?.uid : null, correctedAt: editing ? serverTimestamp() : null,
        ...(status === 'enviado_aprovacao' ? { approvalNote: null } : {}),
      }
      if (record) await updateDoc(expenseRef, payload)
      else await setDoc(expenseRef, { ...payload, createdBy: profile?.uid, createdByName: profile?.displayName, createdAt: serverTimestamp() })
      await writeAudit(profile, record ? (status === 'enviado_aprovacao' ? 'Despesa corrigida e reenviada para aprovação' : 'Correção de despesa salva') : (status === 'rascunho' ? 'Despesa salva como rascunho' : 'Despesa enviada para aprovação'), `${nome} — ${money.format(total)} · ${attachments.length} anexo(s)`, expenseRef.id)
      onClose()
    } catch (error) {
      console.error(error)
      window.alert(error instanceof Error ? error.message : 'Não foi possível salvar a despesa ou enviar os anexos.')
    } finally { setBusy(false) }
  }

  return <div className="modal-backdrop"><section className="modal-sheet legacy-sheet expense-sheet" role="dialog" aria-modal="true">
    <div className="modal-toolbar"><div><span className="eyebrow expense-text">Tesouraria</span><h2>{editing ? 'Corrigir Demonstrativo de Despesas' : 'Demonstrativo de Despesas'}</h2></div><button className="icon-button" type="button" onClick={onClose}><X size={20} /></button></div>
    <div className="legacy-title-block"><strong>FLÁVIO MARQUES ADVOGADOS ASSOCIADOS</strong><span>DEMONSTRATIVO DE DESPESAS</span></div>
    {record?.status === 'devolvido' && <div className="return-note"><div><strong>Devolvido para correção</strong><span>{record.approvalNote || 'A Diretoria solicitou correção deste demonstrativo.'}</span></div></div>}
    <div className="form-grid compact-grid"><label><span>Unidade</span><select value={unidade} onChange={(e) => setUnidade(e.target.value as 'RJ' | 'SP')}><option>RJ</option><option>SP</option></select></label><label className="span-2"><span>Nome / Responsável</span><input value={nome} onChange={(e) => setNome(e.target.value)} /></label><label><span>Competência</span><input type="month" value={competencia} onChange={(e) => setCompetencia(e.target.value)} /></label><label className="span-2"><span>Fornecedor / Favorecido</span><input value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} /></label><label><span>CPF / CNPJ</span><input value={documento} onChange={(e) => setDocumento(e.target.value)} /></label></div>
    <div className="legacy-table expense-table"><div className="legacy-row legacy-head"><span>DATA</span><span>HISTÓRICO</span><span>VALOR</span><span></span></div>{items.map((item, index) => <div className="legacy-row" key={index}><input type="date" value={item.data} onChange={(e) => updateItem(index, 'data', e.target.value)} /><input value={item.historico} onChange={(e) => updateItem(index, 'historico', e.target.value)} /><input inputMode="numeric" value={item.valor} onChange={(e) => updateItem(index, 'valor', formatCurrencyFromDigits(e.target.value))} placeholder="R$ 0,00" /><button type="button" className="row-remove" onClick={() => setItems((current) => current.length > 1 ? current.filter((_, i) => i !== index) : current)}><Trash2 size={15} /></button></div>)}</div>
    <button type="button" className="add-row-button expense-text" onClick={() => setItems((current) => [...current, { data: '', historico: '', valor: '' }])}><Plus size={16} /> Adicionar linha</button>
    <div className="account-integration-block expense-account-block"><AccountSelector category="Despesa" value={account?.code || initialAccountCode} onChange={setAccount} label="Categoria / Plano de Contas" placeholder="Digite código ou nome — ex.: 4.05, aluguel, telefone..." /><p>A classificação permanece opcional.</p></div>
    <div className="form-grid compact-grid section-gap"><label className="span-2"><span>Detalhamento complementar <small>(opcional)</small></span><input value={subcategoria} onChange={(e) => setSubcategoria(e.target.value)} /></label><label className="span-3"><span>OBS.</span><textarea rows={3} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} /></label></div>

    <div className="document-zone storage-document-zone"><CheckCircle2 size={20} /><div><strong>Documentos comprobatórios · Storage ativo</strong><span>Anexe boleto, nota fiscal, comprovante, PDF ou imagem. Limite de 20 MB por arquivo.</span></div><label className="storage-upload-button"><Upload size={16} /> Selecionar arquivos<input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,image/*" onChange={(e) => setFiles(Array.from(e.target.files ?? []))} /></label></div>
    {(previousAttachments.length > 0 || files.length > 0) && <div className="expense-attachment-list">{previousAttachments.map((item) => <a key={item.path} href={item.url} target="_blank" rel="noreferrer"><Paperclip size={14} /> {item.name}<ExternalLink size={13} /></a>)}{files.map((file) => <span key={`${file.name}-${file.size}`}><Paperclip size={14} /> {file.name} · aguardando envio</span>)}</div>}

    <div className="legacy-total"><span>Total da Despesa</span><strong>{money.format(total)}</strong></div>
    <div className="modal-actions"><button className="secondary-button" type="button" onClick={onClose}>Cancelar</button>{editing ? <><button className="outline-expense-button" type="button" disabled={busy} onClick={() => save('devolvido')}>Salvar correção</button><button className="expense-button" type="button" disabled={busy} onClick={() => save('enviado_aprovacao')}><Send size={17} /> {busy ? 'Enviando...' : 'Reenviar para Aprovação'}</button></> : <><button className="outline-expense-button" type="button" disabled={busy} onClick={() => save('rascunho')}>Salvar rascunho</button><button className="expense-button" type="button" disabled={busy} onClick={() => save('enviado_aprovacao')}><Send size={17} /> {busy ? 'Enviando...' : 'Enviar para Aprovação'}</button></>}</div>
  </section></div>
}

export function ExpensesPageStorage() {
  const [params, setParams] = useSearchParams()
  const [open, setOpen] = useState(params.get('novo') === '1')
  const [editing, setEditing] = useState<AnyRecord | null>(null)
  const [search, setSearch] = useState('')
  const { records, loading } = useExpenses()
  useEffect(() => { if (params.get('novo') === '1') { setEditing(null); setOpen(true) } }, [params])
  const filtered = records.filter((item) => `${item.nome ?? ''} ${item.fornecedor ?? ''} ${item.competencia ?? ''} ${item.categoria ?? ''} ${item.expenseAccountCode ?? ''} ${item.expenseAccountName ?? ''}`.toLowerCase().includes(search.toLowerCase()))
  const close = () => { setOpen(false); setEditing(null); setParams({}) }

  return <>
    <Header onNew={() => { setEditing(null); setOpen(true) }} />
    <section className="page-card module-card expense-module-card"><div className="module-toolbar"><div className="search-box"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por responsável, fornecedor, competência, código ou conta" /></div><button className="secondary-button"><Filter size={17} /> Filtros</button></div>
      {loading ? <div className="module-empty"><RefreshCw className="spin" size={30} /><strong>Carregando despesas</strong></div> : filtered.length === 0 ? <div className="module-empty"><ReceiptText size={34} /><strong>Nenhuma despesa encontrada</strong><span>Clique em Nova Despesa para preencher o primeiro demonstrativo.</span></div> : <div className="data-table review-expenses-table"><div className="data-row data-head"><span>Competência</span><span>Responsável / Favorecido</span><span>Plano de Contas</span><span>Status</span><span className="numeric">Valor</span><span>Ações</span></div>{filtered.map((item) => <div className="data-row" key={item.id}><span>{item.competencia || '—'}</span><span><strong>{item.nome || 'Sem nome'}</strong><small>{item.fornecedor || ''}</small></span><span><strong>{item.expenseAccountCode || item.classificacaoContabil || '—'}</strong><small>{item.expenseAccountName || item.categoria || 'Não classificada'}</small></span><span><WorkflowStatusBadge status={item.status} label={expenseStatusLabels[item.status] || item.status || '—'} /></span><span className="numeric expense-text"><strong>{money.format(toNumber(item.valorTotal))}</strong><small>{toNumber(item.attachmentCount) || existingAttachments(item).length} anexo(s)</small></span><span>{item.status === 'devolvido' ? <button className="small-expense-button" type="button" onClick={() => { setEditing(item); setOpen(true) }}><Pencil size={14} /> Corrigir e reenviar</button> : <span className="muted-dash">—</span>}</span></div>)}</div>}
    </section>
    {open && <ExpenseModal key={editing?.id ?? 'nova-despesa-storage'} record={editing} onClose={close} />}
  </>
}
