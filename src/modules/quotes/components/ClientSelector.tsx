import { useState, type JSX } from 'react'

export interface ClientOption { id: string; name: string; taxId?: string | null; email?: string | null; phone?: string | null }

export interface ClientSelectorProps {
  valueId?: string
  clientSearch: string
  setClientSearch: (v: string) => void
  clients: { isPending: boolean; data?: { data?: ClientOption[] } }
  onSelectClient: (id: string, name: string) => void
  onOpenCreateClient: () => void
}

export function ClientSelector({ valueId, clientSearch, setClientSearch, clients, onSelectClient, onOpenCreateClient }: ClientSelectorProps): JSX.Element {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const listboxId = 'client-listbox'

  return (
    <div className="flex flex-col gap-1 sm:col-span-3">
      <span className="text-sm text-slate-300">Cliente</span>
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <input
            id="client-combobox"
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={activeIndex >= 0 && clients.data?.data?.[activeIndex] ? `client-option-${clients.data.data[activeIndex].id}` : undefined}
            className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 pr-9 text-white outline-none focus:ring"
            value={clientSearch}
            onChange={(e) => {
              setClientSearch(e.target.value)
              setOpen(true)
              setActiveIndex(-1)
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              setTimeout(() => setOpen(false), 100)
            }}
            onKeyDown={(e) => {
              const items = clients.data?.data ?? []
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                if (!items.length) return
                setOpen(true)
                setActiveIndex((i) => (i + 1) % items.length)
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                if (!items.length) return
                setOpen(true)
                setActiveIndex((i) => (i <= 0 ? items.length - 1 : i - 1))
              } else if (e.key === 'Enter') {
                if (activeIndex >= 0 && items[activeIndex]) {
                  e.preventDefault()
                  const c = items[activeIndex]
                  onSelectClient(c.id, c.name)
                  setClientSearch(c.name)
                  setOpen(false)
                }
              } else if (e.key === 'Escape') {
                setOpen(false)
              }
            }}
            placeholder="Buscar cliente (nombre, RUC o email)…"
          />
          {clientSearch ? (
            <button
              type="button"
              aria-label="Limpiar búsqueda de cliente"
              onClick={() => {
                setClientSearch('')
                setActiveIndex(-1)
                setOpen(false)
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-0.5 text-slate-300 hover:bg-slate-800"
            >
              ×
            </button>
          ) : null}
        </div>
        <button
          type="button"
          className="shrink-0 rounded border border-slate-600 px-3 py-2 text-slate-200 hover:bg-slate-800"
          onClick={onOpenCreateClient}
        >
          Crear cliente
        </button>
      </div>

      {/* resultados (listbox) */}
      <div
        className={`basis-full max-h-40 overflow-auto rounded border border-slate-800 bg-slate-900 ${open ? '' : 'hidden'}`}
        role="listbox"
        id={listboxId}
        aria-label="Resultados de clientes"
        onMouseDown={(e) => { e.preventDefault() }}
      >
        {clients.isPending && !clients.data ? (
          <div className="px-3 py-2 text-sm text-slate-400" aria-live="polite">Buscando…</div>
        ) : clients.data?.data?.length ? (
          clients.data.data.map((c, idx) => {
            const isSelected = valueId === c.id
            const isActive = idx === activeIndex
            const subtitle = ([c.taxId, c.email, c.phone].filter(Boolean) as string[]).join(' · ')
            return (
              <div
                id={`client-option-${c.id}`}
                key={c.id}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => {
                  onSelectClient(c.id, c.name)
                  setClientSearch(c.name)
                  setOpen(false)
                }}
                className={`flex cursor-pointer items-center justify-between px-3 py-2 text-slate-200 ${isActive ? 'bg-slate-800 text-white' : ''}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate">{c.name}</div>
                  <div className="truncate text-xs text-slate-400">{subtitle || '\u00A0'}</div>
                </div>
                {isSelected ? <span className="ml-2 shrink-0 text-xs text-slate-400">seleccionado</span> : null}
              </div>
            )
          })
        ) : (
          <div className="px-3 py-2 text-sm text-slate-400" aria-live="polite">{clientSearch ? 'Sin resultados' : 'Escribe para buscar'}</div>
        )}
      </div>
    </div>
  )
}

export default ClientSelector
