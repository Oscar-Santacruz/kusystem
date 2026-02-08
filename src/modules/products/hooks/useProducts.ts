import { useQuery, useMutation, useQueryClient, keepPreviousData, type UseQueryOptions } from '@tanstack/react-query'
import { ApiInstance } from '@/services/api'
import type { Paginated } from '@/shared/types/api'
import type { Product, CreateProductInput, UpdateProductInput, ProductTemplate } from '@/shared/types/domain'

const BASE = '/products'

export interface ListParams {
  page?: number
  pageSize?: number
  search?: string
}

const keys = {
  all: ['products'] as const,
  list: (params: ListParams) => [...keys.all, 'list', params] as const,
  detail: (id: string) => [...keys.all, 'detail', id] as const,
}

export function useProducts(
  params: ListParams = { page: 1, pageSize: 20 },
  options?: Omit<UseQueryOptions<Paginated<Product>>, 'queryKey' | 'queryFn'>
) {
  const { page = 1, pageSize = 20, search } = params
  return useQuery({
    queryKey: keys.list(params),
    queryFn: async () => {
      const data = await ApiInstance.get<Paginated<Product>>(BASE, { params: { page, pageSize, search } })
      return data
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    ...options,
  })
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: id ? keys.detail(id) : [...keys.all, 'detail', 'unknown'],
    queryFn: async () => {
      if (!id) throw new Error('id requerido')
      const data = await ApiInstance.get<Product>(`${BASE}/${id}`)
      return data
    },
    enabled: Boolean(id),
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateProductInput) => {
      const data = await ApiInstance.post<Product>(BASE, { data: input })
      return data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.all })
    },
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateProductInput }) => {
      const data = await ApiInstance.put<Product>(`${BASE}/${id}`, { data: input })
      return data
    },
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: keys.detail(variables.id) })
      void qc.invalidateQueries({ queryKey: keys.all })
    },
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const data = await ApiInstance.delete<{ ok: true }>(`${BASE}/${id}`)
      return data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.all })
    },
  })
}

export function useProductTemplates() {
  return useQuery({
    queryKey: ['product-templates'],
    queryFn: async () => {
      const data = await ApiInstance.get<{ data: ProductTemplate[] }>('/product-templates')
      return data.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}
