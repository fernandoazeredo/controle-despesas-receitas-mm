import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { FileText, Handshake, Plus, ReceiptText, X } from 'lucide-react'

export function RevenueTypeChooser() {
  const [actionsTarget, setActionsTarget] = useState<HTMLElement | null>(null)
  const [standardButton, setStandardButton] = useState<HTMLButtonElement | null>(null)
  const [agreementButton, setAgreementButton] = useState<HTMLButtonElement | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function locate() {
      if (window.location.pathname !== '/alvaras') {
        setActionsTarget(null)
        return
      }
      const actions = document.querySelector('.page-heading .quick-actions') as HTMLElement | null
      if (!actions) return

      const buttons = Array.from(actions.querySelectorAll('button')) as HTMLButtonElement[]
      const standard = buttons.find((button) => button.textContent?.trim().includes('Nova Receita') && !button.classList.contains('revenue-type-chooser-button')) ?? null
      const agreement = buttons.find((button) => button.classList.contains('labor-agreement-launch-button')) ?? null

      if (standard) standard.style.display = 'none'
      if (agreement) agreement.style.display = 'none'

      setActionsTarget(actions)
      setStandardButton(standard)
      setAgreementButton(agreement)
    }

    locate()
    const observer = new MutationObserver(locate)
    observer.observe(document.body, { childList: true, subtree: true })
    window.addEventListener('popstate', locate)
    return () => {
      observer.disconnect()
      window.removeEventListener('popstate', locate)
    }
  }, [])

  function openStandard() {
    setOpen(false)
    standardButton?.click()
  }

  function openAgreement() {
    setOpen(false)
    agreementButton?.click()
  }

  return <>
    {actionsTarget && createPortal(
      <button className="revenue-button revenue-type-chooser-button" type="button" onClick={() => setOpen(true)}>
        <Plus size={18} /> Nova Receita
      </button>,
      actionsTarget,
    )}

    {open && createPortal(
      <div className="modal-backdrop revenue-type-backdrop">
        <section className="decision-modal revenue-type-modal" role="dialog" aria-modal="true" aria-label="Escolher tipo de receita">
          <div className="modal-toolbar">
            <div><span className="eyebrow revenue-text">Nova Receita</span><h2>Qual é o tipo de recebimento?</h2></div>
            <button className="icon-button" type="button" onClick={() => setOpen(false)} aria-label="Fechar"><X size={20} /></button>
          </div>
          <p className="revenue-type-helper">Escolha o fluxo correto. Cada opção abre o formulário próprio e mantém os lançamentos dentro do mesmo módulo de Receitas.</p>
          <div className="revenue-type-options">
            <button type="button" className="revenue-type-option" onClick={openStandard} disabled={!standardButton}>
              <span className="revenue-type-icon"><ReceiptText size={25} /></span>
              <span><strong>Alvará / Receita normal</strong><small>Recebimento de alvará ou valor único, com o demonstrativo já utilizado no sistema.</small></span>
            </button>
            <button type="button" className="revenue-type-option agreement" onClick={openAgreement} disabled={!agreementButton}>
              <span className="revenue-type-icon"><Handshake size={25} /></span>
              <span><strong>Acordo Trabalhista</strong><small>Controle próprio do acordo, com parcelas, datas previstas e realizadas, honorários, deduções e líquido do cliente.</small></span>
            </button>
          </div>
          <div className="revenue-type-note"><FileText size={16} /> O acordo trabalhista segue o formulário específico informado pelo Jurídico.</div>
        </section>
      </div>,
      document.body,
    )}
  </>
}
