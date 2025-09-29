import { type JSX, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useClients, useDeleteClient } from '@/modules/clients/hooks/useClients'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { useToast } from '@/shared/ui/toast'
import { DataTable } from '@/shared/components/DataTable'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import type { Client } from '@/shared/types/domain'

// Hybrid pagination threshold
const FETCH_ALL_LIMIT = 1000

export function ClientsListPage(): JSX.Element {
  const { success } = useToast()
  const [sp, setSp] = useSearchParams()
  const initialSearch = sp.get('q') ?? ''
  const initialPage = Math.max(1, Number(sp.get('page') ?? '1') || 1)
  const [search, setSearch] = useState(initialSearch)
  const [pageIndex, setPageIndex] = useState(initialPage - 1) // 0-based

  // Viewport-aware options and defaults (SSR-safe)
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  const MOBILE_OPTIONS = [5, 15, 30]
  const DESKTOP_OPTIONS = [15, 30, 50, 100]
  const PAGE_SIZE_OPTIONS = isMobile ? MOBILE_OPTIONS : DESKTOP_OPTIONS
  const DEFAULT_PAGE_SIZE = isMobile ? 5 : 30

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

  const page = pageIndex + 1 // backend 1-based
  const debounced = useDebouncedValue(search, 300)
  
  // First fetch to get total
  const { data, isPending, isFetching } = useClients({ page, pageSize, search: debounced || undefined })
  const total = data?.total ?? 0

  // Hybrid strategy: if total ≤ 1000, fetch all and paginate client-side
  const shouldFetchAll = useMemo(() => total > 0 && total <= FETCH_ALL_LIMIT, [total])
  
  // Re-fetch with all data if needed
  const { data: allData } = useClients(
    { page: 1, pageSize: total, search: debounced || undefined },
    { enabled: shouldFetchAll && total > 0 }
  )
  
  const effectiveData = shouldFetchAll && allData ? allData : data
  const items = effectiveData?.data ?? []
  
  const del = useDeleteClient()

  useEffect(() => {
    const next = new URLSearchParams()
    if (search) next.set('q', search)
    next.set('page', String(page))
    setSp(next, { replace: true })
  }, [search, page, setSp])

  const columns: ColumnDef<Client>[] = useMemo(() => [
    { header: 'Nombre', accessorKey: 'name', meta: { filter: 'text' } },
    { header: 'RUC', accessorKey: 'taxId', meta: { filter: 'text' }, cell: (ctx) => ctx.row.original.taxId || '-' },
    { header: 'Teléfono', accessorKey: 'phone', meta: { filter: 'text' }, cell: (ctx) => ctx.row.original.phone || '-' },
    { header: 'Email', accessorKey: 'email', meta: { filter: 'text' }, cell: (ctx) => ctx.row.original.email || '-' },
    {
      id: 'actions',
      header: () => <div className="text-right">Acciones</div>,
      cell: (ctx) => {
        const c = ctx.row.original
        return (
          <div className="space-x-2 text-right">
            <Link className="text-blue-400 hover:underline" to={`/main/clients/${c.id}/edit`}>
              Editar
            </Link>
            <Link className="text-amber-400 hover:underline" to={`/main/clients/${c.id}/branches`}>
              Sucursales
            </Link>
            <button
              className="text-red-400 hover:underline disabled:opacity-50"
              disabled={del.isPending}
              onClick={async () => {
                if (!confirm('¿Eliminar cliente?')) return
                try {
                  await del.mutateAsync(c.id)
                  success('Cliente eliminado')
                } catch (e) {
                  console.error('Error eliminando cliente:', e)
                }
              }}
            >
              Eliminar
            </button>
          </div>
        )
      },
    },
  ], [del.isPending, success])

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
          onChange={(e) => { setSearch(e.target.value); setPageIndex(0) }}
          placeholder="Buscar por nombre, RUC, email…"
          className="w-full max-w-md rounded border border-slate-300 px-3 py-2"
        />
        {(isFetching || isPending) && <span className="text-slate-500">Buscando…</span>}
      </div>

      <DataTable<Client>
        data={items}
        columns={columns}
        isLoading={isPending}
        pagination={{ pageIndex, pageSize, total }}
        onPaginationChange={(next: PaginationState) => {
          setPageIndex(next.pageIndex)
          setPageSize(next.pageSize)
        }}
        showPageSize={true}
        useClientPagination={shouldFetchAll}
      />
    </section>
  )
}

export default ClientsListPage
