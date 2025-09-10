import { useQuery } from '@tanstack/react-query'
import { useOrgStore } from '@/lib/org-store'
import { getMyOrganizations, type Organization } from '@/services/org'
import { getEnv } from '@/config/env'
import { useAuth0 } from '@auth0/auth0-react'

export function useCurrentOrganization(): { organization: Organization | null, logoUrl: string | null, isLoading: boolean } {
  const orgId = useOrgStore((s) => s.orgId)
  const currentOrgMeta = useOrgStore((s) => s.currentOrg)
  const setCurrentOrg = useOrgStore((s) => s.setCurrentOrg)
  try { console.log('[useCurrentOrganization] orgId:', orgId) } catch {}
  const { isAuthenticated, isLoading: authLoading } = useAuth0()
  try { console.log('[useCurrentOrganization] authLoading:', authLoading, 'isAuthenticated:', isAuthenticated) } catch {}

  const metaMatchesStore = Boolean(currentOrgMeta && currentOrgMeta.id && currentOrgMeta.id === orgId)
  try { 
    console.log('[useCurrentOrganization] metaMatchesStore decision:')
    console.log('  - currentOrgMeta:', currentOrgMeta)
    console.log('  - currentOrgMeta?.id:', currentOrgMeta?.id)
    console.log('  - orgId:', orgId)
    console.log('  - id match:', currentOrgMeta?.id === orgId)
    console.log('  - metaMatchesStore:', metaMatchesStore)
  } catch {}

  const { data, isLoading } = useQuery<import('@/services/org').Membership[]>({
    queryKey: ['my-organizations'],
    queryFn: async () => {
      try { console.log('[useCurrentOrganization] fetching my organizations...') } catch {}
      const res = await getMyOrganizations()
      try { console.log('[useCurrentOrganization] fetched organizations (raw):', Array.isArray((res as any)?.data) ? (res as any).data.length : 'not-array') } catch {}
      const list = Array.isArray((res as any)?.data) ? (res as any).data : []
      return list as import('@/services/org').Membership[]
    },
    enabled: !authLoading && isAuthenticated && !metaMatchesStore,
    retry: 2,
    retryDelay: (attempt) => 500 * attempt,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })
  try { 
    console.log('[useCurrentOrganization] query state:')
    console.log('  - enabled:', !authLoading && isAuthenticated && !metaMatchesStore)
    console.log('  - authLoading:', authLoading)
    console.log('  - metaMatchesStore:', metaMatchesStore)
    console.log('  - isLoading:', isLoading)
    console.log('  - data length:', Array.isArray(data) ? data.length : 'not array')
  } catch {}

  // Resolver organization y logoUrl
  let organization: Organization | null = null
  let logoUrl: string | null = null

  if (metaMatchesStore && currentOrgMeta) {
    // Preferir datos del store
    try { 
      console.log('[useCurrentOrganization] USING STORE META:')
      console.log('  - org id:', currentOrgMeta.id)
      console.log('  - org name:', currentOrgMeta.name)
      console.log('  - raw logoUrl:', currentOrgMeta.logoUrl)
    } catch {}
    organization = { id: currentOrgMeta.id, name: currentOrgMeta.name ?? null, logoUrl: currentOrgMeta.logoUrl ?? null } as unknown as Organization
    logoUrl = resolveLogoUrl(currentOrgMeta.logoUrl)
  } else {
    // Fallback a datos de la query
    try { 
      console.log('[useCurrentOrganization] USING QUERY DATA:')
      console.log('  - data available:', Boolean(data))
      console.log('  - searching for orgId:', orgId)
    } catch {}
    const list = Array.isArray(data) ? data : []
    const found = list.find((m: import('@/services/org').Membership) => m.tenant?.id?.toString?.() === orgId || m.tenant?.id === orgId)?.tenant || null
    organization = found
    try { 
      console.log('[useCurrentOrganization] query result:')
      console.log('  - found org:', Boolean(found))
      console.log('  - org id:', organization?.id)
      console.log('  - org name:', organization?.name)
    } catch {}
    
    // Si encontramos la org en la query, poblamos el store para próximas veces
    if (found && orgId) {
      const meta = {
        id: orgId,
        name: found.name ?? null,
        logoUrl: (found.logoUrl as string | null) ?? null,
      }
      console.log('[useCurrentOrganization] populating store with found org:', meta)
      setCurrentOrg(meta)
    }
    
    try {
      const raw = (organization?.logoUrl as string | null) ?? null
      try { console.log('[useCurrentOrganization] raw logo from query:', raw) } catch {}
      logoUrl = resolveLogoUrl(raw)
    } catch (e) {
      console.error('[useCurrentOrganization] error resolviendo logoUrl:', e)
      logoUrl = null
    }
  }

  try { 
    console.log('[useCurrentOrganization] FINAL RESULT:')
    console.log('  - organization:', organization)
    console.log('  - logoUrl:', logoUrl)
    console.log('  - isLoading:', !metaMatchesStore && isLoading)
  } catch {}

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
