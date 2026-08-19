import { useEffect } from 'react'
import { isValidCPF, maskCpfCnpj, onlyDigits, validateCpfCnpj } from '../lib/cpfCnpjValidator'

const BLOCKING_ACTIONS = new Set([
  'Enviar para Aprovação',
  'Reenviar para Aprovação',
  'Enviar à Tesouraria',
])

function findFieldMode(input: HTMLInputElement): 'cpf' | 'cpf-cnpj' | null {
  const label = input.closest('label')
  const text = label?.querySelector('span')?.textContent?.trim().toUpperCase() ?? ''
  if (text === 'CPF') return 'cpf'
  if (text.includes('CPF') && text.includes('CNPJ')) return 'cpf-cnpj'
  return null
}

function validationMessage(input: HTMLInputElement) {
  const mode = findFieldMode(input)
  const value = input.value
  const digits = onlyDigits(value)
  if (!mode || digits.length === 0) return undefined

  if (mode === 'cpf') {
    if (digits.length < 11) return 'CPF incompleto.'
    return isValidCPF(digits) ? undefined : 'CPF inválido. Confira os números digitados.'
  }

  const result = validateCpfCnpj(value)
  return result.valid ? undefined : result.message
}

function errorNode(input: HTMLInputElement) {
  const label = input.closest('label')
  if (!label) return null
  let node = label.querySelector<HTMLElement>('.cpf-cnpj-field-error')
  if (!node) {
    node = document.createElement('small')
    node.className = 'cpf-cnpj-field-error'
    node.setAttribute('role', 'alert')
    label.appendChild(node)
  }
  return node
}

function showValidation(input: HTMLInputElement) {
  const message = validationMessage(input)
  const node = errorNode(input)
  input.classList.toggle('cpf-cnpj-invalid', Boolean(message))
  input.setAttribute('aria-invalid', message ? 'true' : 'false')
  if (node) {
    node.textContent = message ?? ''
    node.hidden = !message
  }
  return !message
}

function setReactInputValue(input: HTMLInputElement, value: string) {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')
  descriptor?.set?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

function formatInput(input: HTMLInputElement) {
  const mode = findFieldMode(input)
  if (!mode) return
  const digits = onlyDigits(input.value).slice(0, mode === 'cpf' ? 11 : 14)
  const masked = maskCpfCnpj(digits)
  if (masked !== input.value) setReactInputValue(input, masked)
}

function matchingInputs(root: ParentNode = document) {
  return Array.from(root.querySelectorAll<HTMLInputElement>('label input')).filter((input) => findFieldMode(input))
}

export function CpfCnpjValidationEnhancer() {
  useEffect(() => {
    const touched = new WeakSet<HTMLInputElement>()

    const onInput = (event: Event) => {
      const input = event.target
      if (!(input instanceof HTMLInputElement) || !findFieldMode(input)) return
      formatInput(input)
      if (touched.has(input)) showValidation(input)
    }

    const onBlur = (event: FocusEvent) => {
      const input = event.target
      if (!(input instanceof HTMLInputElement) || !findFieldMode(input)) return
      touched.add(input)
      formatInput(input)
      showValidation(input)
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const button = target.closest('button')
      if (!(button instanceof HTMLButtonElement)) return
      const label = button.textContent?.replace(/\s+/g, ' ').trim() ?? ''
      if (![...BLOCKING_ACTIONS].some((action) => label.includes(action))) return

      const modal = button.closest('.modal-sheet, .decision-modal, .obligation-modal') ?? document
      const inputs = matchingInputs(modal)
      const invalid = inputs.find((input) => {
        touched.add(input)
        formatInput(input)
        return !showValidation(input)
      })

      if (invalid) {
        event.preventDefault()
        event.stopPropagation()
        invalid.focus()
        invalid.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }

    document.addEventListener('input', onInput, true)
    document.addEventListener('blur', onBlur, true)
    document.addEventListener('click', onClick, true)

    return () => {
      document.removeEventListener('input', onInput, true)
      document.removeEventListener('blur', onBlur, true)
      document.removeEventListener('click', onClick, true)
    }
  }, [])

  return null
}
