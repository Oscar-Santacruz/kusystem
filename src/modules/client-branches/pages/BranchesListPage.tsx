import { type JSX, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useClientBranches, useDeleteClientBranch } from '@/modules/client-branches/hooks/useClientBranches'
import { useToast } from '@/shared/ui/toast'
import { DataTable } from '@/shared/components/DataTable'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import { FaPencilAlt, FaTrash } from 'react-icons/fa'

interface ClientBranch {
  id: string
  name: string
  address?: string | null
}

export function BranchesListPage(): JSX.Element {
  const { clientId } = useParams<{ clientId: string }>()
  const navigate = useNavigate()
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(15)
  
  const { data, isPending, isError, refetch } = useClientBranches(clientId, { 
    page: pageIndex + 1, 
    pageSize 
  })
  const del = useDeleteClientBranch(clientId)
  const { success, error } = useToast()

  const columns: ColumnDef<ClientBranch>[] = useMemo(() => [
    {
      header: 'Nombre',
      accessorKey: 'name',
      meta: { filter: 'text' },
      cell: (ctx) => ctx.row.original.name,
    },
    {
      header: 'Dirección',
      accessorKey: 'address',
      meta: { filter: 'text' },
      cell: (ctx) => ctx.row.original.address ?? '—',
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Acciones</div>,
      cell: (ctx) => {
        const branch = ctx.row.original
        return (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => navigate(`/main/client-branches/${branch.id}/edit`)}
              className="inline-flex items-center justify-center rounded p-2 text-amber-400 transition-colors hover:bg-amber-400/10"
              title="Editar"
            >
              <FaPencilAlt className="h-4 w-4" />
            </button>
            <button
              className="inline-flex items-center justify-center rounded p-2 text-red-400 transition-colors hover:bg-red-400/10 disabled:opacity-50"
              disabled={del.isPending}
              title="Eliminar"
              onClick={async () => {
                if (!confirm('¿Eliminar sucursal?')) return
                try {
                  await del.mutateAsync(branch.id)
                  success('Sucursal eliminada')
                  await refetch()
                } catch (e: any) {
                  error(e?.message || 'No se pudo eliminar la sucursal')
                }
              }}
            >
              <FaTrash className="h-4 w-4" />
            </button>
          </div>
        )
      },
    },
  ], [del.isPending, navigate, success, error, refetch])

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Sucursales</h2>
        <Link 
          to="new"
          className="rounded bg-slate-700 px-3 py-1 text-white hover:bg-slate-600"
        >
          Nuevo
        </Link>
      </div>

      {isError && (
        <div className="rounded border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-200">
          Error al cargar. <button className="underline" onClick={() => refetch()}>Reintentar</button>
        </div>
      )}

      <DataTable<ClientBranch>
        data={data?.data ?? []}
        columns={columns}
        isLoading={isPending}
        pagination={{
          pageIndex,
          pageSize,
          total: data?.total ?? 0,
        }}
        onPaginationChange={(next: PaginationState) => {
          setPageIndex(next.pageIndex)
          setPageSize(next.pageSize)
        }}
        showPageSize={true}
      />
    </section>
  )
}

export default BranchesListPage
