import { useEffect, useState } from 'react'
import { AlertTriangle, BadgeCheck, Eye, FileCheck2, ShieldCheck, X } from 'lucide-react'
import { addDoc, collection, doc, onSnapshot, serverTimestamp, updateDoc, type DocumentData } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { DIRECTOR_EMAIL, useAuth } from '../auth/AuthContext'
import { WorkflowStatusBadge } from '../components/WorkflowStatusBadge'

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
type AnyRecord = { id: string } & DocumentData
type DecisionStatus = 'devolvido' | 'rejeitado'

const expenseStatusLabels: Record<string, string> = {
  enviado_aprovacao: 'Enviado para Aprovação',
  em_analise: 'Em Análise',
  aprovado: 'Aprovado',
  devolvido: 'Devolvido p/ Correção',
  rejeitado: 'Rejeitado',
}

function useExpenses(enabled: boolean) {
  const [records, setRecords] = useState<AnyRecord[]>([])
  useEffect(() => {
    if (!enabled) return
    return onSnapshot(collection(db, 'expenses'), (snapshot) => {
      setRecords(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
    })
  }, [enabled])
  return records
}

async function writeAudit(profile: ReturnType<typeof useAuth>['profile'], action: string, detail: string, entityId: string) {
  if (!profile) return
  await addDoc(collection(db, 'auditLogs'), {
    action,
    module: 'Aprovações',
    detail,
    entityId,
    userId: profile.uid,
    userName: profile.displayName,
    userEmail: profile.email,
    createdAt: serverTimestamp(),
  })
}

export function ApprovalsPageEnhanced() {
  const { profile } = useAuth()
  const email = profile?.email?.trim().toLowerCase() ?? ''
  const isDirector = email === DIRECTOR_EMAIL && profile?.role === 'diretor'
  const canView = isDirector || profile?.role === 'master'
  const records = useExpenses(canView)
  const queue = records.filter((item) => ['enviado_aprovacao', 'em_analise'].includes(item.status))
  const [decision, setDecision] = useState<{ item: AnyRecord; status: DecisionStatus } | null>(null)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)

  if (!canView) {
    return <section className="page-card module-empty"><ShieldCheck size={36} /><strong>Acesso restrito</strong><span>Somente o Diretor autorizado e o Administrador Master podem visualizar esta fila.</span></section>
  }

  async function approve(item: AnyRecord) {
    if (!isDirector) return
    setBusy(true)
    try {
      await updateDoc(doc(db, 'expenses', item.id), {
        status: 'aprovado',
        approvalNote: null,
        decisionBy: profile?.uid,
        decisionByName: profile?.displayName,
        decisionByEmail: profile?.email,
        decisionAt: serverTimestamp(),
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      await writeAudit(profile, 'Despesa: Aprovado', `${item.nome ?? 'Despesa'} — ${money.format(Number(item.valorTotal ?? 0))} — Autorizado por Flávio Marques`, item.id)
    } finally {
      setBusy(false)
    }
  }

  async function confirmDecision() {
    if (!isDirector || !decision || !reason.trim()) return
    setBusy(true)
    try {
      const label = expenseStatusLabels[decision.status]
      const detail = `${decision.item.nome ?? 'Despesa'} — ${money.format(Number(decision.item.valorTotal ?? 0))} — Motivo/justificativa: ${reason.trim()}`
      await updateDoc(doc(db, 'expenses', decision.item.id), {
        status: decision.status,
        approvalNote: reason.trim(),
        decisionBy: profile?.uid,
        decisionByName: profile?.displayName,
        decisionByEmail: profile?.email,
        decisionAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      await writeAudit(profile, `Despesa: ${label}`, detail, decision.item.id)
      setDecision(null)
      setReason('')
    } finally {
      setBusy(false)
    }
  }

  function openDecision(item: AnyRecord, status: DecisionStatus) {
    if (!isDirector) return
    setReason('')
    setDecision({ item, status })
  }

  return <>
    <div className="page-heading"><div><span className="eyebrow">Autorização de pagamentos</span><h1>Aprovações</h1><p>Flávio Marques é o único Diretor autorizado a aprovar, devolver ou rejeitar despesas. O Administrador Master possui consulta para controle do sistema, sem poder de autorização financeira.</p></div></div>
    {!isDirector && <div className="warning-box"><Eye size={18} /><span><strong>Modo consulta:</strong> como Administrador Master, você pode acompanhar a fila, mas as decisões financeiras são exclusivas do Diretor Flávio Marques.</span></div>}
    <section className="page-card module-card approval-card">
      {queue.length === 0 ? <div className="module-empty"><FileCheck2 size={34} /><strong>Nenhuma aprovação pendente</strong><span>As despesas enviadas ou reenviadas pela operação aparecerão nesta fila.</span></div> : <div className="approval-list">{queue.map((item) => <article className="approval-item" key={item.id}><div><WorkflowStatusBadge status={item.status} label={expenseStatusLabels[item.status] || item.status} /><h3>{item.nome || 'Demonstrativo de despesa'}</h3><p>{item.fornecedor || 'Sem fornecedor informado'} · {item.competencia || 'Sem competência'} · {item.categoria || 'Sem categoria'}</p></div><strong className="expense-text">{money.format(Number(item.valorTotal ?? 0))}</strong>{isDirector ? <div className="row-actions"><button className="small-success-button" disabled={busy} onClick={() => approve(item)}><BadgeCheck size={15} /> Aprovar</button><button className="small-neutral-button" disabled={busy} onClick={() => openDecision(item, 'devolvido')}>Devolver</button><button className="small-expense-button" disabled={busy} onClick={() => openDecision(item, 'rejeitado')}>Rejeitar</button></div> : <div className="row-actions"><span className="status-badge neutral">Somente consulta</span></div>}</article>)}</div>}
    </section>

    {decision && isDirector && <div className="modal-backdrop"><section className={`decision-modal ${decision.status}`} role="dialog" aria-modal="true"><div className="modal-toolbar"><div><span className="eyebrow">Diretor autorizador</span><h2>{decision.status === 'devolvido' ? 'Devolver para correção' : 'Rejeitar despesa'}</h2></div><button className="icon-button" type="button" onClick={() => setDecision(null)}><X size={20} /></button></div><div className="decision-warning"><AlertTriangle size={20} /><div><strong>{decision.item.nome || 'Despesa'}</strong><span>{money.format(Number(decision.item.valorTotal ?? 0))}</span></div></div><label className="decision-reason"><span>{decision.status === 'devolvido' ? 'O que precisa ser corrigido?' : 'Justificativa da rejeição'}</span><textarea rows={5} autoFocus value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Digite o motivo completo. Ele ficará registrado na Auditoria." /></label><div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setDecision(null)}>Cancelar</button><button className={decision.status === 'rejeitado' ? 'expense-button' : 'warning-action-button'} type="button" disabled={busy || !reason.trim()} onClick={confirmDecision}>{busy ? 'Registrando...' : decision.status === 'devolvido' ? 'Confirmar devolução' : 'Confirmar rejeição'}</button></div></section></div>}
  </>
}
