import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listMembers, removeMember, getMyOrganizations } from '@/services/org'
import { useOrgStore } from '@/lib/org-store'
import { Link } from 'react-router-dom'

export function MembersPage() {
  const orgId = useOrgStore((s) => s.orgId)
  const qc = useQueryClient()

  const myOrgs = useQuery({ queryKey: ['my-organizations'], queryFn: getMyOrganizations, staleTime: 60_000 })
  const members = useQuery({ queryKey: ['members', orgId], queryFn: listMembers, enabled: !!orgId })

  const currentMembership = myOrgs.data?.data.find((m) => m.tenant.id.toString() === (orgId ?? ''))
  const canManage = currentMembership ? (currentMembership.role === 'owner' || currentMembership.role === 'admin') : false

  const del = useMutation({
    mutationFn: (userId: string) => removeMember(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members', orgId] })
    },
  })

  if (members.isLoading || myOrgs.isLoading) return <div className="p-6">Cargando…</div>
  if (members.isError) return <div className="p-6 text-red-400">Error al cargar miembros</div>

  const rows = members.data?.data ?? []

  return (
    <div className="p-2 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Mi organización</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Rol: {currentMembership?.role ?? '—'}</span>
          {canManage && (
            <Link
              to="/main/organization/invite"
              className="bg-blue-600 hover:bg-blue-500 text-white rounded px-3 py-2 text-sm"
            >
              Invitar miembro
            </Link>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-slate-800">
          <thead className="bg-slate-900">
            <tr>
              <th className="text-left px-3 py-2 border-b border-slate-800">Nombre</th>
              <th className="text-left px-3 py-2 border-b border-slate-800">Email</th>
              <th className="text-left px-3 py-2 border-b border-slate-800">Rol</th>
              <th className="text-left px-3 py-2 border-b border-slate-800">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} className="odd:bg-slate-900/40">
                <td className="px-3 py-2 border-b border-slate-800">{m.user.name || '—'}</td>
                <td className="px-3 py-2 border-b border-slate-800">{m.user.email}</td>
                <td className="px-3 py-2 border-b border-slate-800">{m.role}</td>
                <td className="px-3 py-2 border-b border-slate-800">
                  {canManage ? (
                    <button
                      className="text-red-400 hover:text-red-300 text-sm"
                      onClick={() => {
                        if (confirm('¿Quitar a este miembro?')) del.mutate(m.user.id)
                      }}
                      disabled={del.isPending}
                    >
                      Quitar
                    </button>
                  ) : (
                    <span className="text-slate-500 text-sm">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
