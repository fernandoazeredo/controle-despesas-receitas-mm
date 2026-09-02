import { useEffect } from 'react'
import { useInstitutionalSettings } from '../hooks/useInstitutionalSettings'

function setReactInputValue(input: HTMLInputElement, value: string) {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')
  descriptor?.set?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

function setTextIfChanged(element: Element | null | undefined, value: string) {
  if (element && element.textContent !== value) element.textContent = value
}

function enhanceExpenseForm(companyName: string) {
  const modal = document.querySelector('.expense-sheet')

  if (modal) {
    setTextIfChanged(modal.querySelector('.legacy-title-block strong'), companyName)

    const labels = Array.from(modal.querySelectorAll<HTMLLabelElement>('label'))
    for (const label of labels) {
      const caption = label.querySelector<HTMLElement>('span')
      const input = label.querySelector<HTMLInputElement>('input')
      if (!caption || !input) continue
      const text = caption.textContent?.trim() ?? ''

      if (text === 'Nome / Responsável' || text === 'Nome da Empresa') {
        setTextIfChanged(caption, 'Nome da Empresa')
        input.readOnly = true
        input.setAttribute('aria-readonly', 'true')
        input.classList.add('institutional-readonly-field')
        if (input.value !== companyName) setReactInputValue(input, companyName)
      }

      if (text === 'Fornecedor / Favorecido') setTextIfChanged(caption, 'Nome do Fornecedor / Favorecido')
      if (text === 'CPF / CNPJ' || text === 'CPF / CNPJ do Fornecedor / Favorecido') setTextIfChanged(caption, 'CPF do Favorecido / CNPJ do Fornecedor')
    }
  }

  const table = document.querySelector('.review-expenses-table')
  const header = table?.querySelector('.data-head')
  if (header) {
    const cells = header.querySelectorAll(':scope > span')
    setTextIfChanged(cells[1], 'Fornecedor / Favorecido')
  }

  table?.querySelectorAll<HTMLElement>('.data-row:not(.data-head)').forEach((row) => {
    const cell = row.querySelectorAll<HTMLElement>(':scope > span')[1]
    if (!cell) return
    const strong = cell.querySelector('strong')
    const small = cell.querySelector('small')
    if (!strong || !small) return
    const company = strong.textContent?.trim() ?? ''
    const supplier = small.textContent?.trim() ?? ''
    if (supplier && company === companyName) {
      setTextIfChanged(strong, supplier)
      setTextIfChanged(small, companyName)
    }
  })
}

export function ExpenseFormSemanticsEnhancer() {
  const institutional = useInstitutionalSettings()

  useEffect(() => {
    let scheduled = false
    const run = () => {
      if (scheduled) return
      scheduled = true
      requestAnimationFrame(() => {
        scheduled = false
        enhanceExpenseForm(institutional.razaoSocial)
      })
    }

    run()
    const observer = new MutationObserver(run)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [institutional.razaoSocial])

  return null
}
