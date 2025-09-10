import { type FormEvent, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrganization } from '@/services/org'
import { useOrgStore } from '@/lib/org-store'
import { MobileActionBar } from '@/shared/ui/mobile-action-bar'
import { uploadOrgLogo } from '@/services/files'

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
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const logoPreview = useMemo(() => (logoFile ? URL.createObjectURL(logoFile) : null), [logoFile])

  function onNameChange(v: string) {
    setName(v)
    if (!slug) setSlug(slugify(v))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const nameTrim = name.trim()
      const slugTrim = slug.trim()
      let logoKey: string | undefined
      if (logoFile) {
        // 1) Subir imagen al servicio interno y obtener la key
        logoKey = await uploadOrgLogo(slugTrim, logoFile)
      }
      // 2) Crear organización pasando la key (si existe)
      const org = await createOrganization({ name: nameTrim, slug: slugTrim, logoUrl: logoKey })
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
    <div className="max-w-xl mx-auto p-6 pb-20 lg:pb-6">
      <h1 className="text-2xl font-semibold mb-4">Crear organización</h1>
      <form id="create-org-form" onSubmit={onSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <span className="text-sm text-gray-700">Logo de la empresa (opcional)</span>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 flex items-center justify-center rounded border bg-white overflow-hidden">
              {logoPreview ? (
                <img src={logoPreview} alt="Vista previa del logo" className="h-full w-full object-contain" />
              ) : (
                <span className="text-xs text-gray-400">Sin logo</span>
              )}
            </div>
            <label className="inline-flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                className="block text-sm"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null
                  setLogoFile(f)
                }}
              />
            </label>
          </div>
          <p className="text-xs text-gray-500">Formatos recomendados: PNG o SVG. Tamaño sugerido: 256x256.</p>
        </div>
        <label className="grid gap-2">
          <span className="text-sm text-gray-700">Nombre de la empresa</span>
          <input
            className="border rounded px-3 py-3"
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
            className="border rounded px-3 py-3"
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
        <div className="hidden lg:flex justify-end">
          <button
            disabled={loading}
            className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
          >
            {loading ? 'Creando…' : 'Crear organización'}
          </button>
        </div>
      </form>
      <MobileActionBar>
        <button
          disabled={loading}
          type="submit"
          form="create-org-form"
          className="w-full rounded bg-blue-600 px-4 py-3 text-white font-medium hover:bg-blue-500 disabled:opacity-60"
        >
          {loading ? 'Creando…' : 'Crear organización'}
        </button>
      </MobileActionBar>
    </div>
  )
}
