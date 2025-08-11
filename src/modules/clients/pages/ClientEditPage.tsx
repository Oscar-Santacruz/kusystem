import { type JSX } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ClientForm } from '@/modules/clients/components/ClientForm'
import { useClient, useUpdateClient } from '@/modules/clients/hooks/useClients'
import { useToast } from '@/shared/ui/toast'

export function ClientEditPage(): JSX.Element {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useClient(id)
  const update = useUpdateClient()
  const navigate = useNavigate()
  const { success } = useToast()

  if (isLoading) return <div className="p-4">Cargando…</div>
  if (!data) return <div className="p-4">No se encontró el cliente</div>

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Editar Cliente</h1>
        {id ? (
          <div className="space-x-2">
            <Link className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-50" to={`/main/clients/${id}/branches`}>
              Sucursales
            </Link>
          </div>
        ) : null}
      </div>

      <ClientForm
        initialValues={{
          name: data.name,
          taxId: data.taxId,
          phone: data.phone,
          email: data.email,
        }}
        pending={update.isPending}
        onSubmit={(vals) => {
          if (!id) return
          update.mutate({ id, input: vals }, {
            onSuccess: () => {
              success('Cliente actualizado')
              navigate('/main/clients')
            },
          })
        }}
      />
    </div>
  )
}

export default ClientEditPage
