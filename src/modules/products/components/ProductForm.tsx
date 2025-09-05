import { useEffect, useState, useId, type JSX } from 'react'
import { z } from 'zod'
import type { CreateProductInput } from '@/shared/types/domain'
import { formatCurrency } from '@/shared/utils/format'

export interface ProductFormValues extends CreateProductInput {}

export interface ProductFormProps {
  initialValues?: ProductFormValues
  pending?: boolean
  onSubmit: (values: ProductFormValues) => void | Promise<void>
  /** Si true, el precio ingresado se interpreta como precio final con IVA incluido */
  priceIncludesTax?: boolean
  /** Callback opcional para alternar el modo IVA incluido (controlado desde el padre) */
  onChangePriceIncludesTax?: (value: boolean) => void
  /** ID opcional del formulario para asociar botones externos (footer del modal) */
  formId?: string
  /** Callback opcional para reportar cambios del formulario al padre (para guards, previews, etc.) */
  onChange?: (values: ProductFormValues) => void
}

const DEFAULTS: ProductFormValues = {
  sku: '',
  name: '',
  description: '',
  unit: 'UN',
  price: 0,
  cost: 0,
  taxRate: 0.1,
  stock: 0,
  minStock: 0,
  barcode: ''
}

export function ProductForm(props: ProductFormProps): JSX.Element {
  const { onSubmit, pending = false, initialValues, priceIncludesTax = false, onChangePriceIncludesTax, formId } = props
  const [values, setValues] = useState<ProductFormValues>(initialValues ?? DEFAULTS)
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormValues, string>>>({})
  const uid = useId()

  const ProductSchema = z.object({
    name: z.string().trim().min(2, 'El nombre es requerido'),
    sku: z
      .string()
      .trim()
      .optional()
      .or(z.literal(''))
      .transform((v) => (v ? v : undefined)),
    description: z.string().optional(),
    unit: z.string().trim().min(1, 'Unidad requerida'),
    price: z.number().min(0, 'Precio inválido'),
    cost: z.number().min(0, 'Costo inválido'),
    taxRate: z.number().min(0, 'Debe ser >= 0').max(1, 'Debe ser <= 1'),
    stock: z.number().min(0, 'Stock inválido'),
    minStock: z.number().min(0, 'Stock mínimo inválido'),
    barcode: z.string().optional()
  })

  useEffect(() => {
    if (initialValues) {
      setValues((v) => {
        const next = { ...v, ...initialValues }
        props.onChange?.(next)
        return next
      })
    }
  }, [initialValues])

  function handleChange<K extends keyof ProductFormValues>(key: K, val: ProductFormValues[K]) {
    setValues((prev) => {
      const next = { ...prev, [key]: val }
      props.onChange?.(next)
      return next
    })
  }

  // Helpers para formateo y parsing de enteros con separador de miles
  const formatInt = (n: number | undefined | null) => {
    const v = typeof n === 'number' ? n : 0
    return v === 0 ? '' : new Intl.NumberFormat('es-PY').format(Math.trunc(Math.abs(v)))
  }
  const parseIntFromString = (s: string) => {
    const digits = s.replace(/\D+/g, '')
    if (!digits) return 0
    return Math.trunc(Number(digits))
  }

  // Cálculos dependiendo si el precio ingresado incluye IVA o no
  const netPrice = priceIncludesTax ? values.price / (1 + (values.taxRate || 0)) : values.price
  const taxAmount = priceIncludesTax ? values.price - netPrice : values.price * (values.taxRate || 0)
  const total = priceIncludesTax ? values.price : values.price + taxAmount
  const profit = netPrice - (values.cost || 0)
  const profitMargin = netPrice > 0 ? (profit / netPrice) * 100 : 0

  return (
    <form
      id={formId}
      className="flex flex-col md:flex-row gap-6"
      onSubmit={async (e) => {
        e.preventDefault()
        e.stopPropagation()
        const result = ProductSchema.safeParse(values)
        if (!result.success) {
          const fieldErrors: Partial<Record<keyof ProductFormValues, string>> = {}
          for (const issue of result.error.issues) {
            const path = issue.path[0] as keyof ProductFormValues
            if (path) fieldErrors[path] = issue.message
          }
          setErrors(fieldErrors)
          return
        }
        setErrors({})
        await onSubmit(result.data as ProductFormValues)
      }}
    >
      <div className="flex-1 space-y-6">
        <p className="text-sm text-slate-500">Completa la información del producto. Los campos marcados con <span className="text-red-500">*</span> son obligatorios.</p>
        {/* Basic Information Section */}
        <div className="space-y-4 border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-blue-600">📦</span>
            <h3 className="font-medium text-slate-700">Información Básica</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor={`${uid}-name`}>
                Nombre del producto <span className="text-red-500">*</span>
              </label>
              <input
                id={`${uid}-name`}
                type="text"
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                autoFocus
                value={values.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={pending}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor={`${uid}-description`}>
                Descripción
              </label>
              <textarea
                id={`${uid}-description`}
                rows={3}
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={values.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                disabled={pending}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor={`${uid}-sku`}>
                  Código
                </label>
                <input
                  id={`${uid}-sku`}
                  type="text"
                  className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={values.sku || ''}
                  onChange={(e) => handleChange('sku', e.target.value)}
                  disabled={pending}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor={`${uid}-barcode`}>
                  Código de barras
                </label>
                <input
                  id={`${uid}-barcode`}
                  type="text"
                  className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={values.barcode || ''}
                  onChange={(e) => handleChange('barcode', e.target.value)}
                  disabled={pending}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor={`${uid}-unit`}>
                  Unidad de medida <span className="text-red-500">*</span>
                </label>
                <select
                  id={`${uid}-unit`}
                  className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={values.unit}
                  onChange={(e) => handleChange('unit', e.target.value)}
                  disabled={pending}
                >
                  <option value="UN">Unidad (UN)</option>
                  <option value="KG">Kilogramo (KG)</option>
                  <option value="LT">Litro (LT)</option>
                  <option value="M">Metro (M)</option>
                  <option value="M2">Metro cuadrado (M²)</option>
                  <option value="M3">Metro cúbico (M³)</option>
                </select>
                {errors.unit && <p className="mt-1 text-sm text-red-600">{errors.unit}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing and Tax Section */}
        <div className="space-y-4 border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-blue-600">💲</span>
            <h3 className="font-medium text-slate-700">Precios e IVA</h3>
          </div>
          {priceIncludesTax && (
            <p className="text-xs text-slate-500">Modo activo: el precio ingresado incluye IVA. Los totales se calculan a partir del precio bruto.</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor={`${uid}-cost`}>
                Costo
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 sm:text-sm">₲</span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  id={`${uid}-cost`}
                  className="block w-full pl-7 pr-12 rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formatInt(values.cost)}
                  onChange={(e) => handleChange('cost', parseIntFromString(e.target.value))}
                  disabled={pending}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700" htmlFor={`${uid}-price`}>
                  Precio de venta <span className="text-red-500">*</span>
                </label>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${priceIncludesTax ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                  {priceIncludesTax ? 'Con IVA' : 'Sin IVA'}
                </span>
              </div>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 sm:text-sm">₲</span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  id={`${uid}-price`}
                  className="block w-full pl-7 pr-12 rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formatInt(values.price)}
                  onChange={(e) => handleChange('price', parseIntFromString(e.target.value))}
                  disabled={pending}
                />
              </div>
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor={`${uid}-taxRate`}>
                IVA (%)
              </label>
              <div className="flex items-center gap-3">
                <div className="relative rounded-md shadow-sm flex-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="10"
                    id={`${uid}-taxRate`}
                    className="block w-full pr-12 rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={values.taxRate || values.taxRate === 0 ? String(Math.trunc((values.taxRate || 0) * 100)) : ''}
                    onChange={(e) => {
                      const intVal = parseIntFromString(e.target.value)
                      const capped = Math.max(0, Math.min(100, intVal))
                      handleChange('taxRate', capped / 100)
                    }}
                    disabled={pending}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 sm:text-sm">%</span>
                  </div>
                </div>

                <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    checked={priceIncludesTax}
                    onChange={(e) => onChangePriceIncludesTax?.(e.target.checked)}
                    disabled={pending}
                  />
                  <span>Incluye IVA</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Section */}
        <div className="space-y-4 border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-blue-600">📦</span>
            <h3 className="font-medium text-slate-700">Inventario</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor={`${uid}-stock`}>
                Stock actual
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                id={`${uid}-stock`}
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formatInt(values.stock)}
                onChange={(e) => handleChange('stock', parseIntFromString(e.target.value))}
                disabled={pending}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor={`${uid}-minStock`}>
                Stock mínimo
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                id={`${uid}-minStock`}
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formatInt(values.minStock)}
                onChange={(e) => handleChange('minStock', parseIntFromString(e.target.value))}
                disabled={pending}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Price Summary */}
      <div className="w-full md:w-96 flex-shrink-0">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-blue-600">🧮</span>
            <h3 className="font-medium text-slate-800">Resumen de Precios</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">{priceIncludesTax ? 'Precio bruto (con IVA):' : 'Precio de venta:'}</span>
              <span className="font-medium">{formatCurrency(values.price)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">IVA ({Math.round((values.taxRate || 0) * 100)}%):</span>
              <span className="font-medium">{formatCurrency(taxAmount)}</span>
            </div>
            
            <div className="border-t border-slate-200 my-2"></div>
            
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span className="text-blue-600">{formatCurrency(total)}</span>
            </div>
            
            <div className="border-t border-slate-200 my-2"></div>
            
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Costo:</span>
              <span className="text-sm">{formatCurrency(values.cost || 0)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Ganancia:</span>
              <span className="text-sm">{formatCurrency(profit)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Margen de ganancia:</span>
              <span className="text-sm">{profitMargin.toFixed(2)}%</span>
            </div>
            <div className={`mt-3 rounded-md border ${priceIncludesTax ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600'} p-3 text-xs` }>
              {priceIncludesTax ? (
                <p>Precio incluye IVA: Sí. El valor ingresado ya contiene el impuesto, se desglosa automáticamente.</p>
              ) : (
                <p>Precio incluye IVA: No. El impuesto se calcula sobre el precio indicado.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

export default ProductForm
