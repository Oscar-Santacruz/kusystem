import { type JSX } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BranchForm } from '@/modules/client-branches/components/BranchForm'
import { useClientBranch, useUpdateClientBranch } from '@/modules/client-branches/hooks/useClientBranches'
import { useToast } from '@/shared/ui/toast'

export function BranchEditPage(): JSX.Element {
  const { id } = useParams<{ id: string }>()
  const { data, isPending } = useClientBranch(id)
  const update = useUpdateClientBranch()
  const navigate = useNavigate()
  const { success } = useToast()

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-200">Editar sucursal</h2>
      </div>

      <div className="rounded border border-slate-700/50 bg-slate-800/30 p-6">
        {isPending && !data ? (
          <div className="text-slate-400">Cargando…</div>
        ) : data ? (
          <BranchForm
            initialValues={{ name: data.name, address: data.address ?? '' }}
            pending={update.isPending}
            onSubmit={async (vals) => {
              if (!id) return
              await update.mutateAsync({ id, input: vals })
              success('Sucursal actualizada')
              navigate(-1)
            }}
            onCancel={() => navigate(-1)}
          />
        ) : (
          <div className="text-red-400">No se encontró la sucursal</div>
        )}
      </div>
    </section>
  )
}

export default BranchEditPage
