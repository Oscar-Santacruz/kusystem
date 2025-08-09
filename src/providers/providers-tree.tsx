import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react'
import { getEnv } from '@/config/env'
import { ApiClient } from '@/services/api'

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

export function Providers({ children }: ProvidersProps) {
  const env = getEnv()
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
  })
  if (!domain || !clientId) {
    console.warn('[auth0] domain o clientId vacíos. Revisa tu .env y reinicia el dev server.')
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
        <AuthBridge>{children}</AuthBridge>
      </Auth0Provider>
    </QueryClientProvider>
  )
}
