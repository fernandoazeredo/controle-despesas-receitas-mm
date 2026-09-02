import { useEffect } from 'react'

const NEW_LOGO = '/logo-mm.png'

export function BrandIdentityMMEnhancer() {
  useEffect(() => {
    function applyLogo() {
      const images = Array.from(document.querySelectorAll('img')) as HTMLImageElement[]
      for (const image of images) {
        const src = image.getAttribute('src') ?? ''
        const isBrandImage = src.includes('logo-fm.svg') || image.closest('.auth-brand-panel, .brand-logo-only, .mobile-header-brand')
        if (!isBrandImage) continue
        if (src !== NEW_LOGO) image.setAttribute('src', NEW_LOGO)
        image.setAttribute('alt', 'Marques & Müller Advogados Associados')
      }
    }

    applyLogo()
    const observer = new MutationObserver(applyLogo)
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] })
    window.addEventListener('popstate', applyLogo)
    window.addEventListener('hashchange', applyLogo)

    return () => {
      observer.disconnect()
      window.removeEventListener('popstate', applyLogo)
      window.removeEventListener('hashchange', applyLogo)
    }
  }, [])

  return null
}
