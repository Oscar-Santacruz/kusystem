import { type JSX, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuotes, useDeleteQuote } from '@/modules/quotes/hooks/useQuotes'
import { useToast } from '@/shared/ui/toast'
import { QuotesTable } from '@/modules/quotes/components/QuotesTable'

export function QuotesListPage(): JSX.Element {
  // TanStack Table usa pageIndex 0-based; nuestro backend usa page 1-based
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10) // TODO: exponer selector si hace falta
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
