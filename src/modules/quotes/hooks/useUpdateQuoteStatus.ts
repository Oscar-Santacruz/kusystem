import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiInstance } from '@/services/api'

export type QuoteStatus = 'DRAFT' | 'OPEN' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'INVOICED'

interface UpdateQuoteStatusParams {
  id: string
  status: QuoteStatus
  reason?: string
}

export function useUpdateQuoteStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status, reason }: UpdateQuoteStatusParams) => {
      const data = await ApiInstance.patch(`/quotes/${id}/status`, {
        data: {
          status,
          reason,
        },
      })
      return data
    },
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      queryClient.invalidateQueries({ queryKey: ['quote', variables.id] })
    },
  })
}
