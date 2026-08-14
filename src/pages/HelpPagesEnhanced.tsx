import {
  AlertTriangle,
  BadgeCheck,
  BadgeDollarSign,
  BookOpenCheck,
  Calculator,
  FileCheck2,
  FolderArchive,
  Lightbulb,
  Paperclip,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react'

function Header({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div></div>
}

export function TipsPageEnhanced() {
  return <>
    <Header eyebrow="Ajuda rápida" title="DICAS" description="Orientações objetivas para operar o Controle de Despesas e Receitas sem quebrar o fluxo financeiro." />

    <div className="tips-grid enhanced-tips-grid">
      <article className="tip expense-tip"><ReceiptText /><h3>Despesa</h3><p><strong>Tesouraria/Operador → Nova Despesa → preencher demonstrativo → classificar no Plano de Contas, se desejar → anexar documentos → enviar para aprovação.</strong> O Diretor aprova, devolve para correção ou rejeita. Se devolvida, a equipe corrige e reenvia; depois seguem pagamento e arquivo.</p></article>
      <article className="tip revenue-tip"><BadgeDollarSign /><h3>Receita / Alvará</h3><p><strong>Área de origem → Nova Receita → preencher o demonstrativo completo → classificar em uma conta 3.xx → enviar à Tesouraria.</strong> A Tesouraria recebe o documento pronto e encerra a operação após a conferência do crédito e a execução dos repasses aplicáveis.</p></article>
      <article className="tip"><FileCheck2 /><h3>Aprovação</h3><p><strong>Flávio Marques é o único autorizador financeiro.</strong> Aprovado conta na Dashboard; Devolvido volta para correção; Rejeitado sai do fluxo. Devolução e rejeição exigem justificativa e ficam registradas na Auditoria.</p></article>
      <article className="tip"><BookOpenCheck /><h3>Plano de Contas</h3><p>O plano está integrado aos lançamentos: Despesas pesquisa contas finais <strong>4.xx</strong> e Receitas/Alvarás contas finais <strong>3.xx</strong>. A página de manutenção é exclusiva do <strong>Administrador Master Fernando</strong>; os demais usuários apenas utilizam as contas nos lançamentos.</p></article>
      <article className="tip"><Users /><h3>Usuários — padrão @ Kit Fernando</h3><p>Não existe convite obrigatório. O próprio usuário solicita o cadastro e fica <strong>Pendente</strong>. Fernando libera o acesso. Perfis especiais: Flávio = Diretor/Autorizador; Reinaldo = Gerente; Socorro = Tesouraria; demais = Operador/Colaborador.</p></article>
      <article className="tip"><Calculator /><h3>Contabilidade</h3><p>Escolha competência e movimento, confira quantidades e valores. <strong>Baixar ZIP</strong> gera o pacote contábil; <strong>Gerar link</strong> envia o ZIP ao Firebase Storage; <strong>Enviar Movimento</strong> registra o fechamento no histórico.</p></article>
      <article className="tip"><ShieldCheck /><h3>Auditoria</h3><p>Envios, aprovações, devoluções, rejeições, correções, alterações de usuários, Plano de Contas e pacotes contábeis ficam registrados.</p></article>
      <article className="tip"><Paperclip /><h3>Documentos / Storage</h3><p>O Firebase Storage está <strong>ativo</strong>. Em Nova Despesa já é possível anexar boleto, nota fiscal, comprovante, PDF ou imagem; os anexos aparecem no <strong>Arquivo de Documentos</strong>.</p></article>
    </div>

    <section className="page-card help-situations-card">
      <h2>O que fazer em cada situação</h2>
      <div className="help-situation-list">
        <div><AlertTriangle /><span><strong>Despesa devolvida:</strong> abra Despesas → Corrigir e reenviar → ajuste o que foi solicitado → Reenviar para Aprovação.</span></div>
        <div><BadgeCheck /><span><strong>Despesa aprovada:</strong> ela passa a compor o total de Despesas e o Saldo/Resultado da Dashboard.</span></div>
        <div><RefreshCw /><span><strong>Valor do alvará mudou:</strong> ajuste o Valor Líquido do Alvará; percentuais e valores vinculados são recalculados conforme o último campo editado.</span></div>
        <div><BookOpenCheck /><span><strong>Precisa classificar um lançamento:</strong> digite parte do código ou nome da conta no próprio formulário. A busca usa o Plano de Contas salvo no Firestore.</span></div>
        <div><UserCheck /><span><strong>Novo usuário:</strong> usuário solicita cadastro → fica Pendente → Fernando libera como perfil correspondente → status Ativo.</span></div>
        <div><FolderArchive /><span><strong>Precisa localizar um anexo:</strong> abra Arquivo de Documentos e pesquise por processo, fornecedor, cliente, status ou nome do arquivo.</span></div>
      </div>
    </section>
  </>
}

export function HowToPageEnhanced() {
  const steps = [
    ['1', 'Entrar no sistema', 'Acesse com e-mail/senha ou Google. No primeiro acesso, o próprio usuário solicita o cadastro e fica Pendente até a liberação do Administrador Master.'],
    ['2', 'Perfis e responsabilidades', 'Fernando administra o sistema; Flávio é o único autorizador financeiro; Reinaldo atua como Gerente; Socorro atua na Tesouraria; os demais são Operadores/Colaboradores.'],
    ['3', 'Cadastrar uma despesa', 'Clique em Nova Despesa, preencha o demonstrativo, classifique em uma conta 4.xx se desejar e anexe os documentos comprobatórios no Firebase Storage.'],
    ['4', 'Acompanhar o status', 'Rascunho, Enviado para Aprovação, Em Análise, Aprovado, Devolvido p/ Correção, Rejeitado, Pago e Arquivado ficam visíveis no próprio módulo.'],
    ['5', 'Autorizar uma despesa', 'Somente o Diretor Flávio autoriza financeiramente. Ele pode Aprovar, Devolver ou Rejeitar; devolução e rejeição exigem justificativa e ficam na Auditoria.'],
    ['6', 'Corrigir uma devolução', 'Em Despesas, localize Devolvido p/ Correção, clique Corrigir e reenviar, faça os ajustes e envie novamente.'],
    ['7', 'Cadastrar uma receita / alvará', 'A área de origem preenche o demonstrativo completo, escolhe uma conta final 3.xx e envia o documento pronto à Tesouraria.'],
    ['8', 'Tratar a receita na Tesouraria', 'A Tesouraria recebe o demonstrativo pronto, confirma o recebimento e encerra a operação depois da conferência do crédito e dos repasses aplicáveis.'],
    ['9', 'Consultar a Dashboard', 'Receitas ficam em azul, despesas em vermelho e saldo em verde. Somente despesas aprovadas entram no cálculo. Os cards funcionam como atalhos para os módulos.'],
    ['10', 'Plano de Contas protegido', 'O Plano de Contas correto fica salvo no Firestore e é usado nos seletores dos lançamentos. A página de manutenção é exibida somente para Fernando, Administrador Master.'],
    ['11', 'Gerenciar usuários', 'Cada usuário solicita o próprio cadastro. Fernando visualiza os Pendentes, confere o perfil oficial e altera para Ativo, Inativo ou Bloqueado.'],
    ['12', 'Fechar para a Contabilidade', 'Escolha competência, unidade e movimento. Baixar ZIP gera o pacote; Gerar link grava no Storage; Enviar Movimento registra o fechamento no histórico.'],
    ['13', 'Consultar Auditoria e documentos', 'Use Auditoria para rastrear ações. O Arquivo de Documentos já mostra Storage ativo e centraliza os anexos gravados nas despesas.'],
  ]

  return <>
    <Header eyebrow="Guia operacional" title="Como Usar" description="Passo a passo completo do fluxo financeiro, usuários, aprovação, Plano de Contas, documentos e contabilidade." />
    <div className="howto-steps enhanced-howto">{steps.map(([number, title, text]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
    <section className="page-card tour-callout"><Lightbulb size={24} /><div><h2>Tour Guiado</h2><p>O conteúdo definitivo do tour será baseado nestas etapas. DICAS e Como Usar já refletem o fluxo atual do sistema.</p></div></section>
  </>
}
