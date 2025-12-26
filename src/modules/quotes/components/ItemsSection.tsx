import { type JSX, type RefObject } from 'react'
import type { QuoteItem } from '@/modules/quotes/types'

export interface ItemsSectionProps {
  // Search state
  productSearch: string
  setProductSearch: (v: string) => void
  productSearchRef: RefObject<HTMLInputElement | null>
  // Query results
  products: {
    isPending: boolean
    data?: { data?: Array<{ id: string; name: string; price: number; taxRate?: number | null; sku?: string | null; priceIncludesTax?: boolean | null }> }
  }
  // Actions
  onOpenCreateProduct: () => void
  onAddFromProduct: (p: { id: string; name: string; price: number; taxRate?: number | undefined }) => void
  onUpdateItem: (index: number, patch: Partial<QuoteItem>) => void
  onRemoveItem: (index: number) => void
  // Reorder (DnD)
  onReorderItems: (fromIndex: number, toIndex: number) => void
  // Data
  items: QuoteItem[]
  // Utils
  formatPrice: (n: number) => string
}

export function ItemsSection(props: ItemsSectionProps): JSX.Element {
  const {
    productSearch,
    setProductSearch,
    productSearchRef,
    products,
    onOpenCreateProduct,
    onAddFromProduct,
    onUpdateItem,
    onRemoveItem,
    onReorderItems,
    items,
    formatPrice,
  } = props

  return (
    <div className="relative space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-slate-300">Ítems</span>
        <div className="flex gap-2">
          <input
            ref={productSearchRef}
            className="w-full sm:w-64 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:ring"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="Buscar producto (nombre, SKU o unidad)…"
          />
          <button type="button" onClick={onOpenCreateProduct} className="rounded border border-slate-600 px-3 py-2 text-slate-200 hover:bg-slate-800">
            Crear producto
          </button>
        </div>
      </div>
      {/* Botón flotante oculto */}
      <button type="button" className="hidden" aria-hidden="true" tabIndex={-1} />
      {productSearch.trim() ? (
        <div className="max-h-40 overflow-auto rounded border border-slate-800 bg-slate-900">
          {products.isPending && !products.data ? (
            <div className="px-3 py-2 text-sm text-slate-400">Buscando…</div>
          ) : (products.data?.data?.length ?? 0) > 0 ? (
            (products.data?.data ?? []).map((p) => {
              const taxRate = Number(p.taxRate || 0)
              const displayPrice = p.priceIncludesTax ? Math.round(p.price * (1 + taxRate)) : p.price
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onAddFromProduct({ id: p.id, name: p.name, price: p.price, taxRate: p.taxRate ?? undefined })}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-slate-800 focus:bg-slate-800 text-slate-200"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="truncate">{p.name}</div>
                      {p.priceIncludesTax ? (
                        <span className="shrink-0 rounded-full border border-emerald-600/40 bg-emerald-950/50 px-2 py-0.5 text-[10px] text-emerald-300">
                          IVA inc.
                        </span>
                      ) : null}
                    </div>
                    <div className="truncate text-xs text-slate-400">
                      {p.sku ? `SKU: ${p.sku}` : ''}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-slate-400">{formatPrice(displayPrice)}</span>
                    <span className="text-xs text-slate-400">+ Agregar</span>
                  </div>
                </button>
              )
            })
          ) : (
            <div className="px-3 py-2 text-sm text-slate-400">Sin resultados</div>
          )}
        </div>
      ) : null}

      {/* Tabla de ítems */}
      <div className="overflow-x-auto">
        <table className="min-w-[700px] w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border border-slate-800 px-2 py-2 text-center w-8" title="Arrastra para reordenar" aria-label="Handle" />
              <th className="border border-slate-800 px-3 py-2 text-left w-2/5">Descripción</th>
              <th className="border border-slate-800 px-3 py-2 text-right w-24">Cantidad</th>
              <th className="border border-slate-800 px-3 py-2 text-right w-28">P. Unit</th>
              <th className="border border-slate-800 px-3 py-2 text-right w-28">Total</th>
              <th className="border border-slate-800 px-3 py-2 text-center w-16">Acción</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr
                key={idx}
                draggable
                onDragStart={(e) => {
                  try { e.dataTransfer.setData('text/plain', String(idx)) } catch { }
                  // efecto visual
                  e.currentTarget.classList.add('opacity-60')
                }}
                onDragEnd={(e) => {
                  e.currentTarget.classList.remove('opacity-60')
                }}
                onDragOver={(e) => {
                  // Necesario para permitir drop
                  e.preventDefault()
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  const from = Number(e.dataTransfer.getData('text/plain'))
                  const to = idx
                  if (!Number.isNaN(from) && from !== to) {
                    onReorderItems(from, to)
                  }
                }}
                className="cursor-move"
                title="Arrastra para reordenar"
              >
                <td className="border border-slate-800 px-2 py-2 text-center align-middle select-none">
                  <span className="inline-flex items-center justify-center text-slate-400/80" aria-hidden="true">
                    {/* 6-dot handle */}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="opacity-75">
                      <circle cx="5" cy="5" r="1" />
                      <circle cx="11" cy="5" r="1" />
                      <circle cx="5" cy="8" r="1" />
                      <circle cx="11" cy="8" r="1" />
                      <circle cx="5" cy="11" r="1" />
                      <circle cx="11" cy="11" r="1" />
                    </svg>
                  </span>
                </td>
                <td className="border border-slate-800 px-3 py-2">
                  <div className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white" title={it.description}>
                    {it.description}
                  </div>
                </td>
                <td className="border border-slate-800 px-3 py-2 text-right">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-right text-white outline-none"
                    value={it.quantity}
                    onChange={(e) => onUpdateItem(idx, { quantity: Math.max(0, Number(e.target.value) || 0) })}
                  />
                </td>
                <td className="border border-slate-800 px-3 py-2 text-right">
                  <div className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-right text-white" title={String(it.unitPrice ?? 0)}>
                    {formatPrice(it.unitPrice ?? 0)}
                  </div>
                </td>
                <td className="border border-slate-800 px-3 py-2 text-right font-medium">
                  {formatPrice(it.quantity * it.unitPrice)}
                </td>
                <td className="border border-slate-800 px-3 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => onRemoveItem(idx)}
                    className="inline-flex items-center justify-center rounded border border-red-700 p-2 text-red-300 hover:bg-red-950 transition-colors"
                    aria-label="Eliminar ítem"
                    title="Eliminar ítem"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ItemsSection
