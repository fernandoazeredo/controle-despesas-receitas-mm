import { useEffect, useMemo, useState } from 'react'
import { BarChart3 } from 'lucide-react'
import '../expense-management-dashboard.css'

type ExpenseRecord = {
  id: string
  competencia?: string
  unidade?: string
  nome?: string
  fornecedor?: string
  categoria?: string
  subcategoria?: string
  expenseAccountName?: string
  expenseAccountCode?: string
  status?: string
  valorTotal?: number
  items?: Array<{ historico?: string; valor?: number }>
}

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const percent = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function normalizeText(value: unknown) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function recordSearchText(record: ExpenseRecord) {
  const itemText = Array.isArray(record.items) ? record.items.map((item) => item.historico ?? '').join(' ') : ''
  return normalizeText([
    record.nome,
    record.fornecedor,
    record.categoria,
    record.subcategoria,
    record.expenseAccountName,
    record.expenseAccountCode,
    itemText,
  ].join(' '))
}

type ExpenseGroup = 'taxes' | 'payroll' | 'operational' | 'other'

function classifyExpense(record: ExpenseRecord): ExpenseGroup {
  const text = recordSearchText(record)

  if (/folha de pagamento e pessoal|folha de pagamento|salario|salarios|plano de saude|assistencia medica|vale[- ]?transporte|seguro de vida|treinamento|capacitacao|saude ocupacional|exame demissional|rescisao|multa 40%/.test(text)) return 'payroll'

  if (/impostos, tributos e encargos|imposto|tributo|encargo|darf|darm|irpj|csll|pis|cofins|irrf|retencao|retencoes|\biss\b|\binss\b|\bfgts\b|\biptu\b/.test(text)) return 'taxes'

  if (/contas a pagar - operacionais|conta de luz|energia eletrica|aluguel|condominio|telefonia|telefone|internet|estacionamento|limpeza|higiene|manutencao|reparo|sistema|assinatura|software|suporte|backup|cartao|despesas gerais|paisagismo|transporte contratado|material de limpeza/.test(text)) return 'operational'

  return 'other'
}

function isDashboardExpense(record: ExpenseRecord) {
  return ['aprovado', 'pago', 'arquivado'].includes(String(record.status ?? ''))
}

function competenceLabel(value: string) {
  if (!/^\d{4}-\d{2}$/.test(value)) return value || 'Todas'
  const [year, month] = value.split('-')
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(Number(year), Number(month) - 1, 1))
}

export function ExpenseManagementDashboard({ records, loading }: { records: ExpenseRecord[]; loading: boolean }) {
  const competences = useMemo(() => Array.from(new Set(records.map((item) => String(item.competencia ?? '')).filter(Boolean))).sort().reverse(), [records])
  const [competence, setCompetence] = useState(() => new Date().toISOString().slice(0, 7))
  const [unit, setUnit] = useState('Todas')

  useEffect(() => {
    if (!loading && competences.length && !competences.includes(competence)) setCompetence(competences[0])
  }, [competence, competences, loading])

  const summary = useMemo(() => {
    const selected = records.filter((record) => isDashboardExpense(record) && (!competence || record.competencia === competence) && (unit === 'Todas' || record.unidade === unit))
    const totals = selected.reduce((acc, record) => {
      const value = Number(record.valorTotal) || 0
      acc.total += value
      const group = classifyExpense(record)
      if (group === 'taxes') acc.taxes += value
      if (group === 'payroll') acc.payroll += value
      if (group === 'operational') acc.operational += value
      return acc
    }, { total: 0, taxes: 0, payroll: 0, operational: 0 })
    return { ...totals, count: selected.length }
  }, [competence, records, unit])

  const cards = [
    { key: 'total', label: 'Total das Despesas', value: summary.total, share: summary.total > 0 ? 100 : 0 },
    { key: 'taxes', label: 'Impostos / Encargos', value: summary.taxes, share: summary.total > 0 ? (summary.taxes / summary.total) * 100 : 0 },
    { key: 'payroll', label: 'Folha / Pessoal', value: summary.payroll, share: summary.total > 0 ? (summary.payroll / summary.total) * 100 : 0 },
    { key: 'operational', label: 'Contas a Pagar', value: summary.operational, share: summary.total > 0 ? (summary.operational / summary.total) * 100 : 0 },
  ]
  const graphCards = cards.slice(1)
  const maxGraphValue = Math.max(1, ...graphCards.map((card) => card.value))

  return <section className="page-card expense-management-dashboard">
    <div className="expense-dashboard-heading">
      <div><span className="eyebrow">Resumo gerencial</span><h2>Dashboard de Despesas</h2><p>Acumulado automático dos demonstrativos aprovados, pagos ou arquivados. Os percentuais representam a participação de cada grupo no total das despesas da competência.</p></div>
      <div className="expense-dashboard-filters">
        <label><span>Competência</span><select value={competence} onChange={(event) => setCompetence(event.target.value)}>{competences.length === 0 && <option value={competence}>{competenceLabel(competence)}</option>}{competences.map((item) => <option value={item} key={item}>{competenceLabel(item)}</option>)}</select></label>
        <label><span>Unidade</span><select value={unit} onChange={(event) => setUnit(event.target.value)}><option>Todas</option><option>RJ</option><option>SP</option></select></label>
      </div>
    </div>

    <div className="expense-dashboard-cards">
      {cards.map((card) => <article key={card.key} className={`expense-dashboard-card is-${card.key}`}><span>{card.label}</span><strong>{money.format(card.value)}</strong><small>{percent.format(card.share)}% das despesas</small></article>)}
    </div>

    <div className="expense-dashboard-chart-card">
      <div className="expense-dashboard-chart-title"><BarChart3 size={20} /><div><strong>Despesas por Grupo</strong><span>{competenceLabel(competence)} · {summary.count} demonstrativo(s)</span></div></div>
      <div className="expense-dashboard-chart" role="img" aria-label="Gráfico de despesas por grupo">
        {graphCards.map((card) => <div className="expense-chart-column" key={card.key}><div className="expense-chart-value">{money.format(card.value)}<small>{percent.format(card.share)}%</small></div><div className="expense-chart-track"><div className="expense-chart-bar" style={{ height: `${card.value > 0 ? Math.max(8, (card.value / maxGraphValue) * 100) : 0}%` }} /></div><strong>{card.label}</strong></div>)}
      </div>
    </div>
  </section>
}
