import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiInstance } from '@/services/api'
import type { CreateQuoteInput, Paginated, Quote, UpdateQuoteInput } from '@/modules/quotes/types'

const BASE = '/quotes'

export interface ListParams {
  page?: number
  pageSize?: number
  search?: string
}

const keys = {
  all: ['quotes'] as const,
  list: (params: ListParams) => [...keys.all, 'list', params] as const,
  detail: (id: string) => [...keys.all, 'detail', id] as const,
}

export function useQuotes(params: ListParams = { page: 1, pageSize: 10 }) {
  const { page = 1, pageSize = 10, search } = params
  return useQuery({
    queryKey: keys.list(params),
    queryFn: async () => {
      const data = await ApiInstance.get<Paginated<Quote>>(BASE, {
        params: { page, pageSize, search },
      })
      return data
    },
  })
}

export function useQuote(id: string | undefined) {
  return useQuery({
    queryKey: id ? keys.detail(id) : [...keys.all, 'detail', 'unknown'],
    queryFn: async () => {
      if (!id) throw new Error('id requerido')
      const data = await ApiInstance.get<Quote>(`${BASE}/${id}`)
      return data
    },
    enabled: Boolean(id),
  })
}

export function useCreateQuote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateQuoteInput) => {
      const data = await ApiInstance.post<Quote>(BASE, { data: input })
      return data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.all })
    },
  })
}

export function useUpdateQuote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateQuoteInput }) => {
      const data = await ApiInstance.put<Quote>(`${BASE}/${id}`, { data: input })
      return data
    },
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: keys.detail(variables.id) })
      void qc.invalidateQueries({ queryKey: keys.all })
    },
  })
}

export function useDeleteQuote() {
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
