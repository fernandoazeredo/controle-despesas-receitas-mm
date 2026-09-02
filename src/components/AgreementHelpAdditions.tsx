import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { FileText, Handshake, Send } from 'lucide-react'
import { useLocation } from 'react-router-dom'

export function AgreementHelpAdditions() {
  const location = useLocation()
  const [host, setHost] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const onHelpPage = location.pathname === '/dicas' || location.pathname === '/como-usar'
    if (!onHelpPage) {
      setHost(null)
      return
    }

    const locate = () => {
      const main = document.querySelector<HTMLElement>('.main-content')
      if (!main) return false
      setHost(main)
      return true
    }

    if (locate()) return

    const observer = new MutationObserver(() => {
      if (locate()) observer.disconnect()
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [location.pathname])

  if (!host || (location.pathname !== '/dicas' && location.pathname !== '/como-usar')) return null

  return createPortal(
    <section className="page-card agreement-help-card" style={{ marginBottom: 16 }}>
      <span className="eyebrow">Novo fluxo de receitas</span>
      <h2>Acordo Trabalhista</h2>
      <p>Ao clicar em <strong>+ Nova Receita</strong>, escolha entre <strong>Alvará / Receita normal</strong> e <strong>Acordo Trabalhista</strong>. Cada opção abre seu formulário próprio.</p>
      <div className="help-situation-list" style={{ marginTop: 14 }}>
        <div><Handshake size={18} /><span><strong>Acordo Trabalhista:</strong> informe processo, partes, valor bruto do acordo, percentual de honorários, conta de recebimento e dados do cliente.</span></div>
        <div><FileText size={18} /><span><strong>Parcelas:</strong> use <strong>+ Adicionar parcela</strong> para incluir cada parcela. Preencha datas prevista e realizada, valor, honorários, deduções, líquido do cliente e data de contabilização.</span></div>
        <div><Send size={18} /><span><strong>Envio:</strong> anexe acordo e comprovantes, salve como rascunho quando necessário e envie à Tesouraria quando houver recebimento efetivo a confirmar.</span></div>
      </div>
    </section>,
    host,
  )
}
