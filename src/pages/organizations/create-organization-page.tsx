import { type FormEvent, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrganization } from '@/services/org'
import { useOrgStore } from '@/lib/org-store'
import { MobileActionBar } from '@/shared/ui/mobile-action-bar'
import { ImageUploader } from '@/shared/ui/image-uploader'
import { getEnv } from '@/config/env'

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
  const [logoKey, setLogoKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadUrl = useMemo(() => {
    const { VITE_FILES_BASE_URL } = getEnv()
    const base = VITE_FILES_BASE_URL || 'http://localhost:3000'
    const key = `kusystem/${encodeURIComponent(slug || 'temp')}/logo.png`
    return `${base}/api/files/${key}`
  }, [slug])

  // URL completa para vista previa
  const previewUrl = useMemo(() => {
    if (!logoKey) return null
    const { VITE_FILES_BASE_URL } = getEnv()
    const base = VITE_FILES_BASE_URL || 'http://localhost:3000'
    return `${base}/api/files/${logoKey}`
  }, [logoKey])

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
      // Crear organización pasando la key del logo (si se subió)
      const org = await createOrganization({ name: nameTrim, slug: slugTrim, logoUrl: logoKey || undefined })
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
          <ImageUploader
            uploadUrl={uploadUrl}
            onUploadSuccess={(fileKey) => {
              setLogoKey(fileKey)
            }}
            onUploadError={(error) => {
              console.error('Error al subir logo:', error)
              setError('Error al subir el logo. Por favor intenta de nuevo.')
            }}
            previewUrl={previewUrl}
            onClearPreview={() => setLogoKey(null)}
            helpText="Formatos recomendados: PNG o SVG. Tamaño sugerido: 256x256. Máximo: 5MB."
            disabled={loading}
            height={150}
          />
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
