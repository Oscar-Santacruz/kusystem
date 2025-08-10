import { useEffect, useState, type JSX } from 'react'
import type { CreateClientInput } from '@/shared/types/domain'

export interface ClientFormValues extends CreateClientInput {}

export interface ClientFormProps {
  initialValues?: ClientFormValues
  pending?: boolean
  onSubmit: (values: ClientFormValues) => void | Promise<void>
}

const DEFAULTS: ClientFormValues = {
  name: '',
  taxId: '',
  phone: '',
  email: '',
}

export function ClientForm(props: ClientFormProps): JSX.Element {
  const { onSubmit, pending = false, initialValues } = props
  const [values, setValues] = useState<ClientFormValues>(initialValues ?? DEFAULTS)

  useEffect(() => {
    if (initialValues) setValues((v) => ({ ...v, ...initialValues }))
  }, [initialValues])

  function handleChange<K extends keyof ClientFormValues>(key: K, val: ClientFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: val }))
  }

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault()
        await onSubmit(values)
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-sm text-slate-600">Nombre</span>
          <input
            required
            className="rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring"
            value={values.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Nombre o Razón Social"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-600">RUC/CI</span>
          <input
            className="rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring"
            value={values.taxId ?? ''}
            onChange={(e) => handleChange('taxId', e.target.value)}
            placeholder="RUC/CI"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-600">Teléfono</span>
          <input
            className="rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring"
            value={values.phone ?? ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="Teléfono"
          />
        </label>

        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-sm text-slate-600">Email</span>
          <input
            type="email"
            className="rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring"
            value={values.email ?? ''}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="correo@dominio.com"
          />
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

export default ClientForm
