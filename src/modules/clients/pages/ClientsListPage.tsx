import { type JSX, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useClients, useDeleteClient } from '@/modules/clients/hooks/useClients'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { useToast } from '@/shared/ui/toast'

export function ClientsListPage(): JSX.Element {
  const { success } = useToast()
  const [sp, setSp] = useSearchParams()
  const initialSearch = sp.get('q') ?? ''
  const initialPage = Number(sp.get('page') ?? '1') || 1
  const [search, setSearch] = useState(initialSearch)
  const [page, setPage] = useState(initialPage)
  const pageSize = 10
  const debounced = useDebouncedValue(search, 300)

  const { data, isPending, isFetching } = useClients({ page, pageSize, search: debounced || undefined })
  const del = useDeleteClient()

  const items = data?.data ?? []
  const total = data?.total ?? 0
  const hasPrev = page > 1
  const hasNext = page * pageSize < total

  useEffect(() => {
    const next = new URLSearchParams()
    if (search) next.set('q', search)
    next.set('page', String(page))
    setSp(next, { replace: true })
  }, [search, page, setSp])

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Clientes</h2>
        <div className="space-x-2">
          <Link className="rounded bg-slate-900 px-3 py-1 text-white hover:bg-slate-800" to="/main/clients/new">
            Nuevo
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Buscar por nombre, CUIT, email…"
          className="w-full max-w-md rounded border border-slate-300 px-3 py-2"
        />
        {(isFetching || isPending) && <span className="text-slate-500">Buscando…</span>}
      </div>

      <div className="rounded border border-slate-200 bg-white/50">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">CUIT</th>
              <th className="px-3 py-2">Teléfono</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-slate-500" colSpan={5}>
                  {isPending ? 'Cargando…' : 'Sin resultados'}
                </td>
              </tr>
            ) : (
              items.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-3 py-2">{c.name}</td>
                  <td className="px-3 py-2">{c.taxId || '-'}</td>
                  <td className="px-3 py-2">{c.phone || '-'}</td>
                  <td className="px-3 py-2">{c.email || '-'}</td>
                  <td className="px-3 py-2 text-right space-x-2">
                    <Link className="rounded border px-2 py-1 hover:bg-slate-50" to={`/main/clients/${c.id}/edit`}>
                      Editar
                    </Link>
                    <Link className="rounded border px-2 py-1 hover:bg-slate-50" to={`/main/clients/${c.id}/branches`}>
                      Sucursales
                    </Link>
                    <button
                      className="rounded border px-2 py-1 text-red-600 hover:bg-red-50"
                      onClick={() => {
                        if (confirm('¿Eliminar cliente?')) del.mutate(c.id, { onSuccess: () => success('Cliente eliminado') })
                      }}
                      disabled={del.isPending}
                    >
                      Borrar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="text-slate-600">
          Página {total === 0 ? 0 : page} de {Math.max(1, Math.ceil(total / pageSize))} · {total} registros
        </div>
        <div className="space-x-2">
          <button
            className="rounded border px-3 py-1 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!hasPrev}
          >
            Anterior
          </button>
          <button
            className="rounded border px-3 py-1 disabled:opacity-50"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasNext}
          >
            Siguiente
          </button>
        </div>
      </div>
    </section>
  )
}

export default ClientsListPage
