import { useQuery } from '@tanstack/react-query'
import { useAuth0 } from '@auth0/auth0-react'
import { getMyOrganizations } from '@/services/org'
import { useOrgStore } from '@/lib/org-store'

export function OrgSelector() {
  const orgId = useOrgStore((s) => s.orgId)
  const setOrgId = useOrgStore((s) => s.setOrgId)

  const { isAuthenticated } = useAuth0()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-organizations'],
    queryFn: getMyOrganizations,
    staleTime: 60_000,
    enabled: isAuthenticated, // evita 401 antes de tener headers de usuario
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
      {isLoading ? (
        <span className="text-sm text-slate-300">Cargando…</span>
      ) : isError ? (
        <span className="text-sm text-red-400">Error</span>
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
