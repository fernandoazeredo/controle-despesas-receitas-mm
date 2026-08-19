import { useEffect } from 'react'

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

function enhanceAccountChoices() {
  document.querySelectorAll<HTMLElement>('.dre-account-choice').forEach((choice) => {
    const select = choice.querySelector<HTMLSelectElement>('select')
    const label = select?.closest('label')
    if (!select || !label || choice.querySelector('.dre-account-search')) return

    const wrapper = document.createElement('label')
    wrapper.className = 'dre-account-search'

    const caption = document.createElement('span')
    caption.textContent = 'Buscar conta por número ou nome'

    const input = document.createElement('input')
    input.type = 'search'
    input.placeholder = 'Ex.: 4.05.27 ou Telefonia'
    input.autocomplete = 'off'

    const hint = document.createElement('small')
    hint.textContent = 'Digite parte do código ou do nome para reduzir a lista abaixo.'

    input.addEventListener('input', () => {
      const needle = normalize(input.value)
      let visible = 0

      Array.from(select.options).forEach((option, index) => {
        if (index === 0) {
          option.hidden = false
          return
        }
        const matches = !needle || normalize(option.textContent ?? '').includes(needle) || normalize(option.value).includes(needle)
        option.hidden = !matches
        if (matches) visible += 1
      })

      hint.textContent = needle
        ? `${visible} conta(s) encontrada(s). Abra a lista para selecionar.`
        : 'Digite parte do código ou do nome para reduzir a lista abaixo.'
    })

    wrapper.append(caption, input, hint)
    choice.insertBefore(wrapper, label)
  })
}

export function DreAccountSearchEnhancer() {
  useEffect(() => {
    let scheduled = false
    const run = () => {
      scheduled = false
      enhanceAccountChoices()
    }
    const schedule = () => {
      if (scheduled) return
      scheduled = true
      requestAnimationFrame(run)
    }

    enhanceAccountChoices()
    const observer = new MutationObserver(schedule)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return null
}
