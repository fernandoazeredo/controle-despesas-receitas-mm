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
      <article className="tip expense-tip"><ReceiptText /><h3>Despesa</h3><p><strong>Operação/Tesouraria → Nova Despesa → preencher demonstrativo → classificar no Plano de Contas, se desejar → enviar para aprovação.</strong> Somente o Diretor Flávio Marques pode aprovar, devolver para correção ou rejeitar. Se devolvida, a operação corrige e reenvia; depois a Tesouraria executa pagamento e arquivo.</p></article>
      <article className="tip revenue-tip"><BadgeDollarSign /><h3>Receita / Alvará</h3><p><strong>Área de origem → Nova Receita → preencher o demonstrativo completo → classificar em uma conta 3.xx → enviar à Tesouraria.</strong> A Tesouraria recebe o documento pronto e encerra a operação após a conferência do crédito e a execução dos repasses aplicáveis.</p></article>
      <article className="tip"><FileCheck2 /><h3>Autorização</h3><p><strong>Flávio Marques é o único Diretor autorizador.</strong> Aprovado conta na Dashboard; Devolvido volta para correção; Rejeitado sai do fluxo financeiro. Devolução e rejeição exigem justificativa e ficam registradas na Auditoria.</p></article>
      <article className="tip"><BookOpenCheck /><h3>Plano de Contas</h3><p>O plano está integrado aos lançamentos: Despesas pesquisa contas finais <strong>4.xx</strong> e Receitas/Alvarás contas finais <strong>3.xx</strong>. O Administrador Master pode <strong>baixar o TXT</strong>, corrigir e <strong>fazer upload do mesmo arquivo</strong>.</p></article>
      <article className="tip"><Users /><h3>Usuários — padrão @ Kit Fernando</h3><p>Não existe convite obrigatório. O usuário solicita cadastro e fica <strong>Pendente</strong>. Perfis oficiais: Fernando = <strong>Administrador Master</strong>; Flávio = <strong>Diretor/Autorizador</strong>; Reinaldo = <strong>Gerente</strong>; Socorro = <strong>Tesouraria</strong>; demais = <strong>Colaborador/Operador</strong>.</p></article>
      <article className="tip"><Calculator /><h3>Contabilidade</h3><p>Escolha competência e movimento, confira quantidades e valores. <strong>Baixar ZIP</strong> gera o pacote contábil no navegador; <strong>Gerar link para Contabilidade</strong> envia o mesmo ZIP ao Firebase Storage; <strong>Enviar Movimento</strong> registra o fechamento no histórico.</p></article>
      <article className="tip"><ShieldCheck /><h3>Auditoria</h3><p>Envios, autorizações, devoluções, rejeições, correções, alterações de usuários, atualizações do Plano de Contas e geração de pacotes contábeis ficam registrados.</p></article>
      <article className="tip"><Paperclip /><h3>Documentos</h3><p>O Firebase Storage está ativo no projeto Blaze. O pacote contábil já usa o Storage; a conexão dos uploads de boletos, notas, alvarás, comprovantes e PDFs aos formulários será tratada separadamente.</p></article>
    </div>

    <section className="page-card help-situations-card">
      <h2>O que fazer em cada situação</h2>
      <div className="help-situation-list">
        <div><AlertTriangle /><span><strong>Despesa devolvida:</strong> abra Despesas → Corrigir e reenviar → ajuste o que foi solicitado → Reenviar para Aprovação.</span></div>
        <div><BadgeCheck /><span><strong>Despesa aprovada:</strong> a autorização é exclusiva do Diretor Flávio Marques e, depois de aprovada, passa a compor o total de Despesas e o Saldo/Resultado da Dashboard.</span></div>
        <div><RefreshCw /><span><strong>Valor do alvará mudou:</strong> ajuste o Valor Líquido do Alvará; percentuais e valores vinculados são recalculados conforme o último campo editado.</span></div>
        <div><BookOpenCheck /><span><strong>Precisa classificar um lançamento:</strong> digite parte do código ou nome da conta no próprio formulário. A busca consulta o Plano de Contas sincronizado e restringe o tipo correto.</span></div>
        <div><UserCheck /><span><strong>Novo usuário:</strong> envie apenas o link do sistema → usuário solicita cadastro → aparece como Pendente → Administrador Master libera o acesso. Os demais colaboradores entram como Operador.</span></div>
        <div><FolderArchive /><span><strong>Precisa enviar movimento ao contador:</strong> abra Contabilidade → escolha competência/filtros → Baixar ZIP ou Gerar link para Contabilidade → registre o envio no histórico.</span></div>
      </div>
    </section>
  </>
}

export function HowToPageEnhanced() {
  const steps = [
    ['1', 'Entrar no sistema', 'Acesse com e-mail/senha ou Google. No primeiro acesso, o próprio usuário solicita o cadastro e fica Pendente até a liberação do Administrador Master.'],
    ['2', 'Entender os perfis', 'Fernando é o Administrador Master do sistema; Flávio Marques é o Diretor e único autorizador; Reinaldo é Gerente; Socorro é Tesouraria; os demais usuários entram como Colaborador/Operador.'],
    ['3', 'Cadastrar uma despesa', 'Operação ou Tesouraria abre Nova Despesa, preenche o demonstrativo e, se desejar, classifica o lançamento pesquisando uma conta final 4.xx do Plano de Contas. Depois envia para aprovação.'],
    ['4', 'Acompanhar o status', 'Rascunho, Enviado para Aprovação, Em Análise, Aprovado, Devolvido p/ Correção, Rejeitado, Pago e Arquivado ficam visíveis no próprio módulo.'],
    ['5', 'Autorizar uma despesa', 'Somente o Diretor Flávio Marques pode Aprovar, Devolver ou Rejeitar. O Administrador Master pode acompanhar a fila em modo consulta, mas não executa autorização financeira.'],
    ['6', 'Corrigir uma devolução', 'Em Despesas, localize o status Devolvido p/ Correção, clique Corrigir e reenviar, faça os ajustes e envie novamente.'],
    ['7', 'Cadastrar uma receita / alvará', 'A área de origem preenche o demonstrativo completo, escolhe uma conta final 3.xx do Plano de Contas e envia o documento pronto à Tesouraria. Percentual e valor permanecem vinculados e o líquido do cliente é calculado automaticamente.'],
    ['8', 'Tratar a receita na Tesouraria', 'A Tesouraria recebe o demonstrativo pronto, confirma o recebimento e encerra a operação depois da conferência do crédito, dos repasses aplicáveis e dos comprovantes.'],
    ['9', 'Consultar a Dashboard', 'Receitas ficam em azul, despesas em vermelho e saldo em verde. Somente despesas aprovadas entram no cálculo. Os cards da Dashboard funcionam como atalhos para os respectivos módulos.'],
    ['10', 'Usar e manter o Plano de Contas', 'Os formulários consultam o plano sincronizado no Firestore. O Administrador Master pode baixar o Plano de Contas em TXT, corrigir o arquivo e subir o mesmo TXT.'],
    ['11', 'Gerenciar usuários — @ Kit Fernando', 'Não há convite obrigatório. O usuário se cadastra sozinho e entra Pendente. O Administrador Master ativa, inativa ou bloqueia. Os quatro e-mails institucionais definidos recebem seus perfis oficiais; todos os demais entram como Operador.'],
    ['12', 'Fechar para a Contabilidade', 'Escolha a competência, unidade e movimento. Baixar ZIP gera resumo, CSV de despesas/receitas e JSON do movimento. Gerar link envia esse ZIP ao Firebase Storage e disponibiliza um link para compartilhamento. Enviar Movimento registra o fechamento no histórico.'],
    ['13', 'Consultar Auditoria e documentos', 'Use Auditoria para rastrear ações, inclusive autorizações, motivos de devolução/rejeição e geração de pacotes. O Firebase Storage já está ativo; os uploads documentais dos formulários serão conectados em etapa própria.'],
  ]

  return <>
    <Header eyebrow="Guia operacional" title="Como Usar" description="Passo a passo completo do fluxo financeiro, usuários, autorização, Plano de Contas e contabilidade." />
    <div className="howto-steps enhanced-howto">{steps.map(([number, title, text]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
    <section className="page-card tour-callout"><Lightbulb size={24} /><div><h2>Tour Guiado</h2><p>O conteúdo definitivo do tour será baseado nestas etapas. O recurso de holofote por botão continua pendente de conexão, mas DICAS e Como Usar já refletem o fluxo atual do sistema.</p></div></section>
  </>
}
