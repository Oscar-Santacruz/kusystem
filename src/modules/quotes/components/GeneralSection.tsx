import { type JSX } from 'react'

export interface BranchOption { id: string; name: string }

export interface GeneralSectionProps {
  // Dates
  issueDate: string
  dueInDays: number
  dueDate: string
  onChangeDueInDays: (v: number) => void
  // Branch selection (depends on customer)
  customerId?: string
  branchId?: string
  branchName?: string
  showBranchSelector: boolean
  setShowBranchSelector: (v: boolean) => void
  branches: { isLoading: boolean; data?: { data?: BranchOption[] } }
  onSelectBranch: (branchId: string | undefined, branchName: string) => void
}

export function GeneralSection(props: GeneralSectionProps): JSX.Element {
  const {
    issueDate,
    dueInDays,
    dueDate,
    onChangeDueInDays,
    customerId,
    showBranchSelector,
    setShowBranchSelector,
    branches,
    onSelectBranch,
  } = props

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {/* Emisión (no editable) */}
      <label className="flex flex-col gap-1">
        <span className="text-sm text-slate-300">Emisión</span>
        <div className="w-40 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white">{issueDate || '-'}</div>
      </label>

      {/* Vencimiento en días */}
      <label className="flex flex-col gap-1">
        <span id="dueDays-label" className="text-sm text-slate-300">Vencimiento en días</span>
        <input
          type="number"
          min={0}
          className="w-40 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:ring"
          aria-labelledby="dueDays-label"
          value={dueInDays}
          onChange={(e) => onChangeDueInDays(Number(e.target.value))}
        />
        <span className="text-xs text-slate-400">Fecha de vencimiento: {dueDate || '-'}</span>
      </label>

      {/* placeholder de columna */}
      <div />

      {/* Selector de Estación de Servicio (según cliente) */}
      <div className="space-y-2 sm:col-span-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showBranchSelector}
            onChange={(e) => {
              setShowBranchSelector(e.target.checked)
              if (!e.target.checked) {
                onSelectBranch(undefined, '')
              }
            }}
            className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-300">Elegir estación de servicio</span>
        </label>

        {showBranchSelector && customerId && (
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-300">Estación de Servicio</span>
            <select
              disabled={!customerId || branches.isLoading}
              className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:ring disabled:opacity-60"
              value={props.branchId ?? ''}
              onChange={(e) => {
                const branchId = e.target.value || undefined
                const branch = (branches.data?.data ?? []).find((b) => b.id === branchId)
                onSelectBranch(branchId, branch?.name ?? '')
              }}
            >
              <option value="">Sin estación específica</option>
              {(branches.data?.data ?? []).map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </label>
        )}
        {showBranchSelector && customerId && (branches.data?.data?.length ?? 0) === 0 ? (
          <span className="text-xs text-slate-400">Sin sucursales para este cliente.</span>
        ) : null}

        {showBranchSelector && !customerId && (
          <span className="text-xs text-slate-400">Primero selecciona un cliente para ver las estaciones de servicio.</span>
        )}
      </div>
    </div>
  )
}

export default GeneralSection
