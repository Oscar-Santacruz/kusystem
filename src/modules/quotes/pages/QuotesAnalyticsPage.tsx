import { type JSX, useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuotesAnalytics } from '@/modules/quotes/hooks/useQuotesAnalytics'
import type { BucketType } from '@/modules/quotes/types/analytics'
import { TimeSeriesChart, StatusChart, TopClientsChart } from '@/modules/quotes/components/AnalyticsCharts'

export function QuotesAnalyticsPage(): JSX.Element {
  const [sp, setSp] = useSearchParams()

  // Filtros desde URL o defaults
  const getDefaultDates = () => {
    const to = new Date()
    const from = new Date()
    from.setMonth(from.getMonth() - 3) // Último trimestre
    return {
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
    }
  }

  const defaults = getDefaultDates()
  const [from, setFrom] = useState(sp.get('from') ?? defaults.from)
  const [to, setTo] = useState(sp.get('to') ?? defaults.to)
  const [bucket, setBucket] = useState<BucketType>((sp.get('bucket') as BucketType) ?? 'month')
  const [statusFilter, setStatusFilter] = useState(sp.get('status') ?? '')
  const [clientFilter, setClientFilter] = useState(sp.get('client_id') ?? '')
  const [metricView, setMetricView] = useState<'count' | 'amount'>('count')
  const [statusMetricView, setStatusMetricView] = useState<'count' | 'amount'>('count')

  // Sincronizar filtros con URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    if (bucket) params.set('bucket', bucket)
    if (statusFilter) params.set('status', statusFilter)
    if (clientFilter) params.set('client_id', clientFilter)
    setSp(params, { replace: true })
  }, [from, to, bucket, statusFilter, clientFilter, setSp])

  const { data, isLoading, isError, refetch } = useQuotesAnalytics({
    from,
    to,
    bucket,
    status: statusFilter || undefined,
    client_id: clientFilter || undefined,
  })

  const kpis = data?.kpis
  const byStatus = data?.by_status ?? []
  const byTime = data?.by_time ?? []
  const topClientsByCount = data?.top_clients_by_count ?? []
  const topClientsByAmount = data?.top_clients_by_amount ?? []
  const funnel = data?.funnel ?? []
  const [topClientsView, setTopClientsView] = useState<'count' | 'amount'>('count')
  const topClientsData = topClientsView === 'count' ? topClientsByCount : topClientsByAmount

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  }

  // Formatear porcentaje
  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Analytics - Presupuestos</h2>
          <p className="text-sm text-slate-400">
            {data?.last_updated && `Última actualización: ${new Date(data.last_updated).toLocaleString('es-PY')}`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="rounded bg-slate-700 px-3 py-1 text-white hover:bg-slate-600"
            disabled={isLoading}
          >
            {isLoading ? 'Cargando...' : 'Actualizar'}
          </button>
          <Link
            to="/main/quotes"
            className="rounded bg-slate-800 px-3 py-1 text-white hover:bg-slate-700"
          >
            Ver Lista
          </Link>
        </div>
      </div>

      {/* Filtros globales */}
      <div className="rounded border border-slate-700/50 bg-slate-800/30 p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-300">Filtros</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <div>
            <label className="mb-1 block text-xs text-slate-400">Desde</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Hasta</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Agrupación</label>
            <select
              value={bucket}
              onChange={(e) => setBucket(e.target.value as BucketType)}
              className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-200"
            >
              <option value="day">Día</option>
              <option value="week">Semana</option>
              <option value="month">Mes</option>
              <option value="year">Año</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-200"
            >
              <option value="">Todos</option>
              <option value="OPEN">Abierto</option>
              <option value="APPROVED">Aprobado</option>
              <option value="REJECTED">Rechazado</option>
              <option value="EXPIRED">Vencido</option>
              <option value="DRAFT">Borrador</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFrom(defaults.from)
                setTo(defaults.to)
                setBucket('month')
                setStatusFilter('')
                setClientFilter('')
              }}
              className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-300 hover:bg-slate-700"
            >
              Resetear
            </button>
          </div>
        </div>
      </div>

      {isError && (
        <div className="rounded border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-200">
          Error al cargar analytics. <button className="underline" onClick={() => refetch()}>Reintentar</button>
        </div>
      )}

      {/* KPIs Cards */}
      {kpis && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {/* Total Presupuestos */}
          <div className="rounded border border-slate-700/50 bg-slate-800/30 p-4">
            <div className="text-xs text-slate-400">Total Presupuestos</div>
            <div className="mt-1 text-2xl font-semibold text-slate-200">{kpis.count.toLocaleString('es-PY')}</div>
          </div>

          {/* Monto Total */}
          <div className="rounded border border-slate-700/50 bg-slate-800/30 p-4">
            <div className="text-xs text-slate-400">Monto Total</div>
            <div className="mt-1 text-2xl font-semibold text-slate-200">{formatCurrency(kpis.amount_sum)}</div>
          </div>

          {/* Ticket Promedio */}
          <div className="rounded border border-slate-700/50 bg-slate-800/30 p-4">
            <div className="text-xs text-slate-400">Ticket Promedio</div>
            <div className="mt-1 text-2xl font-semibold text-slate-200">{formatCurrency(kpis.avg_ticket)}</div>
          </div>

          {/* Hit Rate */}
          <div className="rounded border border-slate-700/50 bg-slate-800/30 p-4">
            <div className="text-xs text-slate-400">Hit Rate</div>
            <div className="mt-1 text-2xl font-semibold text-emerald-400">{formatPercent(kpis.hit_rate)}</div>
            <div className="mt-1 text-xs text-slate-500">Aprobados / Totales</div>
          </div>

          {/* Lead Time */}
          <div className="rounded border border-slate-700/50 bg-slate-800/30 p-4">
            <div className="text-xs text-slate-400">Lead Time (mediana)</div>
            <div className="mt-1 text-2xl font-semibold text-slate-200">
              {kpis.lead_time_median_hours.toFixed(1)}h
            </div>
            <div className="mt-1 text-xs text-slate-500">Creado → Aprobado</div>
          </div>
        </div>
      )}

      {/* Alertas */}
      {kpis && (kpis.expiring_7d > 0 || kpis.expired > 0) && (
        <div className="flex gap-3">
          {kpis.expiring_7d > 0 && (
            <div className="flex-1 rounded border border-amber-600/30 bg-amber-950/30 p-3 text-sm text-amber-200">
              ⚠️ {kpis.expiring_7d} presupuestos vencen en los próximos 7 días
            </div>
          )}
          {kpis.expired > 0 && (
            <div className="flex-1 rounded border border-red-600/30 bg-red-950/30 p-3 text-sm text-red-200">
              🚨 {kpis.expired} presupuestos vencidos
            </div>
          )}
        </div>
      )}

      {/* Serie Temporal */}
      <div className="rounded border border-slate-700/50 bg-slate-800/30 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-300">Evolución Temporal</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setMetricView('count')}
              className={`rounded px-3 py-1 text-xs ${
                metricView === 'count'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Cantidad
            </button>
            <button
              onClick={() => setMetricView('amount')}
              className={`rounded px-3 py-1 text-xs ${
                metricView === 'amount'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Monto
            </button>
          </div>
        </div>
        {byTime.length > 0 ? (
          <TimeSeriesChart data={byTime} metric={metricView} formatCurrency={formatCurrency} />
        ) : (
          <div className="flex h-64 items-center justify-center text-slate-500">
            Sin datos para mostrar
          </div>
        )}
      </div>

      {/* Fila 3: Por Estado + Top Clientes */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Por Estado */}
        <div className="rounded border border-slate-700/50 bg-slate-800/30 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-300">Por Estado</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setStatusMetricView('count')}
                className={`rounded px-2 py-1 text-xs ${
                  statusMetricView === 'count'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Cantidad
              </button>
              <button
                onClick={() => setStatusMetricView('amount')}
                className={`rounded px-2 py-1 text-xs ${
                  statusMetricView === 'amount'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Monto
              </button>
            </div>
          </div>
          {byStatus.length > 0 ? (
            <StatusChart data={byStatus} metric={statusMetricView} formatCurrency={formatCurrency} />
          ) : (
            <div className="flex h-64 items-center justify-center text-slate-500">
              Sin datos para mostrar
            </div>
          )}
        </div>

        {/* Top Clientes */}
        <div className="rounded border border-slate-700/50 bg-slate-800/30 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-300">Top 10 Clientes</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setTopClientsView('count')}
                className={`rounded px-2 py-1 text-xs ${
                  topClientsView === 'count'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Por Cantidad
              </button>
              <button
                onClick={() => setTopClientsView('amount')}
                className={`rounded px-2 py-1 text-xs ${
                  topClientsView === 'amount'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Por Monto
              </button>
            </div>
          </div>
          {topClientsData.length > 0 ? (
            <TopClientsChart data={topClientsData} metric={topClientsView} formatCurrency={formatCurrency} />
          ) : (
            <div className="flex h-64 items-center justify-center text-slate-500">
              Sin datos para mostrar
            </div>
          )}
        </div>
      </div>

      {/* Funnel */}
      {funnel.length > 0 && (
        <div className="rounded border border-slate-700/50 bg-slate-800/30 p-4">
          <h3 className="mb-4 text-sm font-semibold text-slate-300">Funnel de Conversión</h3>
          <div className="flex items-center justify-around">
            {funnel.map((stage) => {
              const percentage = funnel[0].count > 0 ? ((stage.count / funnel[0].count) * 100).toFixed(1) : '0.0'
              return (
                <div key={stage.stage} className="flex flex-col items-center">
                  <div className="text-xs text-slate-400">{stage.stage}</div>
                  <div className="mt-1 text-2xl font-semibold text-slate-200">{stage.count}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {percentage}%
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}

export default QuotesAnalyticsPage
