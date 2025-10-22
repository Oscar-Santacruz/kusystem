export interface QuoteItem {
  id?: string
  productId?: string
  description: string
  quantity: number
  unitPrice: number
  discount?: number
  taxRate?: number
}

// Cargos adicionales predefinidos (evitar enum, usar objeto as const)
export const AdditionalChargeTypes = {
  ESTADIA: 'estadia',
  TRANSPORTE: 'transporte',
  VIATICO: 'viatico',
} as const

export type AdditionalChargeType = typeof AdditionalChargeTypes[keyof typeof AdditionalChargeTypes]

export interface AdditionalCharge {
  type: AdditionalChargeType
  amount: number
}

export interface Quote {
  id: string
  // número puede venir como string del backend; lo conservamos pero mostraremos sólo dígitos en UI
  number?: string | number
  status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  customerId?: string
  customerName: string
  customerRuc?: string | null
  // Sucursal del cliente
  branchId?: string
  branchName?: string
  issueDate?: string
  dueDate?: string
  currency?: string
  notes?: string
  // Mostrar notas en PDF/impresión
  printNotes?: boolean
  items: QuoteItem[]
  additionalCharges?: AdditionalCharge[]
  subtotal?: number
  taxTotal?: number
  discountTotal?: number
  total?: number
  createdAt?: string
  updatedAt?: string
  // Enlace público (MVP opcional, backend futuro)
  publicId?: string
  publicEnabled?: boolean
}

export interface CreateQuoteInput {
  customerId?: string
  customerName: string
  branchId?: string
  branchName?: string
  issueDate?: string
  dueDate?: string
  currency?: string
  notes?: string
  printNotes?: boolean
  items?: QuoteItem[]
  additionalCharges?: AdditionalCharge[]
}

export interface UpdateQuoteInput extends Partial<CreateQuoteInput> {}

export interface Paginated<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
