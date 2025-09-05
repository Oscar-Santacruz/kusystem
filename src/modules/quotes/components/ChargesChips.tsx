import { type JSX } from 'react'
import { AdditionalChargeTypes, type AdditionalChargeType } from '@/modules/quotes/types'

export interface ChargeItem {
  type: AdditionalChargeType
  amount?: number | null
}

export interface ChargesChipsProps {
  charges: ChargeItem[]
  onAdd: (type: AdditionalChargeType) => void
  onUpdate: (type: AdditionalChargeType, amount: number) => void
  onRemove: (type: AdditionalChargeType) => void
}

const chargeLabels: Partial<Record<AdditionalChargeType, string>> = {
  [AdditionalChargeTypes.ESTADIA]: 'Estadía',
  [AdditionalChargeTypes.TRANSPORTE]: 'Transporte',
  [AdditionalChargeTypes.VIATICO]: 'Viático',
}

const chargeIcons: Partial<Record<AdditionalChargeType, JSX.Element>> = {
  [AdditionalChargeTypes.ESTADIA]: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  [AdditionalChargeTypes.TRANSPORTE]: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  [AdditionalChargeTypes.VIATICO]: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
}

function labelFromType(t: AdditionalChargeType): string {
  return chargeLabels[t] ?? t.replace(/[_-]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}

export function ChargesChips({ charges, onAdd, onUpdate, onRemove }: ChargesChipsProps): JSX.Element {
  const allTypes = Object.values(AdditionalChargeTypes) as AdditionalChargeType[]
  const remaining = allTypes.filter((t) => !(charges ?? []).some((c) => c.type === t))

  return (
    <div className="space-y-4">
      {/* Separador con título */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-slate-700" />
        <span className="text-sm font-medium text-slate-300">Servicios Adicionales</span>
        <hr className="flex-1 border-slate-700" />
      </div>

      {/* Chips para agregar cargos */}
      <div className="flex flex-wrap items-center gap-2">
        {remaining.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onAdd(t)}
            className="flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-200 hover:bg-slate-800"
          >
            {chargeIcons[t]}
            + {labelFromType(t)}
          </button>
        ))}
      </div>

      {(charges ?? []).length ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {(charges ?? []).map((c) => (
            <div key={c.type} className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-2">
              <div className="flex items-center gap-2 min-w-24 flex-1">
                {chargeIcons[c.type]}
                <span className="text-sm">{labelFromType(c.type)}</span>
              </div>
              <input
                type="number"
                min={0}
                step={1}
                className="w-28 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-right text-white outline-none"
                value={c.amount ?? 0}
                onChange={(e) => onUpdate(c.type, Number(e.target.value))}
              />
              <button
                type="button"
                aria-label="Quitar cargo"
                className="rounded-full border border-red-700 px-2 py-1 text-xs text-red-300 hover:bg-red-950"
                onClick={() => onRemove(c.type)}
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default ChargesChips
