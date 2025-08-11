import { type JSX } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BranchForm } from '@/modules/client-branches/components/BranchForm'
import { useCreateClientBranch } from '@/modules/client-branches/hooks/useClientBranches'

export function BranchNewPage(): JSX.Element {
  const { clientId } = useParams<{ clientId: string }>()
  const create = useCreateClientBranch(clientId)
  const navigate = useNavigate()

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Nueva sucursal</h2>
      </div>

      <div className="rounded border border-slate-200 bg-white/50 p-4">
        <BranchForm
          pending={create.isPending}
          onSubmit={async (vals) => {
            await create.mutateAsync(vals)
            navigate(`/main/clients/${clientId}/branches`)
          }}
          onCancel={() => navigate(-1)}
        />
      </div>
    </section>
  )
}

export default BranchNewPage
