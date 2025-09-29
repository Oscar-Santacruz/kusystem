import { type JSX, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts, useDeleteProduct } from '@/modules/products/hooks/useProducts'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { useToast } from '@/shared/ui/toast'
import { ProductModal } from '@/modules/products/components/ProductModal'
import { DataTable } from '@/shared/components/DataTable'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import type { Product } from '@/shared/types/domain'

export function ProductsListPage(): JSX.Element {
  const { success } = useToast()
  const [sp, setSp] = useSearchParams()
  const initialSearch = sp.get('q') ?? ''
  const initialPage = Math.max(1, Number(sp.get('page') ?? '1') || 1)
  const [search, setSearch] = useState(initialSearch)
  const [pageIndex, setPageIndex] = useState(initialPage - 1) // 0-based

  // Viewport-aware options and defaults (SSR-safe)
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  const MOBILE_OPTIONS = [10, 25, 50]
  const DESKTOP_OPTIONS = [10, 25, 50, 100]
  const PAGE_SIZE_OPTIONS = isMobile ? MOBILE_OPTIONS : DESKTOP_OPTIONS
  const DEFAULT_PAGE_SIZE = isMobile ? 10 : 25

  function usePersistentState<T>(key: string, initial: T) {
    const [state, setState] = useState<T>(() => {
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null
        return raw ? (JSON.parse(raw) as T) : initial
      } catch {
        return initial
      }
    })
    useEffect(() => {
      try {
        if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(state))
      } catch {}
    }, [key, state])
    return [state, setState] as const
  }

  const [pageSize, setPageSize] = usePersistentState<number>('table:pageSize', DEFAULT_PAGE_SIZE)
  useEffect(() => {
    if (!PAGE_SIZE_OPTIONS.includes(pageSize)) {
      const nearest = PAGE_SIZE_OPTIONS.reduce((prev, curr) => (Math.abs(curr - pageSize) < Math.abs(prev - pageSize) ? curr : prev), PAGE_SIZE_OPTIONS[0])
      if (nearest !== pageSize) {
        setPageSize(nearest)
        setPageIndex(0)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile])

  const page = pageIndex + 1
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
          onChange={(e) => { setSearch(e.target.value); setPageIndex(0) }}
          placeholder="Buscar por nombre, SKU…"
          className="w-full max-w-md rounded border border-slate-300 px-3 py-2"
        />
        {(isFetching || isPending) && <span className="text-slate-500">Buscando…</span>}
      </div>

      <DataTable<Product>
        data={items}
        columns={useMemo<ColumnDef<Product>[]>(() => [
          {
            header: 'Nombre',
            accessorKey: 'name',
            meta: { filter: 'text' },
            cell: (ctx) => {
              const p = ctx.row.original
              return (
                <div className="flex items-center gap-2">
                  <span className="truncate">{p.name}</span>
                  {p.priceIncludesTax ? (
                    <span className="shrink-0 rounded-full border border-emerald-600/40 bg-emerald-950/50 px-2 py-0.5 text-[10px] text-emerald-300">
                      IVA inc.
                    </span>
                  ) : null}
                </div>
              )
            },
          },
          {
            header: 'SKU',
            accessorKey: 'sku',
            meta: { filter: 'text' },
            cell: (ctx) => {
              const s = ctx.row.original.sku
              if (!s) return '-'
              const n = Number(s)
              return Number.isFinite(n) ? n.toLocaleString('es-PY') : s
            },
          },
          { header: 'Unidad', accessorKey: 'unit', meta: { filter: 'text' }, cell: (ctx) => ctx.row.original.unit || '-' },
          {
            header: 'Precio',
            accessorKey: 'price',
            meta: { filter: 'text' },
            cell: (ctx) => {
              const p = ctx.row.original
              const r = Number(p.taxRate ?? 0)
              const rate = r > 1 ? r / 100 : r
              const display = p.priceIncludesTax ? Math.round(p.price * (1 + rate)) : p.price
              return display.toLocaleString('es-PY', { style: 'currency', currency: 'PYG', minimumFractionDigits: 0, maximumFractionDigits: 0 })
            },
          },
          {
            header: 'IVA%',
            accessorKey: 'taxRate',
            meta: { filter: 'text' },
            cell: (ctx) => {
              const r = Number(ctx.row.original.taxRate ?? 0)
              const pct = Math.round(r > 1 ? r : r * 100)
              return `${pct}%`
            },
          },
          {
            id: 'actions',
            header: () => <div className="text-right">Acciones</div>,
            cell: (ctx) => {
              const p = ctx.row.original
              return (
                <div className="space-x-2 text-right">
                  <button type="button" className="text-blue-400 hover:underline" onClick={() => openEditModal(p.id)}>
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
                      } catch (e) {
                        console.error('Error eliminando producto:', e)
                      }
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              )
            },
          },
        ], [del.isPending, success, openEditModal])}
        isLoading={isPending}
        pagination={{ pageIndex, pageSize, total }}
        onPaginationChange={(next: PaginationState) => {
          setPageIndex(next.pageIndex)
          setPageSize(next.pageSize)
        }}
        showPageSize={true}
      />

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

      {/* Paginación y selector gestionados por DataTable */}
    </section>
  )
}

export default ProductsListPage
