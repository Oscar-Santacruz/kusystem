import { Modal } from '@/shared/components/Modal'
import { ClientForm } from '@/modules/clients/components/ClientForm'
import { useCreateClient } from '@/modules/clients/hooks/useClients'
import type { Client } from '@/shared/types/domain'
import type { JSX } from 'react'

export interface ClientCreateModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (client: Client) => void
}

export function ClientCreateModal({ open, onClose, onSuccess }: ClientCreateModalProps): JSX.Element {
  const createClient = useCreateClient()

  return (
    <Modal open={open} title="Nuevo Cliente" onClose={onClose}>
      <ClientForm
        pending={createClient.isPending}
        onSubmit={(vals) => {
          createClient.mutate(vals, {
            onSuccess: (c) => {
              onSuccess(c)
              onClose()
            },
          })
        }}
      />
    </Modal>
  )
}

export default ClientCreateModal
