import { useEffect, useMemo, useState, type JSX } from 'react'
import type { CreateQuoteInput, QuoteItem } from '@/modules/quotes/types'
import { ClientCreateModal } from '@/modules/clients/components/ClientCreateModal'
import { ProductCreateModal } from '@/modules/products/components/ProductCreateModal'
import { useClients } from '@/modules/clients/hooks/useClients'
import { useProducts } from '@/modules/products/hooks/useProducts'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { useToast } from '@/shared/ui/toast'

export interface QuoteFormValues extends CreateQuoteInput {}

export interface QuoteFormProps {
  initialValues?: QuoteFormValues
  pending?: boolean
  onSubmit: (values: QuoteFormValues) => void | Promise<void>
}

const DEFAULTS: QuoteFormValues = {
  customerName: '',
  issueDate: '',
  dueDate: '',
  currency: 'USD',
  notes: '',
  items: [],
}

export function QuoteForm(props: QuoteFormProps): JSX.Element {
  const { onSubmit, pending = false, initialValues } = props
  const [values, setValues] = useState<QuoteFormValues>(initialValues ?? DEFAULTS)
  const [clientSearch, setClientSearch] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [openClientModal, setOpenClientModal] = useState(false)
  const [openProductModal, setOpenProductModal] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const dClientSearch = useDebouncedValue(clientSearch, 400)
  const dProductSearch = useDebouncedValue(productSearch, 400)
  const clients = useClients({ page: 1, pageSize: 20, search: dClientSearch })
  const products = useProducts({ page: 1, pageSize: 20, search: dProductSearch })
  const { success } = useToast()

  useEffect(() => {
    if (initialValues) setValues((v) => ({ ...v, ...initialValues }))
  }, [initialValues])

  function handleChange<K extends keyof QuoteFormValues>(key: K, val: QuoteFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: val }))
  }

  function addItemFromProduct(p: { id: string; name: string; price: number; taxRate?: number }) {
    const newItem: QuoteItem = {
      productId: p.id,
      description: p.name,
      quantity: 1,
      unitPrice: p.price,
      taxRate: p.taxRate ?? 0,
    }
    setValues((prev) => ({ ...prev, items: [...(prev.items ?? []), newItem] }))
  }

  function updateItem(index: number, patch: Partial<QuoteItem>) {
    setValues((prev) => {
      const items = [...(prev.items ?? [])]
      items[index] = { ...items[index], ...patch }
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
    const total = subtotal + tax - discount
    return { subtotal, tax, discount, total }
  }, [values.items])

  const canSubmit = Boolean(values.customerId) && ((values.items?.length ?? 0) > 0)

  return (
    <>
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault()
        setFormError(null)
        if (!canSubmit) {
          setFormError('Selecciona un cliente y agrega al menos un ítem.')
          return
        }
        await onSubmit(values)
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-slate-300">Cliente</span>
          <div className="flex gap-2">
            <input
              className="min-w-0 flex-1 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:ring"
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              placeholder="Buscar cliente…"
            />
            <button type="button" onClick={() => setOpenClientModal(true)} className="rounded border border-slate-600 px-3 py-2 text-slate-200 hover:bg-slate-800">
              Crear
            </button>
          </div>
          {/* resultados */}
          <div className="max-h-40 overflow-auto rounded border border-slate-800">
            {clients.isPending && !clients.data ? (
              <div className="px-3 py-2 text-sm text-slate-400">Buscando…</div>
            ) : clients.data?.data?.length ? (
              clients.data.data.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    handleChange('customerId', c.id)
                    handleChange('customerName', c.name)
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left hover:bg-slate-800 ${values.customerId === c.id ? 'bg-slate-800' : ''}`}
                >
                  <span className="truncate">{c.name}</span>
                  {values.customerId === c.id ? <span className="text-xs text-slate-400">seleccionado</span> : null}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-slate-400">{clientSearch ? 'Sin resultados' : 'Escribe para buscar'}</div>
            )}
          </div>
          {/* resumen */}
          <input
            required
            className="mt-2 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:ring"
            value={values.customerName}
            onChange={(e) => handleChange('customerName', e.target.value)}
            placeholder="Nombre del cliente"
          />
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-300">Moneda</span>
          <input
            className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:ring"
            value={values.currency ?? ''}
            onChange={(e) => handleChange('currency', e.target.value)}
            placeholder="USD"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-300">Emisión</span>
          <input
            type="date"
            className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:ring"
            value={values.issueDate ?? ''}
            onChange={(e) => handleChange('issueDate', e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-300">Vencimiento</span>
          <input
            type="date"
            className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:ring"
            value={values.dueDate ?? ''}
            onChange={(e) => handleChange('dueDate', e.target.value)}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-slate-300">Notas</span>
        <textarea
          className="min-h-[100px] rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:ring"
          value={values.notes ?? ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Notas internas o visibles en el PDF"
        />
      </label>

      {/* Productos / Ítems */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Ítems</span>
          <div className="flex gap-2">
            <input
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
        <div className="max-h-40 overflow-auto rounded border border-slate-800">
          {products.isPending && !products.data ? (
            <div className="px-3 py-2 text-sm text-slate-400">Buscando…</div>
          ) : products.data?.data?.length ? (
            products.data.data.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => addItemFromProduct({ id: p.id, name: p.name, price: p.price, taxRate: p.taxRate })}
                className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-slate-800"
              >
                <span className="truncate">{p.name}</span>
                <span className="text-xs text-slate-400">+ Agregar</span>
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-slate-400">{productSearch ? 'Sin resultados' : 'Escribe para buscar'}</div>
          )}
        </div>

        {/* Tabla de ítems */}
        <div className="overflow-auto">
          <table className="min-w-[700px] w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-slate-800 px-2 py-1 text-left">Descripción</th>
                <th className="border border-slate-800 px-2 py-1 text-right">Cantidad</th>
                <th className="border border-slate-800 px-2 py-1 text-right">P. Unit</th>
                <th className="border border-slate-800 px-2 py-1 text-right">Desc.</th>
                <th className="border border-slate-800 px-2 py-1 text-right">IVA</th>
                <th className="border border-slate-800 px-2 py-1 text-right">Total</th>
                <th className="border border-slate-800 px-2 py-1" />
              </tr>
            </thead>
            <tbody>
              {(values.items ?? []).map((it, idx) => {
                const lineTotal = it.quantity * it.unitPrice - (it.discount ?? 0)
                return (
                  <tr key={idx}>
                    <td className="border border-slate-800 px-2 py-1">
                      <input
                        className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-white outline-none"
                        value={it.description}
                        onChange={(e) => updateItem(idx, { description: e.target.value })}
                      />
                    </td>
                    <td className="border border-slate-800 px-2 py-1 text-right">
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        className="w-24 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-right text-white outline-none"
                        value={it.quantity}
                        onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
                      />
                    </td>
                    <td className="border border-slate-800 px-2 py-1 text-right">
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        className="w-28 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-right text-white outline-none"
                        value={it.unitPrice}
                        onChange={(e) => updateItem(idx, { unitPrice: Number(e.target.value) })}
                      />
                    </td>
                    <td className="border border-slate-800 px-2 py-1 text-right">
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        className="w-24 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-right text-white outline-none"
                        value={it.discount ?? 0}
                        onChange={(e) => updateItem(idx, { discount: Number(e.target.value) })}
                      />
                    </td>
                    <td className="border border-slate-800 px-2 py-1 text-right">
                      <input
                        type="number"
                        min={0}
                        max={1}
                        step={0.01}
                        className="w-24 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-right text-white outline-none"
                        value={it.taxRate ?? 0}
                        onChange={(e) => updateItem(idx, { taxRate: Number(e.target.value) })}
                      />
                    </td>
                    <td className="border border-slate-800 px-2 py-1 text-right">{lineTotal.toFixed(2)}</td>
                    <td className="border border-slate-800 px-2 py-1 text-center">
                      <button type="button" onClick={() => removeItem(idx)} className="rounded border border-red-700 px-2 py-1 text-red-300 hover:bg-red-950">Eliminar</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="ml-auto w-full max-w-xs space-y-1">
          <div className="flex justify-between"><span className="text-slate-300">Sub-Total</span><span>{totals.subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-slate-300">IVA</span><span>{totals.tax.toFixed(2)}</span></div>
          {totals.discount ? <div className="flex justify-between"><span className="text-slate-300">Descuento</span><span>-{totals.discount.toFixed(2)}</span></div> : null}
          <div className="flex justify-between font-semibold"><span>Total</span><span>{totals.total.toFixed(2)}</span></div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {formError ? <span className="text-sm text-red-400">{formError}</span> : null}
        <button
          type="submit"
          disabled={pending || !canSubmit}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 disabled:opacity-60"
        >
          {pending ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>

    {/* Modal Crear Cliente */}
    <ClientCreateModal
      open={openClientModal}
      onClose={() => setOpenClientModal(false)}
      onSuccess={(c) => {
        handleChange('customerId', c.id)
        handleChange('customerName', c.name)
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
