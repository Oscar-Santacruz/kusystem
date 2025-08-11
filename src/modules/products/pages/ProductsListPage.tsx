import { type JSX, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useProducts, useDeleteProduct } from '@/modules/products/hooks/useProducts'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { useToast } from '@/shared/ui/toast'

export function ProductsListPage(): JSX.Element {
  const { success } = useToast()
  const [sp, setSp] = useSearchParams()
  const initialSearch = sp.get('q') ?? ''
  const initialPage = Number(sp.get('page') ?? '1') || 1
  const [search, setSearch] = useState(initialSearch)
  const [page, setPage] = useState(initialPage)
  const pageSize = 10
  const debounced = useDebouncedValue(search, 300)

  const { data, isPending, isFetching } = useProducts({ page, pageSize, search: debounced || undefined })
  const del = useDeleteProduct()

  const items = data?.data ?? []
  const total = data?.total ?? 0
  const hasPrev = page > 1
  const hasNext = page * pageSize < total

  useEffect(() => {
    const next = new URLSearchParams(sp)
    if (search) next.set('q', search)
    else next.delete('q')
    next.set('page', String(page))
    setSp(next, { replace: true })
  }, [search, page])

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Productos</h2>
        <div className="space-x-2">
          <Link className="rounded bg-slate-900 px-3 py-1 text-white hover:bg-slate-800" to="/main/products/new">
            Nuevo
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Buscar por nombre, SKU…"
          className="w-full max-w-md rounded border border-slate-300 px-3 py-2"
        />
        {(isFetching || isPending) && <span className="text-slate-500">Buscando…</span>}
      </div>

      <div className="rounded border border-slate-200 bg-white/50">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">Unidad</th>
              <th className="px-3 py-2">Precio</th>
              <th className="px-3 py-2">IVA%</th>
              <th className="px-3 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-slate-500" colSpan={6}>
                  {isPending ? 'Cargando…' : 'Sin resultados'}
                </td>
              </tr>
            ) : (
              items.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-3 py-2">{p.name}</td>
                  <td className="px-3 py-2">{p.sku || '-'}</td>
                  <td className="px-3 py-2">{p.unit || '-'}</td>
                  <td className="px-3 py-2">{p.price.toLocaleString(undefined, { style: 'currency', currency: 'ARS' })}</td>
                  <td className="px-3 py-2">{p.taxRate ?? 0}</td>
                  <td className="px-3 py-2 text-right space-x-2">
                    <Link className="rounded border px-2 py-1 hover:bg-slate-50" to={`/main/products/${p.id}/edit`}>
                      Editar
                    </Link>
                    <button
                      className="rounded border px-2 py-1 text-red-600 hover:bg-red-50"
                      onClick={() => {
                        if (confirm('¿Eliminar producto?')) del.mutate(p.id, { onSuccess: () => success('Producto eliminado') })
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

export default ProductsListPage
