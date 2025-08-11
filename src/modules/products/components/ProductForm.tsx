import { useEffect, useState, type JSX } from 'react'
import { z } from 'zod'
import type { CreateProductInput } from '@/shared/types/domain'

export interface ProductFormValues extends CreateProductInput {}

export interface ProductFormProps {
  initialValues?: ProductFormValues
  pending?: boolean
  onSubmit: (values: ProductFormValues) => void | Promise<void>
}

const DEFAULTS: ProductFormValues = {
  sku: '',
  name: '',
  unit: 'UN',
  price: 0,
  taxRate: 0.1,
}

export function ProductForm(props: ProductFormProps): JSX.Element {
  const { onSubmit, pending = false, initialValues } = props
  const [values, setValues] = useState<ProductFormValues>(initialValues ?? DEFAULTS)
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormValues, string>>>({})

  const ProductSchema = z.object({
    name: z.string().trim().min(2, 'El nombre es requerido'),
    sku: z
      .string()
      .trim()
      .optional()
      .or(z.literal(''))
      .transform((v) => (v ? v : undefined)),
    unit: z.string().trim().min(1, 'Unidad requerida'),
    price: z.number().min(0, 'Precio inválido'),
    taxRate: z.number().min(0, 'Debe ser >= 0').max(1, 'Debe ser <= 1'),
  })

  useEffect(() => {
    if (initialValues) setValues((v) => ({ ...v, ...initialValues }))
  }, [initialValues])

  function handleChange<K extends keyof ProductFormValues>(key: K, val: ProductFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: val }))
  }

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault()
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
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-sm text-slate-600">Nombre</span>
          <input
            className="rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring"
            value={values.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Nombre del producto"
          />
          {errors.name ? <span className="text-xs text-red-600">{errors.name}</span> : null}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-600">SKU</span>
          <input
            className="rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring"
            value={values.sku ?? ''}
            onChange={(e) => handleChange('sku', e.target.value)}
            placeholder="SKU"
          />
          {errors.sku ? <span className="text-xs text-red-600">{errors.sku}</span> : null}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-600">Unidad</span>
          <input
            className="rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring"
            value={values.unit ?? ''}
            onChange={(e) => handleChange('unit', e.target.value)}
            placeholder="UN"
          />
          {errors.unit ? <span className="text-xs text-red-600">{errors.unit}</span> : null}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-600">Precio</span>
          <input
            type="number"
            min={0}
            step={0.01}
            className="rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring"
            value={values.price}
            onChange={(e) => handleChange('price', Number(e.target.value))}
            placeholder="0"
          />
          {errors.price ? <span className="text-xs text-red-600">{errors.price}</span> : null}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-600">IVA (tasa)</span>
          <input
            type="number"
            min={0}
            max={1}
            step={0.01}
            className="rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring"
            value={values.taxRate ?? 0}
            onChange={(e) => handleChange('taxRate', Number(e.target.value))}
            placeholder="0.1 = 10%"
          />
          {errors.taxRate ? <span className="text-xs text-red-600">{errors.taxRate}</span> : null}
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <button type="submit" disabled={pending} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 disabled:opacity-60">
          {pending ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}

export default ProductForm
