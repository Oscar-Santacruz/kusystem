import { type JSX } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClientForm } from '@/modules/clients/components/ClientForm'
import { useCreateClient } from '@/modules/clients/hooks/useClients'

export function ClientNewPage(): JSX.Element {
  const create = useCreateClient()
  const navigate = useNavigate()

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Nuevo Cliente</h1>
      </div>

      <ClientForm
        pending={create.isPending}
        onSubmit={(vals) => {
          create.mutate(vals, {
            onSuccess: () => navigate('/main/clients'),
          })
        }}
      />
    </div>
  )
}

export default ClientNewPage
