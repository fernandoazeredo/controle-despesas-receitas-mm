import { useEffect } from 'react'
import { companyData } from '../data/companyData'

function setReactInputValue(input: HTMLInputElement, value: string) {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')
  descriptor?.set?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

function enhanceExpenseForm() {
  const modal = document.querySelector('.expense-sheet')
  if (!modal) return

  const labels = Array.from(modal.querySelectorAll<HTMLLabelElement>('label'))
  for (const label of labels) {
    const caption = label.querySelector<HTMLElement>('span')
    const input = label.querySelector<HTMLInputElement>('input')
    if (!caption || !input) continue
    const text = caption.textContent?.trim() ?? ''

    if (text === 'Nome / Responsável') {
      caption.textContent = 'Nome da Empresa'
      input.readOnly = true
      input.setAttribute('aria-readonly', 'true')
      input.classList.add('institutional-readonly-field')
      if (input.value !== companyData.razaoSocial) setReactInputValue(input, companyData.razaoSocial)
    }

    if (text === 'Fornecedor / Favorecido') caption.textContent = 'Nome do Fornecedor / Favorecido'
    if (text === 'CPF / CNPJ' || text === 'CPF / CNPJ do Fornecedor / Favorecido') caption.textContent = 'CPF do Favorecido / CNPJ do Fornecedor'
  }

  const table = document.querySelector('.review-expenses-table')
  const header = table?.querySelector('.data-head')
  if (header) {
    const cells = header.querySelectorAll(':scope > span')
    if (cells[1]) cells[1].textContent = 'Fornecedor / Favorecido'
  }

  table?.querySelectorAll<HTMLElement>('.data-row:not(.data-head)').forEach((row) => {
    const cell = row.querySelectorAll<HTMLElement>(':scope > span')[1]
    if (!cell) return
    const strong = cell.querySelector('strong')
    const small = cell.querySelector('small')
    if (!strong || !small) return
    const company = strong.textContent?.trim() ?? ''
    const supplier = small.textContent?.trim() ?? ''
    if (supplier && company === companyData.razaoSocial) {
      strong.textContent = supplier
      small.textContent = companyData.razaoSocial
    }
  })
}

export function ExpenseFormSemanticsEnhancer() {
  useEffect(() => {
    enhanceExpenseForm()
    const observer = new MutationObserver(enhanceExpenseForm)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])
  return null
}
