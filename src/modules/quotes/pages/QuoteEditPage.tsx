import { type JSX } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuote, useUpdateQuote } from '@/modules/quotes/hooks/useQuotes'
import { QuoteForm } from '@/modules/quotes/components/QuoteForm'

export function QuoteEditPage(): JSX.Element {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch } = useQuote(id)
  const update = useUpdateQuote()

  if (isLoading) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Editar Presupuesto</h2>
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-700/40" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-700/40" />
      </section>
    )
  }

  if (isError) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Editar Presupuesto</h2>
        <div className="rounded border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-200">
          Error al cargar. <button className="underline" onClick={() => refetch()}>Reintentar</button>
        </div>
      </section>
    )
  }

  if (!data || !id) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Editar Presupuesto</h2>
        <div className="text-slate-400">No encontrado.</div>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Editar Presupuesto</h2>
      <QuoteForm
        initialValues={{
          customerId: data.customerId,
          customerName: data.customerName,
          issueDate: data.issueDate,
          dueDate: data.dueDate,
          currency: data.currency,
          notes: data.notes,
          items: data.items,
          branchId: data.branchId,
          branchName: data.branchName,
          additionalCharges: data.additionalCharges ?? [],
        }}
        pending={update.isPending}
        onSubmit={(values) => {
          update.mutate({ id, input: values }, {
            onSuccess: () => {
              navigate(`/main/quotes/${id}`)
            },
          })
        }}
      />
    </section>
  )
}
