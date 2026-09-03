import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const ALLOWED_ROLES = ['master', 'diretor', 'gerente', 'tesouraria']

export function SocietaryRouteAccessGuard() {
  const { profile } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const notifiedPath = useRef('')

  useEffect(() => {
    if (location.pathname !== '/repasse-societario') {
      notifiedPath.current = ''
      return
    }
    if (!profile || profile.status !== 'active') return
    if (ALLOWED_ROLES.includes(String(profile.role ?? ''))) return
    if (notifiedPath.current !== location.pathname) {
      notifiedPath.current = location.pathname
      window.alert('Seu perfil não possui acesso ao módulo Repasse Societário.')
    }
    navigate('/', { replace: true })
  }, [location.pathname, navigate, profile])

  return null
}
