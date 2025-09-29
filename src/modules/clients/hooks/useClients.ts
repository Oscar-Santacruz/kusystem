import { useQuery, useMutation, useQueryClient, keepPreviousData, type UseQueryOptions } from '@tanstack/react-query'
import { ApiInstance } from '@/services/api'
import type { Paginated } from '@/shared/types/api'
import type { Client, CreateClientInput, UpdateClientInput } from '@/shared/types/domain'

const BASE = '/clients'

export interface ListParams {
  page?: number
  pageSize?: number
  search?: string
}

const keys = {
  all: ['clients'] as const,
  list: (params: ListParams) => [...keys.all, 'list', params] as const,
  detail: (id: string) => [...keys.all, 'detail', id] as const,
}

export function useClients(
  params: ListParams = { page: 1, pageSize: 20 },
  options?: Omit<UseQueryOptions<Paginated<Client>>, 'queryKey' | 'queryFn'>
) {
  const { page = 1, pageSize = 20, search } = params
  return useQuery({
    queryKey: keys.list(params),
    queryFn: async () => {
      const data = await ApiInstance.get<Paginated<Client>>(BASE, { params: { page, pageSize, search } })
      return data
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    ...options,
  })
}

export function useClient(id: string | undefined) {
  return useQuery({
    queryKey: id ? keys.detail(id) : [...keys.all, 'detail', 'unknown'],
    queryFn: async () => {
      if (!id) throw new Error('id requerido')
      const data = await ApiInstance.get<Client>(`${BASE}/${id}`)
      return data
    },
    enabled: Boolean(id),
  })
}

export function useCreateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateClientInput) => {
      const data = await ApiInstance.post<Client>(BASE, { data: input })
      return data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.all })
    },
  })
}

export function useUpdateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateClientInput }) => {
      const data = await ApiInstance.put<Client>(`${BASE}/${id}`, { data: input })
      return data
    },
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: keys.detail(variables.id) })
      void qc.invalidateQueries({ queryKey: keys.all })
    },
  })
}

export function useDeleteClient() {
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
