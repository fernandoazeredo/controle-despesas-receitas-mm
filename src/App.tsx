import { useState, type FormEvent } from 'react'
import {
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
import { useAuth, type UserRole } from './auth/AuthContext'
import {
  AuditPage,
  DocumentsPage,
  HowToPage,
  TipsPage,
  TreasuryPage,
} from './pages/SystemPages'
import { AccountingPageFixed } from './pages/FixedPages'
import {
  ApprovalsPageReview,
  DashboardPageReview,
  ExpensesPageReview,
  ReceivablesPageReview,
  UsersPageReview,
} from './pages/ReviewFixPages'
import { AccountsPageOfficial } from './pages/AccountsPageOfficial'
import './system.css'
import './fixes.css'
import './review-fixes.css'
import './accounts-official.css'

const companyData = {
  razaoSocial: 'FLÁVIO MARQUES ADVOGADOS ASSOCIADOS',
  cnpj: '04.344.462/0001-87',
  endereco: 'Rua México, 21 / 1102 – Centro – Rio de Janeiro – RJ',
}

type MenuItem = {
  to: string
  label: string
  icon: typeof LayoutDashboard
  tone?: 'expense' | 'revenue'
  roles?: UserRole[]
}

const menu: MenuItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/despesas', label: 'Despesas', icon: ReceiptText, tone: 'expense', roles: ['master', 'admin', 'tesouraria'] },
  { to: '/alvaras', label: 'Recebimento de Alvarás', icon: FileText, tone: 'revenue', roles: ['master', 'admin', 'alvaras'] },
  { to: '/tesouraria', label: 'Tesouraria / Receitas', icon: CircleDollarSign, tone: 'revenue', roles: ['master', 'admin', 'tesouraria'] },
  { to: '/aprovacoes', label: 'Aprovações', icon: FileCheck2, roles: ['master', 'admin', 'diretoria'] },
  { to: '/plano-contas', label: 'Plano de Contas', icon: BookOpenCheck, roles: ['master', 'admin', 'contabilidade', 'tesouraria'] },
  { to: '/contabilidade', label: 'Contabilidade', icon: Calculator, roles: ['master', 'admin', 'contabilidade'] },
  { to: '/documentos', label: 'Arquivo de Documentos', icon: FolderArchive },
  { to: '/usuarios', label: 'Usuários', icon: Users, roles: ['master', 'admin'] },
  { to: '/auditoria', label: 'Auditoria', icon: ShieldCheck, roles: ['master', 'admin', 'diretoria'] },
  { to: '/configuracoes', label: 'Configurações', icon: Settings, roles: ['master', 'admin'] },
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

function Configuracoes() {
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Administração</span>
          <h1>Configurações</h1>
          <p>Dados institucionais, regras operacionais e situação dos serviços do aplicativo.</p>
        </div>
      </div>
      <section className="page-card">
        <span className="eyebrow">Dados institucionais</span>
        <h2>Configurações do Aplicativo</h2>
        <p>Cadastro utilizado nos demonstrativos, relatórios e documentos gerados pelo sistema.</p>
        <div className="settings-grid">
          <label><span>Razão Social</span><input value={companyData.razaoSocial} readOnly /></label>
          <label><span>CNPJ</span><input value={companyData.cnpj} readOnly /></label>
          <label className="settings-full-width"><span>Endereço</span><input value={companyData.endereco} readOnly /></label>
        </div>
      </section>
      <div className="settings-panels">
        <section className="page-card"><h2>Fluxo Financeiro</h2><div className="status-row"><span>Aprovação de despesas</span><strong>Ativa</strong></div><div className="status-row"><span>Classificação contábil</span><strong>Opcional</strong></div><div className="status-row"><span>Recebimento chega pronto à Tesouraria</span><strong>Ativo</strong></div></section>
        <section className="page-card"><h2>Serviços Firebase</h2><div className="status-row"><span>Authentication</span><strong className="success-text">Ativo</strong></div><div className="status-row"><span>Firestore</span><strong className="success-text">Ativo</strong></div><div className="status-row"><span>Hosting</span><strong className="success-text">Ativo</strong></div><div className="status-row"><span>Storage</span><strong className="warning-text">Pendente Blaze</strong></div></section>
      </div>
    </>
  )
}

function AppShell() {
  const { profile, logout } = useAuth()
  const role = profile?.role ?? 'consulta'
  const visibleMenu = menu.filter((item) => !item.roles || item.roles.includes(role))

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
          {visibleMenu.map(({ to, label, icon: Icon, tone }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}${tone ? ` ${tone}-nav` : ''}`}>
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
          <Route path="/" element={<DashboardPageReview />} />
          <Route path="/despesas" element={<ExpensesPageReview />} />
          <Route path="/alvaras" element={<ReceivablesPageReview />} />
          <Route path="/tesouraria" element={<TreasuryPage />} />
          <Route path="/aprovacoes" element={<ApprovalsPageReview />} />
          <Route path="/plano-contas" element={<AccountsPageOfficial />} />
          <Route path="/contabilidade" element={<AccountingPageFixed />} />
          <Route path="/documentos" element={<DocumentsPage />} />
          <Route path="/usuarios" element={<UsersPageReview />} />
          <Route path="/auditoria" element={<AuditPage />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/dicas" element={<TipsPage />} />
          <Route path="/como-usar" element={<HowToPage />} />
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
