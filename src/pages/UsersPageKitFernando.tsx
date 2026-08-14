import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Copy, RefreshCw, ShieldCheck, UserCheck, Users } from 'lucide-react'
import { addDoc, collection, doc, onSnapshot, serverTimestamp, updateDoc, type DocumentData } from 'firebase/firestore'
import { db } from '../lib/firebase'
import {
  DIRECTOR_EMAIL,
  MANAGER_EMAIL,
  PRIMARY_ADMIN_EMAIL,
  TREASURY_EMAIL,
  officialRoleForEmail,
  useAuth,
  type UserStatus,
} from '../auth/AuthContext'
import { WorkflowStatusBadge } from '../components/WorkflowStatusBadge'

const dateTimeBR = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
type UserRecord = { id: string } & DocumentData

type OfficialRole = 'master' | 'diretor' | 'gerente' | 'tesouraria' | 'operador'

const roleLabels: Record<OfficialRole, string> = {
  master: 'Administrador Master',
  diretor: 'Diretor / Autorizador',
  gerente: 'Gerente',
  tesouraria: 'Tesouraria',
  operador: 'Colaborador / Operador',
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

function roleNote(email: string) {
  const normalized = email.trim().toLowerCase()
  if (normalized === PRIMARY_ADMIN_EMAIL) return 'Administração total do sistema; usuários e configurações.'
  if (normalized === DIRECTOR_EMAIL) return 'Único usuário autorizado a aprovar, devolver ou rejeitar pagamentos/despesas.'
  if (normalized === MANAGER_EMAIL) return 'Gestão e acompanhamento operacional, sem poder de autorização.'
  if (normalized === TREASURY_EMAIL) return 'Operação financeira e Tesouraria, sem poder de autorização.'
  return 'Operação cotidiana; não autoriza pagamentos.'
}

export function UsersPageKitFernando() {
  const { profile } = useAuth()
  const [records, setRecords] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const canManage = profile?.role === 'master'

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

  async function updateStatus(item: UserRecord, status: UserStatus) {
    if (!canManage || String(item.email ?? '').toLowerCase() === PRIMARY_ADMIN_EMAIL) return
    const email = String(item.email ?? '').trim().toLowerCase()
    const role = officialRoleForEmail(email)
    await updateDoc(doc(db, 'users', item.id), {
      role,
      status,
      updatedAt: serverTimestamp(),
      updatedBy: profile?.uid ?? null,
      updatedByName: profile?.displayName ?? null,
    })
    await addDoc(collection(db, 'auditLogs'), {
      action: 'Status de usuário alterado',
      module: 'Usuários',
      detail: `${email} → ${roleLabels[role]} · ${statusLabels[status]}`,
      entityId: item.id,
      userId: profile?.uid ?? null,
      userName: profile?.displayName ?? null,
      userEmail: profile?.email ?? null,
      createdAt: serverTimestamp(),
    })
  }

  async function copyRegistrationLink() {
    const text = `${window.location.origin}\n\nNo primeiro acesso, clique em “Primeiro acesso? Solicitar cadastro”. O cadastro ficará Pendente até a liberação do Administrador Master.`
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
        <p>O próprio usuário solicita o cadastro. O perfil é definido pelas regras oficiais do escritório e o Administrador Master libera ou bloqueia o acesso.</p>
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
        <h2>Perfis oficiais e autorização</h2>
        <p><strong>Fernando:</strong> Administrador Master do sistema. <strong>Flávio Marques:</strong> Diretor e único autorizador de pagamentos/despesas. <strong>Reinaldo:</strong> Gerente. <strong>Socorro:</strong> Tesouraria. Todos os demais cadastros entram como <strong>Colaborador / Operador</strong>.</p>
        <small>Todos os usuários, exceto o Master, nascem Pendentes e só acessam após a sua liberação.</small>
      </div>
    </section>

    <section className="page-card module-card users-kit-card">
      <div className="card-title-row"><div><h2>Cadastros do sistema</h2><p>Pendentes aparecem primeiro para facilitar a liberação.</p></div><WorkflowStatusBadge status="pending" label={`${counts.pending} pendente(s)`} /></div>
      {loading ? <div className="module-empty"><RefreshCw className="spin" size={30} /><strong>Carregando usuários</strong><span>Consultando o Firestore...</span></div> : ordered.length === 0 ? <div className="module-empty"><Users size={34} /><strong>Nenhum usuário cadastrado</strong><span>O primeiro cadastro aparecerá aqui como Pendente.</span></div> : <div className="data-table users-kit-table">
        <div className="data-row data-head"><span>Usuário</span><span>Perfil / Regra</span><span>Status</span><span>Último acesso</span></div>
        {ordered.map((item) => {
          const email = String(item.email ?? '').trim().toLowerCase()
          const locked = email === PRIMARY_ADMIN_EMAIL
          const role = officialRoleForEmail(email)
          const currentStatus = (item.status as UserStatus) || 'pending'
          return <div className="data-row" key={item.id}>
            <span><strong>{item.displayName || 'Usuário'}</strong><small>{email}</small>{locked && <em className="master-lock"><ShieldCheck size={13} /> Administrador Master</em>}</span>
            <span><strong>{roleLabels[role]}</strong><small>{roleNote(email)}</small></span>
            <span>{canManage && !locked ? <select value={currentStatus} onChange={(event) => updateStatus(item, event.target.value as UserStatus)}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select> : <WorkflowStatusBadge status={locked ? 'active' : currentStatus} label={locked ? 'Ativo' : statusLabels[currentStatus]} />}</span>
            <span>{item.status === 'active' && item.lastLoginAt ? timestampToDateTime(item.lastLoginAt) : item.status === 'pending' ? <span className="pending-access-note"><CheckCircle2 size={14} /> Aguardando liberação</span> : timestampToDateTime(item.lastLoginAt)}</span>
          </div>
        })}
      </div>}
    </section>
  </>
}
