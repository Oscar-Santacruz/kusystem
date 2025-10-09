import { useEffect, useMemo, useRef, useState, type JSX } from 'react'
import { useSearchParams } from 'react-router-dom'

import type { CreateQuoteInput, QuoteItem, AdditionalChargeType } from '@/modules/quotes/types'
import { AdditionalChargeTypes } from '@/modules/quotes/types'
import { ClientCreateModal } from '@/modules/clients/components/ClientCreateModal'
import { ProductModal } from '@/modules/products/components/ProductModal'
import { useClients } from '@/modules/clients/hooks/useClients'
import { useProducts } from '@/modules/products/hooks/useProducts'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { useToast } from '@/shared/ui/toast'
import { useClientBranches } from '@/modules/client-branches/hooks/useClientBranches'
import { QuoteSidebar } from '@/modules/quotes/components/QuoteSidebar'
import { ChargesChips } from '@/modules/quotes/components/ChargesChips'
import { computeTotals } from '@/lib/quotes/calc'
import { ItemsSection } from '@/modules/quotes/components/ItemsSection'
import { GeneralSection } from '@/modules/quotes/components/GeneralSection'
import { ClientSelector } from '@/modules/quotes/components/ClientSelector'
import { MobileActionBar } from '@/shared/ui/mobile-action-bar'

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
  const [sp, setSp] = useSearchParams()
  const isClientModalOpen = sp.get('modal') === 'client' && (sp.get('mode') === 'create' || sp.get('mode') === 'edit')
  function openClientModal() {
    const next = new URLSearchParams(sp)
    next.set('modal', 'client')
    next.set('mode', 'create')
    next.delete('id')
    setSp(next, { replace: true })
  }
  function closeClientModal() {
    const next = new URLSearchParams(sp)
    next.delete('modal')
    next.delete('mode')
    next.delete('id')
    setSp(next, { replace: true })
  }
  const [openProductModal, setOpenProductModal] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const dClientSearch = useDebouncedValue(clientSearch, 400)
  const dProductSearch = useDebouncedValue(productSearch, 400)
  const clients = useClients({ page: 1, pageSize: 20, search: dClientSearch })
  const products = useProducts({ page: 1, pageSize: 20, search: dProductSearch })
  const { success } = useToast()
  const branches = useClientBranches(values.customerId, { page: 1, pageSize: 50 })
  // Combobox (clientes)
  // Combobox control interno movido a ClientSelector

  // Formateo con separador de miles para PYG (sin decimales)
  const nf = useMemo(() => new Intl.NumberFormat('es-AR', { useGrouping: true, minimumFractionDigits: 0, maximumFractionDigits: 0 }), [])
  function formatPrice(n: number): string {
    return nf.format(Number.isFinite(n) ? n : 0)
  }

  // Mostrar errores de formulario (validaciones generales)

  // Cargos adicionales dinámicos

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

  // Reordenar items (HTML5 DnD)
  function reorderItems(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return
    setValues((prev) => {
      const list = [...(prev.items ?? [])]
      if (fromIndex < 0 || fromIndex >= list.length) return prev
      if (toIndex < 0 || toIndex >= list.length) return prev
      const [moved] = list.splice(fromIndex, 1)
      list.splice(toIndex, 0, moved)
      return { ...prev, items: list }
    })
  }

  const totals = useMemo(() => {
    return computeTotals(values.items ?? [], values.additionalCharges ?? [])
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
      className="space-y-4 min-[1020px]:pr-[26rem] pb-24 min-[1020px]:pb-0"
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

      {/* Información General */}
      <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-200">📋 Información General</h3>
        
        {/* Cliente */}
        <ClientSelector
          valueId={values.customerId}
          clientSearch={clientSearch}
          setClientSearch={setClientSearch}
          clients={clients}
          onSelectClient={(id, name) => {
            handleChange('customerId', id)
            handleChange('customerName', name)
            // resetear sucursal al cambiar de cliente
            handleChange('branchId', undefined)
            handleChange('branchName', '')
          }}
          onOpenCreateClient={() => openClientModal()}
        />

        <div className="mt-4">
          <GeneralSection
            issueDate={values.issueDate || ''}
            dueInDays={dueInDays}
            dueDate={values.dueDate || ''}
            onChangeDueInDays={(n) => setDueInDays(n)}
            onChangeIssueDate={(d) => handleChange('issueDate', d)}
            customerId={values.customerId}
            branchId={values.branchId}
            branchName={values.branchName}
            showBranchSelector={showBranchSelector}
            setShowBranchSelector={(v) => {
              setShowBranchSelector(v)
              if (!v) setValues(prev => ({ ...prev, branchId: undefined, branchName: '' }))
            }}
            branches={branches}
            onSelectBranch={(branchId, branchName) => setValues(prev => ({ ...prev, branchId, branchName }))}
          />
        </div>
      </div>

      {/* Items */}
      <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-200">📦 Items</h3>
        
        {/* Productos / Ítems */}
        <ItemsSection
          productSearch={productSearch}
          setProductSearch={setProductSearch}
          productSearchRef={productSearchRef}
          products={products}
          onOpenCreateProduct={() => setOpenProductModal(true)}
          onAddFromProduct={(p) => addItemFromProduct(p)}
          onUpdateItem={(i, patch) => updateItem(i, patch)}
          onRemoveItem={(i) => removeItem(i)}
          onReorderItems={(from, to) => reorderItems(from, to)}
          items={values.items ?? []}
          formatPrice={formatPrice}
        />

        {/* Servicios Adicionales dentro de Items */}
        <div className="mt-6">
          <ChargesChips
            charges={(values.additionalCharges ?? []).map(c => ({ type: c.type, amount: c.amount }))}
            onAdd={(t) => addCharge(t)}
            onUpdate={(t, amount) => upsertCharge(t, amount)}
            onRemove={(t) => removeCharge(t)}
          />
        </div>


      </div>

      {/* Panel de resumen y notas: inline en mobile (<lg), flotante en desktop (lg) */}
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

      
      {/* Mobile sticky totals + action */}
      <MobileActionBar>
        <div className="flex items-center justify-between w-full gap-3">
          <div className="flex flex-col text-left">
            <span className="text-[11px] text-slate-400">Total</span>
            <span className="text-base font-semibold">{new Intl.NumberFormat('es-PY', { maximumFractionDigits: 0 }).format(totals.total)}</span>
          </div>
          <button
            type="submit"
            className="flex-1 rounded bg-blue-600 px-4 py-3 text-white font-medium hover:bg-blue-500 disabled:opacity-60"
            disabled={!canSubmit || !!pending}
          >
            {pending ? 'Guardando…' : 'Guardar presupuesto'}
          </button>
        </div>
      </MobileActionBar>
    </form>

    {/* Modal Crear Cliente */}
    <ClientCreateModal
      open={isClientModalOpen}
      onClose={() => closeClientModal()}
      onSuccess={(c) => {
        handleChange('customerId', c.id)
        handleChange('customerName', c.name)
        // Resetear sucursal al cambiar de cliente
        handleChange('branchId', undefined)
        handleChange('branchName', '')
        closeClientModal()
        setClientSearch('')
        success('Cliente creado')
      }}
    />

    {/* Modal Producto unificado (modo crear) */}
    <ProductModal
      mode="create"
      open={openProductModal}
      onClose={() => setOpenProductModal(false)}
      onSuccess={(_, p) => {
        addItemFromProduct({ id: p.id, name: p.name, price: p.price, taxRate: p.taxRate })
        setOpenProductModal(false)
        setProductSearch('')
        success('Producto creado')
      }}
    />
    </>
  )
}
