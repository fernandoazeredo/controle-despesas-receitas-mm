import {
  AlertTriangle,
  BadgeCheck,
  BadgeDollarSign,
  BookOpenCheck,
  Calculator,
  DatabaseBackup,
  FileCheck2,
  FileText,
  FolderArchive,
  Landmark,
  LayoutDashboard,
  Lightbulb,
  Paperclip,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
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
      <article className="tip expense-tip"><ReceiptText /><h3>Despesa</h3><p><strong>Tesouraria/Operador → Nova Despesa → preencher demonstrativo → classificar no Plano de Contas, se desejar → anexar documentos → enviar para aprovação.</strong> Depois do envio, a despesa segue para a fila de Aprovações.</p></article>
      <article className="tip revenue-tip"><BadgeDollarSign /><h3>Receita / Alvará</h3><p><strong>Área de origem → Nova Receita → preencher o demonstrativo completo → anexar alvará/acordo e documentos → enviar à Tesouraria.</strong> O recebimento do Alvará não passa pela fila de Aprovações: a Tesouraria confirma o crédito e o evento fica registrado na Auditoria.</p></article>
      <article className="tip"><Calculator /><h3>Composição do Alvará</h3><p>O demonstrativo possui campos para impostos, honorários, despesas, <strong>duas linhas gerais de Outras Deduções / Participações</strong> e uma linha específica com <strong>nome do agente/beneficiário</strong> quando houver comissão.</p></article>
      <article className="tip"><RefreshCw /><h3>Percentuais e valores</h3><p>Valores monetários usam o padrão <strong>1.000,00</strong>. Percentuais ficam com <strong>duas casas decimais</strong> e seguem a regra definida: terceira casa de 0 a 5 desce; de 6 a 9 sobe.</p></article>
      <article className="tip"><BadgeDollarSign /><h3>Repasse de Alvarás</h3><p>Depois que a Tesouraria confirma o recebimento, o valor líquido devido ao cliente aparece automaticamente em <strong>Repasse de Alvarás</strong>. Programe à vista ou parcelado, envie para aprovação e registre cada pagamento pela data efetiva.</p></article>
      <article className="tip"><Users /><h3>Comissões de Agentes</h3><p>Se o Demonstrativo tiver valor em <strong>Outras Deduções / Participações</strong> e nome do agente, a obrigação aparece automaticamente em Comissões de Agentes. Antes do pagamento é possível lançar <strong>uma ou mais deduções</strong>, com data, histórico e valor. O sistema calcula automaticamente <strong>Comissão Bruta - Deduções = Valor Líquido a Pagar</strong> e parcela somente o líquido.</p></article>
      <article className="tip"><FileText /><h3>Nota Fiscal</h3><p>O menu Nota Fiscal reaproveita automaticamente cliente, CPF, e-mail, endereço, processo e valor dos Honorários do Escritório. O extrato mostra <strong>Status NFS-e, Nº NFSe e Data</strong>.</p></article>
      <article className="tip"><FileCheck2 /><h3>Aprovação</h3><p><strong>Flávio Marques é o autorizador financeiro oficial.</strong> Fernando, como Administrador Master, possui modo de homologação. A fila geral de Aprovações continua sendo de Despesas; Repasse de Alvarás e Comissões possuem aprovação dentro dos próprios módulos.</p></article>
      <article className="tip"><RefreshCw /><h3>Status das parcelas</h3><p>Cada parcela de Repasse/Comissão segue <strong>Pendente → Aguardando aprovação → Aprovada → Paga</strong>. O alvará consolidado segue Aguardando programação → Aguardando aprovação → Aprovado → Parcialmente pago → Pago integralmente.</p></article>
      <article className="tip"><LayoutDashboard /><h3>Dashboard</h3><p>Receitas aparecem em azul, Despesas em vermelho e Saldo/Resultado em verde. Os cards <strong>Receitas, Despesas e Aguardando Aprovação</strong> funcionam como atalhos; <strong>Saldo/Resultado é informativo</strong>.</p></article>
      <article className="tip"><BookOpenCheck /><h3>Plano de Contas</h3><p>Despesas pesquisam contas finais <strong>4.xx</strong> e Receitas/Alvarás contas finais <strong>3.xx</strong>. A página de manutenção é exclusiva do Administrador Master.</p></article>
      <article className="tip"><Users /><h3>Usuários</h3><p>O próprio usuário solicita o cadastro e fica <strong>Pendente</strong>. O Master libera o acesso. Perfis especiais: Flávio = Diretor/Autorizador; Reinaldo = Gerente; Socorro = Tesouraria; demais = Operador/Colaborador.</p></article>
      <article className="tip"><Calculator /><h3>Contabilidade</h3><p>O pacote mensal separa <strong>Despesas, Receitas, Repasses de Alvarás e Comissões de Agentes</strong>. A receita entra na competência do recebimento; repasses/comissões entram na competência da data real do pagamento da parcela.</p></article>
      <article className="tip"><Landmark /><h3>Extrato bancário</h3><p>O extrato consolidado mensal é obrigatório para o pacote contábil. Aceita PDF, OFX, CSV e Excel e fica associado à competência/unidade selecionada.</p></article>
      <article className="tip"><ShieldCheck /><h3>Auditoria</h3><p>Recebimento do Alvará, confirmação pela Tesouraria, programação, aprovação e execução de Repasse/Comissão, além das demais ações financeiras, ficam registrados com usuário, data e detalhe. Master, Diretor, Gerente e Tesouraria podem consultar a Auditoria.</p></article>
      <article className="tip"><Paperclip /><h3>Documentos / Storage</h3><p>O Firebase Storage está <strong>ativo</strong>. Despesas e Receitas/Alvarás aceitam anexos, e o <strong>Arquivo de Documentos</strong> centraliza os arquivos gravados.</p></article>
      <article className="tip"><Wrench /><h3>Utilitários</h3><p>Somente o Administrador Master acessa o menu Utilitários. Ali é possível baixar backup JSON, restaurar esse JSON e executar a limpeza total preservando os usuários.</p></article>
      <article className="tip"><DatabaseBackup /><h3>Backup / Restauração</h3><p>O backup JSON preserva os <strong>dados do Firestore</strong>, incluindo Repasse de Alvarás, Comissões de Agentes e Nota Fiscal. Ele não contém fisicamente PDFs ou outros arquivos do Storage.</p></article>
    </div>

    <section className="page-card help-situations-card">
      <h2>O que fazer em cada situação</h2>
      <div className="help-situation-list">
        <div><AlertTriangle /><span><strong>Despesa devolvida:</strong> se você criou o lançamento, abra Despesas → Corrigir e reenviar → ajuste o solicitado → Reenviar para Aprovação. O Master também pode corrigir para suporte/homologação.</span></div>
        <div><BadgeCheck /><span><strong>Alvará recebido:</strong> confirme o crédito em Tesouraria / Receitas. Não envie o recebimento para Aprovações; depois da confirmação, os módulos Repasse, Nota Fiscal e Comissão são alimentados automaticamente.</span></div>
        <div><BadgeDollarSign /><span><strong>Repasse parcelado:</strong> Repasse de Alvarás → Programar pagamento → escolha Parcelado → número de parcelas → datas/valores → Enviar para aprovação → depois registre cada parcela paga.</span></div>
        <div><Users /><span><strong>Comissão com dedução:</strong> Comissões de Agentes → Programar → Adicionar dedução → informe data, histórico e valor. O líquido é recalculado automaticamente; depois escolha à vista/parcelado e envie o valor líquido para aprovação.</span></div>
        <div><RefreshCw /><span><strong>Data ou percentual:</strong> digite datas no padrão DDMMAAAA ou use o calendário; percentuais são exibidos com duas casas e usam a regra especial de arredondamento aprovada.</span></div>
        <div><ShieldCheck /><span><strong>Precisa comprovar quem fez uma ação:</strong> abra Auditoria e pesquise por processo, usuário, módulo ou ação.</span></div>
        <div><FolderArchive /><span><strong>Precisa localizar um anexo:</strong> abra Arquivo de Documentos e pesquise por processo, fornecedor, cliente, status ou nome do arquivo.</span></div>
        <div><Calculator /><span><strong>Fechamento mensal:</strong> Contabilidade → competência → extrato consolidado → Movimento completo. Repasses e comissões pagos em outro mês aparecerão no mês do pagamento real.</span></div>
      </div>
    </section>
  </>
}

export function HowToPageEnhanced() {
  const steps = [
    ['1', 'Entrar no sistema', 'Acesse com e-mail/senha ou Google. No primeiro acesso, o próprio usuário solicita o cadastro e fica Pendente até a liberação do Administrador Master.'],
    ['2', 'Perfis e responsabilidades', 'O Master administra o sistema e homologa; Flávio é o autorizador financeiro oficial; Reinaldo atua como Gerente; Socorro atua na Tesouraria; os demais são Operadores/Colaboradores.'],
    ['3', 'Cadastrar uma despesa', 'Clique em Nova Despesa, preencha o demonstrativo, classifique se desejar e selecione os documentos comprobatórios. Depois envie para Aprovação.'],
    ['4', 'Autorizar uma despesa', 'Todos os usuários ativos podem consultar Aprovações. Flávio é o autorizador oficial e o Master também pode Aprovar, Devolver ou Rejeitar em homologação.'],
    ['5', 'Cadastrar uma receita / alvará', 'A área de origem preenche o Demonstrativo de Recebimento de Honorários, informa processo, cliente, dados bancários, composição do valor, dados da Nota Fiscal e, quando houver participação, o nome do agente.'],
    ['6', 'Preencher composição e deduções', 'O demonstrativo calcula percentuais e valores com padrão brasileiro. Há duas linhas gerais de Outras Deduções / Participações e uma linha final para comissão com nome do agente/beneficiário. Percentuais ficam com duas casas decimais.'],
    ['7', 'Enviar o Alvará à Tesouraria', 'O recebimento do Alvará não vai para a fila de Aprovações. Use Enviar à Tesouraria; a Tesouraria confere o crédito e usa Confirmar recebimento. Essas ações ficam registradas na Auditoria.'],
    ['8', 'Repasse de Alvarás', 'Após a confirmação do crédito, o sistema leva automaticamente processo, cliente, dados bancários e Valor Líquido Devido ao Cliente para Repasse de Alvarás. Esse valor é dinheiro de terceiro e não é despesa operacional do escritório.'],
    ['9', 'Programar o repasse', 'Escolha À vista ou Parcelado, informe quantidade, datas e valores. Ao enviar, o repasse consolidado fica Aguardando aprovação e cada parcela também fica Aguardando aprovação.'],
    ['10', 'Aprovar o repasse', 'Flávio/Diretor é o autorizador oficial; o Master também pode homologar. Quando aprovado, as parcelas mudam para Aprovada. A rejeição devolve a programação para correção.'],
    ['11', 'Registrar pagamentos do cliente', 'A Tesouraria marca cada parcela como paga e informa a data efetiva. O sistema calcula Já repassado, Saldo a repassar, Próxima parcela e status Parcialmente pago/Pago integralmente. Cada parcela executada gera Auditoria.'],
    ['12', 'Comissões de Agentes e deduções', 'Se houver Outras Deduções / Participações com agente informado, a comissão aparece automaticamente em Comissões de Agentes. Antes de programar o pagamento, podem ser incluídas uma ou mais deduções com data, histórico e valor. O sistema calcula Comissão Bruta menos Deduções e usa somente o Valor Líquido para pagamento à vista ou parcelado, aprovação e baixa.'],
    ['13', 'Nota Fiscal', 'O menu Nota Fiscal recebe automaticamente os dados do cliente e o valor dos Honorários do Escritório. Registre Status NFS-e, Número da NFSe e Data de emissão quando emitida.'],
    ['14', 'Campos protegidos', 'Datas podem ser digitadas em DDMMAAAA ou escolhidas no calendário. Se o usuário clicar fora de Nova Receita com dados não salvos, o sistema pede confirmação antes de descartar.'],
    ['15', 'Consultar a Dashboard', 'Receitas ficam em azul, despesas em vermelho e saldo em verde. Os cards Receitas, Despesas e Aguardando Aprovação funcionam como atalhos; Saldo/Resultado é apenas informativo.'],
    ['16', 'Plano de Contas protegido', 'O Plano de Contas correto fica salvo no Firestore e é usado nos seletores dos lançamentos. A página de manutenção é exibida somente para o Administrador Master.'],
    ['17', 'Gerenciar usuários', 'Cada usuário solicita o próprio cadastro. O Master visualiza os Pendentes, confere o perfil e altera para Ativo, Inativo ou Bloqueado.'],
    ['18', 'Preparar o fechamento contábil', 'Em Contabilidade, escolha competência, unidade e Movimento completo e anexe o extrato consolidado. Receitas são agrupadas pelo mês do recebimento; Repasse de Alvarás e Comissões pelo mês da data efetiva de pagamento da parcela.'],
    ['19', 'Baixar o pacote da Contabilidade', 'O ZIP contém planilha Excel com Resumo, Despesas, Receitas, Repasses de Alvarás, Comissões de Agentes, Documentos e Pendências, além do extrato bancário e anexos disponíveis.'],
    ['20', 'Consultar Auditoria', 'Auditoria registra quem criou/enviou/confirmou o Alvará, quem programou/aprovou o pagamento e quem executou cada parcela, além das demais ações relevantes.'],
    ['21', 'Backup e restauração', 'No menu Utilitários, exclusivo do Master, o Backup JSON salva os dados do Firestore, inclusive os novos controles de Repasse, Comissão e Nota Fiscal.'],
  ]

  return <>
    <Header eyebrow="Guia operacional" title="Como Usar" description="Passo a passo completo do fluxo financeiro, usuários, aprovação, documentos, backup e contabilidade." />
    <div className="howto-steps enhanced-howto">{steps.map(([number, title, text]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
    <section className="page-card tour-callout"><Lightbulb size={24} /><div><h2>Tour Guiado</h2><p>O conteúdo definitivo do tour deve seguir estas etapas e respeitar as mesmas permissões descritas acima.</p></div></section>

    <section className="page-card howto-flowchart-card">
      <div><span className="eyebrow">Visão visual</span><h2>Fluxo Geral do Sistema - Versão Atualizada</h2><p>Este fluxograma resume, de forma visual, todo o funcionamento do aplicativo: Despesas, Recebimento de Alvarás, Repasse de Alvarás, Comissões de Agentes, Nota Fiscal, Contabilidade e funcionalidades transversais.</p></div>
      <a href="/fluxo-geral-sistema.svg" target="_blank" rel="noreferrer" className="howto-flowchart-link" title="Abrir fluxograma em tamanho maior"><img src="/fluxo-geral-sistema.svg" alt="Fluxo Geral do Sistema atualizado" /></a>
      <a href="/fluxo-geral-sistema.svg" target="_blank" rel="noreferrer" className="secondary-button howto-flowchart-button">Abrir imagem em tamanho maior</a>
    </section>
  </>
}
