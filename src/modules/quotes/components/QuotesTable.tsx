import { type JSX } from 'react'
import { Link } from 'react-router-dom'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type PaginationState,
} from '@tanstack/react-table'
import type { Quote } from '@/modules/quotes/types'

export interface QuotesTableProps {
  data: Quote[]
  isLoading?: boolean
  pagination: { pageIndex: number; pageSize: number; total: number }
  onPaginationChange: (updater: PaginationState) => void
  onDelete: (id: string) => Promise<void>
  deletePending?: boolean
}

export function QuotesTable({
  data,
  isLoading = false,
  pagination,
  onPaginationChange,
  onDelete,
  deletePending = false,
}: QuotesTableProps): JSX.Element {
  const columns: ColumnDef<Quote>[] = [
    {
      header: '#',
      accessorKey: 'number',
      cell: (ctx) => {
        const v = ctx.row.original.number
        const id = ctx.row.original.id
        const digits = String(v ?? '').replace(/\D+/g, '')
        return <span>{digits || id.slice(0, 6)}</span>
      },
    },
    {
      header: 'Cliente',
      accessorKey: 'customerName',
      cell: (info) => info.getValue() as any,
    },
    {
      header: 'Sucursal',
      accessorKey: 'branchName',
      cell: (ctx) => ctx.row.original.branchName ?? '—',
    },
    {
      header: 'Estado',
      accessorKey: 'status',
      cell: (ctx) => ctx.row.original.status ?? 'draft',
    },
    {
      header: 'Total',
      accessorKey: 'total',
      cell: (ctx) => {
        const n = Number(ctx.row.original.total)
        if (!Number.isFinite(n)) return '-'
        return n.toLocaleString('es-PY', {
          style: 'currency',
          currency: 'PYG',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Acciones</div>,
      cell: (ctx) => {
        const q = ctx.row.original
        return (
          <div className="space-x-2 text-right">
            <Link className="text-blue-400 hover:underline" to={`/main/quotes/${q.id}`}>
              Ver
            </Link>
            <Link className="text-amber-400 hover:underline" to={`/main/quotes/${q.id}/edit`}>
              Editar
            </Link>
            <button
              className="text-red-400 hover:underline disabled:opacity-50"
              disabled={deletePending}
              onClick={() => onDelete(q.id)}
            >
              Eliminar
            </button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.max(1, Math.ceil((pagination.total || 0) / (pagination.pageSize || 10))),
    state: {
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
    },
    onPaginationChange: (updater) => {
      // TanStack envía un Updater<PaginationState>: puede ser objeto o función.
      const current = table.getState().pagination
      const next = typeof updater === 'function' ? (updater as (old: PaginationState) => PaginationState)(current) : updater
      onPaginationChange(next as PaginationState)
    },
    debugTable: false,
  })

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded border border-slate-700/50">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-800/60 text-slate-300">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th key={header.id} className={`px-3 py-2 ${header.column.id === 'actions' ? 'text-right' : ''}`}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-slate-800/60">
                  <td className="px-3 py-3" colSpan={columns.length}>
                    <div className="h-4 w-full animate-pulse rounded bg-slate-700/40" />
                  </td>
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr className="border-t border-slate-800/60">
                <td className="px-3 py-6 text-center text-slate-400" colSpan={columns.length}>
                  No hay presupuestos.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-800/60 hover:bg-slate-800/30">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`px-3 py-2 ${cell.column.id === 'actions' ? 'text-right' : ''}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Controles de paginación */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">
          {(() => {
            const start = pagination.pageIndex * pagination.pageSize + 1
            const end = Math.min((pagination.pageIndex + 1) * pagination.pageSize, pagination.total)
            return (
              <span>
                Mostrando {pagination.total === 0 ? 0 : start}-{pagination.total === 0 ? 0 : end} de {pagination.total} registros
              </span>
            )
          })()}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="flex h-8 w-8 items-center justify-center rounded border border-slate-700/50 bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Primera página"
          >
            {'<<'}
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="flex h-8 w-8 items-center justify-center rounded border border-slate-700/50 bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Página anterior"
          >
            {'<'}
          </button>
          <span className="px-2 text-sm text-slate-300">
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="flex h-8 w-8 items-center justify-center rounded border border-slate-700/50 bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Página siguiente"
          >
            {'>'}
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="flex h-8 w-8 items-center justify-center rounded border border-slate-700/50 bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Última página"
          >
            {'>>'}
          </button>
        </div>
      </div>
    </div>
  )
}
