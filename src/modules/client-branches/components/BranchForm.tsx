import { useEffect, useState, type JSX } from 'react'
import { z } from 'zod'
import type { CreateClientBranchInput } from '@/shared/types/domain'

export interface BranchFormValues extends Omit<CreateClientBranchInput, 'clientId'> {}

interface BranchFormProps {
  initialValues?: Partial<BranchFormValues>
  pending?: boolean
  onSubmit: (values: BranchFormValues) => Promise<void> | void
  onCancel?: () => void
}

const DEFAULTS: BranchFormValues = {
  name: '',
  address: '',
}

const BranchSchema = z.object({
  name: z.string().trim().min(2, 'El nombre es requerido'),
  address: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined)),
})

export function BranchForm(props: BranchFormProps): JSX.Element {
  const { initialValues, pending = false, onSubmit, onCancel } = props
  const [values, setValues] = useState<BranchFormValues>({ ...DEFAULTS, ...initialValues })
  const [errors, setErrors] = useState<Partial<Record<keyof BranchFormValues, string>>>({})

  useEffect(() => {
    if (initialValues) setValues((v) => ({ ...v, ...initialValues }))
  }, [initialValues])

  function handleChange<K extends keyof BranchFormValues>(key: K, value: BranchFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    e.stopPropagation()
    const result = BranchSchema.safeParse(values)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof BranchFormValues, string>> = {}
      for (const issue of result.error.issues) {
        const path = issue.path[0] as keyof BranchFormValues
        if (path) fieldErrors[path] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    await onSubmit(result.data as BranchFormValues)
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-600">Nombre</span>
          <input
            id="name"
            className="rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring"
            value={values.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Sucursal principal"
          />
          {errors.name ? <span className="text-xs text-red-600">{errors.name}</span> : null}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-600">Dirección (opcional)</span>
          <input
            id="address"
            className="rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring"
            value={values.address ?? ''}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Calle 123, Ciudad"
          />
          {errors.address ? <span className="text-xs text-red-600">{errors.address}</span> : null}
        </label>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 disabled:opacity-60"
        >
          {pending ? 'Guardando…' : 'Guardar'}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-slate-300 px-4 py-2 hover:bg-slate-50"
          >
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  )
}

export default BranchForm
