import { ShieldCheck } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { AccountsPageOfficial } from './AccountsPageOfficial'

const PRIMARY_ADMIN_EMAIL = 'fernandoazeredo64@gmail.com'

export function AccountsPageFernando() {
  const { profile } = useAuth()
  const isFernando = profile?.email?.trim().toLowerCase() === PRIMARY_ADMIN_EMAIL

  if (!isFernando) {
    return <section className="page-card module-empty"><ShieldCheck size={38} /><strong>Acesso restrito</strong><span>O Plano de Contas é de manutenção exclusiva do Administrador Master.</span></section>
  }

  return <div className="accounts-fernando-only"><AccountsPageOfficial /></div>
}
