import { type JSX } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuote } from '@/modules/quotes/hooks/useQuotes'

export function QuoteDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError, refetch } = useQuote(id)

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Presupuesto #{data?.number ?? id?.slice(0, 6)}</h2>
        <div className="space-x-2">
          <Link className="rounded bg-slate-700 px-3 py-1 text-white hover:bg-slate-600" to={`/main/quotes/${id}/edit`}>
            Editar
          </Link>
          <Link className="rounded bg-slate-900 px-3 py-1 text-white hover:bg-slate-800" to={`/main/quotes/${id}/print`}>
            Imprimir
          </Link>
          <Link className="rounded border border-slate-600 px-3 py-1 text-slate-200 hover:bg-slate-800" to="/main/quotes">
            Volver
          </Link>
        </div>
      </div>

      {isError && (
        <div className="rounded border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-200">
          Error al cargar. <button className="underline" onClick={() => refetch()}>Reintentar</button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          <div className="h-5 w-64 animate-pulse rounded bg-slate-700/40" />
          <div className="h-4 w-full animate-pulse rounded bg-slate-700/40" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-slate-700/40" />
        </div>
      ) : data ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-slate-400 text-sm">Cliente</div>
              <div className="text-white">{data.customerName}</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm">Estado</div>
              <div className="text-white">{data.status ?? 'draft'}</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm">Moneda</div>
              <div className="text-white">{data.currency ?? '-'}</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm">Total</div>
              <div className="text-white">{data.total ?? '-'}</div>
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-sm mb-1">Notas</div>
            <div className="rounded border border-slate-700 p-3 text-slate-200 bg-slate-900/40 whitespace-pre-wrap">
              {data.notes ?? '—'}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-slate-400">No encontrado.</div>
      )}
    </section>
  )
}
