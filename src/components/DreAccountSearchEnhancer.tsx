import { useEffect } from 'react'

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

function selectAccount(select: HTMLSelectElement, input: HTMLInputElement) {
  const typed = normalize(input.value)
  if (!typed) return

  const options = Array.from(select.options).slice(1)
  const exact = options.find((option) => {
    const text = normalize(option.textContent ?? '')
    return normalize(option.value) === typed || text === typed
  })
  if (!exact) return

  if (select.value !== exact.value) {
    select.value = exact.value
    select.dispatchEvent(new Event('change', { bubbles: true }))
  }
  input.value = exact.textContent ?? exact.value
}

function enhanceAccountChoices() {
  document.querySelectorAll<HTMLElement>('.dre-account-choice').forEach((choice, index) => {
    const select = choice.querySelector<HTMLSelectElement>('select')
    const label = select?.closest('label')
    if (!select || !label) return

    let input = label.querySelector<HTMLInputElement>('.dre-account-combobox')
    let datalist = label.querySelector<HTMLDataListElement>('datalist.dre-account-datalist')

    if (!input) {
      const listId = `dre-account-options-${index}-${Math.random().toString(36).slice(2, 8)}`
      input = document.createElement('input')
      input.className = 'dre-account-combobox'
      input.type = 'text'
      input.setAttribute('list', listId)
      input.setAttribute('autocomplete', 'off')
      input.placeholder = 'Digite o número ou nome da conta'

      datalist = document.createElement('datalist')
      datalist.className = 'dre-account-datalist'
      datalist.id = listId

      const caption = label.querySelector('span')
      if (caption) caption.insertAdjacentElement('afterend', input)
      else label.prepend(input)
      label.appendChild(datalist)

      input.addEventListener('change', () => selectAccount(select!, input!))
      input.addEventListener('blur', () => {
        window.setTimeout(() => selectAccount(select!, input!), 0)
      })
    }

    select.style.display = 'none'
    select.setAttribute('aria-hidden', 'true')

    if (datalist) {
      datalist.replaceChildren(...Array.from(select.options).slice(1).map((option) => {
        const item = document.createElement('option')
        item.value = option.textContent ?? option.value
        return item
      }))
    }

    if (document.activeElement !== input) {
      const selected = select.selectedOptions[0]
      input.value = select.value && selected ? (selected.textContent ?? select.value) : ''
    }
  })
}

export function DreAccountSearchEnhancer() {
  useEffect(() => {
    let frame = 0
    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        enhanceAccountChoices()
      })
    }

    enhanceAccountChoices()
    const observer = new MutationObserver(schedule)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return null
}
