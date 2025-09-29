export type QuoteStatus = 'DRAFT' | 'OPEN' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'INVOICED'

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador',
  OPEN: 'Abierto',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  EXPIRED: 'Vencido',
  INVOICED: 'Facturado',
}

export const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-600',
  OPEN: 'bg-blue-600',
  APPROVED: 'bg-green-600',
  REJECTED: 'bg-red-600',
  EXPIRED: 'bg-orange-600',
  INVOICED: 'bg-purple-600',
}

export const STATUS_TEXT_COLORS: Record<string, string> = {
  DRAFT: 'text-gray-200',
  OPEN: 'text-blue-200',
  APPROVED: 'text-green-200',
  REJECTED: 'text-red-200',
  EXPIRED: 'text-orange-200',
  INVOICED: 'text-purple-200',
}

export function getStatusLabel(status: string | null | undefined): string {
  if (!status) return 'Sin estado'
  return STATUS_LABELS[status] || status
}

export function getStatusColor(status: string | null | undefined): string {
  if (!status) return STATUS_COLORS.DRAFT
  return STATUS_COLORS[status] || STATUS_COLORS.DRAFT
}

export function getStatusTextColor(status: string | null | undefined): string {
  if (!status) return STATUS_TEXT_COLORS.DRAFT
  return STATUS_TEXT_COLORS[status] || STATUS_TEXT_COLORS.DRAFT
}
