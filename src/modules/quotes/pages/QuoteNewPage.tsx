import { type JSX, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCreateQuote, useQuote } from '@/modules/quotes/hooks/useQuotes'
import { QuoteForm } from '@/modules/quotes/components/QuoteForm'
import logo from '@/assets/logo.png'
import { useCurrentOrganization } from '@/shared/hooks/useCurrentOrganization'

export function QuoteNewPage(): JSX.Element {
  const navigate = useNavigate()
  const create = useCreateQuote()
  const { logoUrl: orgLogoUrl } = useCurrentOrganization()

  const [searchParams] = useSearchParams()
  const cloneId = searchParams.get('cloneId')
  const { data: sourceQuote, isLoading: isLoadingSource } = useQuote(cloneId || undefined)

  const initialValues = useMemo(() => {
    if (!sourceQuote) return undefined

    // Sanitizar datos para el nuevo presupuesto
    const today = new Date()
    const y = today.getFullYear()
    const m = String(today.getMonth() + 1).padStart(2, '0')
    const d = String(today.getDate()).padStart(2, '0')
    const todayStr = `${y}-${m}-${d}`

    return {
      customerName: sourceQuote.customerName,
      customerId: sourceQuote.customerId, // Asumimos que QuoteForm maneja esto si existe
      issueDate: todayStr,
      dueDate: todayStr,
      currency: sourceQuote.currency,
      items: sourceQuote.items.map(it => ({
        productId: it.productId,
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        taxRate: it.taxRate,
        discount: it.discount
      })),
      additionalCharges: sourceQuote.additionalCharges?.map(c => ({
        type: c.type,
        amount: c.amount
      })) || [],
      notes: sourceQuote.notes,
      printNotes: sourceQuote.printNotes,
      branchId: sourceQuote.branchId,
      branchName: sourceQuote.branchName
    }
  }, [sourceQuote])

  // Logs de diagnóstico de montaje y cambios relevantes
  useEffect(() => {
    // Montaje de la página (sin logs)
    return () => { }
  }, [])

  useEffect(() => { }, [orgLogoUrl])

  useEffect(() => { }, [create.isPending])

  const imgSrc = orgLogoUrl || (logo as any)

  if (cloneId && isLoadingSource) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-slate-400">Cargando datos para clonar...</div>
      </div>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-4">
        <img src={imgSrc} alt="Logo" className="h-32 w-64 object-contain" />
        <h2 className="text-2xl font-semibold">
          {cloneId ? 'Clonar Presupuesto' : 'Nuevo Presupuesto'}
        </h2>
      </div>
      <QuoteForm
        initialValues={initialValues as any}
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
