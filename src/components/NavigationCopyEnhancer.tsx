import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function applyNavigationCopy(pathname: string) {
  const revenueLink = document.querySelector<HTMLAnchorElement>('a.nav-link[href="/alvaras"]')
  const revenueLabel = revenueLink?.querySelector<HTMLElement>('span')
  if (revenueLabel) revenueLabel.textContent = 'Receitas'

  const approvalLink = document.querySelector<HTMLAnchorElement>('a.nav-link[href="/aprovacoes"]')
  if (approvalLink) approvalLink.classList.add('approval-attention-nav')

  if (pathname === '/alvaras') {
    const heading = document.querySelector<HTMLElement>('.main-content .page-heading')
    const title = heading?.querySelector<HTMLElement>('h1')
    const description = heading?.querySelector<HTMLElement>('p')
    if (title) title.textContent = 'Receitas'
    if (description) description.textContent = 'O departamento de origem registra os recebimentos, informa a conta em que o valor foi recebido e anexa os documentos que seguirão para a Tesouraria.'
  }
}

export function NavigationCopyEnhancer() {
  const location = useLocation()

  useEffect(() => {
    applyNavigationCopy(location.pathname)
    const timers = [0, 40, 120, 250].map((delay) => window.setTimeout(() => applyNavigationCopy(location.pathname), delay))
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [location.pathname])

  return null
}
