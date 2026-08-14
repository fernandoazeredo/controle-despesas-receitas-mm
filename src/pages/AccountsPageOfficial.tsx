import { useEffect, useMemo, useState } from 'react'
import { BookOpenCheck, RefreshCw, Search, ShieldCheck } from 'lucide-react'
import { collection, doc, onSnapshot, serverTimestamp, writeBatch, type DocumentData } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../auth/AuthContext'
import {
  OFFICIAL_CHART_OF_ACCOUNTS_SOURCE,
  OFFICIAL_CHART_OF_ACCOUNTS_VERSION,
  officialChartOfAccounts,
  type ChartOfAccount,
} from '../data/chartOfAccounts'

type StoredAccount = { id: string } & DocumentData

type Filter = 'Todos' | 'Receita' | 'Despesa' | 'Patrimonial / Dívida'

function normalized(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function AccountsPageOfficial() {
  const { profile } = useAuth()
  const [records, setRecords] = useState<StoredAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('Todos')
  const canManage = profile?.role === 'master' || profile?.role === 'admin'

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'chartOfAccounts'), (snapshot) => {
      setRecords(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
      setLoading(false)
    }, () => setLoading(false))
    return unsubscribe
  }, [])

  const officialCodes = useMemo(() => new Set(officialChartOfAccounts.map((item) => item.code)), [])
  const storedOfficialCount = useMemo(() => records.filter((item) => officialCodes.has(String(item.code ?? ''))).length, [records, officialCodes])
  const synchronized = storedOfficialCount === officialChartOfAccounts.length && records.length === officialChartOfAccounts.length

  const visible = useMemo(() => {
    const needle = normalized(search.trim())
    return officialChartOfAccounts.filter((item) => {
      const categoryOk = filter === 'Todos' || item.category === filter
      const textOk = !needle || normalized(`${item.code} ${item.name} ${item.dre ?? ''}`).includes(needle)
      return categoryOk && textOk
    })
  }, [search, filter])

  const counts = useMemo(() => ({
    groups: officialChartOfAccounts.filter((item) => item.kind === 'group').length,
    accounts: officialChartOfAccounts.filter((item) => item.kind === 'account').length,
    revenues: officialChartOfAccounts.filter((item) => item.kind === 'account' && item.category === 'Receita').length,
    expenses: officialChartOfAccounts.filter((item) => item.kind === 'account' && item.category === 'Despesa').length,
    patrimonial: officialChartOfAccounts.filter((item) => item.kind === 'account' && item.category === 'Patrimonial / Dívida').length,
  }), [])

  async function replaceFirestorePlan() {
    if (!canManage) return
    const confirmed = window.confirm(`Substituir o plano de contas atualmente salvo no Firestore pelo plano oficial com ${officialChartOfAccounts.length} códigos?`)
    if (!confirmed) return

    setSyncing(true)
    setMessage('')
    try {
      const batch = writeBatch(db)
      records.forEach((item) => batch.delete(doc(db, 'chartOfAccounts', item.id)))
      officialChartOfAccounts.forEach((item) => {
        const ref = doc(db, 'chartOfAccounts', item.code.replaceAll('.', '_'))
        batch.set(ref, {
          ...item,
          active: true,
          source: OFFICIAL_CHART_OF_ACCOUNTS_SOURCE,
          version: OFFICIAL_CHART_OF_ACCOUNTS_VERSION,
          updatedAt: serverTimestamp(),
          updatedBy: profile?.uid ?? null,
          updatedByName: profile?.displayName ?? null,
        })
      })
      const auditRef = doc(collection(db, 'auditLogs'))
      batch.set(auditRef, {
        action: 'Plano de contas oficial sincronizado',
        module: 'Plano de Contas',
        detail: `${officialChartOfAccounts.length} códigos · ${counts.accounts} contas finais · versão ${OFFICIAL_CHART_OF_ACCOUNTS_VERSION}`,
        userId: profile?.uid ?? null,
        userName: profile?.displayName ?? null,
        userEmail: profile?.email ?? null,
        createdAt: serverTimestamp(),
      })
      await batch.commit()
      setMessage('Plano de contas oficial sincronizado com o Firestore com sucesso.')
    } catch (error) {
      console.error(error)
      setMessage('Não foi possível sincronizar o plano de contas. Confira sua permissão e tente novamente.')
    } finally {
      setSyncing(false)
    }
  }

  function tone(item: ChartOfAccount) {
    if (item.category === 'Receita') return 'account-revenue'
    if (item.category === 'Despesa') return 'account-expense'
    return 'account-patrimonial'
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Plano oficial do escritório</span>
          <h1>Plano de Contas</h1>
          <p>Estrutura oficial importada do arquivo atual, preservando código, descrição, hierarquia e classificação DRE.</p>
        </div>
        {canManage && (
          <div className="quick-actions">
            <button className="secondary-button" type="button" onClick={replaceFirestorePlan} disabled={syncing}>
              {syncing ? <RefreshCw className="spin" size={17} /> : <BookOpenCheck size={17} />}
              {synchronized ? 'Atualizar plano oficial' : 'Sincronizar plano oficial'}
            </button>
          </div>
        )}
      </div>

      <div className="accounts-summary-grid">
        <article><span>Códigos totais</span><strong>{officialChartOfAccounts.length}</strong><small>{counts.groups} grupos + {counts.accounts} contas finais</small></article>
        <article className="account-revenue"><span>Contas de receita</span><strong>{counts.revenues}</strong><small>Códigos 3.xx</small></article>
        <article className="account-expense"><span>Contas de despesa</span><strong>{counts.expenses}</strong><small>Códigos 4.xx</small></article>
        <article className="account-patrimonial"><span>Patrimonial / Dívidas</span><strong>{counts.patrimonial}</strong><small>Códigos 5.xx</small></article>
      </div>

      <section className="page-card official-plan-info">
        <div><ShieldCheck size={20} /><span><strong>Fonte:</strong> {OFFICIAL_CHART_OF_ACCOUNTS_SOURCE} · versão {OFFICIAL_CHART_OF_ACCOUNTS_VERSION}</span></div>
        <div><strong>Firestore:</strong> {loading ? 'verificando...' : synchronized ? `sincronizado (${records.length} códigos)` : `${records.length} código(s) salvo(s); o plano oficial abaixo já está disponível no aplicativo.`}</div>
        {message && <div className="account-plan-message">{message}</div>}
      </section>

      <section className="page-card module-card official-accounts-card">
        <div className="module-toolbar accounts-toolbar">
          <div className="search-box"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar código, conta ou classificação DRE" /></div>
          <select value={filter} onChange={(e) => setFilter(e.target.value as Filter)}>
            <option>Todos</option>
            <option>Receita</option>
            <option>Despesa</option>
            <option>Patrimonial / Dívida</option>
          </select>
        </div>

        <div className="official-accounts-table">
          <div className="official-account-row official-account-head"><span>Código</span><span>Conta</span><span>Categoria</span><span>DRE</span></div>
          {visible.map((item) => (
            <div className={`official-account-row ${item.kind === 'group' ? 'official-group-row' : ''}`} key={item.code}>
              <span className="account-code" style={{ paddingLeft: `${Math.max(0, item.level - 2) * 16}px` }}>{item.code}</span>
              <span><strong>{item.name}</strong>{item.parentCode && <small>Grupo: {item.parentCode}</small>}</span>
              <span><b className={`account-category ${tone(item)}`}>{item.category}</b></span>
              <span>{item.dre ?? (item.kind === 'group' ? 'Grupo / Subgrupo' : '—')}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
