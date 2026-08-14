import {
  AlertTriangle,
  BadgeCheck,
  BadgeDollarSign,
  BookOpenCheck,
  Calculator,
  FileCheck2,
  FolderArchive,
  Lightbulb,
  MailPlus,
  Paperclip,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  Users,
} from 'lucide-react'

function Header({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div></div>
}

export function TipsPageEnhanced() {
  return <>
    <Header eyebrow="Ajuda rápida" title="DICAS" description="Orientações objetivas para operar o Controle de Despesas e Receitas sem quebrar o fluxo financeiro." />

    <div className="tips-grid enhanced-tips-grid">
      <article className="tip expense-tip"><ReceiptText /><h3>Despesa</h3><p><strong>Tesouraria → Nova Despesa → preencher demonstrativo → classificar no Plano de Contas, se desejar → enviar para aprovação.</strong> A Diretoria aprova, devolve para correção ou rejeita. Se devolvida, a Tesouraria corrige e reenvia; depois seguem pagamento e arquivo.</p></article>
      <article className="tip revenue-tip"><BadgeDollarSign /><h3>Receita / Alvará</h3><p><strong>Área de origem → Nova Receita → preencher o demonstrativo completo → classificar em uma conta 3.xx → enviar à Tesouraria.</strong> A Tesouraria recebe o documento pronto e encerra a operação após a conferência do crédito e a execução dos repasses aplicáveis.</p></article>
      <article className="tip"><FileCheck2 /><h3>Aprovação</h3><p><strong>Aprovado</strong> conta na Dashboard. <strong>Devolvido</strong> volta para correção. <strong>Rejeitado</strong> sai do fluxo financeiro. Devolução e rejeição exigem justificativa, que fica registrada na Auditoria.</p></article>
      <article className="tip"><BookOpenCheck /><h3>Plano de Contas</h3><p>O Plano de Contas oficial está integrado aos lançamentos. Em Despesas, a busca mostra apenas contas finais <strong>4.xx</strong>; em Receitas/Alvarás, apenas contas finais <strong>3.xx</strong>. Pesquise por código, nome ou DRE.</p></article>
      <article className="tip"><Users /><h3>Usuários</h3><p>Use <strong>Convidar usuário</strong>. A pessoa cria a própria senha, aparece como Pendente e só acessa o sistema depois de o administrador definir perfil e ativar o cadastro.</p></article>
      <article className="tip"><Calculator /><h3>Contabilidade</h3><p>Escolha competência e movimento, confira quantidades e valores e registre o envio. ZIP e link seguro serão habilitados quando o Storage estiver ativo.</p></article>
      <article className="tip"><ShieldCheck /><h3>Auditoria</h3><p>Envios, aprovações, devoluções, rejeições, correções, convites e demais eventos ficam registrados. O motivo de devolução ou rejeição aparece no próprio log.</p></article>
      <article className="tip"><Paperclip /><h3>Documentos</h3><p>O dossiê digital receberá boletos, notas, alvarás, comprovantes e PDFs assim que o Firebase Storage estiver disponível no projeto.</p></article>
    </div>

    <section className="page-card help-situations-card">
      <h2>O que fazer em cada situação</h2>
      <div className="help-situation-list">
        <div><AlertTriangle /><span><strong>Despesa devolvida:</strong> abra Despesas → Corrigir e reenviar → ajuste o que foi solicitado → Reenviar para Aprovação.</span></div>
        <div><BadgeCheck /><span><strong>Despesa aprovada:</strong> ela passa a compor o total de Despesas e o Saldo/Resultado da Dashboard.</span></div>
        <div><RefreshCw /><span><strong>Valor do alvará mudou:</strong> ajuste o Valor Líquido do Alvará; percentuais e valores vinculados são recalculados conforme o último campo editado.</span></div>
        <div><BookOpenCheck /><span><strong>Precisa classificar um lançamento:</strong> digite parte do código ou nome da conta no próprio formulário. A busca consulta o Plano de Contas sincronizado e restringe o tipo correto.</span></div>
        <div><MailPlus /><span><strong>Novo usuário:</strong> registre o convite → envie o link → aguarde o cadastro → defina perfil → mude o status para Ativo.</span></div>
        <div><FolderArchive /><span><strong>Precisa localizar um lançamento:</strong> use Despesas, Receitas ou Arquivo de Documentos e pesquise por responsável, fornecedor, processo, código da conta ou status.</span></div>
      </div>
    </section>
  </>
}

export function HowToPageEnhanced() {
  const steps = [
    ['1', 'Entrar no sistema', 'Acesse com e-mail/senha ou Google. Usuários novos precisam de cadastro aprovado pelo administrador.'],
    ['2', 'Escolher o módulo correto', 'Tesouraria usa Despesas; área de origem usa Recebimento de Alvarás; Diretoria usa Aprovações; Contabilidade usa o fechamento mensal.'],
    ['3', 'Cadastrar uma despesa', 'Clique em Nova Despesa, preencha o demonstrativo e, se desejar, classifique o lançamento pesquisando uma conta final 4.xx do Plano de Contas. Depois envie para aprovação.'],
    ['4', 'Acompanhar o status', 'Rascunho, Enviado para Aprovação, Em Análise, Aprovado, Devolvido p/ Correção, Rejeitado, Pago e Arquivado ficam visíveis no próprio módulo.'],
    ['5', 'Analisar uma despesa', 'Na Diretoria, escolha Aprovar, Devolver ou Rejeitar. Devolução e rejeição abrem um modal próprio, exigem justificativa e ficam registradas na Auditoria.'],
    ['6', 'Corrigir uma devolução', 'Em Despesas, localize o status Devolvido p/ Correção, clique Corrigir e reenviar, faça os ajustes e envie novamente.'],
    ['7', 'Cadastrar uma receita / alvará', 'A área de origem preenche o demonstrativo completo, escolhe uma conta final 3.xx do Plano de Contas e envia o documento pronto à Tesouraria. Percentual e valor permanecem vinculados e o líquido do cliente é calculado automaticamente.'],
    ['8', 'Tratar a receita na Tesouraria', 'A Tesouraria recebe o demonstrativo pronto, confirma o recebimento e encerra a operação depois da conferência do crédito, dos repasses aplicáveis e dos comprovantes.'],
    ['9', 'Consultar a Dashboard', 'Receitas ficam em azul, despesas em vermelho e saldo em verde. Somente despesas aprovadas entram no cálculo. Os cards Despesas e Aguardando Aprovação levam diretamente aos respectivos módulos.'],
    ['10', 'Usar o Plano de Contas', 'O plano oficial possui contas de receita, despesa e patrimoniais/dívidas. Os formulários consultam diretamente o plano sincronizado no Firestore, com busca por código, nome ou DRE.'],
    ['11', 'Fechar para a Contabilidade', 'Escolha a competência, confira despesas e receitas aptas e registre o envio. O histórico fica salvo. ZIP/link aguardam o Storage.'],
    ['12', 'Gerenciar usuários', 'Abra Usuários e Permissões, convide o usuário, aguarde o primeiro cadastro, escolha o perfil adequado e ative ou bloqueie conforme necessário.'],
    ['13', 'Consultar Auditoria e documentos', 'Use Auditoria para rastrear ações, inclusive motivos de devolução/rejeição, e o Arquivo de Documentos para localizar dossiês. Anexos serão habilitados com o Storage.'],
  ]

  return <>
    <Header eyebrow="Guia operacional" title="Como Usar" description="Passo a passo completo do fluxo financeiro, de usuários, aprovação, Plano de Contas e contabilidade." />
    <div className="howto-steps enhanced-howto">{steps.map(([number, title, text]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
    <section className="page-card tour-callout"><Lightbulb size={24} /><div><h2>Tour Guiado</h2><p>O conteúdo definitivo do tour será baseado nestas etapas. O recurso de holofote por botão continua pendente de conexão, mas DICAS e Como Usar já refletem o fluxo atual do sistema.</p></div></section>
  </>
}
