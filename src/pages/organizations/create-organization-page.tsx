import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrganization } from '@/services/org'
import { useOrgStore } from '@/lib/org-store'

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40)
}

export function CreateOrganizationPage() {
  const navigate = useNavigate()
  const setOrgId = useOrgStore((s) => s.setOrgId)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function onNameChange(v: string) {
    setName(v)
    if (!slug) setSlug(slugify(v))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const org = await createOrganization({ name: name.trim(), slug: slug.trim() })
      // org.id puede venir como string
      const id = (org as any).id?.toString?.() ?? String((org as any).id)
      setOrgId(id)
      navigate('/main/welcome', { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.error ?? err?.message ?? 'Error al crear organización')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Crear organización</h1>
      <form onSubmit={onSubmit} className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm text-gray-700">Nombre de la empresa</span>
          <input
            className="border rounded px-3 py-2"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Mi Empresa S.A."
            required
            minLength={2}
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm text-gray-700">Nombre corto (slug)</span>
          <input
            className="border rounded px-3 py-2"
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            placeholder="mi-empresa"
            required
            minLength={3}
            maxLength={40}
            pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
            title="Min 3, letras minúsculas/números/guiones"
          />
        </label>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button
          disabled={loading}
          className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {loading ? 'Creando…' : 'Crear organización'}
        </button>
      </form>
    </div>
  )
}
