import { type JSX, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuote } from '@/modules/quotes/hooks/useQuotes'
import { QuotePrint } from '@/modules/quotes/components/QuotePrint'
import { useReactToPrint } from 'react-to-print'
import { useCurrentOrganization } from '@/shared/hooks/useCurrentOrganization'

function onlyDigits(v: string | number | undefined | null): string {
  if (v == null) return ''
  const s = String(v)
  const stripped = s.replace(/\D+/g, '')
  return stripped
}

export function QuotePrintPage(): JSX.Element {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError, refetch } = useQuote(id)
  const printRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({ contentRef: printRef })
  const { logoUrl: orgLogoUrl } = useCurrentOrganization()

  if (isLoading) return <div className="p-6">Cargando…</div>
  if (isError) {
    return (
      <div className="p-6">
        Error al cargar. <button className="underline" onClick={() => refetch()}>Reintentar</button>
      </div>
    )
  }
  if (!data) return <div className="p-6">No encontrado.</div>

  async function handleDownloadPdf(): Promise<void> {
    const el = document.getElementById('print-sheet')
    if (!el) return
    const html2pdf = (await import('html2pdf.js')).default as any
    const filename = `presupuesto-${onlyDigits(data?.number ?? id ?? '') || (id ?? 'sin-numero')}.pdf`
    await html2pdf()
      .set({
        margin: [0, 0, 0, 0],
        filename,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] },
      })
      .from(el)
      .save()
  }

  return (
    <div className="px-4 py-6">
      {/* Estilos solo para impresión */}
      <style>{`
        /* Controlamos los márgenes de la hoja desde CSS para evitar márgenes dobles del navegador */
        @page { size: A4; margin: 0; }
        @media print {
          :root { color-scheme: light; }
          html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
          /* Forzar que se impriman colores de fondo y sombras si fuera necesario */
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          aside, header, footer { display: none !important; }
          /* Hoja centrada con márgenes internos consistentes */
          #print-sheet {
            box-shadow: none !important;
            width: calc(210mm - 24mm) !important; /* 12mm por lado */
            margin: 12mm auto !important;
            padding: 6mm !important; /* espaciado interno estable para evitar recortes */
            font-size: 11pt !important; /* tamaño base legible */
          }
          #print-sheet table th,
          #print-sheet table td { font-size: 10pt !important; }
          /* Evitar cortes raros de filas */
          table { page-break-inside: auto; }
          tr, td, th { page-break-inside: avoid; page-break-after: auto; }
          .print-hidden { display: none !important; }
          /* Quitar sombras/pesos de texto que pueden recortarse al imprimir */
          .no-print-shadow { text-shadow: none !important; }
        }
      `}</style>

      {/* Barra de acciones (no se imprime) */}
      <div className="print-hidden mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link className="rounded border border-slate-600 px-3 py-1 text-slate-200 hover:bg-slate-800" to={`/main/quotes/${id}`}>
            Volver
          </Link>
          <button
            className="rounded bg-slate-900 px-3 py-1 text-white hover:bg-slate-800"
            onClick={handlePrint}
          >
            Imprimir
          </button>
          <button
            className="rounded bg-blue-700 px-3 py-1 text-white hover:bg-blue-600"
            onClick={handleDownloadPdf}
          >
            Descargar PDF
          </button>
        </div>
      </div>

      {/* Hoja de impresión (reutilizable) */}
      <QuotePrint id="print-sheet" quote={data} ref={printRef} orgLogoUrl={orgLogoUrl ?? undefined} />
    </div>
  )
}

export default QuotePrintPage
