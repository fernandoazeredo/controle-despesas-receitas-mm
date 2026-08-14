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

function ensureHowToFlow() {
  const existing = document.querySelector<HTMLElement>('.system-flow-card')
  const isHowTo = window.location.pathname === '/como-usar'

  if (!isHowTo) {
    existing?.remove()
    return
  }

  if (existing) return
  const main = document.querySelector<HTMLElement>('.main-content')
  if (!main) return

  const section = document.createElement('section')
  section.className = 'page-card system-flow-card'
  section.setAttribute('aria-labelledby', 'system-flow-title')
  section.innerHTML = `
    <div style="margin-bottom:16px">
      <span class="eyebrow">Visão completa</span>
      <h2 id="system-flow-title" style="margin:5px 0 7px">Fluxo Geral do Sistema – Visão Completa</h2>
      <p style="margin:0;color:var(--muted);line-height:1.55">Este fluxograma resume os módulos de <strong>Despesas</strong>, <strong>Recebimento de Alvarás</strong>, <strong>Tesouraria / Receitas</strong>, <strong>Contabilidade / Exportação</strong> e as funcionalidades transversais do sistema.</p>
    </div>
    <a href="/fluxo-geral-sistema.svg" target="_blank" rel="noreferrer" title="Abrir fluxograma em tamanho maior" style="display:block;text-decoration:none">
      <img src="/fluxo-geral-sistema.svg" alt="Fluxo Geral do Sistema de Controle de Despesas e Receitas MM" loading="lazy" style="display:block;width:100%;height:auto;border:1px solid var(--border);border-radius:12px;background:#fff;box-shadow:0 8px 26px rgba(20,35,55,.08)" />
    </a>
    <div style="display:flex;justify-content:center;margin-top:14px">
      <a href="/fluxo-geral-sistema.svg" target="_blank" rel="noreferrer" class="secondary-button" style="text-decoration:none">Abrir imagem em tamanho maior</a>
    </div>
  `
  main.appendChild(section)
}

export function WorkflowStatusEnhancer() {
  useEffect(() => {
    applyStatusClasses()
    ensureHowToFlow()

    const observer = new MutationObserver(() => {
      applyStatusClasses()
      ensureHowToFlow()
    })
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })

    const onPopState = () => ensureHowToFlow()
    window.addEventListener('popstate', onPopState)

    return () => {
      observer.disconnect()
      window.removeEventListener('popstate', onPopState)
      document.querySelector<HTMLElement>('.system-flow-card')?.remove()
    }
  }, [])

  return null
}
