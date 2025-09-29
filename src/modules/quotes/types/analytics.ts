export type BucketType = 'day' | 'week' | 'month' | 'year'

export interface QuotesAnalyticsRange {
  from: string
  to: string
  tz: string
  bucket: BucketType
}

export interface QuotesAnalyticsKPIs {
  count: number
  amount_sum: number
  avg_ticket: number
  hit_rate: number
  lead_time_median_hours: number
  expiring_7d: number
  expired: number
}

export interface StatusBreakdown {
  status: string
  count: number
  amount_sum: number
}

export interface TimeSeriesPoint {
  bucket: string
  count: number
  amount_sum: number
}

export interface TopClient {
  client_id: string
  client_name: string
  count: number
  amount_sum: number
}

export interface FunnelStage {
  stage: string
  count: number
}

export interface QuotesAnalytics {
  range: QuotesAnalyticsRange
  kpis: QuotesAnalyticsKPIs
  by_status: StatusBreakdown[]
  by_time: TimeSeriesPoint[]
  top_clients_by_count: TopClient[]
  top_clients_by_amount: TopClient[]
  funnel: FunnelStage[]
  last_updated: string
  etag?: string
}

export interface QuotesAnalyticsFilters {
  from?: string
  to?: string
  tz?: string
  bucket?: BucketType
  status?: string
  client_id?: string
  top?: number
}
