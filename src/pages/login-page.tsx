import { useAuth0 } from '@auth0/auth0-react'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export function LoginPage() {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0()
  const navigate = useNavigate()
  const location = useLocation() as any
  const from = location.state?.from?.pathname || '/main/welcome'
  const safeFrom = from === '/login' ? '/main/welcome' : from

  useEffect(() => {
    if (isAuthenticated) {
      console.log('[login] usuario autenticado, redirigiendo a', safeFrom)
      navigate(safeFrom, { replace: true })
    }
  }, [isAuthenticated, safeFrom, navigate])

  if (isLoading) return <div className="p-6">Cargando…</div>

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-semibold">Iniciar sesión</h1>
      <p className="mb-6 text-slate-300">Autentícate con Auth0 para continuar.</p>
      <button
        className="rounded bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500"
        onClick={() => {
          console.log('[login] loginWithRedirect → returnTo:', safeFrom)
          loginWithRedirect({ appState: { returnTo: safeFrom } })
        }}
      >
        Entrar con Auth0
      </button>
      {isAuthenticated ? (
        <div className="mt-4 text-sm text-slate-400">
          Ya estás autenticado. Redirigiendo… Si no ocurre, <button
            className="underline"
            onClick={() => navigate(safeFrom, { replace: true })}
          >haz click aquí</button>.
        </div>
      ) : null}
    </div>
  )
}
