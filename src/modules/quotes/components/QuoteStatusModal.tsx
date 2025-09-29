import { type JSX, useState } from 'react'
import type { QuoteStatus } from '@/modules/quotes/hooks/useUpdateQuoteStatus'
import { STATUS_LABELS, STATUS_COLORS } from '@/modules/quotes/utils/status-colors'

interface QuoteStatusModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  currentStatus: string | null | undefined
  newStatus: QuoteStatus
  isLoading?: boolean
}

export function QuoteStatusModal({
  isOpen,
  onClose,
  onConfirm,
  currentStatus,
  newStatus,
  isLoading,
}: QuoteStatusModalProps): JSX.Element | null {
  const [reason, setReason] = useState('')

  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm(reason)
    setReason('')
  }

  const handleClose = () => {
    setReason('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-slate-800 p-6 shadow-xl">
        <h3 className="mb-4 text-xl font-semibold text-slate-200">
          Cambiar estado del presupuesto
        </h3>

        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Estado actual:</span>
            <span className={`rounded px-2 py-1 text-xs font-medium text-white ${STATUS_COLORS[currentStatus || 'DRAFT']}`}>
              {STATUS_LABELS[currentStatus || 'DRAFT'] || currentStatus || 'Sin estado'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Nuevo estado:</span>
            <span className={`rounded px-2 py-1 text-xs font-medium text-white ${STATUS_COLORS[newStatus]}`}>
              {STATUS_LABELS[newStatus]}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="reason" className="mb-2 block text-sm font-medium text-slate-300">
            Motivo del cambio (opcional)
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej: Cliente aprobó el presupuesto por teléfono"
            className="w-full rounded border border-slate-600 bg-slate-700 px-3 py-2 text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={3}
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="rounded bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-600 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`rounded px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 ${STATUS_COLORS[newStatus]}`}
          >
            {isLoading ? 'Cambiando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}
