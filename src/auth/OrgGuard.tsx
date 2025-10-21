import { type ReactNode, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { useOrgStore } from '@/lib/org-store'
import { getMyOrganizations, getMyPermissions } from '@/services/org'
import { usePermissionsStore, type Permission } from '@/lib/permissions-store'
import { useAuthReadyStore } from '@/lib/auth-ready-store'

interface OrgGuardProps {
  children: ReactNode
}

export function OrgGuard({ children }: OrgGuardProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const orgId = useOrgStore((s) => s.orgId)
  const setOrgId = useOrgStore((s) => s.setOrgId)
  const setOrganizations = useOrgStore((s) => s.setOrganizations)
  const setCurrentOrg = useOrgStore((s) => s.setCurrentOrg)
  const setPermissions = usePermissionsStore((s) => s.setPermissions)
  const setIsOwner = usePermissionsStore((s) => s.setIsOwner)
  const resetPermissions = usePermissionsStore((s) => s.reset)
  const { isAuthenticated, isLoading } = useAuth0()
  const authReady = useAuthReadyStore((s) => s.isReady)
  const resolvingRef = useRef(false)
  const loadingPermsRef = useRef(false)

  useEffect(() => {
    // Resolver organizaciones y cargar permisos
    async function resolveOrg() {
      if (resolvingRef.current) return
      resolvingRef.current = true
      
      try {
        const res = await getMyOrganizations()
        const list = res.data || []
        // Mapear y publicar lista en el store como metadatos
        const metas = list.map((m) => ({
          id: m.tenant.id.toString(),
          name: m.tenant.name ?? null,
          logoUrl: (m.tenant.logoUrl as string | null) ?? null,
        }))
        setOrganizations(metas)

        if (list.length === 0) {
          resetPermissions()
          if (!location.pathname.startsWith('/onboarding')) {
            navigate('/onboarding', { replace: true })
          }
          return
        }
        // Hay 1 o más organizaciones: tomar la primera si no hay selección previa
        if (!orgId) {
          const id = list[0].tenant.id.toString()
          setOrgId(id)
        }
        // Publicar currentOrg al store según orgId efectivo
        const currentId = orgId || list[0].tenant.id.toString()
        const cur = metas.find((m) => m.id === currentId) || null
        setCurrentOrg(cur)

        // Si estamos en onboarding pero ya existen organizaciones, enviar a inicio
        if (location.pathname.startsWith('/onboarding')) {
          navigate('/main/welcome', { replace: true })
        }
      } catch {
        resetPermissions()
        if (!location.pathname.startsWith('/onboarding')) {
          navigate('/onboarding', { replace: true })
        }
      } finally {
        resolvingRef.current = false
      }
    }

    // Cargar permisos cuando cambia el tenant activo
    async function loadPermissions() {
      if (loadingPermsRef.current) return
      loadingPermsRef.current = true
      
      try {
        console.log('[OrgGuard] Cargando permisos para tenant:', orgId)
        const perms = await getMyPermissions()
        console.log('[OrgGuard] Permisos recibidos:', perms)
        const normalized = (perms.permissions ?? [])
          .filter((value): value is Permission => typeof value === 'string' && value.includes(':'))
        setPermissions(normalized)
        setIsOwner(perms.role === 'owner')
      } catch (err) {
        console.error('[OrgGuard] Error cargando permisos:', err)
        resetPermissions()
      } finally {
        loadingPermsRef.current = false
      }
    }

    // No intentar resolver mientras Auth0 sigue cargando o headers no están configurados
    if (isLoading || !authReady) {
      console.log('[OrgGuard] Esperando auth...', { isLoading, authReady })
      return
    }

    if (!orgId && isAuthenticated) {
      void resolveOrg()
    } else if (orgId && isAuthenticated) {
      void loadPermissions()
    }
  }, [orgId, isAuthenticated, isLoading, authReady, navigate, location, setOrgId, setOrganizations, setCurrentOrg, setPermissions, setIsOwner, resetPermissions])

  // Mostrar skeleton mientras esperamos auth headers
  if (!authReady || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
          <p className="text-slate-300">Preparando autenticación...</p>
        </div>
      </div>
    )
  }

  // Mostrar skeleton mientras resolvemos organización
  if (!orgId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
          <p className="text-slate-300">Cargando organización...</p>
        </div>
      </div>
    )
  }
  
  return <>{children}</>
}
