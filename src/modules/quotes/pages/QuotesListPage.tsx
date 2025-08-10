import { type JSX } from 'react'
import { Link } from 'react-router-dom'
import { useQuotes, useDeleteQuote } from '@/modules/quotes/hooks/useQuotes'

export function QuotesListPage(): JSX.Element {
  const { data, isLoading, isError, refetch } = useQuotes({ page: 1, pageSize: 10 })
  const del = useDeleteQuote()

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

      <div className="overflow-x-auto rounded border border-slate-700/50">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-800/60 text-slate-300">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Cliente</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-slate-800/60">
                  <td className="px-3 py-3" colSpan={5}>
                    <div className="h-4 w-full animate-pulse rounded bg-slate-700/40" />
                  </td>
                </tr>
              ))
            ) : (data?.data ?? []).length === 0 ? (
              <tr className="border-t border-slate-800/60">
                <td className="px-3 py-6 text-center text-slate-400" colSpan={5}>
                  No hay presupuestos.
                </td>
              </tr>
            ) : (
              (data?.data ?? []).map((q) => (
                <tr key={q.id} className="border-t border-slate-800/60 hover:bg-slate-800/30">
                  <td className="px-3 py-2">{q.number ?? q.id.slice(0, 6)}</td>
                  <td className="px-3 py-2">{q.customerName}</td>
                  <td className="px-3 py-2">{q.status ?? 'draft'}</td>
                  <td className="px-3 py-2">{q.total ?? '-'}</td>
                  <td className="px-3 py-2 text-right space-x-2">
                    <Link className="text-blue-400 hover:underline" to={`/main/quotes/${q.id}`}>Ver</Link>
                    <Link className="text-amber-400 hover:underline" to={`/main/quotes/${q.id}/edit`}>Editar</Link>
                    <button
                      className="text-red-400 hover:underline"
                      disabled={del.isPending}
                      onClick={() => {
                        if (!confirm('¿Eliminar presupuesto?')) return
                        del.mutate(q.id, { onSuccess: () => { void refetch() } })
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
    </section>
  )
}
