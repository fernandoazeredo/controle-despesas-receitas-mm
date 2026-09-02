import { useEffect } from 'react'

function setNativeInputValue(input: HTMLInputElement, value: string) {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')
  descriptor?.set?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

function rowValues(row: HTMLElement) {
  return Array.from(row.querySelectorAll('input')).map((input) => (input as HTMLInputElement).value)
}

function applyRowValues(row: HTMLElement, values: string[]) {
  const inputs = Array.from(row.querySelectorAll('input')) as HTMLInputElement[]
  inputs.forEach((input, index) => setNativeInputValue(input, values[index] ?? ''))
}

export function DynamicAgreementInstallmentsEnhancer() {
  useEffect(() => {
    function enhance() {
      const sheet = document.querySelector('.labor-agreement-sheet') as HTMLElement | null
      if (!sheet) return

      const labels = Array.from(sheet.querySelectorAll('.labor-agreement-grid label')) as HTMLLabelElement[]
      const quantityLabel = labels.find((label) => label.querySelector('span')?.textContent?.trim() === 'Número de parcelas')
      const quantityInput = quantityLabel?.querySelector('input[type="number"]') as HTMLInputElement | null
      if (!quantityInput) return
      if (quantityLabel) quantityLabel.style.display = 'none'

      const table = sheet.querySelector('.labor-installments-table') as HTMLElement | null
      if (!table) return

      const oldNote = sheet.querySelector('.labor-dynamic-note')
      oldNote?.remove()

      if (!sheet.querySelector('.labor-installments-toolbar')) {
        const toolbar = document.createElement('div')
        toolbar.className = 'labor-installments-toolbar'

        const info = document.createElement('span')
        info.textContent = 'Adicione somente as parcelas necessárias. As linhas não serão criadas automaticamente.'

        const addButton = document.createElement('button')
        addButton.type = 'button'
        addButton.className = 'revenue-button labor-add-installment-button'
        addButton.textContent = '+ Adicionar parcela'
        addButton.addEventListener('click', () => {
          const current = Number(quantityInput.value) || 1
          if (current >= 60) {
            window.alert('O limite é de 60 parcelas.')
            return
          }
          setNativeInputValue(quantityInput, String(current + 1))
        })

        toolbar.append(info, addButton)
        table.insertAdjacentElement('beforebegin', toolbar)
      }

      const head = table.querySelector('.labor-installment-row.head') as HTMLElement | null
      if (head && !head.querySelector('.labor-actions-head')) {
        const actionHead = document.createElement('span')
        actionHead.className = 'labor-actions-head'
        actionHead.textContent = 'Ações'
        head.appendChild(actionHead)
      }

      const rows = Array.from(table.querySelectorAll('.labor-installment-row:not(.head)')) as HTMLElement[]
      rows.forEach((row, rowIndex) => {
        if (row.querySelector('.labor-row-actions')) return

        const actions = document.createElement('div')
        actions.className = 'labor-row-actions'

        const editButton = document.createElement('button')
        editButton.type = 'button'
        editButton.className = 'labor-edit-row-button'
        editButton.textContent = 'Editar'
        editButton.title = `Editar parcela ${rowIndex + 1}`
        editButton.addEventListener('click', () => {
          const firstInput = row.querySelector('input') as HTMLInputElement | null
          firstInput?.focus()
          firstInput?.select?.()
          row.classList.add('labor-row-editing')
          window.setTimeout(() => row.classList.remove('labor-row-editing'), 1200)
        })

        const deleteButton = document.createElement('button')
        deleteButton.type = 'button'
        deleteButton.className = 'labor-delete-row-button'
        deleteButton.textContent = 'Excluir'
        deleteButton.title = `Excluir parcela ${rowIndex + 1}`
        deleteButton.addEventListener('click', () => {
          const currentRows = Array.from(table.querySelectorAll('.labor-installment-row:not(.head)')) as HTMLElement[]
          const currentIndex = currentRows.indexOf(row)
          if (currentIndex < 0) return

          const hasData = rowValues(row).some((value) => value.trim() !== '' && value.trim() !== '0,00')
          if (hasData && !window.confirm(`Excluir a parcela ${currentIndex + 1}? Os dados desta linha serão removidos.`)) return

          if (currentRows.length === 1) {
            applyRowValues(row, rowValues(row).map(() => ''))
            return
          }

          const allValues = currentRows.map(rowValues)
          allValues.splice(currentIndex, 1)

          for (let index = currentIndex; index < currentRows.length - 1; index += 1) {
            applyRowValues(currentRows[index], allValues[index] ?? [])
          }

          const current = Number(quantityInput.value) || currentRows.length
          setNativeInputValue(quantityInput, String(Math.max(1, current - 1)))
        })

        actions.append(editButton, deleteButton)
        row.appendChild(actions)
      })
    }

    enhance()
    const observer = new MutationObserver(enhance)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [])

  return null
}
