import { forwardRef, useMemo } from 'react'
import logo from '@/assets/logo.png'
import type { Quote } from '@/modules/quotes/types'

function onlyDigits(v: string | number | undefined | null): string {
  if (v == null) return ''
  const s = String(v)
  const stripped = s.replace(/\D+/g, '')
  return stripped
}

function formatCurrency0(n?: number, currency = 'PYG'): string {
  if (n == null) return '-'
  try {
    return new Intl.NumberFormat('es-PY', { style: 'currency', currency, maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(n)
  } catch {
    return new Intl.NumberFormat('es-PY', { maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(n)
  }
}

function formatQty0(n?: number): string {
  if (n == null) return '-'
  return new Intl.NumberFormat('es-PY', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
}

function parseLocalDate(value?: string | number | Date): Date {
  if (value == null) return new Date()
  if (value instanceof Date) return value
  if (typeof value === 'number') return new Date(value)
  const s = String(value)
  // Si viene como YYYY-MM-DD, parsear en local para evitar UTC shift
  const ymd = s.match(/^\d{4}-\d{2}-\d{2}$/)
  if (ymd) {
    const [y, m, d] = s.split('-').map((n) => Number(n))
    return new Date(y, m - 1, d)
  }
  // fallback: confiar en Date
  return new Date(s)
}

function formatDateUpper(date?: string | number | Date): string {
  const d = parseLocalDate(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = d.toLocaleString('es-PY', { month: 'long' }).toUpperCase()
  const year = String(d.getFullYear())
  return `${day} DE ${month} DE ${year}`
}

function chargeLabel(type?: string): string {
  if (!type) return ''
  if (type === 'estadia') return 'Estadía'
  if (type === 'transporte') return 'Transporte'
  if (type === 'viatico') return 'Viático'
  // Fallback genérico
  return String(type).replace(/[_-]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}

export interface QuotePrintProps {
  quote: Quote
  id?: string
  className?: string
}

export const QuotePrint = forwardRef<HTMLDivElement, QuotePrintProps>(function QuotePrint(
  { quote: data, id, className },
  ref
) {
  const computed = useMemo(() => {
    const items = data?.items ?? []
    const subtotal = items.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0)
    const tax = items.reduce((acc, it) => acc + (it.taxRate ? (it.quantity * it.unitPrice * it.taxRate) : 0), 0)
    const discount = items.reduce((acc, it) => acc + (it.discount ?? 0), 0)
    const chargesList = ((data as any)?.additionalCharges ?? []) as Array<{ type?: string; amount?: number }>
    const charges = chargesList.reduce<number>((acc: number, c: { type?: string; amount?: number }) => acc + (c?.amount ?? 0), 0)
    const total = (data?.total ?? (subtotal + tax + charges - discount))
    return {
      subtotal: data?.subtotal ?? subtotal,
      tax: data?.taxTotal ?? tax,
      discount: data?.discountTotal ?? discount,
      charges,
      chargesList,
      total,
    }
  }, [data])

  return (
    <div id={id} ref={ref} className={['mx-auto w-[210mm] max-w-full bg-white p-8 shadow print:shadow-none', className].filter(Boolean).join(' ')}>
      {/* Encabezado */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Santacruz Publicidad" className="h-32 w-80 object-contain" />
        </div>
        <div className="text-right">
          <div className="no-print-shadow text-4xl font-black tracking-wide text-slate-800" style={{textShadow: '0 1px 0 #bbb, 0 2px 0 #aaa, 0 3px 0 #999, 0 4px 0 #888, 0 5px 0 #777'}}>
            PRESUPUESTO
          </div>
          <div className="mt-2 text-2xl font-bold">N° {onlyDigits(data.number) || data.id.slice(0, 6)}</div>
          <div className="text-base font-semibold">
            {formatDateUpper(data.issueDate)}
          </div>
          {/* Sucursal centrada se mostrará debajo, no la duplicamos aquí */}
        </div>
      </div>

      {/* Sucursal (centrada) en lugar de título de proyecto */}


      {/* Cliente */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <div className="text-lg font-semibold text-slate-500" style={{textShadow: '0 1px 0 #d1d5db'}}>Señores:</div>
          <div className="text-2xl font-extrabold text-slate-700">
            {data.customerName}
          </div>
        </div>
        <div className="text-right">
        <div className="text-lg font-semibold text-slate-700">
        Estación de Servicio  : {data.branchName || '—'}
      </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="mt-4">
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
                  <td className="border border-slate-300 px-2 py-1 align-top uppercase">{it.description}</td>
                  <td className="border border-slate-300 px-2 py-1 text-center align-top">UN</td>
                  <td className="border border-slate-300 px-2 py-1 text-right align-top">{formatQty0(it.quantity)}</td>
                  <td className="border border-slate-300 px-2 py-1 text-right align-top">{formatCurrency0(it.unitPrice, data.currency)}</td>
                  <td className="border border-slate-300 px-2 py-1 text-right align-top">{formatCurrency0(lineTotal, data.currency)}</td>
                </tr>
              )
            })}
            {data.items.length < 4
              ? Array.from({ length: 4 - data.items.length }).map((_, i) => (
                  <tr key={`empty-${i}`}>
                    <td className="border border-slate-300 px-2 py-6 align-top">&nbsp;</td>
                    <td className="border border-slate-300 px-2 py-6 align-top">&nbsp;</td>
                    <td className="border border-slate-300 px-2 py-6" />
                    <td className="border border-slate-300 px-2 py-6" />
                    <td className="border border-slate-300 px-2 py-6" />
                    <td className="border border-slate-300 px-2 py-6" />
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>

      {/* Totales */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div />
        <div className="justify-self-end w-80">
          <div className="flex justify-between border-b border-slate-400 py-1">
            <span>SUB-TOTAL</span>
            <span>{formatCurrency0(computed.subtotal, data.currency)}</span>
          </div>
          <div className="flex justify-between border-b border-slate-400 py-1">
            <span>IVA</span>
            <span>{formatCurrency0(computed.tax, data.currency)}</span>
          </div>
          {computed.chargesList.length > 0 ? (
            <div className="border-b border-slate-400 py-1">
              <ul className="mt-1 divide-y divide-slate-200 rounded border border-slate-300 bg-white p-2 text-slate-800">
                {computed.chargesList.map((c, idx) => (
                  <li key={idx} className="flex items-center justify-between py-1">
                    <span>{chargeLabel((c as any).type)}</span>
                    <span>{formatCurrency0((c as any).amount ?? 0, data.currency)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {computed.discount ? (
            <div className="flex justify-between border-b border-slate-400 py-1">
              <span>DESCUENTO</span>
              <span>-{formatCurrency0(computed.discount, data.currency)}</span>
            </div>
          ) : null}
          <div className="mt-1 flex justify-between font-bold">
            <span>TOTAL GUARANIES</span>
            <span>{formatCurrency0(computed.total, data.currency)}</span>
          </div>
        </div>
      </div>

      {/* Observaciones (sin lista de cargos en pie de página) */}
      {(data.printNotes ?? true) && data.notes ? (
        <div className="mt-6 text-sm">
          <div>
            <div className="text-slate-500">Observaciones</div>
            <div className="whitespace-pre-wrap">{data.notes}</div>
          </div>
        </div>
      ) : null}
    </div>
  )
})

export default QuotePrint
