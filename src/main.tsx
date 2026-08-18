import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './auth/AuthContext'
import { ExpenseSettlementPanel } from './components/ExpenseSettlementPanel'
import { ThemeControls } from './components/ThemeControls'
import './styles.css'
import './button-label-fix.css'
import './workflow-additions.css'
import './responsive-shell.css'
import './alvara-controls.css'
import './financial-controls-v3.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeControls />
        <App />
        <ExpenseSettlementPanel />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
