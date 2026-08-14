import { useEffect } from 'react'

const STATUS_CLASS_BY_TEXT: Record<string, string> = {
  'Rascunho': 'workflow-neutral',
  'Enviado para Aprovação': 'workflow-info',
  'Em Análise': 'workflow-info',
  'Enviado à Tesouraria': 'workflow-info',
  'Recebido pela Tesouraria': 'workflow-info',
  'Aprovado': 'workflow-success',
  'Pago': 'workflow-success',
  'Arquivado': 'workflow-success',
  'Encerrado / Arquivado': 'workflow-success',
  'Ativo': 'workflow-success',
  'Cadastrado': 'workflow-success',
  'Devolvido p/ Correção': 'workflow-warning',
  'Devolvido para Correção': 'workflow-warning',
  'Pendente': 'workflow-warning',
  'Aguardando cadastro': 'workflow-warning',
  'Rejeitado': 'workflow-danger',
  'Bloqueado': 'workflow-danger',
  'Inativo': 'workflow-neutral',
}

function applyStatusClasses(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('.status-badge').forEach((badge) => {
    badge.classList.remove('workflow-neutral', 'workflow-info', 'workflow-success', 'workflow-warning', 'workflow-danger')
    const label = badge.textContent?.trim() ?? ''
    const statusClass = STATUS_CLASS_BY_TEXT[label]
    if (statusClass) badge.classList.add(statusClass)
  })
}

export function WorkflowStatusEnhancer() {
  useEffect(() => {
    applyStatusClasses()
    const observer = new MutationObserver(() => applyStatusClasses())
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [])

  return null
}
