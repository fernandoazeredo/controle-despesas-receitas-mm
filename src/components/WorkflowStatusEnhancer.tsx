import { useEffect } from 'react'
import '../qa-polish.css'

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

const revenueModalBaselines = new WeakMap<Element, string>()
const dateBuffers = new WeakMap<HTMLInputElement, string>()

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

function setNativeInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  if (setter) setter.call(input, value)
  else input.value = value
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

function serializeControls(root: Element) {
  const controls = Array.from(root.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea'))
  const values = controls.map((control, index) => {
    const checked = control instanceof HTMLInputElement && ['checkbox', 'radio'].includes(control.type) ? String(control.checked) : ''
    return `${index}:${control instanceof HTMLInputElement ? control.type : control.tagName}:${control.value}:${checked}`
  })
  values.push(`uploads:${root.querySelectorAll('.upload-item').length}`)
  return values.join('|')
}

function captureRevenueModalBaselines() {
  document.querySelectorAll<HTMLElement>('.modal-backdrop').forEach((backdrop) => {
    const sheet = backdrop.querySelector<HTMLElement>('.revenue-sheet')
    if (!sheet || revenueModalBaselines.has(backdrop)) return
    requestAnimationFrame(() => {
      if (document.body.contains(backdrop) && !revenueModalBaselines.has(backdrop)) revenueModalBaselines.set(backdrop, serializeControls(sheet))
    })
  })
}

function closeRevenueModalFromBackdrop(backdrop: HTMLElement) {
  const sheet = backdrop.querySelector<HTMLElement>('.revenue-sheet')
  if (!sheet) return
  const baseline = revenueModalBaselines.get(backdrop) ?? ''
  const dirty = baseline !== serializeControls(sheet)
  if (dirty && !window.confirm('Descartar alterações? Os dados ainda não salvos serão perdidos.')) return
  const closeButton = sheet.querySelector<HTMLButtonElement>('.modal-toolbar .icon-button')
  closeButton?.click()
}

function dateMaskText(digits: string) {
  const padded = digits.slice(0, 8).padEnd(8, '_')
  return `${padded.slice(0, 2)}/${padded.slice(2, 4)}/${padded.slice(4, 8)}`
}

function validIsoFromDigits(digits: string) {
  if (!/^\d{8}$/.test(digits)) return ''
  const day = Number(digits.slice(0, 2))
  const month = Number(digits.slice(2, 4))
  const year = Number(digits.slice(4, 8))
  if (year < 1900 || year > 2200 || month < 1 || month > 12 || day < 1 || day > 31) return ''
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return ''
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function getDateHint() {
  let hint = document.querySelector<HTMLDivElement>('.date-mask-hint')
  if (!hint) {
    hint = document.createElement('div')
    hint.className = 'date-mask-hint'
    document.body.appendChild(hint)
  }
  return hint
}

function showDateHint(input: HTMLInputElement, text: string, isError = false) {
  const hint = getDateHint()
  const rect = input.getBoundingClientRect()
  hint.textContent = text
  hint.classList.toggle('is-error', isError)
  hint.style.left = `${Math.min(Math.max(8, rect.left), window.innerWidth - 205)}px`
  hint.style.top = `${Math.min(window.innerHeight - 42, rect.bottom + 5)}px`
  hint.hidden = false
}

function hideDateHint() {
  const hint = document.querySelector<HTMLDivElement>('.date-mask-hint')
  if (hint) hint.hidden = true
}

function handleDateKeydown(event: KeyboardEvent) {
  const input = event.target instanceof HTMLInputElement && event.target.type === 'date' ? event.target : null
  if (!input || input.disabled || input.readOnly || event.ctrlKey || event.metaKey || event.altKey) return

  if (/^\d$/.test(event.key)) {
    event.preventDefault()
    const previous = dateBuffers.get(input) ?? ''
    const next = previous.length >= 8 ? event.key : `${previous}${event.key}`
    dateBuffers.set(input, next)
    showDateHint(input, `Digite DDMMAAAA: ${dateMaskText(next)}`)
    if (next.length === 8) {
      const iso = validIsoFromDigits(next)
      if (!iso) {
        showDateHint(input, `Data inválida: ${dateMaskText(next)}`, true)
        return
      }
      setNativeInputValue(input, iso)
      dateBuffers.set(input, '')
      showDateHint(input, `Data registrada: ${dateMaskText(next)}`)
      window.setTimeout(hideDateHint, 650)
    }
    return
  }

  if (event.key === '/' || event.key === '-') {
    event.preventDefault()
    return
  }

  if (event.key === 'Backspace' || event.key === 'Delete') {
    event.preventDefault()
    const previous = dateBuffers.get(input) ?? ''
    if (previous) {
      const next = previous.slice(0, -1)
      dateBuffers.set(input, next)
      showDateHint(input, `Digite DDMMAAAA: ${dateMaskText(next)}`)
    } else {
      setNativeInputValue(input, '')
      showDateHint(input, 'Digite DDMMAAAA: __/__/____')
    }
  }
}

function roundPercentageInput(target: EventTarget | null) {
  const input = target instanceof HTMLInputElement ? target : null
  if (!input || input.type !== 'number' || !input.closest('.composition-table')) return
  const value = Number(input.value)
  if (!Number.isFinite(value) || input.value === '') return
  const rounded = Math.round(value * 100) / 100
  setNativeInputValue(input, String(rounded))
  requestAnimationFrame(() => {
    if (document.activeElement !== input) input.value = rounded.toFixed(2)
  })
}

export function WorkflowStatusEnhancer() {
  useEffect(() => {
    applyStatusClasses()
    ensureHowToFlow()
    captureRevenueModalBaselines()

    const observer = new MutationObserver(() => {
      applyStatusClasses()
      ensureHowToFlow()
      captureRevenueModalBaselines()
    })
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })

    const onPopState = () => ensureHowToFlow()
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target instanceof HTMLElement ? event.target : null
      if (!target?.classList.contains('modal-backdrop') || !target.querySelector('.revenue-sheet')) return
      event.preventDefault()
      event.stopPropagation()
      closeRevenueModalFromBackdrop(target)
    }
    const onFocusOut = (event: FocusEvent) => {
      if (event.target instanceof HTMLInputElement && event.target.type === 'date') {
        dateBuffers.set(event.target, '')
        hideDateHint()
      }
      roundPercentageInput(event.target)
    }
    const onFocusIn = (event: FocusEvent) => {
      const input = event.target instanceof HTMLInputElement && event.target.type === 'date' ? event.target : null
      if (!input) return
      dateBuffers.set(input, '')
      input.title = 'Digite a data em DDMMAAAA ou utilize o calendário.'
    }
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      const backdrop = document.querySelector<HTMLElement>('.modal-backdrop:has(.revenue-sheet)')
      if (!backdrop) return
      event.preventDefault()
      event.stopPropagation()
      closeRevenueModalFromBackdrop(backdrop)
    }

    window.addEventListener('popstate', onPopState)
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', handleDateKeydown, true)
    document.addEventListener('keydown', onEscape, true)
    document.addEventListener('focusin', onFocusIn, true)
    document.addEventListener('focusout', onFocusOut, true)

    return () => {
      observer.disconnect()
      window.removeEventListener('popstate', onPopState)
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', handleDateKeydown, true)
      document.removeEventListener('keydown', onEscape, true)
      document.removeEventListener('focusin', onFocusIn, true)
      document.removeEventListener('focusout', onFocusOut, true)
      document.querySelector<HTMLElement>('.system-flow-card')?.remove()
      document.querySelector<HTMLElement>('.date-mask-hint')?.remove()
    }
  }, [])

  return null
}
