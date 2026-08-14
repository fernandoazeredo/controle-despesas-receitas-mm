import {
  Archive,
  BadgeDollarSign,
  BookOpenCheck,
  Building2,
  Calculator,
  CircleDollarSign,
  FileCheck2,
  FileText,
  FolderArchive,
  LayoutDashboard,
  Lightbulb,
  ReceiptText,
  Scale,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { NavLink, Route, Routes } from 'react-router-dom'

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

const companyData = {
  razaoSocial: 'FLÁVIO MARQUES ADVOGADOS ASSOCIADOS',
  cnpj: '04.344.462/0001-87',
  endereco: 'Rua México, 21 / 1102 – Centro – Rio de Janeiro – RJ',
}

const menu = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/despesas', label: 'Despesas', icon: ReceiptText },
  { to: '/alvaras', label: 'Recebimento de Alvarás', icon: FileText },
  { to: '/tesouraria', label: 'Tesouraria / Receitas', icon: CircleDollarSign },
  { to: '/aprovacoes', label: 'Aprovações', icon: FileCheck2 },
  { to: '/plano-contas', label: 'Plano de Contas', icon: BookOpenCheck },
  { to: '/contabilidade', label: 'Contabilidade', icon: Calculator },
  { to: '/documentos', label: 'Arquivo de Documentos', icon: FolderArchive },
  { to: '/usuarios', label: 'Usuários', icon: Users },
  { to: '/auditoria', label: 'Auditoria', icon: ShieldCheck },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
]

function Placeholder({ title, text }: { title: string; text: string }) {
  return (
    <section className="page-card">
      <h2>{title}</h2>
      <p>{text}</p>
    </section>
  )
}

function Dashboard() {
  const metrics = [
    ['Receitas / Honorários', money.format(0)],
    ['Despesas', money.format(0)],
    ['Resultado', money.format(0)],
    ['Aguardando Aprovação', '0'],
  ]

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Visão gerencial</span>
          <h1>Dashboard Financeira</h1>
          <p>Retrato consolidado das despesas, recebimentos, honorários, repasses e aprovações.</p>
        </div>
        <div className="quick-actions">
          <button className="primary-button"><ReceiptText size={18} /> + Despesa</button>
          <button className="secondary-button"><BadgeDollarSign size={18} /> + Recebimento</button>
        </div>
      </div>

      <div className="metrics-grid">
        {metrics.map(([label, value]) => (
          <article className="metric" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>Competência atual</small>
          </article>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="page-card">
          <h2>Movimento financeiro</h2>
          <div className="empty-chart">Os gráficos serão alimentados automaticamente pelo Firestore.</div>
        </section>
        <section className="page-card">
          <h2>Fluxo de aprovação</h2>
          <div className="status-row"><span>Rascunhos</span><strong>0</strong></div>
          <div className="status-row"><span>Em análise</span><strong>0</strong></div>
          <div className="status-row"><span>Aprovados</span><strong>0</strong></div>
          <div className="status-row"><span>Devolvidos</span><strong>0</strong></div>
        </section>
      </div>
    </>
  )
}

function Configuracoes() {
  return (
    <section className="page-card">
      <span className="eyebrow">Dados institucionais</span>
      <h2>Configurações do Aplicativo</h2>
      <p>Cadastro institucional utilizado nos demonstrativos, relatórios e documentos gerados pelo sistema.</p>

      <div className="settings-grid">
        <label>
          <span>Razão Social</span>
          <input value={companyData.razaoSocial} readOnly />
        </label>
        <label>
          <span>CNPJ</span>
          <input value={companyData.cnpj} readOnly />
        </label>
        <label className="settings-full-width">
          <span>Endereço</span>
          <input value={companyData.endereco} readOnly />
        </label>
      </div>
    </section>
  )
}

export default function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <img src="/logo-fm.jpg" alt="Flávio Marques Advogados Associados" onError={(e) => { e.currentTarget.style.display = 'none' }} />
          <div className="brand-fallback">
            <strong>FLÁVIO MARQUES</strong>
            <span>ADVOGADOS ASSOCIADOS</span>
          </div>
          <div className="app-name">Controle de Despesas e Receitas</div>
        </div>

        <nav>
          {menu.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-help">
          <NavLink to="/dicas" className="tips-button"><Lightbulb size={18} /> DICAS</NavLink>
          <NavLink to="/como-usar" className="howto-link"><Scale size={18} /> Como Usar</NavLink>
        </div>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/despesas" element={<Placeholder title="Despesas / Tesouraria" text="Demonstrativo tradicional de despesas, comprovantes, aprovação, pagamento e arquivamento." />} />
          <Route path="/alvaras" element={<Placeholder title="Recebimento de Alvarás" text="Origem do demonstrativo de recebimento de honorários e envio do documento pronto à Tesouraria." />} />
          <Route path="/tesouraria" element={<Placeholder title="Tesouraria / Receitas" text="Conferência do recebimento, repasses, comprovantes e encerramento financeiro." />} />
          <Route path="/aprovacoes" element={<Placeholder title="Aprovações da Diretoria" text="Fila de despesas e operações submetidas para análise, aprovação ou devolução." />} />
          <Route path="/plano-contas" element={<Placeholder title="Plano de Contas" text="Cadastro hierárquico de contas e classificação opcional de despesas e componentes de recebimentos." />} />
          <Route path="/contabilidade" element={<Placeholder title="Contabilidade" text="Movimento mensal, conferência documental, pacote ZIP, relatórios e envio à contabilidade." />} />
          <Route path="/documentos" element={<Placeholder title="Arquivo de Documentos" text="Pesquisa e consulta dos dossiês digitais, demonstrativos e comprovantes." />} />
          <Route path="/usuarios" element={<Placeholder title="Usuários e Permissões" text="Perfis de acesso separados por função e módulo." />} />
          <Route path="/auditoria" element={<Placeholder title="Auditoria" text="Histórico imutável das ações, aprovações, devoluções e alterações relevantes." />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/dicas" element={<Placeholder title="DICAS" text="Fluxograma operacional, passo a passo por perfil e soluções para situações comuns. Este módulo terá destaque em vermelho." />} />
          <Route path="/como-usar" element={<Placeholder title="Como Usar" text="Tour guiado interativo e instruções simples para usuários com baixa familiaridade tecnológica." />} />
        </Routes>
      </main>
    </div>
  )
}