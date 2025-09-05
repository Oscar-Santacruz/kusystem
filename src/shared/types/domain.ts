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

export interface UpdateClientInput extends Partial<CreateClientInput> {}

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

export interface UpdateClientBranchInput extends Partial<CreateClientBranchInput> {}

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
  priceIncludesTax?: boolean
  createdAt?: string
  updatedAt?: string
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
  priceIncludesTax?: boolean
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}
