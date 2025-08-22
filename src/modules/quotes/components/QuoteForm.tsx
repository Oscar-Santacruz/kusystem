import { useEffect, useMemo, useRef, useState, type JSX } from 'react'

import type { CreateQuoteInput, QuoteItem, AdditionalChargeType } from '@/modules/quotes/types'
import { AdditionalChargeTypes } from '@/modules/quotes/types'
import { ClientCreateModal } from '@/modules/clients/components/ClientCreateModal'
import { ProductCreateModal } from '@/modules/products/components/ProductCreateModal'
import { useClients } from '@/modules/clients/hooks/useClients'
import { useProducts } from '@/modules/products/hooks/useProducts'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { useToast } from '@/shared/ui/toast'
import { useClientBranches } from '@/modules/client-branches/hooks/useClientBranches'
import { QuoteSidebar } from '@/modules/quotes/components/QuoteSidebar'

export interface QuoteFormValues extends CreateQuoteInput {}

function toISOLocalDateString(value?: string | number | Date): string {
  if (value == null) return getTodayISOLocal()
  if (value instanceof Date) {
    const y = value.getFullYear()
    const m = String(value.getMonth() + 1).padStart(2, '0')
    const d = String(value.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  if (typeof value === 'number') return toISOLocalDateString(new Date(value))
  const s = String(value)
  // Si viene como YYYY-MM-DD, retornar igual
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  // Intentar parseo local si trae tiempo/UTC
  const dt = new Date(s)
  if (!isNaN(dt.getTime())) return toISOLocalDateString(dt)
  // Fallback
  return getTodayISOLocal()
}

export interface QuoteFormProps {
  initialValues?: QuoteFormValues
  pending?: boolean
  onSubmit: (values: QuoteFormValues) => void | Promise<void>
}

function getTodayISOLocal(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function addDaysISO(baseISO: string, days: number): string {
  const [y, m, d] = baseISO.split('-').map((n) => Number(n))
  const date = new Date(y, (m - 1), d)
  date.setDate(date.getDate() + Number(days || 0))
  const yy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

function getDaysDiffISO(startISO?: string, endISO?: string): number {
  if (!startISO || !endISO) return 0
  const [y1, m1, d1] = startISO.split('-').map((n) => Number(n))
  const [y2, m2, d2] = endISO.split('-').map((n) => Number(n))
  const a = new Date(y1, (m1 - 1), d1)
  const b = new Date(y2, (m2 - 1), d2)
  const ms = b.getTime() - a.getTime()
  return Math.round(ms / (24 * 60 * 60 * 1000))
}

const DEFAULTS: QuoteFormValues = {
  customerName: '',
  issueDate: getTodayISOLocal(),
  dueDate: getTodayISOLocal(),
  currency: 'PYG',
  notes: '',
  printNotes: true,
  items: [],
  branchId: undefined,
  branchName: '',
  additionalCharges: [],
}

export function QuoteForm(props: QuoteFormProps): JSX.Element {
  const { onSubmit, pending = false, initialValues } = props
  const [values, setValues] = useState<QuoteFormValues>(initialValues ?? DEFAULTS)
  const [dueInDays, setDueInDays] = useState<number>(() => initialValues ? getDaysDiffISO((initialValues?.issueDate ?? DEFAULTS.issueDate), (initialValues?.dueDate ?? DEFAULTS.dueDate)) : 90)
  const [showBranchSelector, setShowBranchSelector] = useState<boolean>(!!initialValues?.customerId)
  const [clientSearch, setClientSearch] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const productSearchRef = useRef<HTMLInputElement | null>(null)
  const [openClientModal, setOpenClientModal] = useState(false)
  const [openProductModal, setOpenProductModal] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const dClientSearch = useDebouncedValue(clientSearch, 400)
  const dProductSearch = useDebouncedValue(productSearch, 400)
  const clients = useClients({ page: 1, pageSize: 20, search: dClientSearch })
  const products = useProducts({ page: 1, pageSize: 20, search: dProductSearch })
  const { success } = useToast()
  const branches = useClientBranches(values.customerId, { page: 1, pageSize: 50 })
  // Combobox (clientes)
  const [clientOpen, setClientOpen] = useState(false)
  const [clientActiveIndex, setClientActiveIndex] = useState<number>(-1)
  const clientListboxId = 'client-listbox'

  // Formateo con separador de miles para PYG (sin decimales)
  const nf = useMemo(() => new Intl.NumberFormat('es-AR', { useGrouping: true, minimumFractionDigits: 0, maximumFractionDigits: 0 }), [])
  function formatPrice(n: number): string {
    return nf.format(Number.isFinite(n) ? n : 0)
  }

  // Mostrar errores de formulario (validaciones generales)

  // Cargos adicionales dinámicos
  const allChargeTypes = useMemo(() => Object.values(AdditionalChargeTypes) as AdditionalChargeType[], [])

  function upsertCharge(type: AdditionalChargeType, amount: number) {
    setValues((prev) => {
      const list = [...(prev.additionalCharges ?? [])]
      const idx = list.findIndex((c) => c.type === type)
      if (amount <= 0) {
        if (idx >= 0) { list.splice(idx, 1) }
      } else {
        if (idx >= 0) list[idx] = { type, amount }
        else list.push({ type, amount })
      }
      return { ...prev, additionalCharges: list }
    })
  }
  const chargeLabels: Partial<Record<AdditionalChargeType, string>> = {
    [AdditionalChargeTypes.ESTADIA]: 'Estadía',
    [AdditionalChargeTypes.TRANSPORTE]: 'Transporte',
    [AdditionalChargeTypes.VIATICO]: 'Viático',
  }
  function labelFromType(t: AdditionalChargeType): string {
    return chargeLabels[t] ?? t.replace(/[_-]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
  }
  function addCharge(type: AdditionalChargeType) {
    setValues((prev) => {
      const list = [...(prev.additionalCharges ?? [])]
      if (!list.find((c) => c.type === type)) list.push({ type, amount: 0 })
      return { ...prev, additionalCharges: list }
    })
  }
  function removeCharge(type: AdditionalChargeType) {
    setValues((prev) => {
      const list = [...(prev.additionalCharges ?? [])]
      const idx = list.findIndex((c) => c.type === type)
      if (idx >= 0) list.splice(idx, 1)
      return { ...prev, additionalCharges: list }
    })
  }

  // IVA permitido: 0%, 5% o 10%
  function normalizeTaxRate(rate?: number): number {
    if (rate == null || Number.isNaN(rate)) return 0
    // admitir entrada como 0..1 o 0..100
    const r = rate > 1 ? rate / 100 : rate
    if (Math.abs(r - 0.1) < 0.005) return 0.1
    if (Math.abs(r - 0.05) < 0.005) return 0.05
    if (Math.abs(r - 0) < 0.005) return 0
    // fallback: redondear al más cercano entre 0, 0.05, 0.1
    const candidates = [0, 0.05, 0.1]
    return candidates.reduce((best, cur) => Math.abs(cur - r) < Math.abs(best - r) ? cur : best, 0)
  }

  useEffect(() => {
    if (initialValues) {
      const normIssue = toISOLocalDateString(initialValues.issueDate ?? DEFAULTS.issueDate)
      const normDue = toISOLocalDateString(initialValues.dueDate ?? DEFAULTS.dueDate)
      setValues((v) => ({ ...v, ...initialValues, issueDate: normIssue, dueDate: normDue }))
      setDueInDays(getDaysDiffISO(normIssue, normDue))
      if (initialValues.customerName) {
        setClientSearch(initialValues.customerName)
      }
    }
  }, [initialValues])

  // Mantener dueDate sincronizado con issueDate + dueInDays
  useEffect(() => {
    const base = values.issueDate || getTodayISOLocal()
    const nextDue = addDaysISO(base, dueInDays)
    if (values.dueDate !== nextDue) {
      setValues((prev) => ({ ...prev, dueDate: nextDue }))
    }
  }, [values.issueDate, dueInDays])

  // Autosave de borrador en localStorage
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem('quoteFormDraft', JSON.stringify(values))
      } catch {}
    }, 600)
    return () => clearTimeout(id)
  }, [values])

  // Cargar borrador si no hay initialValues
  useEffect(() => {
    if (!initialValues) {
      try {
        const raw = localStorage.getItem('quoteFormDraft')
        if (raw) {
          const draft = JSON.parse(raw)
          if (draft && typeof draft === 'object') {
            const normIssue = toISOLocalDateString(draft.issueDate ?? DEFAULTS.issueDate)
            const normDue = toISOLocalDateString(draft.dueDate ?? DEFAULTS.dueDate)
            setValues((prev) => ({ ...prev, ...draft, issueDate: normIssue, dueDate: normDue }))
            if (draft.customerName) {
              setClientSearch(draft.customerName)
            }
          }
        }
      } catch {}
    }
  }, [initialValues])

  // Si hay branchName pero no branchId (p.ej. al editar), intentar mapear por nombre cuando cargan sucursales
  useEffect(() => {
    if (!values.customerId) return
    if (values.branchId) return
    if (!values.branchName) return
    const list = branches.data?.data ?? []
    if (!list.length) return
    const found = list.find(b => (b.name || '').toLowerCase() === (values.branchName || '').toLowerCase())
    if (found) {
      setValues((prev) => ({ ...prev, branchId: found.id, branchName: found.name }))
    }
  }, [values.customerId, values.branchId, values.branchName, branches.data])

  function handleChange<K extends keyof QuoteFormValues>(key: K, val: QuoteFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: val }))
  }

  function addItemFromProduct(p: { id: string; name: string; price: number; taxRate?: number }) {
    const newItem: QuoteItem = {
      productId: p.id,
      description: p.name,
      quantity: 1,
      unitPrice: p.price,
      taxRate: normalizeTaxRate(p.taxRate ?? 0),
    }
    setValues((prev) => ({ ...prev, items: [...(prev.items ?? []), newItem] }))
  }

  function updateItem(index: number, patch: Partial<QuoteItem>) {
    setValues((prev) => {
      const items = [...(prev.items ?? [])]
      const next: Partial<QuoteItem> = { ...patch }
      if (Object.prototype.hasOwnProperty.call(patch, 'taxRate')) {
        next.taxRate = normalizeTaxRate(patch.taxRate as number)
      }
      items[index] = { ...items[index], ...next }
      return { ...prev, items }
    })
  }

  function removeItem(index: number) {
    setValues((prev) => {
      const items = [...(prev.items ?? [])]
      items.splice(index, 1)
      return { ...prev, items }
    })
  }

  const totals = useMemo(() => {
    const items = values.items ?? []
    const subtotal = items.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0)
    const tax = items.reduce((acc, it) => acc + (it.taxRate ? (it.quantity * it.unitPrice * it.taxRate) : 0), 0)
    const discount = items.reduce((acc, it) => acc + (it.discount ?? 0), 0)
    const charges = (values.additionalCharges ?? []).reduce((acc, c) => acc + (c.amount || 0), 0)
    const total = subtotal + tax + charges - discount
    return { subtotal, tax, discount, charges, total }
  }, [values.items, values.additionalCharges])

  const canSubmit = Boolean(values.customerId) && ((values.items?.length ?? 0) > 0)
  const dateInvalid = useMemo(() => dueInDays < 0, [dueInDays])

  // Datos para el panel derecho en layout React
  const chargeDetails = useMemo(() => (
    (values.additionalCharges ?? []).map((c) => ({ label: labelFromType(c.type), amount: c.amount ?? 0 }))
  ), [values.additionalCharges])

  async function handleSubmitFromSidebar(): Promise<void> {
    setFormError(null)
    if (!canSubmit || dateInvalid) {
      setFormError(dateInvalid ? 'La fecha de vencimiento no puede ser anterior a la emisión.' : 'Selecciona un cliente y agrega al menos un ítem.')
      return
    }
    await onSubmit(values)
    try { localStorage.removeItem('quoteFormDraft') } catch {}
  }

  return (
    <>
    <form
      className="space-y-4 lg:pr-[26rem]"
      onSubmit={async (e) => {
        e.preventDefault()
        setFormError(null)
        if (!canSubmit || dateInvalid) {
          setFormError(dateInvalid ? 'La fecha de vencimiento no puede ser anterior a la emisión.' : 'Selecciona un cliente y agrega al menos un ítem.')
          return
        }
        await onSubmit(values)
        try { localStorage.removeItem('quoteFormDraft') } catch {}
      }}
    >
      {/* Encabezado sin logo */}

      {formError ? (
        <div className="rounded border border-red-700 bg-red-950 px-3 py-2 text-red-200" role="alert">
          {formError}
        </div>
      ) : null}

      {/* Panel derecho como layout React */}
      <QuoteSidebar
        totals={{ subtotal: totals.subtotal, tax: totals.tax, charges: totals.charges, total: totals.total }}
        chargeDetails={chargeDetails}
        notes={values.notes ?? ''}
        onNotesChange={(v) => handleChange('notes', v)}
        printNotes={values.printNotes ?? true}
        onPrintNotesChange={(v) => handleChange('printNotes', v)}
        canSubmit={canSubmit}
        pending={pending}
        onSubmit={handleSubmitFromSidebar}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {/* Emisión (no editable) */}
        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-300">Emisión</span>
          <div className="w-40 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white">{values.issueDate || '-'}</div>
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
            onChange={(e) => setDueInDays(Number(e.target.value))}
          />
          <span className="text-xs text-slate-400">Fecha de vencimiento: {values.dueDate || '-'}</span>
          {dateInvalid ? <span className="text-xs text-red-400">La fecha de vencimiento no puede ser anterior a la emisión.</span> : null}
        </label>

        <div className="flex flex-col gap-1 sm:col-span-3">
          <span className="text-sm text-slate-300">Cliente</span>
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <input
                id="client-combobox"
                role="combobox"
                aria-expanded={clientOpen}
                aria-controls={clientListboxId}
                aria-autocomplete="list"
                aria-activedescendant={clientActiveIndex >= 0 && clients.data?.data?.[clientActiveIndex] ? `client-option-${clients.data.data[clientActiveIndex].id}` : undefined}
                className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 pr-9 text-white outline-none focus:ring"
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value)
                  setClientOpen(true)
                  setClientActiveIndex(-1)
                }}
                onFocus={() => setClientOpen(true)}
                onBlur={() => {
                  // Cerrar después de permitir clic en opciones (coordinado con onMouseDown en listbox)
                  setTimeout(() => setClientOpen(false), 100)
                }}
                onKeyDown={(e) => {
                  const items = clients.data?.data ?? []
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    if (!items.length) return
                    setClientOpen(true)
                    setClientActiveIndex((i) => (i + 1) % items.length)
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    if (!items.length) return
                    setClientOpen(true)
                    setClientActiveIndex((i) => (i <= 0 ? items.length - 1 : i - 1))
                  } else if (e.key === 'Enter') {
                    if (clientActiveIndex >= 0 && items[clientActiveIndex]) {
                      e.preventDefault()
                      const c = items[clientActiveIndex]
                      handleChange('customerId', c.id)
                      handleChange('customerName', c.name)
                      // Resetear sucursal al cambiar de cliente
                      handleChange('branchId', undefined)
                      handleChange('branchName', '')
                      setClientSearch(c.name)
                      setClientOpen(false)
                    }
                  } else if (e.key === 'Escape') {
                    setClientOpen(false)
                  }
                }}
                placeholder="Buscar cliente…"
              />
            {clientSearch ? (
              <button
                type="button"
                aria-label="Limpiar búsqueda de cliente"
                onClick={() => {
                  setClientSearch('')
                  setClientActiveIndex(-1)
                  setClientOpen(false)
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-0.5 text-slate-300 hover:bg-slate-800"
              >
                ×
              </button>
            ) : null}
          </div>
            {/* Botón crear cliente al lado del combobox */}
            <button
              type="button"
              className="shrink-0 rounded border border-slate-600 px-3 py-2 text-slate-200 hover:bg-slate-800"
              onClick={() => setOpenClientModal(true)}
            >
              Crear cliente
            </button>
          </div>

          {/* resultados (listbox) */}
          <div
            className={`basis-full max-h-40 overflow-auto rounded border border-slate-800 bg-slate-900 ${clientOpen ? '' : 'hidden'}`}
            role="listbox"
            id={clientListboxId}
            aria-label="Resultados de clientes"
            onMouseDown={(e) => {
              // Evitar que el blur cierre antes de click
              e.preventDefault()
            }}
          >
            {clients.isPending && !clients.data ? (
              <div className="px-3 py-2 text-sm text-slate-400" aria-live="polite">Buscando…</div>
            ) : clients.data?.data?.length ? (
              clients.data.data.map((c, idx) => {
                const isSelected = values.customerId === c.id
                const isActive = idx === clientActiveIndex
                return (
                  <div
                    id={`client-option-${c.id}`}
                    key={c.id}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setClientActiveIndex(idx)}
                    onClick={() => {
                      handleChange('customerId', c.id)
                      handleChange('customerName', c.name)
                      // Resetear sucursal al cambiar de cliente
                      handleChange('branchId', undefined)
                      handleChange('branchName', '')
                      setClientSearch(c.name)
                      setClientOpen(false)
                    }}
                    className={`flex cursor-pointer items-center justify-between px-3 py-2 text-slate-200 ${
                      isActive ? 'bg-slate-800 text-white' : ''
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    {isSelected ? <span className="text-xs text-slate-400">seleccionado</span> : null}
                  </div>
                )
              })
            ) : (
              <div className="px-3 py-2 text-sm text-slate-400" aria-live="polite">{clientSearch ? 'Sin resultados' : 'Escribe para buscar'}</div>
            )}
          </div>
        </div>

        <label className="hidden">
          <span className="text-sm text-slate-300">Moneda</span>
          <select
            className="w-40 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:ring"
            value={values.currency ?? 'PYG'}
            onChange={(e) => handleChange('currency', e.target.value)}
          >
            <option value="PYG">PYG</option>
          </select>
        </label>

        
        

        {/* Selector de Estación de Servicio (según cliente) */}
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showBranchSelector}
              onChange={(e) => {
                setShowBranchSelector(e.target.checked)
                if (!e.target.checked) {
                  setValues(prev => ({ ...prev, branchId: undefined, branchName: '' }))
                }
              }}
              className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-300">Elegir estación de servicio</span>
          </label>
          
          {showBranchSelector && values.customerId && (
            <label className="flex flex-col gap-1">
              <span className="text-sm text-slate-300">Estación de Servicio</span>
              <select
                disabled={!values.customerId || branches.isLoading}
                className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:ring disabled:opacity-60"
                value={values.branchId ?? ''}
                onChange={(e) => {
                  const branchId = e.target.value || undefined
                  const branch = (branches.data?.data ?? []).find((b) => b.id === branchId)
                  setValues((prev) => ({ ...prev, branchId, branchName: branch?.name ?? '' }))
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
          {showBranchSelector && values.customerId && (branches.data?.data?.length ?? 0) === 0 ? (
            <span className="text-xs text-slate-400">Sin sucursales para este cliente.</span>
          ) : null}
          
          {showBranchSelector && !values.customerId && (
            <span className="text-xs text-slate-400">Primero selecciona un cliente para ver las estaciones de servicio.</span>
          )}
        </div>
      </div>

      {/* (Notas y Cargos se mueven debajo de la grilla de productos) */}

      {/* Productos / Ítems */}
      <div className="relative space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Ítems</span>
          <div className="flex gap-2">
            <input
              ref={productSearchRef}
              className="w-64 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:ring"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Buscar producto…"
            />
            <button type="button" onClick={() => setOpenProductModal(true)} className="rounded border border-slate-600 px-3 py-2 text-slate-200 hover:bg-slate-800">
              Crear producto
            </button>
          </div>
        </div>
        {/* Botón flotante oculto */}
        <button type="button" className="hidden" aria-hidden="true" tabIndex={-1} />
        {productSearch.trim() ? (
          <div className="max-h-40 overflow-auto rounded border border-slate-800 bg-slate-900">
            {products.isPending && !products.data ? (
              <div className="px-3 py-2 text-sm text-slate-400">Buscando…</div>
            ) : products.data?.data?.length ? (
              products.data.data.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addItemFromProduct({ id: p.id, name: p.name, price: p.price, taxRate: p.taxRate })}
                  className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-slate-800 focus:bg-slate-800 text-slate-200"
                >
                  <span className="truncate">{p.name}</span>
                  <span className="text-xs text-slate-400">+ Agregar</span>
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-slate-400">Sin resultados</div>
            )}
          </div>
        ) : null}

        {/* Tabla de ítems */}
        <div className="overflow-x-hidden">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-slate-800 px-3 py-2 text-left w-2/5">Descripción</th>
                <th className="border border-slate-800 px-3 py-2 text-right w-20">Cantidad</th>
                <th className="border border-slate-800 px-3 py-2 text-right w-28">P. Unit</th>
                <th className="border border-slate-800 px-3 py-2 text-right w-28">Total</th>
                <th className="border border-slate-800 px-3 py-2 text-center w-16">Acción</th>
              </tr>
            </thead>
            <tbody>
              {(values.items ?? []).map((it, idx) => {
                return (
                  <tr key={idx}>
                    <td className="border border-slate-800 px-3 py-2">
                      <div className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white" title={it.description}>
                        {it.description}
                      </div>
                    </td>
                    <td className="border border-slate-800 px-3 py-2 text-right">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-right text-white outline-none"
                        value={it.quantity}
                        onChange={(e) => updateItem(idx, { quantity: Math.max(0, Math.trunc(Number(e.target.value) || 0)) })}
                      />
                    </td>
                    <td className="border border-slate-800 px-3 py-2 text-right">
                      <div className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-right text-white" title={String(it.unitPrice ?? 0)}>
                        {formatPrice(it.unitPrice ?? 0)}
                      </div>
                    </td>
                    <td className="border border-slate-800 px-3 py-2 text-right font-medium">
                      {formatPrice(it.quantity * it.unitPrice)}
                    </td>
                    <td className="border border-slate-800 px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="inline-flex items-center justify-center rounded border border-red-700 p-2 text-red-300 hover:bg-red-950 transition-colors"
                        aria-label="Eliminar ítem"
                        title="Eliminar ítem"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      

      {/* Cargos adicionales (debajo de Notas) */}
      <div className="space-y-2">
        {/* Chips para agregar cargos */}
        <div className="flex flex-wrap items-center gap-2">
          {allChargeTypes
            .filter((t) => !(values.additionalCharges ?? []).some((c) => c.type === t))
            .map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => addCharge(t)}
                className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-200 hover:bg-slate-800"
              >
                + {labelFromType(t)}
              </button>
            ))}
        </div>

        {(values.additionalCharges ?? []).length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {(values.additionalCharges ?? []).map((c) => (
              <div key={c.type} className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-2">
                <span className="min-w-24 flex-1 text-sm">{labelFromType(c.type)}</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  className="w-28 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-right text-white outline-none"
                  value={c.amount ?? 0}
                  onChange={(e) => upsertCharge(c.type, Number(e.target.value))}
                />
                <button
                  type="button"
                  aria-label="Quitar cargo"
                  className="rounded-full border border-red-700 px-2 py-1 text-xs text-red-300 hover:bg-red-950"
                  onClick={() => removeCharge(c.type)}
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      
    </form>

    {/* Modal Crear Cliente */}
    <ClientCreateModal
      open={openClientModal}
      onClose={() => setOpenClientModal(false)}
      onSuccess={(c) => {
        handleChange('customerId', c.id)
        handleChange('customerName', c.name)
        // Resetear sucursal al cambiar de cliente
        handleChange('branchId', undefined)
        handleChange('branchName', '')
        setOpenClientModal(false)
        setClientSearch('')
        success('Cliente creado')
      }}
    />

    {/* Modal Crear Producto */}
    <ProductCreateModal
      open={openProductModal}
      onClose={() => setOpenProductModal(false)}
      onSuccess={(p) => {
        addItemFromProduct({ id: p.id, name: p.name, price: p.price, taxRate: p.taxRate })
        setOpenProductModal(false)
        setProductSearch('')
        success('Producto creado')
      }}
    />
    </>
  )
}
