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

// Normaliza fechas provenientes de inputs HTML ("YYYY-MM-DD") a ISO 8601.
// Si viene string vacío o undefined, retorna undefined para no romper zod.optional().
function normalizeDate(value?: string): string | undefined {
  if (!value) return undefined
  const v = value.trim()
  if (!v) return undefined
  // YYYY-MM-DD → ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const d = new Date(`${v}T00:00:00`)
    return d.toISOString()
  }
  return v
}

// Elimina strings vacíos para no enviar "" donde el backend espera undefined
function stripEmptyStrings<T extends Record<string, any>>(obj: T): T {
  const out: Record<string, any> = {}
  for (const [k, val] of Object.entries(obj)) {
    if (typeof val === 'string') {
      const trimmed = val.trim()
      if (trimmed === '') continue
      out[k] = trimmed
    } else if (val && typeof val === 'object' && !Array.isArray(val)) {
      out[k] = stripEmptyStrings(val as any)
    } else {
      out[k] = val
    }
  }
  return out as T
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

// Obtiene una cotización pública por su publicId desde el endpoint público
export function usePublicQuote(publicId: string | undefined) {
  return useQuery({
    queryKey: publicId ? [...keys.all, 'public', publicId] : [...keys.all, 'public', 'unknown'],
    queryFn: async () => {
      if (!publicId) throw new Error('publicId requerido')
      const data = await ApiInstance.get<Quote>(`/public/quotes/${publicId}`)
      return data
    },
    enabled: Boolean(publicId),
  })
}

export function useCreateQuote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateQuoteInput) => {
      const payload: CreateQuoteInput = stripEmptyStrings({
        ...input,
        issueDate: normalizeDate(input.issueDate),
        dueDate: normalizeDate(input.dueDate),
      })
      const data = await ApiInstance.post<Quote>(BASE, { data: payload })
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
      const payload: UpdateQuoteInput = stripEmptyStrings({
        ...input,
        issueDate: normalizeDate(input.issueDate as any),
        dueDate: normalizeDate(input.dueDate as any),
      })
      const data = await ApiInstance.put<Quote>(`${BASE}/${id}`, { data: payload })
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
