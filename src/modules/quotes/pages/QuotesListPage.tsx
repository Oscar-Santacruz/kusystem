import { type JSX, useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuotes, useDeleteQuote } from '@/modules/quotes/hooks/useQuotes'
import { useToast } from '@/shared/ui/toast'
import { DataTable } from '@/shared/components/DataTable'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import type { Quote } from '@/modules/quotes/types'
import { getStatusLabel, getStatusColor } from '@/modules/quotes/utils/status-colors'
import { FaEye, FaPencilAlt, FaTrash } from 'react-icons/fa'

// Hybrid pagination threshold
const FETCH_ALL_LIMIT = 1000

export function QuotesListPage(): JSX.Element {
  // TanStack Table usa pageIndex 0-based; nuestro backend usa page 1-based
  const [pageIndex, setPageIndex] = useState(0)

  // Viewport-aware options and defaults (SSR-safe)
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  const MOBILE_OPTIONS = [5, 15, 30]
  const DESKTOP_OPTIONS = [15, 30, 50, 100]
  const PAGE_SIZE_OPTIONS = isMobile ? MOBILE_OPTIONS : DESKTOP_OPTIONS
  const DEFAULT_PAGE_SIZE = isMobile ? 5 : 30

  // Persistent state hook stored in localStorage with try/catch
  function usePersistentState<T>(key: string, initial: T) {
    const [state, setState] = useState<T>(() => {
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null
        return raw ? (JSON.parse(raw) as T) : initial
      } catch {
        return initial
      }
    })
    // persist on change
    useEffect(() => {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(key, JSON.stringify(state))
        }
      } catch {
        // noop
      }
    }, [key, state])
    return [state, setState] as const
  }

  // Use persistent pageSize with responsive default, and reconcile if viewport options change
  const [pageSize, setPageSize] = usePersistentState<number>('table:pageSize', DEFAULT_PAGE_SIZE)

  // If stored pageSize is not allowed for current viewport, adjust to nearest allowed
  useEffect(() => {
    if (!PAGE_SIZE_OPTIONS.includes(pageSize)) {
      const nearest = PAGE_SIZE_OPTIONS.reduce((prev, curr) =>
        Math.abs(curr - pageSize) < Math.abs(prev - pageSize) ? curr : prev,
      PAGE_SIZE_OPTIONS[0])
      if (nearest !== pageSize) {
        setPageSize(nearest)
        setPageIndex(0)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile])

  // First fetch to get total
  const { data, isLoading, isError, refetch } = useQuotes({ 
    page: pageIndex + 1, 
    pageSize 
  })
  
  const total = data?.total ?? 0

  // Hybrid strategy: if total ≤ 200, fetch all and paginate client-side
  const shouldFetchAll = useMemo(() => total > 0 && total <= FETCH_ALL_LIMIT, [total])
  
  // Re-fetch with all data if needed
  const { data: allData } = useQuotes(
    { page: 1, pageSize: total },
    { enabled: shouldFetchAll && total > 0 }
  )
  
  const effectiveData = shouldFetchAll && allData ? allData : data
  
  const del = useDeleteQuote()
  const { success, error } = useToast()

  const columns: ColumnDef<Quote>[] = useMemo(() => [
    {
      header: '#',
      accessorKey: 'number',
      meta: { filter: 'text' },
      cell: (ctx) => {
        const v = ctx.row.original.number
        const id = ctx.row.original.id
        const digits = String(v ?? '').replace(/\D+/g, '')
        return <span>{digits || id.slice(0, 6)}</span>
      },
    },
    {
      header: 'Cliente',
      accessorKey: 'customerName',
      meta: { filter: 'text' },
      cell: (info) => info.getValue() as any,
    },
    {
      header: 'Sucursal',
      accessorKey: 'branchName',
      meta: { filter: 'text' },
      cell: (ctx) => ctx.row.original.branchName ?? '—',
    },
    {
      header: 'Estado',
      accessorKey: 'status',
      meta: { filter: 'text' },
      cell: (ctx) => {
        const status = ctx.row.original.status
        return (
          <span className={`inline-block rounded px-2 py-1 text-xs font-medium text-white ${getStatusColor(status)}`}>
            {getStatusLabel(status)}
          </span>
        )
      },
    },
    {
      header: 'Total',
      accessorKey: 'total',
      meta: { filter: 'text' },
      cell: (ctx) => {
        const n = Number(ctx.row.original.total)
        if (!Number.isFinite(n)) return '-'
        return n.toLocaleString('es-PY', {
          style: 'currency',
          currency: 'PYG',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Acciones</div>,
      cell: (ctx) => {
        const q = ctx.row.original
        return (
          <div className="flex items-center justify-end gap-2">
            <Link 
              to={`/main/quotes/${q.id}`}
              className="inline-flex items-center justify-center rounded p-2 text-blue-400 transition-colors hover:bg-blue-400/10"
              title="Ver detalles"
            >
              <FaEye className="h-4 w-4" />
            </Link>
            <Link 
              to={`/main/quotes/${q.id}/edit`}
              className="inline-flex items-center justify-center rounded p-2 text-amber-400 transition-colors hover:bg-amber-400/10"
              title="Editar"
            >
              <FaPencilAlt className="h-4 w-4" />
            </Link>
            <button
              className="inline-flex items-center justify-center rounded p-2 text-red-400 transition-colors hover:bg-red-400/10 disabled:opacity-50"
              disabled={del.isPending}
              title="Eliminar"
              onClick={async () => {
                if (!confirm('¿Eliminar presupuesto?')) return
                try {
                  await del.mutateAsync(q.id)
                  success('Presupuesto eliminado')
                  await refetch()
                } catch (e: any) {
                  error(e?.message || 'No se pudo eliminar el presupuesto')
                }
              }}
            >
              <FaTrash className="h-4 w-4" />
            </button>
          </div>
        )
      },
    },
  ], [del.isPending, success, error, refetch])

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Presupuestos</h2>
        <div className="flex gap-2">
          <Link
            to="/main/quotes/analytics"
            className="rounded bg-blue-700 px-3 py-1 text-white hover:bg-blue-600"
          >
            Dashboard
          </Link>
          <Link
            to="/main/quotes/new"
            className="rounded bg-slate-700 px-3 py-1 text-white hover:bg-slate-600"
          >
            Nuevo
          </Link>
        </div>
      </div>

      {isError && (
        <div className="rounded border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-200">
          Error al cargar. <button className="underline" onClick={() => refetch()}>Reintentar</button>
        </div>
      )}

      <DataTable<Quote>
        data={effectiveData?.data ?? []}
        columns={columns}
        isLoading={isLoading}
        pagination={{
          pageIndex,
          pageSize,
          total: effectiveData?.total ?? 0,
        }}
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
