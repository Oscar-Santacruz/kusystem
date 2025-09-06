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
  const { isAuthenticated } = useAuth0()
  const resolvingRef = useRef(false)

  useEffect(() => {
    // Si no hay org activa, intentamos resolver automáticamente del backend
    async function resolveOrg() {
      if (resolvingRef.current) return
      resolvingRef.current = true
      try {
        const res = await getMyOrganizations()
        const list = res.data || []
        if (list.length === 1) {
          const id = list[0].tenant.id.toString()
          setOrgId(id)
          return
        }
        // 0 o varias → ir a onboarding
        if (!location.pathname.startsWith('/onboarding')) {
          navigate('/onboarding', { replace: true })
        }
      } catch {
        if (!location.pathname.startsWith('/onboarding')) {
          navigate('/onboarding', { replace: true })
        }
      } finally {
        resolvingRef.current = false
      }
    }

    if (!orgId && isAuthenticated) {
      void resolveOrg()
    }
  }, [orgId, isAuthenticated, navigate, location, setOrgId])

  if (!orgId) return null
  return <>{children}</>
}
