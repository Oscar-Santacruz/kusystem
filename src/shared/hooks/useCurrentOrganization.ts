import { useQuery } from '@tanstack/react-query'
import { useOrgStore } from '@/lib/org-store'
import { getMyOrganizations, type Organization } from '@/services/org'
import { getEnv } from '@/config/env'
import { useAuth0 } from '@auth0/auth0-react'

export function useCurrentOrganization(): { organization: Organization | null, logoUrl: string | null, isLoading: boolean } {
  const orgId = useOrgStore((s) => s.orgId)
  const currentOrgMeta = useOrgStore((s) => s.currentOrg)
  const setCurrentOrg = useOrgStore((s) => s.setCurrentOrg)
  const { isAuthenticated, isLoading: authLoading } = useAuth0()

  const metaMatchesStore = Boolean(currentOrgMeta && currentOrgMeta.id && currentOrgMeta.id === orgId)

  const { data, isLoading } = useQuery<import('@/services/org').Membership[]>({
    queryKey: ['my-organizations'],
    queryFn: async () => {
      const res = await getMyOrganizations()
      const list = Array.isArray((res as any)?.data) ? (res as any).data : []
      return list as import('@/services/org').Membership[]
    },
    enabled: !authLoading && isAuthenticated && !metaMatchesStore,
    retry: 2,
    retryDelay: (attempt) => 500 * attempt,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })
  // Resolver organization y logoUrl
  let organization: Organization | null = null
  let logoUrl: string | null = null

  if (metaMatchesStore && currentOrgMeta) {
    // Preferir datos del store
    organization = { id: currentOrgMeta.id, name: currentOrgMeta.name ?? null, logoUrl: currentOrgMeta.logoUrl ?? null } as unknown as Organization
    logoUrl = resolveLogoUrl(currentOrgMeta.logoUrl)
  } else {
    // Fallback a datos de la query
    const list = Array.isArray(data) ? data : []
    const found = list.find((m: import('@/services/org').Membership) => m.tenant?.id?.toString?.() === orgId || m.tenant?.id === orgId)?.tenant || null
    organization = found
    
    // Si encontramos la org en la query, poblamos el store para próximas veces
    if (found && orgId) {
      const meta = {
        id: orgId,
        name: found.name ?? null,
        logoUrl: (found.logoUrl as string | null) ?? null,
      }
      setCurrentOrg(meta)
    }
    
    try {
      const raw = (organization?.logoUrl as string | null) ?? null
      logoUrl = resolveLogoUrl(raw)
    } catch (e) {
      console.error('[useCurrentOrganization] error resolviendo logoUrl:', e)
      logoUrl = null
    }
  }

  return { organization, logoUrl, isLoading: !metaMatchesStore && isLoading }

  function resolveLogoUrl(raw: string | null): string | null {
    if (!raw) return null
    if (/^https?:\/\//i.test(raw)) return raw
    // raw es key → construir URL pública
    let base = 'http://localhost:3000'
    try {
      const { VITE_FILES_BASE_URL } = getEnv()
      base = (VITE_FILES_BASE_URL || base)
    } catch {
      console.warn('[useCurrentOrganization] getEnv falló, uso base por defecto http://localhost:3000')
    }
    return `${(base || 'http://localhost:3000').replace(/\/$/, '')}/api/files/${raw}`
  }
}
