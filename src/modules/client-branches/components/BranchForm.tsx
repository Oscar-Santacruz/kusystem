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
      <div className="grid gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-300">Nombre</span>
          <input
            id="name"
            className="rounded border border-slate-600 bg-slate-700 px-3 py-2 text-slate-200 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={values.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Sucursal principal"
          />
          {errors.name ? <span className="text-xs text-red-400">{errors.name}</span> : null}
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-300">Dirección (opcional)</span>
          <input
            id="address"
            className="rounded border border-slate-600 bg-slate-700 px-3 py-2 text-slate-200 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={values.address ?? ''}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Calle 123, Ciudad"
          />
          {errors.address ? <span className="text-xs text-red-400">{errors.address}</span> : null}
        </label>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? 'Guardando…' : 'Guardar'}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-slate-600 px-4 py-2 font-medium text-slate-300 hover:bg-slate-700"
          >
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  )
}

export default BranchForm
