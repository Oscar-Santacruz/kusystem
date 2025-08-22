import { type JSX, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { usePublicQuote } from '@/modules/quotes/hooks/useQuotes'
import { QuotePrint } from '@/modules/quotes/components/QuotePrint'

export function QuotePublicPage(): JSX.Element {
  const { publicId } = useParams<{ publicId: string }>()
  const { data, isLoading, isError, refetch } = usePublicQuote(publicId)

  // Añadir meta noindex para evitar indexación en buscadores
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => {
      document.head.removeChild(meta)
    }
  }, [])

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center text-slate-300">Cargando presupuesto...</div>
    }

    if (isError) {
      return (
        <div className="text-center text-red-300">
          <p>Error al cargar el presupuesto.</p>
          <button className="mt-4 rounded bg-slate-700 px-4 py-2 text-white hover:bg-slate-600" onClick={() => refetch()}>
            Reintentar
          </button>
        </div>
      )
    }

    if (!data) {
      return <div className="text-center text-slate-400">Presupuesto no encontrado.</div>
    }

    return <QuotePrint quote={data} />
  }

  return (
    <main className="min-h-screen bg-slate-900 py-8">
      <div className="mx-auto max-w-4xl">
        {renderContent()}
      </div>
    </main>
  )
}

