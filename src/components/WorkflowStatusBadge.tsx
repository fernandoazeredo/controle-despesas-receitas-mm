export type WorkflowTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

const TONE_BY_STATUS: Record<string, WorkflowTone> = {
  rascunho: 'neutral',
  enviado_aprovacao: 'info',
  em_analise: 'info',
  aprovado: 'success',
  pago: 'success',
  arquivado: 'success',
  devolvido: 'warning',
  rejeitado: 'danger',
  enviado_tesouraria: 'info',
  recebido_tesouraria: 'info',
  encerrado: 'success',
  pending: 'warning',
  active: 'success',
  inactive: 'neutral',
  blocked: 'danger',
}

export function workflowStatusTone(status: string | undefined | null): WorkflowTone {
  return TONE_BY_STATUS[String(status ?? '')] ?? 'neutral'
}

export function WorkflowStatusBadge({ status, label }: { status: string | undefined | null; label: string }) {
  return <span className={`workflow-status-badge workflow-${workflowStatusTone(status)}`}>{label}</span>
}
