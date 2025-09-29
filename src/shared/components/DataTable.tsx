import { type JSX, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type PaginationState,
  type ColumnFiltersState,
} from '@tanstack/react-table'

export interface DataTableProps<T extends object> {
  data: T[]
  columns: ColumnDef<T, any>[]
  isLoading?: boolean
  pagination: { pageIndex: number; pageSize: number; total: number }
  onPaginationChange: (updater: PaginationState) => void
  showPageSize?: boolean
  className?: string
  // Filters (optional controlled). If not provided, DataTable manages its own state.
  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: (updater: ColumnFiltersState) => void
  // Hybrid pagination: if true, use client-side pagination
  useClientPagination?: boolean
}

export function DataTable<T extends object>({
  data,
  columns,
  isLoading = false,
  pagination,
  onPaginationChange,
  showPageSize = true,
  className,
  columnFilters,
  onColumnFiltersChange,
  useClientPagination = false,
}: DataTableProps<T>): JSX.Element {
  // Viewport-aware options (SSR-safe)
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  const MOBILE_OPTIONS = [5, 15, 30]
  const DESKTOP_OPTIONS = [15, 30, 50, 100]
  const PAGE_SIZE_OPTIONS = isMobile ? MOBILE_OPTIONS : DESKTOP_OPTIONS
  const minOption = Math.min(...PAGE_SIZE_OPTIONS)

  // Column filters state (uncontrolled fallback)
  const [internalFilters, setInternalFilters] = useState<ColumnFiltersState>([])
  const effectiveFilters = columnFilters ?? internalFilters

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: useClientPagination ? getPaginationRowModel() : undefined,
    manualPagination: !useClientPagination,
    pageCount: useClientPagination
      ? undefined
      : Math.max(1, Math.ceil((pagination.total || 0) / (pagination.pageSize || 10))),
    state: {
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
      columnFilters: effectiveFilters,
    },
    onPaginationChange: (updater) => {
      const current = table.getState().pagination
      const next = typeof updater === 'function' ? (updater as (old: PaginationState) => PaginationState)(current) : updater
      onPaginationChange(next as PaginationState)
    },
    onColumnFiltersChange: (updater) => {
      if (onColumnFiltersChange) {
        onColumnFiltersChange(updater as ColumnFiltersState)
      } else {
        setInternalFilters(updater as ColumnFiltersState)
      }
    },
    debugTable: false,
  })

  // Helper to render filter UI per column based on meta
  type FilterMeta = { filter?: 'text' | 'select'; options?: Array<{ label: string; value: string }> }
  const headerGroups = table.getHeaderGroups()

  return (
    <div className={className ?? 'space-y-3'}>
      <div className="overflow-x-auto rounded border border-slate-700/50">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-800/60 text-slate-300">
            {headerGroups.map((hg) => (
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
            {/* Filtros por columna (segunda fila de header) */}
            <tr>
              {headerGroups[0]?.headers.map((header) => {
                const col = header.column
                const meta = (col.columnDef.meta as FilterMeta | undefined) ?? {}
                const canFilter = !!meta.filter && col.getCanFilter() && col.id !== 'actions'
                if (!canFilter) return <th key={`f-${header.id}`} className="px-3 py-1" />
                const value = (col.getFilterValue() as string) ?? ''
                if (meta.filter === 'select' && meta.options && meta.options.length > 0) {
                  return (
                    <th key={`f-${header.id}`} className="px-3 py-1">
                      <select
                        className="w-full rounded border border-slate-700/60 bg-slate-800/60 px-2 py-1 text-slate-200"
                        value={value}
                        onChange={(e) => col.setFilterValue(e.target.value || undefined)}
                      >
                        <option value="">Todos</option>
                        {meta.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </th>
                  )
                }
                // default text filter
                return (
                  <th key={`f-${header.id}`} className="px-3 py-1">
                    <input
                      value={value}
                      onChange={(e) => col.setFilterValue(e.target.value || undefined)}
                      placeholder="Filtrar…"
                      className="w-full rounded border border-slate-700/60 bg-slate-800/60 px-2 py-1 text-slate-200 placeholder:text-slate-500"
                    />
                  </th>
                )
              })}
            </tr>
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
                  Sin resultados.
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

      {/* Selector de filas + rango + controles de paginación */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
          {/* Selector Filas por página: visible solo si permitido */}
          {showPageSize && pagination.total > minOption && (
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <span className="whitespace-nowrap">Filas por página</span>
              <select
                aria-label="Filas por página"
                className="rounded border border-slate-700/60 bg-slate-800/60 px-2 py-1 text-slate-200"
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  table.setPageIndex(0)
                  table.setPageSize(v)
                }}
              >
                {PAGE_SIZE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
          )}

          {/* Texto de rango */}
          <div className="text-sm text-slate-400" aria-live="polite">
            {(() => {
              const total = pagination.total
              const from = total === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1
              const to = total === 0 ? 0 : Math.min((pagination.pageIndex + 1) * pagination.pageSize, total)
              return (
                <span>
                  Mostrando {from}–{to} de {total}
                </span>
              )
            })()}
          </div>
        </div>

        {/* Controles de página */}
        <div className="flex items-center space-x-1 self-end md:self-auto">
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
