import { type ReactNode, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { useOrgStore } from '@/lib/org-store'
import { getMyOrganizations } from '@/services/org'

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
  const { isAuthenticated, isLoading } = useAuth0()
  const resolvingRef = useRef(false)
  const retriedRef = useRef(false)

  useEffect(() => {
    // Si no hay org activa, intentamos resolver automáticamente del backend
    async function resolveOrg() {
      if (resolvingRef.current) return
      resolvingRef.current = true
      try {
        let list: Array<any> = []
        try {
          const res = await getMyOrganizations()
          list = res.data || []
        } catch (e) {
          // Primer intento falló (red/401). Hacemos un reintento breve una sola vez.
          if (!retriedRef.current) {
            retriedRef.current = true
            await new Promise((r) => setTimeout(r, 800))
            const res2 = await getMyOrganizations()
            list = res2.data || []
          } else {
            throw e
          }
        }
        // Mapear y publicar lista en el store como metadatos
        const metas = list.map((m) => ({
          id: m.tenant.id.toString(),
          name: m.tenant.name ?? null,
          logoUrl: (m.tenant.logoUrl as string | null) ?? null,
        }))
        setOrganizations(metas)

        if (list.length === 0) {
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
        if (!location.pathname.startsWith('/onboarding')) {
          navigate('/onboarding', { replace: true })
        }
      } finally {
        resolvingRef.current = false
      }
    }

    // No intentar resolver mientras Auth0 sigue cargando
    if (isLoading) return

    if (!orgId && isAuthenticated) {
      void resolveOrg()
    }
  }, [orgId, isAuthenticated, isLoading, navigate, location, setOrgId])

  if (!orgId) return <div className="p-4 text-slate-300">Resolviendo organización…</div>
  return <>{children}</>
}
