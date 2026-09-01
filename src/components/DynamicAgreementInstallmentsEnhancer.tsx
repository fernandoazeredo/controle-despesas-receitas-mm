import { useEffect } from 'react'

function setNativeInputValue(input: HTMLInputElement, value: string) {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')
  descriptor?.set?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

export function DynamicAgreementInstallmentsEnhancer() {
  useEffect(() => {
    let cleanupLastRow: (() => void) | null = null

    function enhance() {
      cleanupLastRow?.()
      cleanupLastRow = null

      const sheet = document.querySelector('.labor-agreement-sheet') as HTMLElement | null
      if (!sheet) return

      const labels = Array.from(sheet.querySelectorAll('.labor-agreement-grid label')) as HTMLLabelElement[]
      const quantityLabel = labels.find((label) => label.querySelector('span')?.textContent?.trim() === 'Número de parcelas')
      const quantityInput = quantityLabel?.querySelector('input[type="number"]') as HTMLInputElement | null
      if (quantityLabel) quantityLabel.style.display = 'none'

      const table = sheet.querySelector('.labor-installments-table') as HTMLElement | null
      if (table && !sheet.querySelector('.labor-dynamic-note')) {
        const note = document.createElement('div')
        note.className = 'labor-dynamic-note'
        note.textContent = 'As parcelas são dinâmicas: ao preencher a última linha, uma nova linha será criada automaticamente.'
        table.insertAdjacentElement('beforebegin', note)
      }

      const rows = Array.from(sheet.querySelectorAll('.labor-installment-row:not(.head)')) as HTMLElement[]
      const lastRow = rows.at(-1)
      if (!lastRow || !quantityInput) return

      let expanded = false
      const handler = () => {
        if (expanded) return
        const inputs = Array.from(lastRow.querySelectorAll('input')) as HTMLInputElement[]
        const hasStarted = inputs.some((input) => input.value.trim() !== '')
        if (!hasStarted) return
        const current = Number(quantityInput.value) || rows.length
        if (current >= 60) return
        expanded = true
        setNativeInputValue(quantityInput, String(current + 1))
      }

      const inputs = Array.from(lastRow.querySelectorAll('input')) as HTMLInputElement[]
      inputs.forEach((input) => input.addEventListener('input', handler))
      inputs.forEach((input) => input.addEventListener('change', handler))
      cleanupLastRow = () => {
        inputs.forEach((input) => input.removeEventListener('input', handler))
        inputs.forEach((input) => input.removeEventListener('change', handler))
      }
    }

    enhance()
    const observer = new MutationObserver(enhance)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      cleanupLastRow?.()
      observer.disconnect()
    }
  }, [])

  return null
}
