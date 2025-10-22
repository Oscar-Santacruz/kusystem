import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMyOrganizations, type MyOrganizationsResponse } from '@/services/org'
import { useOrgStore, type OrgMeta } from '@/lib/org-store'

export function OrgDisplay() {
  const orgId = useOrgStore((s) => s.orgId)
  const setOrgId = useOrgStore((s) => s.setOrgId)
  const storedOrganizations = useOrgStore((s) => s.organizations)
  const setStoredOrganizations = useOrgStore((s) => s.setOrganizations)
  const setCurrentOrgMeta = useOrgStore((s) => s.setCurrentOrg)
  const [modalOpen, setModalOpen] = useState(false)

  const { data, isLoading } = useQuery<MyOrganizationsResponse>({
    queryKey: ['my-organizations'],
    queryFn: getMyOrganizations,
    staleTime: 60_000,
  })

  useEffect(() => {
    if (!data?.data) return
    const metas: OrgMeta[] = data.data.map((m) => ({
      id: m.tenant.id.toString(),
      name: m.tenant.name ?? null,
      logoUrl: (m.tenant.logoUrl as string | null) ?? null,
      ruc: (m.tenant.ruc as string | null) ?? null,
    }))
    setStoredOrganizations(metas)
    if (orgId) {
      const current = metas.find((meta) => meta.id === orgId)
      if (current) setCurrentOrgMeta(current)
    }
  }, [data?.data, setStoredOrganizations, orgId, setCurrentOrgMeta])

  const organizations = useMemo<OrgMeta[]>(() => {
    if (storedOrganizations.length > 0) return storedOrganizations
    const apiList = data?.data || []
    return apiList.map((m) => ({
      id: m.tenant.id.toString(),
      name: m.tenant.name ?? null,
      logoUrl: (m.tenant.logoUrl as string | null) ?? null,
      ruc: (m.tenant.ruc as string | null) ?? null,
    }))
  }, [storedOrganizations, data?.data])

  const currentOrg = organizations.find((org) => org.id === orgId) ?? (organizations[0] ?? null)

  const handleOrgChange = (newId: string) => {
    setOrgId(newId)
    const nextMeta = organizations.find((org) => org.id === newId) ?? null
    setCurrentOrgMeta(nextMeta ?? null)
    setModalOpen(false)
  }

  if ((isLoading && organizations.length === 0) || !currentOrg) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-slate-700 rounded animate-pulse"></div>
        <span className="text-sm text-slate-400">Cargando...</span>
      </div>
    )
  }

  return (
    <>
      {/* Desktop: solo muestra nombre y logo */}
      <div className="hidden md:flex items-center gap-3">
        {currentOrg?.logoUrl && (
          <img 
            src={currentOrg.logoUrl} 
            alt={currentOrg.name ?? 'Organización'}
            className="w-8 h-8 rounded object-contain bg-white"
          />
        )}
        <span className="text-lg font-semibold text-white truncate max-w-[200px]">
          {currentOrg?.name ?? 'Organización'}
        </span>
      </div>

      {/* Mobile: botón que abre modal */}
      <button
        onClick={() => setModalOpen(true)}
        className="md:hidden flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 transition-colors"
      >
        {currentOrg?.logoUrl && (
          <img 
            src={currentOrg.logoUrl} 
            alt={currentOrg.name ?? 'Organización'}
            className="w-6 h-6 rounded object-contain bg-white"
          />
        )}
        <span className="text-sm font-medium text-white truncate max-w-[120px]">
          {currentOrg?.name ?? 'Organización'}
        </span>
        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Modal mobile */}
      {modalOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div 
            className="bg-slate-900 rounded-t-2xl md:rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Cambiar Entidad</h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-2">
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => handleOrgChange(org.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      org.id === orgId
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {org.logoUrl && (
                      <img 
                        src={org.logoUrl} 
                        alt={org.name ?? 'Organización'}
                        className="w-10 h-10 rounded object-contain bg-white"
                      />
                    )}
                    <div className="flex-1 text-left">
                      <div className="font-medium truncate">{org.name ?? 'Organización'}</div>
                      <div className="text-xs opacity-75">{org.ruc ? `RUC: ${org.ruc}` : ''}</div>
                    </div>
                    {org.id === orgId && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
