import { type JSX, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts, useDeleteProduct } from '@/modules/products/hooks/useProducts'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { useToast } from '@/shared/ui/toast'
import { ProductModal } from '@/modules/products/components/ProductModal'

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

  // URL-driven modal state
  const modal = sp.get('modal')
  const mode = sp.get('mode') as 'create' | 'edit' | null
  const editId = sp.get('id')
  const isProductModalOpen = useMemo(() => modal === 'product' && (mode === 'create' || (mode === 'edit' && !!editId)), [modal, mode, editId])
  const isCreate = mode === 'create'
  const isEdit = mode === 'edit'
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

  function openCreateModal() {
    const next = new URLSearchParams(sp)
    next.set('modal', 'product')
    next.set('mode', 'create')
    next.delete('id')
    setSp(next, { replace: true })
  }

  function openEditModal(id: string) {
    const next = new URLSearchParams(sp)
    next.set('modal', 'product')
    next.set('mode', 'edit')
    next.set('id', id)
    setSp(next, { replace: true })
  }

  function closeModal() {
    const next = new URLSearchParams(sp)
    next.delete('modal')
    next.delete('mode')
    next.delete('id')
    setSp(next, { replace: true })
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Productos</h2>
        <div className="space-x-2">
          <button 
            onClick={openCreateModal}
            className="rounded bg-slate-900 px-3 py-1 text-white hover:bg-slate-800"
          >
            Nuevo
          </button>
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

      <div className="overflow-x-auto rounded border border-slate-700/50">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-800/60 text-slate-300">
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
                <td className="px-3 py-6 text-center text-slate-400" colSpan={6}>
                  {isPending ? 'Cargando…' : 'Sin resultados'}
                </td>
              </tr>
            ) : (
              items.map((p) => (
                <tr key={p.id} className="border-t border-slate-800/60 hover:bg-slate-800/30">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="truncate">{p.name}</span>
                      {p.priceIncludesTax ? (
                        <span className="shrink-0 rounded-full border border-emerald-600/40 bg-emerald-950/50 px-2 py-0.5 text-[10px] text-emerald-300">
                          IVA inc.
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3 py-2">{(() => {
                    const s = p.sku
                    if (!s) return '-'
                    const n = Number(s)
                    return Number.isFinite(n) ? n.toLocaleString('es-PY') : s
                  })()}</td>
                  <td className="px-3 py-2">{p.unit || '-'}</td>
                  <td className="px-3 py-2">{(() => {
                    const r = Number(p.taxRate ?? 0)
                    const rate = r > 1 ? r / 100 : r
                    const display = p.priceIncludesTax ? Math.round(p.price * (1 + rate)) : p.price
                    return display.toLocaleString('es-PY', { style: 'currency', currency: 'PYG', minimumFractionDigits: 0, maximumFractionDigits: 0 })
                  })()}</td>
                  <td className="px-3 py-2">{(() => {
                    const r = Number(p.taxRate ?? 0)
                    const pct = Math.round(r > 1 ? r : r * 100)
                    return `${pct}%`
                  })()}</td>
                  <td className="px-3 py-2 text-right space-x-2">
                    <button
                      type="button"
                      className="text-blue-400 hover:underline"
                      onClick={() => openEditModal(p.id)}
                    >
                      Editar
                    </button>
                    <button
                      className="text-red-400 hover:underline disabled:opacity-50"
                      disabled={del.isPending}
                      onClick={async () => {
                        if (!confirm('¿Eliminar producto?')) return
                        try {
                          await del.mutateAsync(p.id)
                          success('Producto eliminado')
                        } catch (e: any) {
                          console.error('Error eliminando producto:', e)
                        }
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal unificado (crear/editar) */}
      {isProductModalOpen && (
        <ProductModal
          mode={isCreate ? 'create' : 'edit'}
          open={true}
          onClose={() => {
            // Cerrar sin notificación (cancel)
            closeModal()
          }}
          productId={isEdit ? (editId ?? undefined) : undefined}
          onSuccess={(m) => {
            // Notificar sólo en éxito real
            success(m === 'create' ? 'Producto creado exitosamente' : 'Producto actualizado')
          }}
        />
      )}

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
