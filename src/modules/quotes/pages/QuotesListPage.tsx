import { type JSX, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuotes, useDeleteQuote } from '@/modules/quotes/hooks/useQuotes'
import { useToast } from '@/shared/ui/toast'
import { QuotesTable } from '@/modules/quotes/components/QuotesTable'

export function QuotesListPage(): JSX.Element {
  // TanStack Table usa pageIndex 0-based; nuestro backend usa page 1-based
  const [pageIndex, setPageIndex] = useState(0)

  // Viewport-aware options and defaults (SSR-safe)
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  const MOBILE_OPTIONS = [10, 25, 50]
  const DESKTOP_OPTIONS = [10, 25, 50, 100]
  const PAGE_SIZE_OPTIONS = isMobile ? MOBILE_OPTIONS : DESKTOP_OPTIONS
  const DEFAULT_PAGE_SIZE = isMobile ? 10 : 25

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

  const { data, isLoading, isError, refetch } = useQuotes({ page: pageIndex + 1, pageSize })
  const del = useDeleteQuote()
  const { success, error } = useToast()

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Presupuestos</h2>
        <Link
          to="/main/quotes/new"
          className="rounded bg-slate-700 px-3 py-1 text-white hover:bg-slate-600"
        >
          Nuevo
        </Link>
      </div>

      {isError && (
        <div className="rounded border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-200">
          Error al cargar. <button className="underline" onClick={() => refetch()}>Reintentar</button>
        </div>
      )}

      <QuotesTable
        data={data?.data ?? []}
        isLoading={isLoading}
        pagination={{
          pageIndex,
          pageSize,
          total: data?.total ?? 0,
        }}
        onPaginationChange={({ pageIndex: pi, pageSize: ps }) => {
          setPageIndex(pi)
          setPageSize(ps)
        }}
        onDelete={async (id: string) => {
          if (!confirm('¿Eliminar presupuesto?')) return
          try {
            await del.mutateAsync(id)
            success('Presupuesto eliminado')
            await refetch()
          } catch (e: any) {
            error(e?.message || 'No se pudo eliminar el presupuesto')
          }
        }}
        deletePending={del.isPending}
      />
    </section>
  )
}
