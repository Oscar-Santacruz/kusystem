import { type JSX, useState } from 'react'
import { FaCheck, FaTimes, FaFileInvoice, FaFile, FaFolderOpen, FaClock } from 'react-icons/fa'
import { QuoteStatusModal } from './QuoteStatusModal'
import { useUpdateQuoteStatus, type QuoteStatus } from '@/modules/quotes/hooks/useUpdateQuoteStatus'
import { toast } from 'sonner'

interface QuoteStatusActionsProps {
  quoteId: string
  currentStatus: string | null | undefined
  onStatusChanged?: () => void
}

export function QuoteStatusActions({ quoteId, currentStatus, onStatusChanged }: QuoteStatusActionsProps): JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<QuoteStatus | null>(null)
  const updateStatus = useUpdateQuoteStatus()

  const handleStatusClick = (status: QuoteStatus) => {
    setSelectedStatus(status)
    setIsModalOpen(true)
  }

  const handleConfirm = async (reason: string) => {
    if (!selectedStatus) return

    try {
      await updateStatus.mutateAsync({
        id: quoteId,
        status: selectedStatus,
        reason,
      })
      toast.success(`Estado cambiado a ${getStatusLabel(selectedStatus)}`)
      setIsModalOpen(false)
      setSelectedStatus(null)
      onStatusChanged?.()
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      toast.error('Error al cambiar el estado del presupuesto')
    }
  }

  const getStatusLabel = (status: QuoteStatus): string => {
    const labels: Record<QuoteStatus, string> = {
      DRAFT: 'Borrador',
      OPEN: 'Abierto',
      APPROVED: 'Aprobado',
      REJECTED: 'Rechazado',
      EXPIRED: 'Vencido',
      INVOICED: 'Facturado',
    }
    return labels[status]
  }

  return (
    <>
      <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-300">Acciones de Estado</h3>
          <div className="rounded bg-slate-700 px-2 py-1 text-xs font-medium text-slate-300">
            {currentStatus || 'Sin estado'}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Borrador */}
          <button
            onClick={() => handleStatusClick('DRAFT')}
            disabled={currentStatus === 'DRAFT'}
            className="flex items-center gap-2 rounded bg-gray-600 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaFile />
            Borrador
          </button>

          {/* Abierto */}
          <button
            onClick={() => handleStatusClick('OPEN')}
            disabled={currentStatus === 'OPEN'}
            className="flex items-center gap-2 rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaFolderOpen />
            Abierto
          </button>

          {/* Aprobar */}
          <button
            onClick={() => handleStatusClick('APPROVED')}
            disabled={currentStatus === 'APPROVED'}
            className="flex items-center gap-2 rounded bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaCheck />
            Aprobar
          </button>

          {/* Rechazar */}
          <button
            onClick={() => handleStatusClick('REJECTED')}
            disabled={currentStatus === 'REJECTED'}
            className="flex items-center gap-2 rounded bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaTimes />
            Rechazar
          </button>

          {/* Vencido */}
          <button
            onClick={() => handleStatusClick('EXPIRED')}
            disabled={currentStatus === 'EXPIRED'}
            className="flex items-center gap-2 rounded bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaClock />
            Vencido
          </button>

          {/* Facturado */}
          <button
            onClick={() => handleStatusClick('INVOICED')}
            disabled={currentStatus === 'INVOICED'}
            className="flex items-center gap-2 rounded bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaFileInvoice />
            Facturado
          </button>
        </div>
      </div>

      {selectedStatus && (
        <QuoteStatusModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedStatus(null)
          }}
          onConfirm={handleConfirm}
          currentStatus={currentStatus}
          newStatus={selectedStatus}
          isLoading={updateStatus.isPending}
        />
      )}
    </>
  )
}
