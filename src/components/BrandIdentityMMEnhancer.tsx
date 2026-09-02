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
  return OLD_NAMES.reduce((current, oldName) => current.split(oldName).join(NEW_NAME), value)
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
        if (label === 'Razão Social' && OLD_NAMES.includes(input.value)) {
          const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')
          descriptor?.set?.call(input, NEW_NAME)
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
