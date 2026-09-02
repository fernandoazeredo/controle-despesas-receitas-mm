import { useEffect } from 'react'

const NEW_LOGO = '/logo-mm.svg'
const OLD_NAMES = [
  'FLÁVIO MARQUES ADVOGADOS ASSOCIADOS',
  'FLAVIO MARQUES ADVOGADOS ASSOCIADOS',
  'Flávio Marques Advogados Associados',
  'Flavio Marques Advogados Associados',
]
const NEW_NAME = 'MARQUES & MÜLLER ADVOGADOS ASSOCIADOS'

function replaceBrandText(value: string) {
  let next = OLD_NAMES.reduce((current, oldName) => current.split(oldName).join(NEW_NAME), value)
  next = next.split('Depósito na conta da MM').join('Depósito na conta da Marques & Müller')
  return next
}

export function BrandIdentityMMEnhancer() {
  useEffect(() => {
    function applyBrand() {
      if (document.title.includes('Flávio Marques') || document.title.includes('Flavio Marques')) {
        document.title = 'Controle de Despesas e Receitas | Marques & Müller Advogados Associados'
      }

      const images = Array.from(document.querySelectorAll('img')) as HTMLImageElement[]
      for (const image of images) {
        const src = image.getAttribute('src') ?? ''
        const isBrandImage = src.includes('logo-fm') || src.includes('logo-mm') || image.closest('.auth-brand-panel, .brand-logo-only, .mobile-header-brand')
        if (!isBrandImage) continue
        if (src !== NEW_LOGO) image.setAttribute('src', NEW_LOGO)
        image.setAttribute('alt', 'Marques & Müller Advogados Associados')
      }

      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      let node = walker.nextNode()
      while (node) {
        const textNode = node as Text
        const current = textNode.nodeValue ?? ''
        const replaced = replaceBrandText(current)
        if (replaced !== current) textNode.nodeValue = replaced
        node = walker.nextNode()
      }

      const inputs = Array.from(document.querySelectorAll('input')) as HTMLInputElement[]
      for (const input of inputs) {
        const label = input.closest('label')?.querySelector('span')?.textContent?.trim()
        let replacement: string | null = null
        if (label === 'Razão Social' && OLD_NAMES.includes(input.value)) replacement = NEW_NAME
        else if (input.value === 'Depósito na conta da MM') replacement = 'Depósito na conta da Marques & Müller'
        else {
          const branded = replaceBrandText(input.value)
          if (branded !== input.value) replacement = branded
        }
        if (replacement !== null) {
          const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')
          descriptor?.set?.call(input, replacement)
          input.dispatchEvent(new Event('input', { bubbles: true }))
          input.dispatchEvent(new Event('change', { bubbles: true }))
        }
      }

      if (window.location.pathname === '/alvaras') {
        const heading = document.querySelector('.page-heading h1')
        if (heading?.textContent?.trim() === 'Recebimento de Alvarás') heading.textContent = 'Recebimento de Alvarás e Acordos'
        const description = document.querySelector('.page-heading p')
        if (description) description.textContent = 'Cadastre e acompanhe recebimentos de Alvarás e Acordos Trabalhistas, informe a conta de recebimento e encaminhe os documentos para a Tesouraria.'
        const head = document.querySelector('.receivable-integrated-table .data-head')
        const columns = head ? Array.from(head.children) as HTMLElement[] : []
        const last = columns.at(-1)
        if (last?.textContent?.trim() === 'Valor') last.textContent = 'Recebido'
      }
    }

    applyBrand()
    const observer = new MutationObserver(applyBrand)
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['src', 'value'] })
    window.addEventListener('popstate', applyBrand)
    window.addEventListener('hashchange', applyBrand)

    return () => {
      observer.disconnect()
      window.removeEventListener('popstate', applyBrand)
      window.removeEventListener('hashchange', applyBrand)
    }
  }, [])

  return null
}
