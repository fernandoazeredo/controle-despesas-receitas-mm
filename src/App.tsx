import { useState, type FormEvent } from 'react'
import {
  BadgeDollarSign,
  BookOpenCheck,
  Calculator,
  CircleDollarSign,
  FileCheck2,
  FileText,
  FolderArchive,
  LayoutDashboard,
  Lightbulb,
  LoaderCircle,
  LogOut,
  Mail,
  ReceiptText,
  Scale,
  Settings,
  ShieldCheck,
  UserRoundCheck,
  Users,
} from 'lucide-react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'

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

function humanizeAuthError(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: string }).code) : ''
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) return 'E-mail ou senha inválidos.'
  if (code.includes('email-already-in-use')) return 'Este e-mail já possui cadastro.'
  if (code.includes('weak-password')) return 'A senha deve possuir pelo menos 6 caracteres.'
  if (code.includes('popup-closed-by-user')) return 'A janela do Google foi fechada antes de concluir o acesso.'
  if (code.includes('popup-blocked')) return 'O navegador bloqueou a janela de login do Google.'
  return 'Não foi possível concluir o acesso. Tente novamente.'
}

function LoadingScreen() {
  return (
    <div className="auth-page">
      <div className="loading-box" aria-live="polite">
        <LoaderCircle className="spin" size={28} />
        <span>Carregando o sistema...</span>
      </div>
    </div>
  )
}

function LoginScreen() {
  const { signInEmail, registerEmail, signInGoogle } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (mode === 'register') await registerEmail(name, email, password)
      else await signInEmail(email, password)
    } catch (err) {
      setError(humanizeAuthError(err))
    } finally {
      setBusy(false)
    }
  }

  async function googleLogin() {
    setBusy(true)
    setError('')
    try {
      await signInGoogle()
    } catch (err) {
      setError(humanizeAuthError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-layout">
        <section className="auth-brand-panel">
          <img src="/logo-fm.jpg" alt="Flávio Marques Advogados Associados" />
          <div className="auth-brand-fallback">
            <strong>FLÁVIO MARQUES</strong>
            <span>ADVOGADOS ASSOCIADOS</span>
          </div>
          <h1>Controle de Despesas e Receitas</h1>
          <p>Gestão financeira, documental, aprovações e movimentação contábil em um único ambiente.</p>
        </section>

        <section className="auth-card">
          <span className="eyebrow">Acesso ao sistema</span>
          <h2>{mode === 'login' ? 'Entrar' : 'Solicitar acesso'}</h2>
          <p className="auth-helper">
            {mode === 'login'
              ? 'Utilize seu e-mail corporativo ou sua conta Google.'
              : 'Novos cadastros ficam aguardando liberação administrativa.'}
          </p>

          <form onSubmit={submit} className="auth-form">
            {mode === 'register' && (
              <label>
                <span>Nome</span>
                <input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
              </label>
            )}
            <label>
              <span>E-mail</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </label>
            <label>
              <span>Senha</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            </label>

            {error && <div className="form-error" role="alert">{error}</div>}

            <button className="primary-button auth-submit" type="submit" disabled={busy}>
              {busy ? <LoaderCircle className="spin" size={18} /> : <Mail size={18} />}
              {mode === 'login' ? 'Entrar com e-mail' : 'Criar acesso'}
            </button>
          </form>

          <div className="auth-divider"><span>ou</span></div>

          <button className="google-button" type="button" onClick={googleLogin} disabled={busy}>
            <span className="google-mark">G</span>
            Continuar com Google
          </button>

          <button className="text-button" type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>
            {mode === 'login' ? 'Primeiro acesso? Solicitar cadastro' : 'Já possui acesso? Voltar para o login'}
          </button>
        </section>
      </div>
    </div>
  )
}

function PendingScreen() {
  const { profile, logout } = useAuth()
  return (
    <div className="auth-page">
      <section className="pending-card">
        <UserRoundCheck size={42} />
        <span className="eyebrow">Cadastro recebido</span>
        <h1>Aguardando liberação</h1>
        <p>Seu cadastro foi criado, mas ainda precisa ser ativado por um administrador do sistema.</p>
        <strong>{profile?.email}</strong>
        <button className="secondary-button" type="button" onClick={logout}><LogOut size={18} /> Sair</button>
      </section>
    </div>
  )
}

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

function AppShell() {
  const { profile, logout } = useAuth()

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

        <div className="sidebar-user">
          <div>
            <strong>{profile?.displayName || 'Usuário'}</strong>
            <span>{profile?.email}</span>
          </div>
          <button type="button" onClick={logout} title="Sair"><LogOut size={17} /></button>
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

export default function App() {
  const { user, profile, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <LoginScreen />
  if (!profile || profile.status !== 'active') return <PendingScreen />
  return <AppShell />
}
