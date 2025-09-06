import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { acceptInvitation, getInvitationByToken } from '@/services/org'
import { useOrgStore } from '@/lib/org-store'

export function InvitationAcceptPage() {
  const { token } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [orgName, setOrgName] = useState<string | null>(null)
  const setOrgId = useOrgStore((s) => s.setOrgId)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!token) return
      try {
        const info = await getInvitationByToken(token)
        if (cancelled) return
        setEmail(info.email)
        setOrgName(info.organization.name)
        setError(null)
      } catch (e: any) {
        setError(e?.response?.data?.error || 'Invitación inválida o expirada')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [token])

  async function onAccept() {
    if (!token) return
    setLoading(true)
    try {
      const res = await acceptInvitation(token)
      const id = res.tenantId?.toString?.() ?? String(res.tenantId)
      setOrgId(id)
      navigate('/main/welcome', { replace: true })
    } catch (e: any) {
      setError(e?.response?.data?.error || 'No se pudo aceptar la invitación')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-6">Cargando invitación…</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Aceptar invitación</h1>
      <p className="text-gray-700 mb-6">
        Te invitaron a unirte a <strong>{orgName}</strong>
        {email ? <> con el correo <strong>{email}</strong></> : null}.
      </p>
      <button onClick={onAccept} className="bg-blue-600 text-white rounded px-4 py-2">Aceptar</button>
    </div>
  )
}
