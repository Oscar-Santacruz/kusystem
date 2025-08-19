import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Bypass temporal de autenticación para entornos donde no hay HTTPS público
  // Activa con: VITE_AUTH_DISABLED=true
  const authDisabled = import.meta.env.VITE_AUTH_DISABLED === 'true'
  const { isAuthenticated, isLoading } = useAuth0()
  const location = useLocation()

  if (authDisabled) {
    return <>{children}</>
  }

  if (isLoading) return <div className="p-6">Cargando…</div>
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <>{children}</>
}
