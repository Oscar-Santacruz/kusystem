import { type JSX, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuote } from '@/modules/quotes/hooks/useQuotes'

function formatCurrency(n?: number, currency = 'PYG'): string {
  if (n == null) return '-'
  try {
    return new Intl.NumberFormat('es-PY', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
  } catch {
    return new Intl.NumberFormat('es-PY', { maximumFractionDigits: 0 }).format(n)
  }
}

export function QuotePrintPage(): JSX.Element {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError, refetch } = useQuote(id)

  const computed = useMemo(() => {
    const items = data?.items ?? []
    const subtotal = items.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0)
    const tax = items.reduce((acc, it) => acc + (it.taxRate ? (it.quantity * it.unitPrice * it.taxRate) : 0), 0)
    const discount = items.reduce((acc, it) => acc + (it.discount ?? 0), 0)
    const total = (data?.total ?? subtotal + tax - discount)
    return {
      subtotal: data?.subtotal ?? subtotal,
      tax: data?.taxTotal ?? tax,
      discount: data?.discountTotal ?? discount,
      total,
    }
  }, [data])

  if (isLoading) return <div className="p-6">Cargando…</div>
  if (isError) {
    return (
      <div className="p-6">
        Error al cargar. <button className="underline" onClick={() => refetch()}>Reintentar</button>
      </div>
    )
  }
  if (!data) return <div className="p-6">No encontrado.</div>

  return (
    <div className="px-4 py-6">
      {/* Estilos globales SOLO para esta página al imprimir */}
      <style>{`
        @page { size: A4; margin: 12mm; }
        @media print {
          aside, header, footer { display: none !important; }
          body { margin: 0; background: #fff; }
          #print-sheet { box-shadow: none !important; margin: 0 !important; width: auto !important; }
          .print-hidden { display: none !important; }
        }
      `}</style>

      {/* Barra de acciones (no se imprime) */}
      <div className="print-hidden mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link className="rounded border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-100" to={`/main/quotes/${id}`}>
            Volver
          </Link>
          <button
            className="rounded bg-slate-900 px-3 py-1 text-white hover:bg-slate-800"
            onClick={() => window.print()}
          >
            Imprimir
          </button>
        </div>
      </div>

      {/* Hoja de impresión */}
      <div id="print-sheet" className="mx-auto w-[210mm] max-w-full bg-white p-8 shadow print:shadow-none">
        {/* Encabezado */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo placeholder */}
            <div className="h-16 w-16 rounded bg-slate-200" />
            <div>
              <div className="text-3xl font-extrabold tracking-tight">SANTACRUZ PUBLICIDAD</div>
              <div className="text-sm text-slate-600">Cel: 0981 852 431</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-black tracking-wide">PRESUPUESTO</div>
            <div className="mt-2 text-base">N° {data.number ?? id?.slice(0, 6)}</div>
            <div className="text-base font-medium">
              {new Date(data.issueDate ?? Date.now()).toLocaleDateString('es-PY', { dateStyle: 'long' })}
            </div>
          </div>
        </div>

        {/* Cliente */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <div className="text-slate-500 text-lg font-semibold">Señores:</div>
            <div className="text-2xl font-bold drop-shadow-sm">{data.customerName}</div>
          </div>
          <div className="text-right">
            {/* Placeholder para sucursal / proyecto si existiera */}
            <div className="text-slate-500 text-lg font-semibold">Proyecto / Sucursal</div>
            <div className="text-xl font-semibold text-slate-700">—</div>
          </div>
        </div>

        {/* Tabla de items */}
        <div className="mt-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-2 border-slate-400 px-2 py-1 text-left">item</th>
                <th className="border-2 border-slate-400 px-2 py-1 text-left text-lg font-semibold">Descripcion</th>
                <th className="border-2 border-slate-400 px-2 py-1 text-center">un</th>
                <th className="border-2 border-slate-400 px-2 py-1 text-right">Cantidad</th>
                <th className="border-2 border-slate-400 px-2 py-1 text-right">P. unitario</th>
                <th className="border-2 border-slate-400 px-2 py-1 text-right">Precio total</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((it, idx) => {
                const lineTotal = it.quantity * it.unitPrice - (it.discount ?? 0)
                return (
                  <tr key={idx}>
                    <td className="border border-slate-300 px-2 py-1 align-top">{idx + 1}</td>
                    <td className="border border-slate-300 px-2 py-1 align-top">{it.description}</td>
                    <td className="border border-slate-300 px-2 py-1 text-center align-top">UN</td>
                    <td className="border border-slate-300 px-2 py-1 text-right align-top">{it.quantity.toFixed(2)}</td>
                    <td className="border border-slate-300 px-2 py-1 text-right align-top">{formatCurrency(it.unitPrice, data.currency)}</td>
                    <td className="border border-slate-300 px-2 py-1 text-right align-top">{formatCurrency(lineTotal, data.currency)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div />
          <div className="justify-self-end w-72">
            <div className="flex justify-between border-b border-slate-300 py-1">
              <span>SUB-TOTAL</span>
              <span>{formatCurrency(computed.subtotal, data.currency)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-300 py-1">
              <span>IVA 10%</span>
              <span>{formatCurrency(computed.tax, data.currency)}</span>
            </div>
            {/* Extras opcionales de ejemplo */}
            <div className="flex justify-between border-b border-slate-300 py-1">
              <span>ESTADIA</span>
              <span>{formatCurrency(0, data.currency)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-300 py-1">
              <span>COSTO DE TRANSPORTE</span>
              <span>{formatCurrency(0, data.currency)}</span>
            </div>
            {computed.discount ? (
              <div className="flex justify-between border-b border-slate-300 py-1">
                <span>DESCUENTO</span>
                <span>-{formatCurrency(computed.discount, data.currency)}</span>
              </div>
            ) : null}
            <div className="mt-1 flex justify-between font-bold">
              <span>TOTAL GUARANIES</span>
              <span>{formatCurrency(computed.total, data.currency)}</span>
            </div>
          </div>
        </div>

        {/* Observaciones */}
        {data.notes ? (
          <div className="mt-6 text-sm">
            <div className="text-slate-500">Observaciones</div>
            <div className="whitespace-pre-wrap">{data.notes}</div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default QuotePrintPage
