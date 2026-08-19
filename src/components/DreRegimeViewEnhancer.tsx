import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { collection, onSnapshot, type DocumentData } from 'firebase/firestore'
import { CalendarDays, Landmark } from 'lucide-react'
import { db } from '../lib/firebase'

type AnyRecord = { id: string } & DocumentData
type Regime = 'competencia' | 'caixa'

type DreRow = {
  id: string
  type: 'revenue' | 'expense'
  period: string
  unit: string
  amount: number
  group: string
}

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const EXPENSE_COMPETENCE_STATUSES = new Set(['aprovado', 'pago', 'arquivado'])
const EXPENSE_CASH_STATUSES = new Set(['pago', 'arquivado'])
const REVENUE_STATUSES = new Set(['recebido_tesouraria', 'encerrado'])

function toNumber(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function revenueAmount(record: AnyRecord) {
  const direct = toNumber(record.invoiceValue)
  if (direct > 0) return direct
  const components = Array.isArray(record.components) ? record.components as DocumentData[] : []
  return toNumber(components.find((item) => item.nome === 'Honorários do Escritório')?.valor)
}

export function DreRegimeViewEnhancer() {
  const [expenses, setExpenses] = useState<AnyRecord[]>([])
  const [revenues, setRevenues] = useState<AnyRecord[]>([])
  const [classifications, setClassifications] = useState<AnyRecord[]>([])
  const [target, setTarget] = useState<HTMLElement | null>(null)
  const [regime, setRegime] = useState<Regime>('competencia')
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7))
  const [unit, setUnit] = useState('Todas')

  useEffect(() => {
    const offExpenses = onSnapshot(collection(db, 'expenses'), (snapshot) => setExpenses(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))))
    const offRevenues = onSnapshot(collection(db, 'receivables'), (snapshot) => setRevenues(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))))
    const offClassifications = onSnapshot(collection(db, 'managerialClassifications'), (snapshot) => setClassifications(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))))
    return () => { offExpenses(); offRevenues(); offClassifications() }
  }, [])

  useEffect(() => {
    const sync = () => {
      const original = document.querySelector<HTMLElement>('.dre-report-card')
      if (!original) { setTarget(null); return }
      original.style.display = 'none'
      let mount = document.getElementById('dre-regime-view-root')
      if (!mount) {
        mount = document.createElement('div')
        mount.id = 'dre-regime-view-root'
        original.parentElement?.insertBefore(mount, original)
      }
      setTarget(mount)
    }
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      document.querySelector<HTMLElement>('.dre-report-card')?.style.removeProperty('display')
      document.getElementById('dre-regime-view-root')?.remove()
    }
  }, [])

  const classificationMap = useMemo(() => new Map(classifications.map((item) => [item.id, item])), [classifications])

  const rows = useMemo<DreRow[]>(() => {
    const result: DreRow[] = []

    for (const item of expenses) {
      const classification = classificationMap.get(`expense__${item.id}`)
      if (!classification?.confirmed || !classification.accountDre || classification.accountDre === 'Não mostrar no DRE Gerencial') continue
      const status = String(item.status ?? '')
      const validStatus = regime === 'competencia' ? EXPENSE_COMPETENCE_STATUSES.has(status) : EXPENSE_CASH_STATUSES.has(status)
      if (!validStatus) continue
      const selectedPeriod = regime === 'competencia'
        ? String(item.competencia ?? '').slice(0, 7)
        : String(item.paymentDate ?? '').slice(0, 7)
      if (!selectedPeriod) continue
      result.push({ id: item.id, type: 'expense', period: selectedPeriod, unit: String(item.unidade ?? 'RJ'), amount: toNumber(item.valorTotal), group: String(classification.accountDre) })
    }

    for (const item of revenues) {
      const classification = classificationMap.get(`revenue__${item.id}`)
      if (!classification?.confirmed || !classification.accountDre || classification.accountDre === 'Não mostrar no DRE Gerencial') continue
      if (!REVENUE_STATUSES.has(String(item.status ?? ''))) continue
      const selectedPeriod = regime === 'competencia'
        ? String(item.data ?? item.receiptDate ?? '').slice(0, 7)
        : String(item.receiptDate ?? item.data ?? '').slice(0, 7)
      if (!selectedPeriod) continue
      result.push({ id: item.id, type: 'revenue', period: selectedPeriod, unit: String(item.unidade ?? 'RJ'), amount: revenueAmount(item), group: String(classification.accountDre) })
    }

    return result.filter((item) => (!period || item.period === period) && (unit === 'Todas' || item.unit === unit))
  }, [classificationMap, expenses, period, regime, revenues, unit])

  const groups = useMemo(() => {
    const map = new Map<string, { revenue: number; expense: number; count: number }>()
    for (const row of rows) {
      const current = map.get(row.group) ?? { revenue: 0, expense: 0, count: 0 }
      if (row.type === 'revenue') current.revenue += row.amount
      else current.expense += row.amount
      current.count += 1
      map.set(row.group, current)
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
  }, [rows])

  const totalRevenue = rows.filter((item) => item.type === 'revenue').reduce((sum, item) => sum + item.amount, 0)
  const totalExpense = rows.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0)
  const balance = totalRevenue - totalExpense

  if (!target) return null

  return createPortal(
    <section className="page-card dre-report-card dre-regime-card">
      <div className="dre-section-heading"><div><span className="eyebrow">Demonstrativo Gerencial</span><h2>Resultado do Período</h2><p>Alterne entre competência econômica e movimentação efetiva de caixa sem duplicar lançamentos.</p></div></div>

      <div className="dre-regime-toggle" role="group" aria-label="Regime de visualização">
        <button className={regime === 'competencia' ? 'active' : ''} type="button" onClick={() => setRegime('competencia')}><CalendarDays size={16} /> Visão Competência</button>
        <button className={regime === 'caixa' ? 'active' : ''} type="button" onClick={() => setRegime('caixa')}><Landmark size={16} /> Visão Caixa</button>
      </div>

      <div className="dre-regime-explanation">{regime === 'competencia'
        ? 'Competência: despesas aparecem no mês a que pertencem; receitas usam a data econômica do recebimento.'
        : 'Caixa: despesas entram somente quando pagas, pela Data do Pagamento; receitas entram pela data efetiva de recebimento.'}</div>

      <div className="dre-report-filters"><label><span>Período</span><input type="month" value={period} onChange={(event) => setPeriod(event.target.value)} /></label><label><span>Unidade</span><select value={unit} onChange={(event) => setUnit(event.target.value)}><option>Todas</option><option>RJ</option><option>SP</option></select></label></div>

      <div className="dre-kpis"><div><span>Receitas</span><strong>{money.format(totalRevenue)}</strong></div><div><span>Despesas</span><strong>{money.format(totalExpense)}</strong></div><div className={balance >= 0 ? 'positive' : 'negative'}><span>Resultado {regime === 'caixa' ? 'de Caixa' : 'Gerencial'}</span><strong>{money.format(balance)}</strong></div><div><span>Lançamentos</span><strong>{rows.length}</strong></div></div>

      <div className="dre-statement"><div className="dre-statement-row head"><span>Grupo DRE</span><span>Lançamentos</span><span>Valor</span></div>{groups.length === 0 ? <div className="dre-empty-statement">Nenhum lançamento classificado para esta visão e período.</div> : groups.map(([label, values]) => {
        const isExpense = values.expense > 0 && values.revenue === 0
        const net = values.revenue - values.expense
        return <div className={`dre-statement-row ${isExpense ? 'expense' : 'revenue'}`} key={label}><span>{label}</span><span>{values.count}</span><strong>{isExpense ? `(${money.format(values.expense)})` : money.format(net)}</strong></div>
      })}<div className="dre-statement-row total"><span>RESULTADO {regime === 'caixa' ? 'DE CAIXA' : 'GERENCIAL'}</span><span>{rows.length}</span><strong>{money.format(balance)}</strong></div></div>
    </section>,
    target,
  )
}
