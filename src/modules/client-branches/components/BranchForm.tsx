import { useState, type JSX } from 'react'
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

export function BranchForm(props: BranchFormProps): JSX.Element {
  const { initialValues, pending = false, onSubmit, onCancel } = props
  const [values, setValues] = useState<BranchFormValues>({ ...DEFAULTS, ...initialValues })
  const [error, setError] = useState<string | null>(null)

  function handleChange<K extends keyof BranchFormValues>(key: K, value: BranchFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!values.name?.trim()) {
      setError('El nombre es requerido')
      return
    }
    await onSubmit({
      name: values.name.trim(),
      address: values.address?.toString().trim() || undefined,
    })
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="name">Nombre</label>
        <input
          id="name"
          className="rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={values.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Sucursal principal"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="address">Dirección (opcional)</label>
        <input
          id="address"
          className="rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={values.address ?? ''}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Calle 123, Ciudad"
        />
      </div>

      {error ? <div className="text-sm text-red-500">{error}</div> : null}

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
