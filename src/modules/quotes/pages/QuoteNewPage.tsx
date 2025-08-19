import { type JSX } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateQuote } from '@/modules/quotes/hooks/useQuotes'
import { QuoteForm } from '@/modules/quotes/components/QuoteForm'
import logo from '@/assets/logo.png'

export function QuoteNewPage(): JSX.Element {
  const navigate = useNavigate()
  const create = useCreateQuote()

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-4">
        <img src={logo} alt="Logo" className="h-32 w-64 object-contain" />
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
