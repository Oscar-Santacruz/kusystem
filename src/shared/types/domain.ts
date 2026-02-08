export interface Client {
  id: string
  name: string
  taxId?: string
  phone?: string
  email?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateClientInput {
  name: string
  taxId?: string
  phone?: string
  email?: string
}

export interface UpdateClientInput extends Partial<CreateClientInput> { }

export interface ClientBranch {
  id: string
  clientId: string
  name: string
  address?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateClientBranchInput {
  clientId: string
  name: string
  address?: string
}

export interface UpdateClientBranchInput extends Partial<CreateClientBranchInput> { }

export interface Product {
  id: string
  sku?: string
  name: string
  description?: string
  unit: string
  price: number
  cost: number
  taxRate: number
  stock: number
  minStock: number
  barcode?: string
  imageUrl?: string
  priceIncludesTax?: boolean
  createdAt?: string
  updatedAt?: string
  templateId?: string | null
  metadata?: Record<string, any>
}

export interface ProductTemplate {
  id: string
  name: string
  attributes: Record<string, {
    label: string
    type: 'text' | 'number' | 'date' | 'select'
    required?: boolean
    options?: string[] // Para selects
  }>
  createdAt?: string
}

export interface CreateProductInput {
  sku?: string
  name: string
  description?: string
  unit: string
  price: number
  cost: number
  taxRate: number
  stock: number
  minStock: number
  barcode?: string
  imageUrl?: string
  priceIncludesTax?: boolean
  templateId?: string | null
  metadata?: Record<string, any>
}

export interface UpdateProductInput extends Partial<CreateProductInput> { }
