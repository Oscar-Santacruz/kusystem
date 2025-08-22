import { type JSX, useEffect, useMemo, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useQuote } from '@/modules/quotes/hooks/useQuotes'
import { QuotePrint } from '@/modules/quotes/components/QuotePrint'

export function QuotePreviewPage(): JSX.Element {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError, refetch } = useQuote(id)
  const printWrapperRef = useRef<HTMLDivElement>(null)

  // Meta noindex para evitar indexación accidental
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => {
      document.head.removeChild(meta)
    }
  }, [])

  const header = useMemo(() => {
    return `Preview de presupuesto ${id ? `#${id}` : ''}`
  }, [id])

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-100">{header}</h1>
        <div className="flex items-center gap-2">
          <button className="rounded bg-slate-700 px-3 py-1 text-sm text-white hover:bg-slate-600" onClick={() => refetch()}>
            Recargar
          </button>
          {data ? (
            <a
              className="rounded bg-slate-700 px-3 py-1 text-sm text-white hover:bg-slate-600"
              href={typeof window !== 'undefined' ? window.location.href : '#'}
              target="_blank"
              rel="noreferrer"
            >
              Abrir en pestaña
            </a>
          ) : null}
        </div>
      </div>

      {isError && (
        <div className="rounded border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-200">
          Error al cargar.{' '}
          <button className="underline" onClick={() => refetch()}>Reintentar</button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          <div className="h-5 w-64 animate-pulse rounded bg-slate-700/40" />
          <div className="h-4 w-full animate-pulse rounded bg-slate-700/40" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-slate-700/40" />
        </div>
      ) : data ? (
        <div className="bg-slate-950">
          <div ref={printWrapperRef}>
            <QuotePrint id="print-sheet-preview" quote={data} />
          </div>
        </div>
      ) : (
        <div className="text-slate-400">No encontrado.</div>
      )}
    </main>
  )
}

export default QuotePreviewPage
