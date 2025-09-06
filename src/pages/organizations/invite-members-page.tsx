import { useState } from 'react'
import { createInvitation } from '@/services/org'

export function InviteMembersPage() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'member'>('member')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInviteUrl(null)
    setLoading(true)
    try {
      const res = await createInvitation({ email: email.trim(), role })
      setInviteUrl(res.inviteUrl)
    } catch (err: any) {
      setError(err?.response?.data?.error ?? err?.message ?? 'No se pudo crear la invitación')
    } finally {
      setLoading(false)
    }
  }

  async function onCopy() {
    if (!inviteUrl) return
    try {
      await navigator.clipboard.writeText(inviteUrl)
      alert('Enlace copiado al portapapeles')
    } catch {
      // Fallback
      window.prompt('Copia el enlace de invitación:', inviteUrl)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Invitar miembros</h1>
      <p className="text-sm text-slate-400 mb-6">Solo owners/admins pueden invitar a esta organización.</p>

      <form onSubmit={onSubmit} className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm text-gray-300">Correo del invitado</span>
          <input
            type="email"
            className="border border-slate-700 bg-slate-900 text-slate-100 rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="invitee@example.com"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-gray-300">Rol</span>
          <select
            className="border border-slate-700 bg-slate-900 text-slate-100 rounded px-3 py-2"
            value={role}
            onChange={(e) => setRole(e.target.value as 'admin' | 'member')}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        {error && <div className="text-red-400 text-sm">{error}</div>}

        <button
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded px-4 py-2"
        >
          {loading ? 'Creando…' : 'Crear invitación'}
        </button>
      </form>

      {inviteUrl && (
        <div className="mt-6 grid gap-2">
          <label className="text-sm text-gray-300">Enlace de invitación</label>
          <div className="flex items-center gap-2">
            <input
              className="flex-1 border border-slate-700 bg-slate-900 text-slate-100 rounded px-3 py-2"
              value={inviteUrl}
              readOnly
            />
            <button onClick={onCopy} className="bg-slate-700 hover:bg-slate-600 text-white rounded px-3 py-2">
              Copiar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
