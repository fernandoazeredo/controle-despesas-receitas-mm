import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Copy, RefreshCw, ShieldCheck, UserCheck, Users } from 'lucide-react'
import { addDoc, collection, doc, onSnapshot, serverTimestamp, updateDoc, type DocumentData } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth, type UserRole, type UserStatus } from '../auth/AuthContext'
import { WorkflowStatusBadge } from '../components/WorkflowStatusBadge'

const PRIMARY_ADMIN_EMAIL = 'fernandoazeredo64@gmail.com'
const dateTimeBR = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

type UserRecord = { id: string } & DocumentData

const roleLabels: Record<UserRole, string> = {
  master: 'Master',
  admin: 'Administrador',
  diretoria: 'Diretoria / Aprovador',
  tesouraria: 'Tesouraria / Financeiro',
  alvaras: 'Recebimento de Alvarás',
  contabilidade: 'Contabilidade',
  consulta: 'Consulta',
}

const statusLabels: Record<UserStatus, string> = {
  pending: 'Pendente',
  active: 'Ativo',
  inactive: 'Inativo',
  blocked: 'Bloqueado',
}

function timestampToDateTime(value: unknown) {
  if (value && typeof value === 'object' && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    return dateTimeBR.format((value as { toDate: () => Date }).toDate())
  }
  return '—'
}

export function UsersPageKitFernando() {
  const { profile } = useAuth()
  const [records, setRecords] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const canManage = profile?.role === 'master' || profile?.role === 'admin'

  useEffect(() => onSnapshot(collection(db, 'users'), (snapshot) => {
    setRecords(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
    setLoading(false)
  }, () => setLoading(false)), [])

  const ordered = useMemo(() => [...records].sort((a, b) => {
    const rank = (status: unknown) => status === 'pending' ? 0 : status === 'active' ? 1 : status === 'blocked' ? 2 : 3
    const diff = rank(a.status) - rank(b.status)
    return diff || String(a.displayName ?? a.email ?? '').localeCompare(String(b.displayName ?? b.email ?? ''), 'pt-BR')
  }), [records])

  const counts = useMemo(() => ({
    pending: records.filter((item) => item.status === 'pending').length,
    active: records.filter((item) => item.status === 'active').length,
    blocked: records.filter((item) => item.status === 'blocked').length,
  }), [records])

  async function updateUser(item: UserRecord, field: 'role' | 'status', value: string) {
    if (!canManage || item.email === PRIMARY_ADMIN_EMAIL) return
    await updateDoc(doc(db, 'users', item.id), {
      [field]: value,
      updatedAt: serverTimestamp(),
      updatedBy: profile?.uid ?? null,
      updatedByName: profile?.displayName ?? null,
    })
    await addDoc(collection(db, 'auditLogs'), {
      action: field === 'status' ? 'Status de usuário alterado' : 'Perfil de usuário alterado',
      module: 'Usuários',
      detail: `${item.email} → ${field === 'status' ? statusLabels[value as UserStatus] : roleLabels[value as UserRole]}`,
      entityId: item.id,
      userId: profile?.uid ?? null,
      userName: profile?.displayName ?? null,
      userEmail: profile?.email ?? null,
      createdAt: serverTimestamp(),
    })
  }

  async function copyRegistrationLink() {
    const text = `${window.location.origin}\n\nNo primeiro acesso, clique em “Primeiro acesso? Solicitar cadastro”. O cadastro ficará Pendente até a liberação do administrador.`
    try {
      await navigator.clipboard.writeText(text)
      setMessage('Link e instrução de cadastro copiados.')
    } catch {
      setMessage(`Envie este endereço ao usuário: ${window.location.origin}`)
    }
  }

  return <>
    <div className="page-heading">
      <div>
        <span className="eyebrow">Padrão @ Kit Fernando</span>
        <h1>Usuários e Permissões</h1>
        <p>O próprio usuário solicita o cadastro. O acesso nasce Pendente e só é liberado depois da sua aprovação.</p>
      </div>
      {canManage && <div className="quick-actions"><button className="secondary-button" type="button" onClick={copyRegistrationLink}><Copy size={17} /> Copiar link de cadastro</button></div>}
    </div>

    {message && <div className="user-invite-feedback" role="status">{message}</div>}

    <div className="user-access-summary">
      <article className="user-pending-card"><span>Pendentes</span><strong>{counts.pending}</strong><small>Aguardando sua liberação</small></article>
      <article className="user-active-card"><span>Ativos</span><strong>{counts.active}</strong><small>Com acesso ao sistema</small></article>
      <article className="user-blocked-card"><span>Bloqueados</span><strong>{counts.blocked}</strong><small>Sem acesso</small></article>
    </div>

    <section className="page-card kit-user-flow">
      <div className="kit-user-flow-icon"><UserCheck size={28} /></div>
      <div>
        <h2>Fluxo de cadastro</h2>
        <p><strong>1.</strong> Usuário abre o sistema → <strong>2.</strong> “Primeiro acesso? Solicitar cadastro” → <strong>3.</strong> cadastro fica <strong>Pendente</strong> → <strong>4.</strong> Administrador define o perfil → <strong>5.</strong> muda o status para <strong>Ativo</strong>.</p>
        <small>Não existe convite obrigatório e ninguém ganha acesso automaticamente.</small>
      </div>
    </section>

    <section className="page-card module-card users-kit-card">
      <div className="card-title-row"><div><h2>Cadastros do sistema</h2><p>Pendentes aparecem primeiro para facilitar a liberação.</p></div><WorkflowStatusBadge status="pending" label={`${counts.pending} pendente(s)`} /></div>
      {loading ? <div className="module-empty"><RefreshCw className="spin" size={30} /><strong>Carregando usuários</strong><span>Consultando o Firestore...</span></div> : ordered.length === 0 ? <div className="module-empty"><Users size={34} /><strong>Nenhum usuário cadastrado</strong><span>O primeiro cadastro aparecerá aqui como Pendente.</span></div> : <div className="data-table users-kit-table">
        <div className="data-row data-head"><span>Usuário</span><span>Perfil</span><span>Status</span><span>Último acesso</span></div>
        {ordered.map((item) => {
          const locked = item.email === PRIMARY_ADMIN_EMAIL
          const currentRole = (item.role as UserRole) || 'consulta'
          const currentStatus = (item.status as UserStatus) || 'pending'
          return <div className="data-row" key={item.id}>
            <span><strong>{item.displayName || 'Usuário'}</strong><small>{item.email}</small>{locked && <em className="master-lock"><ShieldCheck size={13} /> Administrador principal</em>}</span>
            <span>{canManage && !locked ? <select value={currentRole} onChange={(event) => updateUser(item, 'role', event.target.value)}>{Object.entries(roleLabels).filter(([value]) => value !== 'master').map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select> : <strong>{roleLabels[currentRole]}</strong>}</span>
            <span>{canManage && !locked ? <select value={currentStatus} onChange={(event) => updateUser(item, 'status', event.target.value)}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select> : <WorkflowStatusBadge status={locked ? 'active' : currentStatus} label={locked ? 'Ativo' : statusLabels[currentStatus]} />}</span>
            <span>{item.status === 'active' && item.lastLoginAt ? timestampToDateTime(item.lastLoginAt) : item.status === 'pending' ? <span className="pending-access-note"><CheckCircle2 size={14} /> Aguardando liberação</span> : timestampToDateTime(item.lastLoginAt)}</span>
          </div>
        })}
      </div>}
    </section>
  </>
}
