import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth0 } from '@auth0/auth0-react'
import { getMyOrganizations } from '@/services/org'
import { useOrgStore } from '@/lib/org-store'

export function OrgSelector() {
  const orgId = useOrgStore((s) => s.orgId)
  const setOrgId = useOrgStore((s) => s.setOrgId)

  const { isAuthenticated, isLoading: authLoading } = useAuth0()
  const [ready, setReady] = useState(false)

  // Pequeña espera post-auth para evitar 401 mientras se resuelve el token
  useEffect(() => {
    if (!isAuthenticated || authLoading) {
      setReady(false)
      return
    }
    const id = setTimeout(() => setReady(true), 700)
    return () => clearTimeout(id)
  }, [isAuthenticated, authLoading])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-organizations'],
    queryFn: getMyOrganizations,
    staleTime: 60_000,
    enabled: ready, // espera a auth y un pequeño delay
    retry: 2,
    retryDelay: (attempt) => 500 * attempt,
    refetchOnWindowFocus: false,
  })

  const list = data?.data || []
  const options = list.map((m) => ({ id: m.tenant.id.toString(), name: m.tenant.name, role: m.role }))
  const current = options.find((o) => o.id === (orgId ?? ''))

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newId = e.target.value || null
    setOrgId(newId)
    // No hard reload; las peticiones ya enviarán el header X-Tenant-Id nuevo
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400 hidden md:inline">Org actual:</span>
      {authLoading || isLoading ? (
        <span className="text-sm text-slate-300">Cargando…</span>
      ) : isError ? (
        <button className="text-sm text-red-400 underline" onClick={() => refetch()} title="Reintentar">Error · Reintentar</button>
      ) : (
        <select
          value={current?.id ?? ''}
          onChange={onChange}
          className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-slate-100"
          title={current ? `${current.name} (${current.role})` : 'Seleccionar organización'}
        >
          <option value="" disabled>
            {options.length ? 'Selecciona…' : 'Sin organizaciones'}
          </option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name} {o.role !== 'member' ? `• ${o.role}` : ''}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
