import {
  AlertTriangle,
  BadgeCheck,
  BadgeDollarSign,
  BookOpenCheck,
  Calculator,
  FileCheck2,
  FolderArchive,
  Landmark,
  Lightbulb,
  Paperclip,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  Users,
  Wrench,
} from 'lucide-react'

function Header({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div></div>
}

export function TipsPageEnhanced() {
  return <>
    <Header eyebrow="Ajuda rápida" title="DICAS" description="Orientações objetivas para operar o Controle de Despesas e Receitas sem quebrar o fluxo financeiro." />

    <div className="tips-grid enhanced-tips-grid">
      <article className="tip expense-tip"><ReceiptText /><h3>Despesa</h3><p><strong>Tesouraria/Operador → Nova Despesa → preencher demonstrativo → classificar no Plano de Contas, se desejar → anexar documentos → enviar para aprovação.</strong> O Diretor aprova, devolve para correção ou rejeita. Se devolvida, a equipe corrige e reenvia; depois seguem pagamento e arquivo.</p></article>
      <article className="tip revenue-tip"><BadgeDollarSign /><h3>Receita / Alvará</h3><p><strong>Área de origem → Nova Receita → preencher o demonstrativo completo → classificar em uma conta 3.xx → anexar alvará/acordo e documentos → enviar à Tesouraria.</strong> Os anexos ficam disponíveis para o pacote mensal da Contabilidade.</p></article>
      <article className="tip"><FileCheck2 /><h3>Aprovação</h3><p><strong>Flávio Marques é o único autorizador financeiro.</strong> Todos os usuários ativos podem acompanhar a fila; somente o Diretor pode Aprovar, Devolver ou Rejeitar. As decisões ficam registradas na Auditoria.</p></article>
      <article className="tip"><BookOpenCheck /><h3>Plano de Contas</h3><p>Despesas pesquisam contas finais <strong>4.xx</strong> e Receitas/Alvarás contas finais <strong>3.xx</strong>. A página de manutenção é exclusiva do <strong>Administrador Master Fernando</strong>.</p></article>
      <article className="tip"><Users /><h3>Usuários</h3><p>O próprio usuário solicita o cadastro e fica <strong>Pendente</strong>. Fernando libera o acesso. Perfis especiais: Flávio = Diretor/Autorizador; Reinaldo = Gerente; Socorro = Tesouraria; demais = Operador/Colaborador.</p></article>
      <article className="tip"><Calculator /><h3>Contabilidade</h3><p>Escolha competência, unidade e movimento, anexe o <strong>extrato consolidado do banco</strong> e clique em <strong>Baixar ZIP completo</strong>. O ZIP leva uma planilha Excel, o extrato e todos os documentos disponíveis de despesas e receitas.</p></article>
      <article className="tip"><Landmark /><h3>Extrato bancário</h3><p>O extrato consolidado mensal é obrigatório para o pacote contábil. Aceita PDF, OFX, CSV e Excel e fica associado à competência/unidade selecionada.</p></article>
      <article className="tip"><ShieldCheck /><h3>Auditoria</h3><p>Envios, aprovações, devoluções, rejeições, correções, alterações de usuários, extrato bancário, Plano de Contas e pacotes contábeis ficam registrados.</p></article>
      <article className="tip"><Paperclip /><h3>Documentos / Storage</h3><p>O Firebase Storage está <strong>ativo</strong>. Despesas e Receitas/Alvarás aceitam anexos, e o <strong>Arquivo de Documentos</strong> centraliza os arquivos gravados.</p></article>
      <article className="tip"><Wrench /><h3>Utilitários</h3><p>Somente Fernando acessa o menu Utilitários. Ali é possível baixar backup JSON, restaurar esse JSON e executar a limpeza total preservando os usuários.</p></article>
    </div>

    <section className="page-card help-situations-card">
      <h2>O que fazer em cada situação</h2>
      <div className="help-situation-list">
        <div><AlertTriangle /><span><strong>Despesa devolvida:</strong> abra Despesas → Corrigir e reenviar → ajuste o que foi solicitado → Reenviar para Aprovação.</span></div>
        <div><BadgeCheck /><span><strong>Despesa aprovada:</strong> ela passa a compor o total de Despesas e o Saldo/Resultado da Dashboard.</span></div>
        <div><RefreshCw /><span><strong>Valor do alvará mudou:</strong> ajuste o Valor Líquido do Alvará; percentuais e valores vinculados são recalculados conforme o último campo editado.</span></div>
        <div><BookOpenCheck /><span><strong>Precisa classificar um lançamento:</strong> digite parte do código ou nome da conta no próprio formulário.</span></div>
        <div><UserCheck /><span><strong>Novo usuário:</strong> usuário solicita cadastro → fica Pendente → Fernando libera como perfil correspondente → status Ativo.</span></div>
        <div><FolderArchive /><span><strong>Precisa localizar um anexo:</strong> abra Arquivo de Documentos e pesquise por processo, fornecedor, cliente, status ou nome do arquivo.</span></div>
        <div><Calculator /><span><strong>Fechamento mensal:</strong> Contabilidade → escolha competência → anexe extrato consolidado → confira pendências → Baixar ZIP completo.</span></div>
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
    ['5', 'Autorizar uma despesa', 'Todos os usuários ativos podem consultar Aprovações. Somente o Diretor Flávio pode Aprovar, Devolver ou Rejeitar.'],
    ['6', 'Corrigir uma devolução', 'Em Despesas, localize Devolvido p/ Correção, clique Corrigir e reenviar, faça os ajustes e envie novamente.'],
    ['7', 'Cadastrar uma receita / alvará', 'A área de origem preenche o demonstrativo completo, escolhe uma conta final 3.xx, anexa alvará/acordo e documentos do processo e envia à Tesouraria.'],
    ['8', 'Tratar a receita na Tesouraria', 'A Tesouraria recebe o demonstrativo pronto, confirma o recebimento e encerra a operação depois da conferência do crédito e dos repasses aplicáveis.'],
    ['9', 'Consultar a Dashboard', 'Receitas ficam em azul, despesas em vermelho e saldo em verde. Somente despesas aprovadas entram no cálculo. Os cards Receitas, Despesas e Aguardando Aprovação funcionam como atalhos; Saldo/Resultado é apenas informativo.'],
    ['10', 'Plano de Contas protegido', 'O Plano de Contas correto fica salvo no Firestore e é usado nos seletores dos lançamentos. A página de manutenção é exibida somente para Fernando, Administrador Master.'],
    ['11', 'Gerenciar usuários', 'Cada usuário solicita o próprio cadastro. Fernando visualiza os Pendentes, confere o perfil oficial e altera para Ativo, Inativo ou Bloqueado.'],
    ['12', 'Preparar o fechamento contábil', 'Em Contabilidade, escolha competência, unidade e movimento e anexe o extrato consolidado do banco. O sistema mostra quantas despesas, receitas e documentos estão aptos e sinaliza lançamentos sem anexo.'],
    ['13', 'Baixar o pacote da Contabilidade', 'Clique em Baixar ZIP completo. O pacote contém uma planilha Excel com Resumo, Despesas, Receitas, Documentos e Pendências, além do extrato bancário e dos anexos das despesas/receitas.'],
    ['14', 'Backup e restauração', 'No menu Utilitários, exclusivo do Master, Baixar backup JSON salva os dados do Firestore e Fazer upload do JSON restaura um backup gerado pelo próprio sistema.'],
    ['15', 'Limpeza total', 'Utilitários → Limpeza total remove os dados do sistema e preserva os usuários. Antes da exclusão, o sistema baixa automaticamente um backup JSON e exige a frase APAGAR TUDO.'],
    ['16', 'Consultar Auditoria e documentos', 'Use Auditoria para rastrear ações e Arquivo de Documentos para localizar os anexos de despesas e receitas.'],
  ]

  return <>
    <Header eyebrow="Guia operacional" title="Como Usar" description="Passo a passo completo do fluxo financeiro, usuários, aprovação, documentos, backup e contabilidade." />
    <div className="howto-steps enhanced-howto">{steps.map(([number, title, text]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
    <section className="page-card tour-callout"><Lightbulb size={24} /><div><h2>Tour Guiado</h2><p>O conteúdo definitivo do tour será baseado nestas etapas. DICAS e Como Usar já refletem o fluxo atual do sistema.</p></div></section>
  </>
}
