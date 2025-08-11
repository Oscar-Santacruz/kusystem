import { type JSX } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useClientBranches, useDeleteClientBranch } from '@/modules/client-branches/hooks/useClientBranches'
import { useToast } from '@/shared/ui/toast'

export function BranchesListPage(): JSX.Element {
  const { clientId } = useParams<{ clientId: string }>()
  const navigate = useNavigate()
  const { data, isPending, error } = useClientBranches(clientId, { page: 1, pageSize: 20 })
  const del = useDeleteClientBranch(clientId)
  const { success } = useToast()

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Sucursales</h2>
        <div className="space-x-2">
          <Link className="rounded bg-slate-900 px-3 py-1 text-white hover:bg-slate-800" to="new">
            Nuevo
          </Link>
        </div>
      </div>

      <div className="rounded border border-slate-200 bg-white/50">
        {isPending && !data ? (
          <div className="p-4 text-slate-500">Cargando…</div>
        ) : error ? (
          <div className="p-4 text-red-500">Error cargando sucursales</div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-3 py-2">Nombre</th>
                <th className="px-3 py-2">Dirección</th>
                <th className="px-3 py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.length ? (
                data.data.map((b) => (
                  <tr key={b.id} className="border-t">
                    <td className="px-3 py-2">{b.name}</td>
                    <td className="px-3 py-2">{b.address ?? '-'}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50"
                          onClick={() => navigate(`/main/client-branches/${b.id}/edit`)}
                        >
                          Editar
                        </button>
                        <button
                          className="rounded border border-red-300 px-2 py-1 text-red-600 hover:bg-red-50"
                          onClick={async () => {
                            if (!confirm('¿Eliminar sucursal?')) return
                            await del.mutateAsync(b.id)
                            success('Sucursal eliminada')
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-3 py-4 text-center text-slate-500">
                    Sin resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}

export default BranchesListPage
