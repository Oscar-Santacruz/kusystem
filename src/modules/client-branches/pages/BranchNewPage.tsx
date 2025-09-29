import { type JSX } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BranchForm } from '@/modules/client-branches/components/BranchForm'
import { useCreateClientBranch } from '@/modules/client-branches/hooks/useClientBranches'
import { useToast } from '@/shared/ui/toast'

export function BranchNewPage(): JSX.Element {
  const { clientId } = useParams<{ clientId: string }>()
  const create = useCreateClientBranch(clientId)
  const navigate = useNavigate()
  const { success } = useToast()

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-200">Nueva sucursal</h2>
      </div>

      <div className="rounded border border-slate-700/50 bg-slate-800/30 p-6">
        <BranchForm
          pending={create.isPending}
          onSubmit={async (vals) => {
            await create.mutateAsync(vals)
            success('Sucursal creada')
            navigate(`/main/clients/${clientId}/branches`)
          }}
          onCancel={() => navigate(-1)}
        />
      </div>
    </section>
  )
}

export default BranchNewPage
