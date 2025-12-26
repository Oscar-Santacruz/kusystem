import { useMemo, type JSX } from 'react'

export interface ChargeDetail {
  label: string
  amount: number
}

export interface Totals {
  subtotal: number
  tax: number
  charges: number
  total: number
}

export interface QuoteSidebarProps {
  totals: Totals
  chargeDetails: ChargeDetail[]
  notes: string
  onNotesChange: (value: string) => void
  printNotes?: boolean
  onPrintNotesChange?: (value: boolean) => void
  canSubmit: boolean
  pending?: boolean
  onSubmit: () => void | Promise<void>
}

export function QuoteSidebar(props: QuoteSidebarProps): JSX.Element {
  const { totals, chargeDetails, notes, onNotesChange, printNotes = true, onPrintNotesChange, canSubmit, pending, onSubmit } = props

  // Formato PYG: separador de miles, sin decimales
  const nf = useMemo(() => new Intl.NumberFormat('es-AR', { useGrouping: true, minimumFractionDigits: 0, maximumFractionDigits: 0 }), [])
  const fmt = useMemo(() => (n: number | undefined | null) => {
    try { return nf.format(Number(n || 0)) } catch { return '0' }
  }, [nf])

  return (
    <aside
      className="w-full min-[1020px]:w-96 min-[1020px]:fixed min-[1020px]:right-4 min-[1020px]:top-24 z-20 min-[1020px]:h-[75vh] rounded-lg border border-slate-700/70 bg-slate-900/95 shadow-2xl"
      aria-label="Panel de resumen y notas"
    >
      <div className="flex flex-col min-[1020px]:h-full">
        <div className="flex-1 space-y-4 overflow-auto p-4">
          {/* Resumen */}
          <section className="rounded-lg border border-slate-700/70 bg-slate-900 p-4 shadow-md">
            <div className="text-xs text-slate-300 mb-2">Resumen</div>
            <div className="flex justify-between py-1"><span>Sub-Total</span><span>{fmt(totals?.subtotal)}</span></div>
            <div className="flex justify-between py-1"><span>Cargos</span><span>{fmt(totals?.charges)}</span></div>
            <div className="flex justify-between py-1"><span>IVA</span><span>{fmt(totals?.tax)}</span></div>
            <div className="text-xs text-slate-400 mt-1">
              {chargeDetails?.length ? (
                <div className="flex flex-wrap gap-1">
                  {chargeDetails.map((c, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800 px-2 py-1 text-[11px]">
                      {c.label} <strong className="ml-1">{fmt(c.amount)}</strong>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="mt-2 border-t border-slate-700 pt-3 flex items-baseline justify-between">
              <span className="text-slate-300 font-semibold tracking-wide">Total</span>
              <span className="text-white text-2xl font-extrabold font-mono" aria-live="polite">{fmt(totals?.total)}</span>
            </div>
          </section>

          {/* Notas */}
          <section className="rounded-lg border border-slate-700/70 bg-slate-900 p-4 shadow-md">
            <div className="text-xs text-slate-300 mb-2">Notas</div>
            <textarea
              id="quote-notes"
              className="min-h-28 w-full resize-vertical rounded-md border border-slate-700 bg-slate-800 p-2 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              placeholder="Notas internas. Activa opción para mostrarlas en PDF"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              aria-label="Notas del presupuesto"
            />
            <label className="mt-2 flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-600 bg-slate-800"
                checked={!!printNotes}
                onChange={(e) => onPrintNotesChange?.(e.target.checked)}
              />
              Mostrar notas en PDF
            </label>
          </section>
        </div>

        {/* Footer inferior fijo dentro del panel */}
        <div className="sticky bottom-0 bg-gradient-to-b from-transparent to-slate-900/95 p-4 border-t border-slate-700/70 backdrop-blur-sm">
          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white shadow-lg hover:brightness-105 disabled:opacity-60"
              onClick={() => void onSubmit()}
              disabled={!canSubmit || !!pending}
            >
              {pending ? 'Guardando…' : 'Guardar Presupuesto'}
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
