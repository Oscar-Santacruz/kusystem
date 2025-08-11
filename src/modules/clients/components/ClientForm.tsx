import { useEffect, useState, useId, type JSX } from 'react'
import { z } from 'zod'
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

const ClientSchema = z.object({
  name: z.string().trim().min(2, 'El nombre es requerido'),
  taxId: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined)),
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined)),
  email: z
    .string()
    .trim()
    .email('Email inválido')
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined)),
})

export function ClientForm(props: ClientFormProps): JSX.Element {
  const { onSubmit, pending = false, initialValues } = props
  const [values, setValues] = useState<ClientFormValues>(initialValues ?? DEFAULTS)
  const [errors, setErrors] = useState<Partial<Record<keyof ClientFormValues, string>>>({})
  const uid = useId()

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
        e.stopPropagation()
        const result = ClientSchema.safeParse(values)
        if (!result.success) {
          const fieldErrors: Partial<Record<keyof ClientFormValues, string>> = {}
          for (const issue of result.error.issues) {
            const path = issue.path[0] as keyof ClientFormValues
            if (path) fieldErrors[path] = issue.message
          }
          setErrors(fieldErrors)
          return
        }
        setErrors({})
        await onSubmit(result.data as ClientFormValues)
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 sm:col-span-2" htmlFor={`${uid}-name`}>
          <span className="text-sm text-slate-600">Nombre</span>
          <input
            className="rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring"
            id={`${uid}-name`}
            value={values.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Nombre o Razón Social"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${uid}-name-error` : undefined}
          />
          {errors.name ? <span id={`${uid}-name-error`} className="text-xs text-red-600">{errors.name}</span> : null}
        </label>

        <label className="flex flex-col gap-1" htmlFor={`${uid}-taxid`}>
          <span className="text-sm text-slate-600">RUC/CI</span>
          <input
            className="rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring"
            id={`${uid}-taxid`}
            value={values.taxId ?? ''}
            onChange={(e) => handleChange('taxId', e.target.value)}
            placeholder="RUC/CI"
            aria-invalid={Boolean(errors.taxId)}
            aria-describedby={errors.taxId ? `${uid}-taxid-error` : undefined}
          />
          {errors.taxId ? <span id={`${uid}-taxid-error`} className="text-xs text-red-600">{errors.taxId}</span> : null}
        </label>

        <label className="flex flex-col gap-1" htmlFor={`${uid}-phone`}>
          <span className="text-sm text-slate-600">Teléfono</span>
          <input
            className="rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring"
            id={`${uid}-phone`}
            value={values.phone ?? ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="Teléfono"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? `${uid}-phone-error` : undefined}
          />
          {errors.phone ? <span id={`${uid}-phone-error`} className="text-xs text-red-600">{errors.phone}</span> : null}
        </label>

        <label className="flex flex-col gap-1 sm:col-span-2" htmlFor={`${uid}-email`}>
          <span className="text-sm text-slate-600">Email</span>
          <input
            type="email"
            className="rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring"
            id={`${uid}-email`}
            value={values.email ?? ''}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="correo@dominio.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${uid}-email-error` : undefined}
          />
          {errors.email ? <span id={`${uid}-email-error`} className="text-xs text-red-600">{errors.email}</span> : null}
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
