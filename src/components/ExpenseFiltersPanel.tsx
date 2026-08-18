import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Filter, RotateCcw, X } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import '../expense-filters.css'

type FilterState = {
  status: string
  competence: string
}

const statusOptions = [
  ['', 'Todos os status'],
  ['Rascunho', 'Rascunho'],
  ['Enviado para Aprovação', 'Enviado para Aprovação'],
  ['Em Análise', 'Em Análise'],
  ['Aprovado', 'Aprovado'],
  ['Devolvido p/ Correção', 'Devolvido p/ Correção'],
  ['Rejeitado', 'Rejeitado'],
  ['Pago', 'Pago'],
  ['Arquivado', 'Arquivado'],
] as const

function rowText(row: HTMLElement, selector: string) {
  return row.querySelector<HTMLElement>(selector)?.textContent?.trim() ?? ''
}

function applyFilters(filters: FilterState) {
  const table = document.querySelector<HTMLElement>('.review-expenses-table')
  if (!table) return

  const rows = Array.from(table.querySelectorAll<HTMLElement>('.data-row:not(.data-head)'))
  rows.forEach((row) => {
    const competence = rowText(row, ':scope > span:nth-child(1)')
    const status = rowText(row, ':scope > span:nth-child(4)')
    const matchesStatus = !filters.status || status === filters.status
    const matchesCompetence = !filters.competence || competence === filters.competence
    row.hidden = !(matchesStatus && matchesCompetence)
  })
}

export function ExpenseFiltersPanel() {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({ status: '', competence: '' })
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [toolbarButton, setToolbarButton] = useState<HTMLButtonElement | null>(null)
  const [competences, setCompetences] = useState<string[]>([])

  const activeCount = useMemo(() => Number(Boolean(filters.status)) + Number(Boolean(filters.competence)), [filters])

  useEffect(() => {
    if (location.pathname !== '/despesas') {
      setHost(null)
      setToolbarButton(null)
      setOpen(false)
      return
    }

    function locate() {
      const toolbar = document.querySelector<HTMLElement>('.expense-module-card .module-toolbar')
      const button = toolbar
        ? Array.from(toolbar.querySelectorAll<HTMLButtonElement>('button')).find((item) => item.textContent?.includes('Filtros')) ?? null
        : null
      setHost(toolbar)
      setToolbarButton(button)

      const values = Array.from(document.querySelectorAll<HTMLElement>('.review-expenses-table .data-row:not(.data-head) > span:first-child'))
        .map((item) => item.textContent?.trim() ?? '')
        .filter((item) => /^\d{4}-\d{2}$/.test(item))
      setCompetences(Array.from(new Set(values)).sort((a, b) => b.localeCompare(a)))
    }

    locate()
    const observer = new MutationObserver(locate)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [location.pathname])

  useEffect(() => {
    if (!toolbarButton) return
    const handler = (event: Event) => {
      event.preventDefault()
      setOpen((current) => !current)
    }
    toolbarButton.addEventListener('click', handler)
    toolbarButton.classList.toggle('filter-button-active', activeCount > 0)
    toolbarButton.title = activeCount > 0 ? `${activeCount} filtro(s) ativo(s)` : 'Filtrar despesas'
    return () => toolbarButton.removeEventListener('click', handler)
  }, [toolbarButton, activeCount])

  useEffect(() => {
    if (location.pathname !== '/despesas') return
    applyFilters(filters)
    const observer = new MutationObserver(() => applyFilters(filters))
    const table = document.querySelector<HTMLElement>('.review-expenses-table')
    if (table) observer.observe(table, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [filters, location.pathname])

  function clearFilters() {
    setFilters({ status: '', competence: '' })
  }

  if (location.pathname !== '/despesas' || !host || !open) return null

  return createPortal(
    <div className="expense-filter-popover" role="dialog" aria-label="Filtros de despesas">
      <div className="expense-filter-heading">
        <div><Filter size={17} /><strong>Filtros de Despesas</strong></div>
        <button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label="Fechar filtros"><X size={17} /></button>
      </div>
      <div className="expense-filter-grid">
        <label>
          <span>Status</span>
          <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
            {statusOptions.map(([value, label]) => <option key={label} value={value}>{label}</option>)}
          </select>
        </label>
        <label>
          <span>Competência</span>
          <select value={filters.competence} onChange={(event) => setFilters((current) => ({ ...current, competence: event.target.value }))}>
            <option value="">Todas as competências</option>
            {competences.map((competence) => <option key={competence} value={competence}>{competence}</option>)}
          </select>
        </label>
      </div>
      <div className="expense-filter-footer">
        <span>{activeCount > 0 ? `${activeCount} filtro(s) ativo(s)` : 'Nenhum filtro ativo'}</span>
        <button type="button" className="secondary-button" onClick={clearFilters}><RotateCcw size={15} /> Limpar filtros</button>
      </div>
    </div>,
    host,
  )
}
