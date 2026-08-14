import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { collection, onSnapshot, type DocumentData } from 'firebase/firestore'
import { db } from '../lib/firebase'
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

type StoredAccount = { id: string } & DocumentData

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function accountLabel(account: ChartOfAccount) {
  return `${account.code} - ${account.name}`
}

function toChartAccount(item: StoredAccount): ChartOfAccount | null {
  const code = String(item.code ?? '')
  const name = String(item.name ?? '')
  const category = String(item.category ?? '')
  const kind = String(item.kind ?? '')
  if (!code || !name || kind !== 'account' || !['Receita', 'Despesa', 'Patrimonial / Dívida'].includes(category)) return null
  return {
    code,
    name,
    dre: item.dre ? String(item.dre) : null,
    parentCode: item.parentCode ? String(item.parentCode) : null,
    level: Number(item.level ?? code.split('.').length),
    kind: 'account',
    category: category as ChartOfAccount['category'],
  }
}

export function AccountSelector({ category, value, onChange, label = 'Plano de Contas', placeholder, optional = true }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [storedAccounts, setStoredAccounts] = useState<ChartOfAccount[]>([])
  const [source, setSource] = useState<'firestore' | 'oficial'>('oficial')

  useEffect(() => {
    return onSnapshot(collection(db, 'chartOfAccounts'), (snapshot) => {
      const loaded = snapshot.docs
        .map((docItem) => toChartAccount({ id: docItem.id, ...docItem.data() }))
        .filter((item): item is ChartOfAccount => Boolean(item))
      if (loaded.length > 0) {
        setStoredAccounts(loaded)
        setSource('firestore')
      } else {
        setStoredAccounts([])
        setSource('oficial')
      }
    }, () => {
      setStoredAccounts([])
      setSource('oficial')
    })
  }, [])

  const accounts = useMemo(() => {
    const base = storedAccounts.length ? storedAccounts : officialChartOfAccounts
    return base
      .filter((item) => item.kind === 'account' && item.category === category)
      .sort((a, b) => a.code.localeCompare(b.code, 'pt-BR', { numeric: true }))
  }, [category, storedAccounts])

  const selected = useMemo(() => accounts.find((item) => item.code === value) ?? null, [accounts, value])
  const [query, setQuery] = useState('')
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
    const matches = !needle
      ? accounts
      : accounts.filter((item) => normalize(`${item.code} ${item.name} ${item.dre ?? ''}`).includes(needle))
    return matches.slice(0, 18)
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
          <div className="account-selector-footer">{accounts.length} contas finais de {category.toLowerCase()} · fonte: {source === 'firestore' ? 'Plano de Contas sincronizado no Firestore' : 'plano oficial do aplicativo'}.</div>
        </div>
      )}
    </div>
  )
}
