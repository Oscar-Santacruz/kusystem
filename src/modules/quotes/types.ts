export interface QuoteItem {
  id?: string
  productId?: string
  description: string
  quantity: number
  unitPrice: number
  discount?: number
  taxRate?: number
}

export interface Quote {
  id: string
  number?: string
  status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  customerId?: string
  customerName: string
  issueDate?: string
  dueDate?: string
  currency?: string
  notes?: string
  items: QuoteItem[]
  subtotal?: number
  taxTotal?: number
  discountTotal?: number
  total?: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateQuoteInput {
  customerId?: string
  customerName: string
  issueDate?: string
  dueDate?: string
  currency?: string
  notes?: string
  items?: QuoteItem[]
}

export interface UpdateQuoteInput extends Partial<CreateQuoteInput> {}

export interface Paginated<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
