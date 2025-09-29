import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { ApiInstance } from '@/services/api'
import type { QuotesAnalytics, QuotesAnalyticsFilters } from '@/modules/quotes/types/analytics'

const BASE = '/analytics/quotes'

const keys = {
  all: ['quotes-analytics'] as const,
  list: (filters: QuotesAnalyticsFilters) => [...keys.all, 'list', filters] as const,
}

export function useQuotesAnalytics(
  filters: QuotesAnalyticsFilters = {},
  options?: Omit<UseQueryOptions<QuotesAnalytics>, 'queryKey' | 'queryFn'>
) {
  const {
    from,
    to,
    tz = 'America/Asuncion',
    bucket = 'month',
    status,
    client_id,
    top = 10,
  } = filters

  return useQuery({
    queryKey: keys.list(filters),
    queryFn: async () => {
      const data = await ApiInstance.get<QuotesAnalytics>(BASE, {
        params: {
          from,
          to,
          tz,
          bucket,
          status,
          client_id,
          top,
        },
      })
      return data
    },
    staleTime: 60000, // 1 minuto
    refetchOnWindowFocus: false,
    ...options,
  })
}
