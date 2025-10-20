import { type JSX, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateQuote } from '@/modules/quotes/hooks/useQuotes'
import { QuoteForm } from '@/modules/quotes/components/QuoteForm'
import logo from '@/assets/logo.png'
import { useCurrentOrganization } from '@/shared/hooks/useCurrentOrganization'

export function QuoteNewPage(): JSX.Element {
  const navigate = useNavigate()
  const create = useCreateQuote()
  const { logoUrl: orgLogoUrl } = useCurrentOrganization()

  // Logs de diagnóstico de montaje y cambios relevantes
  useEffect(() => {
    // Montaje de la página (sin logs)
    return () => {}
  }, [])

  useEffect(() => {}, [orgLogoUrl])

  useEffect(() => {}, [create.isPending])

  const imgSrc = orgLogoUrl || (logo as any)

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-4">
        <img src={imgSrc} alt="Logo" className="h-32 w-64 object-contain" />
        <h2 className="text-2xl font-semibold">Nuevo Presupuesto</h2>
      </div>
      <QuoteForm
        pending={create.isPending}
        onSubmit={(values) => {
          create.mutate(values, {
            onSuccess: (q) => {
              navigate(`/main/quotes/${q.id}`)
            },
          })
        }}
      />
    </section>
  )
}
