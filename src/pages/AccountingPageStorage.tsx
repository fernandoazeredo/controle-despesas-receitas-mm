import { useEffect, useMemo, useState } from 'react'
import {
  BadgeDollarSign,
  Calculator,
  CheckCircle2,
  ClipboardCopy,
  Download,
  ExternalLink,
  FileArchive,
  Link2,
  ReceiptText,
  Send,
} from 'lucide-react'
import { addDoc, collection, onSnapshot, serverTimestamp, type DocumentData } from 'firebase/firestore'
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'
import { db, storage } from '../lib/firebase'
import { useAuth } from '../auth/AuthContext'
import { createZip } from '../lib/simpleZip'

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const dateTimeBR = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

type AnyRecord = { id: string } & DocumentData
type BusyAction = '' | 'download' | 'link' | 'send'

function useLiveCollection(name: string) {
  const [records, setRecords] = useState<AnyRecord[]>([])
  useEffect(() => onSnapshot(collection(db, name), (snapshot) => {
    setRecords(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
  }), [name])
  return records
}

function toNumber(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function timestampToDateTime(value: unknown) {
  if (value && typeof value === 'object' && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    return dateTimeBR.format((value as { toDate: () => Date }).toDate())
  }
  return '—'
}

function csvCell(value: unknown) {
  const text = String(value ?? '').replace(/\r?\n/g, ' ').trim()
  return `"${text.replace(/"/g, '""')}"`
}

function toCsv(headers: string[], rows: unknown[][]) {
  return `\ufeff${headers.map(csvCell).join(';')}\r\n${rows.map((row) => row.map(csvCell).join(';')).join('\r\n')}\r\n`
}

function safeName(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'todas'
}

function toBlob(bytes: Uint8Array) {
  const buffer = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(buffer).set(bytes)
  return new Blob([buffer], { type: 'application/zip' })
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function statusLabel(value: string) {
  const labels: Record<string, string> = {
    aprovado: 'Aprovado', pago: 'Pago', arquivado: 'Arquivado',
    recebido_tesouraria: 'Recebido pela Tesouraria', encerrado: 'Encerrado / Arquivado',
  }
  return labels[value] ?? value
}

export function AccountingPageStorage() {
  const { profile } = useAuth()
  const expenses = useLiveCollection('expenses')
  const receivables = useLiveCollection('receivables')
  const dispatches = useLiveCollection('accountingDispatches')
  const [competence, setCompetence] = useState(new Date().toISOString().slice(0, 7))
  const [unit, setUnit] = useState('Todas')
  const [movement, setMovement] = useState('Despesas + Recebimentos')
  const [busy, setBusy] = useState<BusyAction>('')
  const [message, setMessage] = useState('')
  const [latestLink, setLatestLink] = useState('')
  const [copied, setCopied] = useState(false)

  const approvedExpenses = useMemo(() => expenses.filter((item) =>
    ['aprovado', 'pago', 'arquivado'].includes(String(item.status))
    && item.competencia === competence
    && (unit === 'Todas' || item.unidade === unit)), [expenses, competence, unit])

  const finishedReceivables = useMemo(() => receivables.filter((item) =>
    ['recebido_tesouraria', 'encerrado'].includes(String(item.status))
    && String(item.data ?? '').slice(0, 7) === competence
    && (unit === 'Todas' || item.unidade === unit)), [receivables, competence, unit])

  const includeExpenses = movement !== 'Somente Recebimentos'
  const includeReceivables = movement !== 'Somente Despesas'
  const selectedExpenses = includeExpenses ? approvedExpenses : []
  const selectedReceivables = includeReceivables ? finishedReceivables : []
  const expenseCount = selectedExpenses.length
  const receivableCount = selectedReceivables.length
  const expenseTotal = selectedExpenses.reduce((sum, item) => sum + toNumber(item.valorTotal), 0)
  const revenueTotal = selectedReceivables.reduce((sum, item) => sum + toNumber(item.valorAlvara), 0)
  const totalEntries = expenseCount + receivableCount
  const orderedDispatches = [...dispatches].sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))

  async function audit(action: string, detail: string, entityId?: string) {
    if (!profile) return
    await addDoc(collection(db, 'auditLogs'), {
      action,
      module: 'Contabilidade',
      detail,
      entityId: entityId ?? null,
      userId: profile.uid,
      userName: profile.displayName,
      userEmail: profile.email,
      createdAt: serverTimestamp(),
    })
  }

  function buildPackage() {
    if (totalEntries === 0) throw new Error('Nenhum lançamento apto foi encontrado para a competência e filtros selecionados.')

    const expenseCsv = toCsv(
      ['Competência', 'Unidade', 'Responsável', 'Fornecedor/Favorecido', 'CPF/CNPJ', 'Plano de Contas', 'Descrição da Conta', 'DRE', 'Status', 'Valor'],
      selectedExpenses.map((item) => [
        item.competencia, item.unidade, item.nome, item.fornecedor, item.documento,
        item.expenseAccountCode ?? item.classificacaoContabil ?? '', item.expenseAccountName ?? '', item.expenseAccountDre ?? '',
        statusLabel(String(item.status ?? '')), money.format(toNumber(item.valorTotal)),
      ]),
    )

    const revenueCsv = toCsv(
      ['Data', 'Unidade', 'Processo', 'Reclamante', 'Reclamada', 'Origem', 'Plano de Contas', 'Descrição da Conta', 'DRE', 'Status', 'Valor do Alvará', 'Líquido Cliente'],
      selectedReceivables.map((item) => [
        item.data, item.unidade, item.processo, item.reclamante, item.reclamada, item.origem,
        item.revenueAccountCode ?? item.classificacaoContabil ?? '', item.revenueAccountName ?? '', item.revenueAccountDre ?? '',
        statusLabel(String(item.status ?? '')), money.format(toNumber(item.valorAlvara)), money.format(toNumber(item.valorLiquidoCliente)),
      ]),
    )

    const summary = [
      'FLÁVIO MARQUES ADVOGADOS ASSOCIADOS',
      'PACOTE DE MOVIMENTO PARA CONTABILIDADE',
      '',
      `Competência: ${competence}`,
      `Unidade: ${unit}`,
      `Movimento: ${movement}`,
      `Despesas aptas: ${expenseCount} | ${money.format(expenseTotal)}`,
      `Receitas aptas: ${receivableCount} | ${money.format(revenueTotal)}`,
      `Gerado por: ${profile?.displayName || profile?.email || 'Usuário'}`,
      `Gerado em: ${dateTimeBR.format(new Date())}`,
      '',
      'Conteúdo do ZIP:',
      '- resumo.txt',
      includeExpenses ? '- despesas.csv' : null,
      includeReceivables ? '- receitas.csv' : null,
      '- movimento.json',
      '',
      'Observação: a classificação pelo Plano de Contas é opcional. Lançamentos não classificados permanecem no pacote.',
    ].filter(Boolean).join('\r\n')

    const json = JSON.stringify({
      generatedAt: new Date().toISOString(),
      competence,
      unit,
      movement,
      totals: { expenseCount, receivableCount, expenseTotal, revenueTotal },
      expenses: selectedExpenses.map((item) => ({
        id: item.id, competencia: item.competencia ?? null, unidade: item.unidade ?? null,
        nome: item.nome ?? null, fornecedor: item.fornecedor ?? null, documento: item.documento ?? null,
        status: item.status ?? null, valorTotal: toNumber(item.valorTotal),
        account: item.planoConta ?? { code: item.expenseAccountCode ?? item.classificacaoContabil ?? null, name: item.expenseAccountName ?? null, dre: item.expenseAccountDre ?? null },
      })),
      receivables: selectedReceivables.map((item) => ({
        id: item.id, data: item.data ?? null, unidade: item.unidade ?? null, processo: item.processo ?? null,
        reclamante: item.reclamante ?? null, reclamada: item.reclamada ?? null, origem: item.origem ?? null,
        status: item.status ?? null, valorAlvara: toNumber(item.valorAlvara), valorLiquidoCliente: toNumber(item.valorLiquidoCliente),
        account: item.planoConta ?? { code: item.revenueAccountCode ?? item.classificacaoContabil ?? null, name: item.revenueAccountName ?? null, dre: item.revenueAccountDre ?? null },
      })),
    }, null, 2)

    const entries = [
      { name: 'resumo.txt', content: summary },
      ...(includeExpenses ? [{ name: 'despesas.csv', content: expenseCsv }] : []),
      ...(includeReceivables ? [{ name: 'receitas.csv', content: revenueCsv }] : []),
      { name: 'movimento.json', content: json },
    ]
    const bytes = createZip(entries)
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const fileName = `Movimento_Contabilidade_${competence}_${safeName(unit)}_${stamp}.zip`
    return { blob: toBlob(bytes), fileName }
  }

  async function downloadPackage() {
    setBusy('download')
    setMessage('')
    try {
      const { blob, fileName } = buildPackage()
      downloadBlob(blob, fileName)
      await audit('Pacote ZIP da Contabilidade baixado', `${competence} · ${unit} · ${expenseCount} despesa(s) · ${receivableCount} receita(s)`)
      setMessage(`ZIP gerado e baixado com sucesso: ${fileName}`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível gerar o ZIP.')
    } finally {
      setBusy('')
    }
  }

  async function generateLink() {
    setBusy('link')
    setMessage('')
    setLatestLink('')
    try {
      const { blob, fileName } = buildPackage()
      const path = `pacotes-contabeis/${competence}/${safeName(unit)}/${fileName}`
      const target = storageRef(storage, path)
      await uploadBytes(target, blob, {
        contentType: 'application/zip',
        customMetadata: {
          competence,
          unit,
          movement,
          generatedBy: profile?.uid ?? '',
        },
      })
      const downloadUrl = await getDownloadURL(target)
      const packageRef = await addDoc(collection(db, 'accountingPackages'), {
        competence, unit, movement, fileName, storagePath: path, downloadUrl,
        expenseCount, receivableCount, expenseTotal, revenueTotal,
        createdBy: profile?.uid ?? null,
        createdByName: profile?.displayName ?? null,
        createdByEmail: profile?.email ?? null,
        createdAt: serverTimestamp(),
      })
      await audit('Link do pacote contábil gerado', `${competence} · ${fileName}`, packageRef.id)
      setLatestLink(downloadUrl)
      try {
        await navigator.clipboard.writeText(downloadUrl)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 2500)
        setMessage('Link do pacote gerado no Firebase Storage e copiado para a área de transferência.')
      } catch {
        setMessage('Link do pacote gerado no Firebase Storage. Use o botão Copiar link abaixo.')
      }
    } catch (error) {
      console.error(error)
      setMessage(error instanceof Error ? error.message : 'Não foi possível gerar o link do pacote.')
    } finally {
      setBusy('')
    }
  }

  async function sendMovement() {
    if (totalEntries === 0) {
      setMessage('Nenhum lançamento apto foi encontrado para a competência e filtros selecionados.')
      return
    }
    const confirmed = window.confirm(`Registrar o movimento ${competence} como enviado à Contabilidade?`)
    if (!confirmed) return
    setBusy('send')
    setMessage('')
    try {
      const ref = await addDoc(collection(db, 'accountingDispatches'), {
        competence, unit, movement, expenseCount, receivableCount, expenseTotal, revenueTotal,
        status: 'enviado', sentBy: profile?.uid, sentByName: profile?.displayName, sentByEmail: profile?.email,
        createdAt: serverTimestamp(),
      })
      await audit('Movimento registrado como enviado à Contabilidade', `${competence} · ${expenseCount} despesa(s) · ${receivableCount} receita(s)`, ref.id)
      setMessage('Movimento registrado com sucesso. O histórico foi atualizado abaixo.')
    } catch (error) {
      console.error(error)
      setMessage('Não foi possível registrar o envio. Confira sua conexão e permissão.')
    } finally {
      setBusy('')
    }
  }

  async function copyLatestLink() {
    if (!latestLink) return
    await navigator.clipboard.writeText(latestLink)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2500)
  }

  return (
    <>
      <div className="page-heading"><div><span className="eyebrow">Fechamento mensal</span><h1>Contabilidade</h1><p>Conferência do movimento, geração do pacote ZIP, compartilhamento via Firebase Storage e histórico de envio.</p></div></div>

      <section className="page-card accounting-panel">
        <div className="accounting-config">
          <label><span>Competência</span><input type="month" value={competence} onChange={(event) => setCompetence(event.target.value)} /></label>
          <label><span>Unidade</span><select value={unit} onChange={(event) => setUnit(event.target.value)}><option>Todas</option><option>RJ</option><option>SP</option></select></label>
          <label><span>Movimento</span><select value={movement} onChange={(event) => setMovement(event.target.value)}><option>Despesas + Recebimentos</option><option>Somente Despesas</option><option>Somente Recebimentos</option></select></label>
        </div>

        <div className="readiness-grid">
          <article><ReceiptText /><span>Despesas aptas</span><strong>{expenseCount}</strong><small>{money.format(expenseTotal)}</small></article>
          <article><BadgeDollarSign /><span>Receitas aptas</span><strong>{receivableCount}</strong><small>{money.format(revenueTotal)}</small></article>
          <article className="storage-ready-card"><FileArchive /><span>Firebase Storage</span><strong>Ativo</strong><small>Pacote ZIP habilitado</small></article>
          <article><CheckCircle2 /><span>Classificação</span><strong>Opcional</strong><small>Plano de Contas</small></article>
        </div>

        <div className="storage-ready-box"><CheckCircle2 size={18} /><span><strong>Storage ativo.</strong> O ZIP contém resumo, CSV de despesas/receitas e JSON do movimento. O botão de link envia esse mesmo pacote ao Firebase Storage.</span></div>

        {message && <div className={`accounting-feedback ${message.includes('sucesso') || message.includes('gerado') || message.includes('baixado') ? 'success' : 'warning'}`} role="status">{message}</div>}

        <div className="accounting-actions">
          <button className="secondary-button" type="button" disabled={Boolean(busy)} onClick={() => void downloadPackage()}><Download size={17} /> {busy === 'download' ? 'Gerando ZIP...' : 'Baixar ZIP'}</button>
          <button className="secondary-button" type="button" disabled={Boolean(busy)} onClick={() => void generateLink()}><Link2 size={17} /> {busy === 'link' ? 'Gerando link...' : 'Gerar link para Contabilidade'}</button>
          <button className="revenue-button" type="button" disabled={Boolean(busy)} onClick={() => void sendMovement()}><Calculator size={17} /> {busy === 'send' ? 'Registrando...' : 'Enviar Movimento à Contabilidade'}</button>
        </div>

        {latestLink && <div className="accounting-share-box">
          <div><Link2 size={19} /><div><strong>Link do pacote contábil</strong><span>Gerado no Firebase Storage para compartilhamento com a Contabilidade.</span></div></div>
          <div className="accounting-share-actions"><button className="secondary-button" type="button" onClick={() => void copyLatestLink()}><ClipboardCopy size={16} /> {copied ? 'Copiado' : 'Copiar link'}</button><a className="secondary-button accounting-open-link" href={latestLink} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Abrir link</a></div>
        </div>}
      </section>

      <section className="page-card accounting-history-card">
        <div className="card-title-row"><div><h2>Histórico de envios para a Contabilidade</h2><p>Cada confirmação fica registrada com competência, usuário e totais.</p></div><span className="status-badge revenue">{orderedDispatches.length} envio(s)</span></div>
        {orderedDispatches.length === 0 ? <div className="module-empty"><Send size={34} /><strong>Nenhum envio registrado</strong><span>O primeiro envio confirmado aparecerá aqui.</span></div> : <div className="accounting-history-list">{orderedDispatches.map((item) => <article key={item.id}><div><strong>{item.competence || '—'} · {item.unit || 'Todas'}</strong><span>{item.movement || 'Movimento mensal'}</span><small>{item.sentByName || item.sentByEmail || 'Usuário'} · {timestampToDateTime(item.createdAt)}</small></div><div className="history-totals"><span>{toNumber(item.expenseCount)} despesa(s) · {money.format(toNumber(item.expenseTotal))}</span><span>{toNumber(item.receivableCount)} receita(s) · {money.format(toNumber(item.revenueTotal))}</span></div><span className="status-badge success">Enviado</span></article>)}</div>}
      </section>
    </>
  )
}
