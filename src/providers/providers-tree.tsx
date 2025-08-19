import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react'
import { getEnv } from '@/config/env'
import { ApiClient, ApiInstance } from '@/services/api'
import { ThemeProvider } from '@/shared/ui/theme'
import { ToastProvider, useToast } from '@/shared/ui/toast'
import { ErrorBoundary } from '@/shared/ui/error-boundary'

type ProvidersProps = {
  children: ReactNode
}

const queryClient = new QueryClient()

function AuthBridge({ children }: { children: ReactNode }) {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()
  useEffect(() => {
    console.log('[auth] AuthBridge mount. isAuthenticated:', isAuthenticated)
    ApiClient.setAuthTokenProvider(async () => {
      if (!isAuthenticated) return null
      try {
        const token = await getAccessTokenSilently()
        console.log('[auth] token obtenido (len):', token?.length ?? 0)
        return token
      } catch {
        console.warn('[auth] fallo al obtener token')
        return null
      }
    })
  }, [getAccessTokenSilently, isAuthenticated])
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
  console.log('[auth0] config:', {
    domain,
    clientId,
    audience,
    redirectUri,
    authDisabled,
    insecureOrigin,
  })
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
          console.log('[auth0] onRedirectCallback →', target)
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
