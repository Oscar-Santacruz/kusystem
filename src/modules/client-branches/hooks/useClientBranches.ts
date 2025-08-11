import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { ApiInstance } from '@/services/api'
import type { Paginated } from '@/shared/types/api'
import type { ClientBranch, CreateClientBranchInput, UpdateClientBranchInput } from '@/shared/types/domain'

const BASE_BY_CLIENT = '/clients'
const BASE = '/client-branches'

export interface ListParams {
  page?: number
  pageSize?: number
}

const keys = {
  all: ['client-branches'] as const,
  byClient: (clientId: string) => [...keys.all, 'by-client', clientId] as const,
  listByClient: (clientId: string, params: ListParams) => [...keys.byClient(clientId), 'list', params] as const,
  detail: (id: string) => [...keys.all, 'detail', id] as const,
}

export function useClientBranches(clientId: string | undefined, params: ListParams = { page: 1, pageSize: 20 }) {
  const { page = 1, pageSize = 20 } = params
  return useQuery({
    queryKey: clientId ? keys.listByClient(clientId, params) : [...keys.all, 'list', 'unknown'],
    queryFn: async () => {
      if (!clientId) throw new Error('clientId requerido')
      const data = await ApiInstance.get<Paginated<ClientBranch>>(`${BASE_BY_CLIENT}/${clientId}/branches`, { params: { page, pageSize } })
      return data
    },
    enabled: Boolean(clientId),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  })
}

export function useClientBranch(id: string | undefined) {
  return useQuery({
    queryKey: id ? keys.detail(id) : [...keys.all, 'detail', 'unknown'],
    queryFn: async () => {
      if (!id) throw new Error('id requerido')
      const data = await ApiInstance.get<ClientBranch>(`${BASE}/${id}`)
      return data
    },
    enabled: Boolean(id),
  })
}

export function useCreateClientBranch(clientId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Omit<CreateClientBranchInput, 'clientId'>) => {
      if (!clientId) throw new Error('clientId requerido')
      const data = await ApiInstance.post<ClientBranch>(`${BASE_BY_CLIENT}/${clientId}/branches`, { data: input })
      return data
    },
    onSuccess: () => {
      if (clientId) void qc.invalidateQueries({ queryKey: keys.byClient(clientId) })
    },
  })
}

export function useUpdateClientBranch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateClientBranchInput }) => {
      const data = await ApiInstance.put<ClientBranch>(`${BASE}/${id}`, { data: input })
      return data
    },
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: keys.detail(variables.id) })
      void qc.invalidateQueries({ queryKey: keys.all })
    },
  })
}

export function useDeleteClientBranch(clientId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const data = await ApiInstance.delete<{ ok: true }>(`${BASE}/${id}`)
      return data
    },
    onSuccess: () => {
      if (clientId) void qc.invalidateQueries({ queryKey: keys.byClient(clientId) })
      void qc.invalidateQueries({ queryKey: keys.all })
    },
  })
}
