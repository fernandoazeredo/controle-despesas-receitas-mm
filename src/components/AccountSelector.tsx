import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { officialChartOfAccounts, type ChartOfAccount } from '../data/chartOfAccounts'

type AccountCategory = 'Receita' | 'Despesa'

type Props = {
  category: AccountCategory
  value?: string | null
  onChange: (account: ChartOfAccount | null) => void
  label?: string
  placeholder?: string
  optional?: boolean
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function accountLabel(account: ChartOfAccount) {
  return `${account.code} - ${account.name}`
}

export function AccountSelector({ category, value, onChange, label = 'Plano de Contas', placeholder, optional = true }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const accounts = useMemo(
    () => officialChartOfAccounts.filter((item) => item.kind === 'account' && item.category === category),
    [category],
  )
  const selected = useMemo(() => accounts.find((item) => item.code === value) ?? null, [accounts, value])
  const [query, setQuery] = useState(selected ? accountLabel(selected) : '')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setQuery(selected ? accountLabel(selected) : '')
  }, [selected?.code])

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const filtered = useMemo(() => {
    const raw = query.trim()
    const selectedLabel = selected ? accountLabel(selected) : ''
    const needle = normalize(raw === selectedLabel ? '' : raw)
    const source = !needle
      ? accounts
      : accounts.filter((item) => normalize(`${item.code} ${item.name} ${item.dre ?? ''}`).includes(needle))
    return source.slice(0, 18)
  }, [accounts, query, selected])

  function type(valueTyped: string) {
    setQuery(valueTyped)
    setOpen(true)
    if (!selected || valueTyped !== accountLabel(selected)) onChange(null)
  }

  function choose(account: ChartOfAccount) {
    onChange(account)
    setQuery(accountLabel(account))
    setOpen(false)
  }

  function clear() {
    onChange(null)
    setQuery('')
    setOpen(true)
  }

  return (
    <div className="account-selector" ref={wrapperRef}>
      <label>
        <span>{label} {optional && <small>(opcional)</small>}</span>
        <div className="account-selector-input">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => type(event.target.value)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder ?? `Digite código ou nome — ex.: ${category === 'Despesa' ? '4.05' : '3.01'}`}
            autoComplete="off"
          />
          {(query || selected) && <button type="button" onClick={clear} aria-label="Limpar classificação"><X size={15} /></button>}
        </div>
      </label>

      {open && (
        <div className="account-selector-menu" role="listbox">
          {filtered.length === 0 ? (
            <div className="account-selector-empty">Nenhuma conta encontrada.</div>
          ) : filtered.map((account) => (
            <button type="button" key={account.code} className={account.code === selected?.code ? 'selected' : ''} onClick={() => choose(account)}>
              <strong>{account.code}</strong>
              <span>{account.name}</span>
              <small>{account.dre || 'Sem classificação DRE'}</small>
            </button>
          ))}
          <div className="account-selector-footer">Mostrando contas finais de {category.toLowerCase()} do Plano de Contas oficial.</div>
        </div>
      )}
    </div>
  )
}
