import type { QuoteItem, AdditionalChargeType } from '@/modules/quotes/types'

export interface AdditionalCharge {
  type: AdditionalChargeType
  amount?: number | null
}

export interface Totals {
  subtotal: number
  tax: number
  discount: number
  charges: number
  total: number
}

export function computeTotals(items: QuoteItem[], additionalCharges: AdditionalCharge[] = []): Totals {
  const safeItems = Array.isArray(items) ? items : []
  const safeCharges = Array.isArray(additionalCharges) ? additionalCharges : []

  const subtotal = safeItems.reduce((acc, it) => acc + (Number(it.quantity || 0) * Number(it.unitPrice || 0)), 0)
  const tax = safeItems.reduce((acc, it) => acc + (Number(it.taxRate || 0) * Number(it.quantity || 0) * Number(it.unitPrice || 0)), 0)
  const discount = safeItems.reduce((acc, it) => acc + Number(it.discount || 0), 0)
  const charges = safeCharges.reduce((acc, c) => acc + Number(c.amount || 0), 0)
  const total = subtotal + tax + charges - discount

  return { subtotal, tax, discount, charges, total }
}
