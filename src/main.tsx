import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './auth/AuthContext'
import { CpfCnpjValidationEnhancer } from './components/CpfCnpjValidationEnhancer'
import { DreRegimeViewEnhancer } from './components/DreRegimeViewEnhancer'
import { ExpenseFormSemanticsEnhancer } from './components/ExpenseFormSemanticsEnhancer'
import { ExpenseFiltersPanel } from './components/ExpenseFiltersPanel'
import { ExpenseSettlementPanel } from './components/ExpenseSettlementPanel'
import { ThemeControls } from './components/ThemeControls'
import './styles.css'
import './button-label-fix.css'
import './workflow-additions.css'
import './responsive-shell.css'
import './alvara-controls.css'
import './financial-controls-v3.css'
import './theme-final.css'
import './theme-contrast-fixes.css'
import './login-compact.css'
import './cpf-cnpj-validation.css'
import './dre-regime-view.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeControls />
        <CpfCnpjValidationEnhancer />
        <ExpenseFormSemanticsEnhancer />
        <DreRegimeViewEnhancer />
        <App />
        <ExpenseFiltersPanel />
        <ExpenseSettlementPanel />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
