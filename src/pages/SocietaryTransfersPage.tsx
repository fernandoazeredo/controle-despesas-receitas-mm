import { useEffect, useMemo, useRef, useState } from 'react'
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type DocumentData,
} from 'firebase/firestore'
import {
  BadgeCheck,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Handshake,
  RefreshCw,
  Save,
  Search,
  Send,
  Settings2,
  XCircle,
} from 'lucide-react'
import { db } from '../lib/firebase'
import { useAuth } from '../auth/AuthContext'
import '../societary-transfers.css'

type AnyRecord = { id: string } & DocumentData
type TransferStatus = 'apurado' | 'rejeitado' | 'aprovado' | 'enviado_tesouraria' | 'pago' | 'cancelado'
type Settings = {
  beneficiary: string
  defaultPercent: number
  startDate: string
  endDate: string
}
type Draft = { percent: string; value: string }

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const today = () => new Date().toISOString().slice(0, 10)
const DEFAULT_SETTINGS: Settings = {
  beneficiary: 'Ana Müller',
  defaultPercent: 40,
  startDate: today(),
  endDate: '',
}

function toNumber(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function normalize(value: unknown) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

function dateBR(value: unknown) {
  const text = String(value ?? '').slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return text || '—'
  const [year, month, day] = text.split('-')
  return `${day}/${month}/${year}`
}

function parseMoney(value: string) {
  const cleaned = value.trim().replace(/\s/g, '').replace(/R\$/gi, '').replace(/[^\d,.-]/g, '')
  if (!cleaned) return 0
  const normalized = cleaned.includes(',') ? cleaned.replace(/\./g, '').replace(',', '.') : cleaned
  const number = Number(normalized)
  return Number.isFinite(number) ? Math.max(0, number) : 0
}

function officeFeesOf(receivable: AnyRecord) {
  const components = Array.isArray(receivable.components) ? receivable.components as DocumentData[] : []
  const component = components.find((item) => normalize(item?.nome) === normalize('Honorários do Escritório'))
  return toNumber(component?.valor)
}

function receiptDateOf(receivable: AnyRecord) {
  return String(receivable.receiptDate ?? receivable.data ?? '').slice(0, 10)
}

function isAlvara(receivable: AnyRecord) {
  const type = normalize(receivable.tipoRecebimento)
  if (type === 'outras_receitas' || type === 'acordo_trabalhista') return false
  return normalize(receivable.origem).includes('alvara')
}

function isEligible(receivable: AnyRecord, settings: Settings) {
  if (!['recebido_tesouraria', 'encerrado'].includes(String(receivable.status ?? ''))) return false
  if (!isAlvara(receivable)) return false
  if (officeFeesOf(receivable) <= 0) return false
  const date = receiptDateOf(receivable)
  if (!date) return false
  if (settings.startDate && date < settings.startDate) return false
  if (settings.endDate && date > settings.endDate) return false
  return true
}

// Regra financeira homologada no sistema: 3ª casa decimal de 0 a 5 desce; de 6 a 9 sobe.
function calculateTransferValue(officeFees: number, percent: number) {
  const officeCents = BigInt(Math.round(Math.max(0, officeFees) * 100))
  const percentBasisPoints = BigInt(Math.round(Math.max(0, percent) * 100))
  const numerator = officeCents * percentBasisPoints
  let cents = numerator / 10000n
  const remainder = numerator % 10000n
  const thirdDecimalDigit = Number((remainder * 10n) / 10000n)
  if (thirdDecimalDigit >= 6) cents += 1n
  return Number(cents) / 100
}

function statusLabel(item: AnyRecord) {
  if (item.status !== 'pago' && item.status !== 'cancelado' && item.dueDate && String(item.dueDate) < today()) return 'Vencido'
  const labels: Record<string, string> = {
    apurado: 'Apurado',
    rejeitado: 'Rejeitado / Ajuste',
    aprovado: 'Aprovado',
    enviado_tesouraria: 'Enviado à Tesouraria',
    pago: 'Pago',
    cancelado: 'Cancelado',
  }
  return labels[String(item.status ?? '')] ?? String(item.status ?? 'Apurado')
}

function statusClass(item: AnyRecord) {
  const label = statusLabel(item)
  if (label === 'Pago' || label === 'Aprovado') return 'soc-status success'
  if (label === 'Vencido' || label.startsWith('Rejeitado') || label === 'Cancelado') return 'soc-status danger'
  if (label === 'Enviado à Tesouraria') return 'soc-status info'
  return 'soc-status warning'
}

async function audit(profile: ReturnType<typeof useAuth>['profile'], action: string, detail: string, entityId?: string) {
  if (!profile) return
  await addDoc(collection(db, 'auditLogs'), {
    module: 'Repasse Societário',
    action,
    detail,
    entityId: entityId ?? null,
    userId: profile.uid,
    userName: profile.displayName,
    userEmail: profile.email,
    createdAt: serverTimestamp(),
  })
}

function useSocietarySettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  useEffect(() => onSnapshot(doc(db, 'appConfig', 'societaryTransfer'), (snapshot) => {
    if (!snapshot.exists()) {
      setSettings(DEFAULT_SETTINGS)
      return
    }
    const data = snapshot.data()
    setSettings({
      beneficiary: String(data.beneficiary || DEFAULT_SETTINGS.beneficiary),
      defaultPercent: toNumber(data.defaultPercent) || DEFAULT_SETTINGS.defaultPercent,
      startDate: String(data.startDate || DEFAULT_SETTINGS.startDate),
      endDate: String(data.endDate || ''),
    })
  }), [])
  return settings
}

function useSocietaryTransfers() {
  const [records, setRecords] = useState<AnyRecord[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => onSnapshot(collection(db, 'societaryTransfers'), (snapshot) => {
    setRecords(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
    setLoading(false)
  }, () => setLoading(false)), [])
  return { records, loading }
}

export function SocietaryTransferSync() {
  const { profile } = useAuth()
  const settings = useSocietarySettings()
  const [receivables, setReceivables] = useState<AnyRecord[]>([])
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set())
  const syncing = useRef(false)
  const reserved = useRef(new Set<string>())
  const canSync = ['master', 'diretor', 'tesouraria'].includes(String(profile?.role ?? ''))

  useEffect(() => onSnapshot(collection(db, 'receivables'), (snapshot) => {
    setReceivables(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
  }), [])

  useEffect(() => onSnapshot(collection(db, 'societaryTransfers'), (snapshot) => {
    const ids = new Set(snapshot.docs.map((item) => item.id))
    setKnownIds(ids)
    reserved.current = new Set([...reserved.current].filter((id) => !ids.has(id)))
  }), [])

  useEffect(() => {
    if (!canSync || syncing.current || !profile) return
    const missing = receivables.filter((item) => isEligible(item, settings) && !knownIds.has(item.id) && !reserved.current.has(item.id))
    if (!missing.length) return

    syncing.current = true
    missing.forEach((item) => reserved.current.add(item.id))

    void (async () => {
      try {
        for (let offset = 0; offset < missing.length; offset += 350) {
          const chunk = missing.slice(offset, offset + 350)
          const batch = writeBatch(db)
          for (const source of chunk) {
            const officeFees = officeFeesOf(source)
            const percent = settings.defaultPercent
            const transferValue = calculateTransferValue(officeFees, percent)
            batch.set(doc(db, 'societaryTransfers', source.id), {
              sourceReceivableId: source.id,
              processo: String(source.processo ?? ''),
              reclamante: String(source.reclamante ?? ''),
              reclamada: String(source.reclamada ?? ''),
              receiptDate: receiptDateOf(source),
              competence: receiptDateOf(source).slice(0, 7),
              officeFees,
              percent,
              originalPercent: percent,
              originalTransferValue: transferValue,
              transferValue,
              paidValue: 0,
              beneficiary: settings.beneficiary,
              status: 'apurado',
              sourceStatus: String(source.status ?? ''),
              createdBy: profile.uid,
              createdByName: profile.displayName,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            })
          }
          await batch.commit()
        }
      } catch (error) {
        console.error('Falha ao sincronizar Repasse Societário', error)
        missing.forEach((item) => reserved.current.delete(item.id))
      } finally {
        syncing.current = false
      }
    })()
  }, [canSync, knownIds, profile, receivables, settings])

  return null
}

function SettingsPanel() {
  const { profile } = useAuth()
  const settings = useSocietarySettings()
  const [form, setForm] = useState<Settings>(settings)
  const [saving, setSaving] = useState(false)
  const canEdit = ['master', 'diretor'].includes(String(profile?.role ?? ''))

  useEffect(() => setForm(settings), [settings])

  async function save() {
    if (!canEdit) return
    if (!form.beneficiary.trim() || form.defaultPercent < 0 || form.defaultPercent > 100) {
      window.alert('Informe beneficiário e percentual padrão entre 0 e 100%.')
      return
    }
    setSaving(true)
    try {
      await setDoc(doc(db, 'appConfig', 'societaryTransfer'), {
        beneficiary: form.beneficiary.trim(),
        defaultPercent: form.defaultPercent,
        startDate: form.startDate,
        endDate: form.endDate,
        updatedAt: serverTimestamp(),
        updatedBy: profile?.uid,
        updatedByName: profile?.displayName,
      }, { merge: true })
      await audit(profile, 'Parâmetros do acordo alterados', `${form.beneficiary.trim()} · ${form.defaultPercent.toLocaleString('pt-BR')}% · início ${dateBR(form.startDate)}${form.endDate ? ` · fim ${dateBR(form.endDate)}` : ''}`)
    } catch (error) {
      console.error(error)
      window.alert('Não foi possível salvar os parâmetros do Repasse Societário.')
    } finally {
      setSaving(false)
    }
  }

  return <details className="soc-settings">
    <summary><Settings2 size={17} /> Parâmetros do acordo</summary>
    <div className="soc-settings-grid">
      <label><span>Beneficiário</span><input value={form.beneficiary} disabled={!canEdit} onChange={(event) => setForm((current) => ({ ...current, beneficiary: event.target.value }))} /></label>
      <label><span>Percentual padrão</span><input type="number" min="0" max="100" step="0.01" value={form.defaultPercent} disabled={!canEdit} onChange={(event) => setForm((current) => ({ ...current, defaultPercent: toNumber(event.target.value) }))} /></label>
      <label><span>Data de início</span><input type="date" value={form.startDate} disabled={!canEdit} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} /></label>
      <label><span>Data de encerramento</span><input type="date" value={form.endDate} disabled={!canEdit} onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))} /></label>
      {canEdit && <button className="secondary-button soc-settings-save" type="button" disabled={saving} onClick={() => void save()}><Save size={16} /> {saving ? 'Salvando...' : 'Salvar parâmetros'}</button>}
    </div>
    <p>O percentual padrão vale somente para novos alvarás apurados. Alterações futuras não recalculam lançamentos já existentes.</p>
  </details>
}

export function SocietaryTransfersPage() {
  const { profile } = useAuth()
  const { records, loading } = useSocietaryTransfers()
  const [search, setSearch] = useState('')
  const [month, setMonth] = useState('')
  const [status, setStatus] = useState('todos')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})
  const [busyId, setBusyId] = useState('')
  const canApprove = ['master', 'diretor'].includes(String(profile?.role ?? ''))

  const rows = useMemo(() => records
    .filter((item) => {
      const haystack = normalize(`${item.processo ?? ''} ${item.reclamante ?? ''} ${item.reclamada ?? ''} ${item.beneficiary ?? ''}`)
      if (search && !haystack.includes(normalize(search))) return false
      if (month && String(item.competence ?? '') !== month) return false
      if (status !== 'todos' && String(item.status ?? '') !== status) return false
      return true
    })
    .sort((a, b) => String(a.receiptDate ?? '').localeCompare(String(b.receiptDate ?? ''))), [month, records, search, status])

  const rowBalances = useMemo(() => {
    let running = 0
    const map = new Map<string, number>()
    for (const item of rows) {
      running += Math.max(0, toNumber(item.transferValue) - toNumber(item.paidValue))
      map.set(item.id, running)
    }
    return map
  }, [rows])

  const totals = useMemo(() => rows.reduce((acc, item) => {
    const transfer = toNumber(item.transferValue)
    const paid = toNumber(item.paidValue)
    acc.office += toNumber(item.officeFees)
    acc.apurado += transfer
    acc.paid += paid
    acc.balance += Math.max(0, transfer - paid)
    if (['apurado', 'rejeitado'].includes(String(item.status ?? ''))) acc.awaiting += transfer
    return acc
  }, { office: 0, apurado: 0, paid: 0, balance: 0, awaiting: 0 }), [rows])

  function draftFor(item: AnyRecord): Draft {
    return drafts[item.id] ?? {
      percent: toNumber(item.percent).toFixed(2),
      value: toNumber(item.transferValue).toFixed(2),
    }
  }

  function changePercent(item: AnyRecord, raw: string) {
    const percent = Math.max(0, Math.min(100, toNumber(raw)))
    const value = calculateTransferValue(toNumber(item.officeFees), percent)
    setDrafts((current) => ({ ...current, [item.id]: { percent: raw, value: value.toFixed(2) } }))
  }

  function changeValue(item: AnyRecord, raw: string) {
    const current = draftFor(item)
    setDrafts((draftState) => ({ ...draftState, [item.id]: { ...current, value: raw } }))
  }

  async function saveAdjustment(item: AnyRecord) {
    if (!canApprove || !['apurado', 'rejeitado'].includes(String(item.status ?? ''))) return
    const draft = draftFor(item)
    const percent = Math.max(0, Math.min(100, toNumber(draft.percent)))
    const transferValue = parseMoney(draft.value)
    if (transferValue < 0) return
    const changed = percent !== toNumber(item.percent) || Math.abs(transferValue - toNumber(item.transferValue)) > 0.0001
    if (!changed) return
    const reason = window.prompt('Informe o motivo do ajuste do percentual/valor:')
    if (!reason?.trim()) return
    setBusyId(item.id)
    try {
      await updateDoc(doc(db, 'societaryTransfers', item.id), {
        percent,
        transferValue,
        status: 'apurado',
        rejectionReason: null,
        lastAdjustmentReason: reason.trim(),
        lastAdjustedBy: profile?.uid,
        lastAdjustedByName: profile?.displayName,
        lastAdjustedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      await audit(profile, 'Repasse ajustado', `Processo ${item.processo || item.id}: ${toNumber(item.percent).toLocaleString('pt-BR')}% / ${money.format(toNumber(item.transferValue))} → ${percent.toLocaleString('pt-BR')}% / ${money.format(transferValue)}. Motivo: ${reason.trim()}`, item.id)
      setDrafts((current) => { const next = { ...current }; delete next[item.id]; return next })
    } finally {
      setBusyId('')
    }
  }

  async function approveOne(item: AnyRecord) {
    if (!canApprove) return
    setBusyId(item.id)
    try {
      await updateDoc(doc(db, 'societaryTransfers', item.id), {
        status: 'aprovado',
        approvedPercent: toNumber(item.percent),
        approvedValue: toNumber(item.transferValue),
        approvedBy: profile?.uid,
        approvedByName: profile?.displayName,
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      await audit(profile, 'Repasse aprovado', `Processo ${item.processo || item.id} · ${toNumber(item.percent).toLocaleString('pt-BR')}% · ${money.format(toNumber(item.transferValue))}`, item.id)
    } finally {
      setBusyId('')
    }
  }

  async function rejectOne(item: AnyRecord) {
    if (!canApprove) return
    const reason = window.prompt('Informe a justificativa para rejeitar/devolver este repasse:')
    if (!reason?.trim()) return
    setBusyId(item.id)
    try {
      await updateDoc(doc(db, 'societaryTransfers', item.id), {
        status: 'rejeitado',
        rejectionReason: reason.trim(),
        rejectedBy: profile?.uid,
        rejectedByName: profile?.displayName,
        rejectedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      await audit(profile, 'Repasse rejeitado para ajuste', `Processo ${item.processo || item.id}. Motivo: ${reason.trim()}`, item.id)
    } finally {
      setBusyId('')
    }
  }

  async function sendTreasury(item: AnyRecord) {
    if (!canApprove || item.status !== 'aprovado') return
    setBusyId(item.id)
    try {
      await updateDoc(doc(db, 'societaryTransfers', item.id), {
        status: 'enviado_tesouraria',
        sentToTreasuryBy: profile?.uid,
        sentToTreasuryByName: profile?.displayName,
        sentToTreasuryAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      await audit(profile, 'Repasse enviado à Tesouraria', `Processo ${item.processo || item.id} · ${money.format(toNumber(item.transferValue))}`, item.id)
    } finally {
      setBusyId('')
    }
  }

  async function approveSelected() {
    if (!canApprove) return
    const eligible = rows.filter((item) => selected.has(item.id) && ['apurado', 'rejeitado'].includes(String(item.status ?? '')))
    if (!eligible.length) return
    const total = eligible.reduce((sum, item) => sum + toNumber(item.transferValue), 0)
    if (!window.confirm(`Aprovar ${eligible.length} repasse(s), totalizando ${money.format(total)}?`)) return
    const batch = writeBatch(db)
    eligible.forEach((item) => batch.update(doc(db, 'societaryTransfers', item.id), {
      status: 'aprovado',
      approvedPercent: toNumber(item.percent),
      approvedValue: toNumber(item.transferValue),
      approvedBy: profile?.uid,
      approvedByName: profile?.displayName,
      approvedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }))
    await batch.commit()
    await audit(profile, 'Aprovação em lote', `${eligible.length} repasses aprovados · ${money.format(total)}`)
    setSelected(new Set())
  }

  async function sendSelected() {
    if (!canApprove) return
    const eligible = rows.filter((item) => selected.has(item.id) && item.status === 'aprovado')
    if (!eligible.length) return
    const total = eligible.reduce((sum, item) => sum + toNumber(item.transferValue), 0)
    if (!window.confirm(`Enviar ${eligible.length} repasse(s) à Tesouraria, totalizando ${money.format(total)}?`)) return
    const batch = writeBatch(db)
    eligible.forEach((item) => batch.update(doc(db, 'societaryTransfers', item.id), {
      status: 'enviado_tesouraria',
      sentToTreasuryBy: profile?.uid,
      sentToTreasuryByName: profile?.displayName,
      sentToTreasuryAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }))
    await batch.commit()
    await audit(profile, 'Envio em lote à Tesouraria', `${eligible.length} repasses enviados · ${money.format(total)}`)
    setSelected(new Set())
  }

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    const ids = rows.map((item) => item.id)
    setSelected((current) => current.size === ids.length && ids.every((id) => current.has(id)) ? new Set() : new Set(ids))
  }

  return <>
    <div className="page-heading">
      <div><span className="eyebrow">Dissolução Societária</span><h1>Repasse Societário</h1><p>Extrato individual dos repasses vinculados aos Honorários do Escritório de cada alvará efetivamente recebido.</p></div>
    </div>

    <SettingsPanel />

    <div className="soc-metrics">
      <article><span>Honorários do Escritório</span><strong>{money.format(totals.office)}</strong><small>Base integral dos alvarás filtrados</small></article>
      <article><span>Repasse Apurado</span><strong>{money.format(totals.apurado)}</strong><small>Percentual aplicado linha a linha</small></article>
      <article><span>Saldo a Pagar</span><strong>{money.format(totals.balance)}</strong><small>Apurado menos valores pagos</small></article>
      <article><span>Aguardando Aprovação</span><strong>{money.format(totals.awaiting)}</strong><small>Apurados ou devolvidos para ajuste</small></article>
      <article><span>Total Pago</span><strong>{money.format(totals.paid)}</strong><small>Baixas confirmadas pela Tesouraria</small></article>
    </div>

    <section className="page-card soc-card">
      <div className="soc-toolbar">
        <div className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar processo, reclamante ou reclamada" /></div>
        <input className="soc-month" type="month" value={month} onChange={(event) => setMonth(event.target.value)} aria-label="Filtrar por competência" />
        <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filtrar por status">
          <option value="todos">Todos os status</option><option value="apurado">Apurado</option><option value="rejeitado">Rejeitado / Ajuste</option><option value="aprovado">Aprovado</option><option value="enviado_tesouraria">Enviado à Tesouraria</option><option value="pago">Pago</option>
        </select>
      </div>

      {canApprove && selected.size > 0 && <div className="soc-batchbar"><strong>{selected.size} selecionado(s)</strong><button className="small-success-button" onClick={() => void approveSelected()}><BadgeCheck size={15} /> Aprovar selecionados</button><button className="small-revenue-button" onClick={() => void sendSelected()}><Send size={15} /> Enviar aprovados à Tesouraria</button></div>}

      {loading ? <div className="module-empty"><RefreshCw className="spin" size={30} /><strong>Carregando extrato societário</strong></div> : rows.length === 0 ? <div className="module-empty"><Handshake size={32} /><strong>Nenhum repasse societário encontrado</strong><span>Os alvarás elegíveis passam a aparecer automaticamente após a confirmação do recebimento pela Tesouraria.</span></div> : <div className="soc-table-wrap"><table className="soc-table">
        <thead><tr><th><input type="checkbox" checked={rows.length > 0 && rows.every((item) => selected.has(item.id))} onChange={toggleAll} /></th><th>Data</th><th>Processo</th><th>Reclamante / Reclamada</th><th>Honorários do Escritório</th><th>% Repasse</th><th>Valor do Repasse</th><th>Valor Pago</th><th>Saldo Linha</th><th>Saldo Acumulado</th><th>Status</th><th>Aprovação / Ações</th></tr></thead>
        <tbody>{rows.map((item) => {
          const draft = draftFor(item)
          const editable = canApprove && ['apurado', 'rejeitado'].includes(String(item.status ?? ''))
          const balance = Math.max(0, toNumber(item.transferValue) - toNumber(item.paidValue))
          return <tr key={item.id}>
            <td><input type="checkbox" checked={selected.has(item.id)} onChange={() => toggle(item.id)} /></td>
            <td>{dateBR(item.receiptDate)}</td>
            <td><strong>{item.processo || '—'}</strong></td>
            <td><strong>{item.reclamante || '—'}</strong><small>{item.reclamada || '—'}</small></td>
            <td className="numeric"><strong>{money.format(toNumber(item.officeFees))}</strong></td>
            <td className="soc-edit-cell"><input type="number" min="0" max="100" step="0.01" disabled={!editable} value={draft.percent} onChange={(event) => changePercent(item, event.target.value)} /><span>%</span></td>
            <td className="soc-edit-cell money-edit"><span>R$</span><input inputMode="decimal" disabled={!editable} value={draft.value} onChange={(event) => changeValue(item, event.target.value)} /></td>
            <td className="numeric">{money.format(toNumber(item.paidValue))}</td>
            <td className="numeric"><strong>{money.format(balance)}</strong></td>
            <td className="numeric"><strong>{money.format(rowBalances.get(item.id) ?? 0)}</strong></td>
            <td><span className={statusClass(item)}>{statusLabel(item)}</span>{item.rejectionReason && <small className="soc-reason">{String(item.rejectionReason)}</small>}</td>
            <td><div className="soc-actions">
              {editable && <button className="small-neutral-button" disabled={busyId === item.id} onClick={() => void saveAdjustment(item)}><Save size={14} /> Ajustar</button>}
              {editable && <button className="small-success-button" disabled={busyId === item.id} onClick={() => void approveOne(item)}><CheckCircle2 size={14} /> Aprovar</button>}
              {editable && <button className="small-expense-button" disabled={busyId === item.id} onClick={() => void rejectOne(item)}><XCircle size={14} /> Rejeitar</button>}
              {item.status === 'aprovado' && canApprove && <button className="small-revenue-button" disabled={busyId === item.id} onClick={() => void sendTreasury(item)}><Send size={14} /> Enviar à Tesouraria</button>}
              {item.status === 'enviado_tesouraria' && <span className="soc-action-note">Aguardando pagamento</span>}
              {item.status === 'pago' && <span className="soc-action-note paid"><CheckCircle2 size={14} /> {dateBR(item.paymentDate)}</span>}
            </div></td>
          </tr>
        })}</tbody>
        <tfoot><tr><td colSpan={4}><strong>TOTAIS DO EXTRATO</strong></td><td className="numeric"><strong>{money.format(totals.office)}</strong></td><td></td><td className="numeric"><strong>{money.format(totals.apurado)}</strong></td><td className="numeric"><strong>{money.format(totals.paid)}</strong></td><td className="numeric"><strong>{money.format(totals.balance)}</strong></td><td className="numeric"><strong>{money.format(totals.balance)}</strong></td><td colSpan={2}></td></tr></tfoot>
      </table></div>}
    </section>
  </>
}

export function SocietaryTreasuryPanel() {
  const { profile } = useAuth()
  const { records, loading } = useSocietaryTransfers()
  const queue = records.filter((item) => item.status === 'enviado_tesouraria').sort((a, b) => String(a.receiptDate ?? '').localeCompare(String(b.receiptDate ?? '')))

  async function pay(item: AnyRecord) {
    if (!window.confirm(`Confirmar pagamento de ${money.format(toNumber(item.transferValue))} para ${item.beneficiary || 'beneficiário'}?`)) return
    await updateDoc(doc(db, 'societaryTransfers', item.id), {
      status: 'pago',
      paidValue: toNumber(item.transferValue),
      paymentDate: today(),
      paidBy: profile?.uid,
      paidByName: profile?.displayName,
      paidAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    await audit(profile, 'Pagamento societário confirmado', `Processo ${item.processo || item.id} · ${money.format(toNumber(item.transferValue))}`, item.id)
  }

  async function returnForAdjustment(item: AnyRecord) {
    const reason = window.prompt('Informe o motivo da devolução para ajuste:')
    if (!reason?.trim()) return
    await updateDoc(doc(db, 'societaryTransfers', item.id), {
      status: 'rejeitado',
      rejectionReason: reason.trim(),
      returnedByTreasury: profile?.uid,
      returnedByTreasuryName: profile?.displayName,
      returnedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    await audit(profile, 'Repasse devolvido pela Tesouraria', `Processo ${item.processo || item.id}. Motivo: ${reason.trim()}`, item.id)
  }

  return <section className="page-card soc-treasury-card">
    <div className="soc-treasury-heading"><div><span className="eyebrow">Fila de pagamentos</span><h2>Repasse Societário</h2><p>Obrigações societárias já aprovadas e encaminhadas para pagamento.</p></div><CircleDollarSign size={28} /></div>
    {loading ? <div className="module-empty"><RefreshCw className="spin" size={26} /><strong>Carregando repasses societários</strong></div> : queue.length === 0 ? <div className="module-empty"><FileText size={28} /><strong>Nenhum repasse societário aguardando pagamento</strong></div> : <div className="soc-table-wrap"><table className="soc-table treasury"><thead><tr><th>Data</th><th>Processo</th><th>Beneficiário</th><th>Honorários</th><th>%</th><th>Valor</th><th>Ações</th></tr></thead><tbody>{queue.map((item) => <tr key={item.id}><td>{dateBR(item.receiptDate)}</td><td>{item.processo || '—'}</td><td><strong>{item.beneficiary || 'Ana Müller'}</strong></td><td className="numeric">{money.format(toNumber(item.officeFees))}</td><td className="numeric">{toNumber(item.percent).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</td><td className="numeric"><strong>{money.format(toNumber(item.transferValue))}</strong></td><td><div className="soc-actions"><button className="small-success-button" onClick={() => void pay(item)}><CheckCircle2 size={14} /> Confirmar pagamento</button><button className="small-neutral-button" onClick={() => void returnForAdjustment(item)}>Devolver</button></div></td></tr>)}</tbody></table></div>}
  </section>
}
