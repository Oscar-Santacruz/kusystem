import { type JSX, useMemo, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuote } from '@/modules/quotes/hooks/useQuotes'
import { QuotePrint } from '@/modules/quotes/components/QuotePrint'
import { QuoteStatusActions } from '@/modules/quotes/components/QuoteStatusActions'
import { useReactToPrint } from 'react-to-print'
import { FaEdit, FaPrint, FaFilePdf, FaImage, FaWhatsapp, FaArrowLeft, FaLink } from 'react-icons/fa'
import { getPublicQuoteUrl } from '@/modules/quotes/utils/public-url'
import { toast } from 'sonner'
import { useCurrentOrganization } from '@/shared/hooks/useCurrentOrganization'

export function QuoteDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError, refetch } = useQuote(id)
  const printWrapperRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({ contentRef: printWrapperRef })
  const { logoUrl: orgLogoUrl, ruc: orgRuc } = useCurrentOrganization()

  function onlyDigits(v: string | number | undefined | null): string {
    if (v == null) return ''
    const s = String(v)
    const stripped = s.replace(/\D+/g, '')
    return stripped
  }

  async function handleCopyPublicLink(): Promise<void> {
    try {
      if (!data) return
      const url = getPublicQuoteUrl(data as any)
      await navigator.clipboard.writeText(url)
      toast.success('Enlace público copiado al portapapeles')
    } catch (e) {
      console.error(e)
      toast.error('No se pudo copiar el enlace')
    }
  }

  async function handleDownloadImage(): Promise<void> {
    const el = document.getElementById('print-sheet-detail')
    if (!el) return
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(el as HTMLElement, { scale: 2, backgroundColor: '#ffffff', useCORS: true })
    canvas.toBlob((blob: Blob | null) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const filename = `presupuesto-${onlyDigits(data?.number ?? id ?? '') || (id ?? 'sin-numero')}.png`
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  async function handleShareWhatsApp(): Promise<void> {
    const el = document.getElementById('print-sheet-detail')
    if (!el) return
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(el as HTMLElement, { scale: 2, backgroundColor: '#ffffff', useCORS: true })
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob((b: Blob | null) => resolve(b), 'image/png'))
    const num = onlyDigits(data?.number ?? id ?? '') || (id ?? 'sin-numero')
    const message = `Presupuesto ${num}`

    try {
      // Intento 1: Web Share API con archivos (puede requerir HTTPS / soporte del navegador)
      if (blob && 'share' in navigator && typeof (navigator as any).share === 'function') {
        const file = new File([blob], `presupuesto-${num}.png`, { type: 'image/png' })
        const canShareFiles = typeof (navigator as any).canShare === 'function'
          ? (navigator as any).canShare({ files: [file] })
          : false
        if (canShareFiles) {
          await (navigator as any).share({ files: [file], text: message, title: message })
          return
        }
      }
    } catch (e) {
      // Continuar con los siguientes intentos si falla
    }

    try {
      // Intento 2: Copiar imagen al portapapeles y abrir WhatsApp Web con mensaje
      if (blob && navigator.clipboard && 'write' in navigator.clipboard) {
        const CI = (window as any).ClipboardItem || (globalThis as any).ClipboardItem
        if (CI) {
          const item = new CI({ 'image/png': blob })
          await (navigator.clipboard as any).write([item])
        }
      }
    } catch (_) {
      // Si copia falla, seguimos al intento final
    }

    // Abrir WhatsApp Web con número opcional
    const phoneInput = prompt('Enviar a WhatsApp. Ingrese número con código de país (ej: 5959xxxxxxx). Deje vacío para elegir contacto en WhatsApp Web:')
    const phone = phoneInput ? onlyDigits(phoneInput) : ''
    const encoded = encodeURIComponent(`${message}`)
    const url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`
    window.open(url, '_blank')
  }

  const fmt = useMemo(() => new Intl.NumberFormat('es-PY', { useGrouping: true, minimumFractionDigits: 0, maximumFractionDigits: 0 }), [])
  function formatPYG(n?: number): string {
    return fmt.format(Number.isFinite(n as number) ? (n as number) : 0)
  }

  function parseLocalDate(value?: string | number | Date): Date {
    if (value == null) return new Date()
    if (value instanceof Date) return value
    if (typeof value === 'number') return new Date(value)
    const s = String(value)
    const ymd = s.match(/^\d{4}-\d{2}-\d{2}$/)
    if (ymd) {
      const [y, m, d] = s.split('-').map((n) => Number(n))
      return new Date(y, m - 1, d)
    }
    return new Date(s)
  }

  function formatDateShort(date?: string | number | Date): string {
    const d = parseLocalDate(date)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = String(d.getFullYear())
    return `${day}/${month}/${year}`
  }

  const computed = useMemo(() => {
    if (!data) return { subtotal: 0, tax: 0, discount: 0, charges: 0, total: 0 }
    const items = data.items ?? []
    const subtotal = items.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0)
    const tax = items.reduce((acc, it) => acc + (it.taxRate ? (it.quantity * it.unitPrice * it.taxRate) : 0), 0)
    const discount = items.reduce((acc, it) => acc + (it.discount ?? 0), 0)
    const chargesList = (data.additionalCharges ?? []) as Array<{ type?: string; amount?: number }>
    const charges = chargesList.reduce<number>((acc, c) => acc + (c?.amount ?? 0), 0)
    const total = (data.total ?? (subtotal + tax + charges - discount))
    return { subtotal, tax, discount, charges, total }
  }, [data])

  function chargeLabel(type?: string): string {
    if (!type) return ''
    if (type === 'estadia') return 'Estadía'
    if (type === 'transporte') return 'Transporte'
    if (type === 'viatico') return 'Viático'
    return String(type).replace(/[_-]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
  }

  async function handleDownloadPdf(): Promise<void> {
    const el = document.getElementById('print-sheet-detail')
    if (!el) return
    const html2pdf = (await import('html2pdf.js')).default as any
    const filename = `presupuesto-${onlyDigits(data?.number ?? id ?? '') || (id ?? 'sin-numero')}.pdf`
    const worker = html2pdf()
      .set({
        margin: [0, 0, 0, 0],
        filename,
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] },
      })
      .from(el)

    // Si el navegador soporta File System Access API, abrir diálogo Guardar como
    // Esto permite elegir carpeta y nombre, incluyendo la extensión .pdf
    const supportsFS = typeof (window as any).showSaveFilePicker === 'function'
    if (supportsFS) {
      const blob: Blob = await worker.outputPdf('blob')
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: 'Archivo PDF',
            accept: { 'application/pdf': ['.pdf'] },
          },
        ],
      })
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
    } else {
      await worker.save()
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-1xl font-semibold">Presupuesto #{onlyDigits(data?.number) || id?.slice(0, 6)}</h2>
        <div className="flex items-center gap-2">
          <Link
            to={`/main/quotes/${id}/edit`}
            className="inline-flex items-center justify-center rounded bg-slate-700 text-white hover:bg-slate-600 h-9 w-9"
            aria-label="Editar"
            title="Editar"
          >
            <FaEdit className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Editar</span>
          </Link>

          <button
            className="inline-flex items-center justify-center rounded bg-slate-900 text-white hover:bg-slate-800 h-9 w-9"
            onClick={handlePrint}
            aria-label="Imprimir"
            title="Imprimir"
          >
            <FaPrint className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Imprimir</span>
          </button>

          <button
            className="inline-flex items-center justify-center rounded bg-blue-700 text-white hover:bg-blue-600 h-9 w-9"
            onClick={handleDownloadPdf}
            aria-label="Descargar PDF"
            title="Descargar PDF"
          >
            <FaFilePdf className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Descargar PDF</span>
          </button>

          <button
            className="inline-flex items-center justify-center rounded bg-emerald-700 text-white hover:bg-emerald-600 h-9 w-9"
            onClick={handleDownloadImage}
            aria-label="Descargar imagen"
            title="Descargar imagen"
          >
            <FaImage className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Descargar imagen</span>
          </button>

          <button
            className="inline-flex items-center justify-center rounded bg-green-700 text-white hover:bg-green-600 h-9 w-9"
            onClick={handleShareWhatsApp}
            aria-label="Enviar por WhatsApp"
            title="Enviar por WhatsApp"
          >
            <FaWhatsapp className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Enviar por WhatsApp</span>
          </button>

          <button
            className="inline-flex items-center justify-center rounded bg-slate-700 text-white hover:bg-slate-600 h-9 w-9"
            onClick={handleCopyPublicLink}
            aria-label="Copiar enlace público"
            title="Copiar enlace público"
          >
            <FaLink className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Copiar enlace público</span>
          </button>

          <Link
            to="/main/quotes"
            className="inline-flex items-center justify-center rounded border border-slate-600 text-slate-200 hover:bg-slate-800 h-9 w-9"
            aria-label="Volver"
            title="Volver"
          >
            <FaArrowLeft className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Volver</span>
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
        <div className="space-y-6">
          {/* Acciones de estado */}
          <QuoteStatusActions 
            quoteId={id!} 
            currentStatus={data.status} 
            onStatusChanged={() => refetch()}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-slate-400 text-sm">Cliente</div>
              <div className="text-white">{data.customerName}</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm">Sucursal</div>
              <div className="text-white">{data.branchName || '—'}</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm">Fecha de emisión</div>
              <div className="text-white">{formatDateShort(data.issueDate)}</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm">Vencimiento</div>
              <div className="text-white">{data.dueDate ? formatDateShort(data.dueDate) : '—'}</div>
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
              <div className="text-white">{formatPYG(computed.total)}</div>
            </div>
          </div>

          {/* Ítems */}
          <div>
            <div className="mb-2 text-sm text-slate-400">Ítems</div>
            <div className="overflow-x-auto rounded border border-slate-700">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-800/50">
                    <th className="px-2 py-2 text-left">#</th>
                    <th className="px-2 py-2 text-left">Descripción</th>
                    <th className="px-2 py-2 text-right">Cantidad</th>
                    <th className="px-2 py-2 text-right">P. unitario</th>
                    <th className="px-2 py-2 text-right">Desc.</th>
                    <th className="px-2 py-2 text-right">IVA</th>
                    <th className="px-2 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((it, idx) => {
                    const line = it.quantity * it.unitPrice - (it.discount ?? 0)
                    const ivaPct = it.taxRate ? (Math.round((it.taxRate > 1 ? it.taxRate : it.taxRate * 100))) : 0
                    return (
                      <tr key={idx} className="border-t border-slate-700/60">
                        <td className="px-2 py-2 align-top">{idx + 1}</td>
                        <td className="px-2 py-2 align-top">{it.description}</td>
                        <td className="px-2 py-2 align-top text-right">{formatPYG(it.quantity)}</td>
                        <td className="px-2 py-2 align-top text-right">{formatPYG(it.unitPrice)}</td>
                        <td className="px-2 py-2 align-top text-right">{formatPYG(it.discount ?? 0)}</td>
                        <td className="px-2 py-2 align-top text-right">{ivaPct}%</td>
                        <td className="px-2 py-2 align-top text-right font-medium">{formatPYG(line)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totales */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div />
            <div className="justify-self-end w-full max-w-xs">
              <div className="flex justify-between border-b border-slate-700 py-1">
                <span className="text-slate-300">Sub-Total</span>
                <span className="text-white">{formatPYG(computed.subtotal)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-700 py-1">
                <span className="text-slate-300">IVA</span>
                <span className="text-white">{formatPYG(computed.tax)}</span>
              </div>
              {(data.additionalCharges?.length ?? 0) > 0 ? (
                <div className="border-b border-slate-700 py-1">
                  <ul className="mt-1 divide-y divide-slate-800 rounded border border-slate-700 bg-slate-900/40 p-2 text-slate-200">
                    {data.additionalCharges!.map((c, idx) => (
                      <li key={idx} className="flex items-center justify-between py-1">
                        <span>{chargeLabel((c as any).type)}</span>
                        <span>{formatPYG((c as any).amount ?? 0)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {computed.discount ? (
                <div className="flex justify-between border-b border-slate-700 py-1">
                  <span className="text-slate-300">Descuento</span>
                  <span className="text-white">-{formatPYG(computed.discount)}</span>
                </div>
              ) : null}
              <div className="mt-1 flex justify-between font-semibold">
                <span className="text-slate-200">Total</span>
                <span className="text-white">{formatPYG(computed.total)}</span>
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-slate-400 text-sm mb-1">Notas</div>
              <div className="rounded border border-slate-700 p-3 text-slate-200 bg-slate-900/40 whitespace-pre-wrap">
                {data.notes ?? '—'}
              </div>
              <div className="text-xs text-slate-500 mt-1">Se {data.printNotes === false ? 'ocultarán' : 'mostrarán'} en PDF</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-slate-400">No encontrado.</div>
      )}

      {/* Bloque imprimible oculto para usar el mismo layout y estilos */}
      {data ? (
        <div style={{ position: 'absolute', left: '-10000px', top: 0, width: '210mm' }}>
          <div ref={printWrapperRef}>
            <style>{`
              @page { size: A4; margin: 0; }
              @media print {
                :root { color-scheme: light; }
                html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
                * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                /* Hoja centrada con márgenes internos consistentes */
                #print-sheet-detail {
                  box-shadow: none !important;
                  width: calc(210mm - 24mm) !important; /* 12mm por lado */
                  margin: 12mm auto !important;
                  padding: 6mm !important; /* espaciado interno estable para evitar recortes */
                  font-size: 11pt !important; /* tamaño base legible */
                }
                #print-sheet-detail table th,
                #print-sheet-detail table td { font-size: 10pt !important; }
                table { page-break-inside: auto; }
                tr, td, th { page-break-inside: avoid; page-break-after: auto; }
              }

              /* Forzar colores compatibles (evitar funciones modernas como oklch en Tailwind v4) */
              #print-sheet-detail { color: #111 !important; background: #ffffff !important; }
              #print-sheet-detail * { color: inherit !important; border-color: #e5e7eb !important; background: transparent !important; }
              #print-sheet-detail table thead tr { background: #f3f4f6 !important; }
              #print-sheet-detail table th { color: #111 !important; }
              #print-sheet-detail hr { border-color: #e5e7eb !important; }
              #print-sheet-detail .muted { color: #6b7280 !important; }
            `}</style>
            {/* Pasamos el logo de la organización para la impresión */}
            <QuotePrint
              id="print-sheet-detail"
              quote={data}
              orgLogoUrl={orgLogoUrl ?? undefined}
              orgRuc={orgRuc ?? undefined}
            />
          </div>
        </div>
      ) : null}
    </section>
  )
}
