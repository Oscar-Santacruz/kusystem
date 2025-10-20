import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react'
import { getEnv } from '@/config/env'
import { ApiClient, ApiInstance } from '@/services/api'
import { ThemeProvider } from '@/shared/ui/theme'
import { ToastProvider, useToast } from '@/shared/ui/toast'
import { ErrorBoundary } from '@/shared/ui/error-boundary'
import { useOrgStore } from '@/lib/org-store'

type ProvidersProps = {
  children: ReactNode
}

const queryClient = new QueryClient()

function AuthBridge({ children }: { children: ReactNode }) {
  const { getAccessTokenSilently, isAuthenticated, user } = useAuth0()
  useEffect(() => {
    ApiClient.setAuthTokenProvider(async () => {
      if (!isAuthenticated) return null
      try {
        const token = await getAccessTokenSilently()
        return token
      } catch {
        console.warn('[auth] fallo al obtener token')
        return null
      }
    })
    // Encabezados puente para backend dev (getCurrentUser usa x-user-*)
    // En producción, esto debería ser reemplazado por validación JWT server-side
    if (isAuthenticated && user) {
      // Si cambia el usuario autenticado, reseteamos la org activa para evitar fugas entre cuentas
      try {
        const prevSub = localStorage.getItem('auth.user.sub')
        if (user.sub && user.sub !== prevSub) {
          localStorage.setItem('auth.user.sub', user.sub)
          localStorage.removeItem('orgId')
          // Actualiza el store inmediatamente
          try { useOrgStore.getState().setOrgId(null) } catch { /* noop */ }
        }
      } catch { /* noop */ }

      if (user.sub) ApiInstance.setHeader('x-user-sub', user.sub)
      if (user.email) ApiInstance.setHeader('x-user-email', user.email)
      const displayName = (user.name || user.nickname || user.email || '').toString()
      if (displayName) ApiInstance.setHeader('x-user-name', displayName)
    } else {
      ApiInstance.removeHeader('x-user-sub')
      ApiInstance.removeHeader('x-user-email')
      ApiInstance.removeHeader('x-user-name')
    }
  }, [getAccessTokenSilently, isAuthenticated, user])
  return <>{children}</>
}

function ApiErrorBridge() {
  const { error } = useToast()
  useEffect(() => {
    ApiInstance.setErrorInterceptor((err: any) => {
      // Derivar mensaje legible
      const status = err?.response?.status
      const serverMsg = err?.response?.data?.message || err?.message
      const msg = status ? `${status} · ${serverMsg || 'Error de red'}` : (serverMsg || 'Error de red')
      error(msg)
    })
  }, [error])
  return null
}

export function Providers({ children }: ProvidersProps) {
  const env = getEnv()
  const authDisabled = env.VITE_AUTH_DISABLED === 'true'
  const insecureOrigin = typeof window !== 'undefined' && window.location && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost'
  const domain = env.VITE_AUTH0_DOMAIN || ''
  const clientId = env.VITE_AUTH0_CLIENT_ID || ''
  const audience = env.VITE_AUTH0_AUDIENCE
  const baseRedirect = env.VITE_AUTH0_CALLBACK_URL || window.location.origin
  const redirectUri = baseRedirect.endsWith('/callback')
    ? baseRedirect
    : `${baseRedirect.replace(/\/$/, '')}/callback`

  // Logs de diagnóstico para Auth0Provider (no se imprimen secretos)
  if (authDisabled || insecureOrigin || !domain || !clientId) {
    // Bypass completo de Auth0: no montamos el provider y limpiamos el token provider
    useEffect(() => {
      ApiClient.setAuthTokenProvider(async () => null)
    }, [])
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ToastProvider>
            <ApiErrorBridge />
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        authorizationParams={{
          audience,
          redirect_uri: redirectUri,
        }}
        onRedirectCallback={(appState) => {
          const target = (appState as any)?.returnTo || '/main/welcome'
          window.location.replace(target)
        }}
        cacheLocation="localstorage"
        useRefreshTokens
      >
        <AuthBridge>
          <ThemeProvider>
            <ToastProvider>
              <ApiErrorBridge />
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </ToastProvider>
          </ThemeProvider>
        </AuthBridge>
      </Auth0Provider>
    </QueryClientProvider>
  )
}
