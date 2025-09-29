import { type JSX } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts'
import type { TimeSeriesPoint, StatusBreakdown, TopClient } from '@/modules/quotes/types/analytics'

interface TimeSeriesChartProps {
  data: TimeSeriesPoint[]
  metric: 'count' | 'amount'
  formatCurrency: (amount: number) => string
}

export function TimeSeriesChart({ data, metric, formatCurrency }: TimeSeriesChartProps): JSX.Element {
  const dataKey = metric === 'count' ? 'count' : 'amount_sum'
  const label = metric === 'count' ? 'Cantidad' : 'Monto'

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis
          dataKey="bucket"
          stroke="#94a3b8"
          tick={{ fill: '#94a3b8', fontSize: 12 }}
        />
        <YAxis
          stroke="#94a3b8"
          tick={{ fill: '#94a3b8', fontSize: 12 }}
          tickFormatter={(value) => (metric === 'amount' ? formatCurrency(value) : value.toString())}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '6px',
            color: '#e2e8f0',
          }}
          formatter={(value: number) => [
            metric === 'amount' ? formatCurrency(value) : value.toLocaleString('es-PY'),
            label,
          ]}
          labelStyle={{ color: '#cbd5e1' }}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: '#3b82f6', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

interface StatusChartProps {
  data: StatusBreakdown[]
  metric: 'count' | 'amount'
  formatCurrency: (amount: number) => string
}

export function StatusChart({ data, metric, formatCurrency }: StatusChartProps): JSX.Element {
  const statusColors: Record<string, string> = {
    DRAFT: '#4b5563',
    OPEN: '#3b82f6',
    APPROVED: '#16a34a',
    REJECTED: '#dc2626',
    EXPIRED: '#ea580c',
    INVOICED: '#9333ea',
  }

  const dataKey = metric === 'count' ? 'count' : 'amount_sum'
  const label = metric === 'count' ? 'Cantidad' : 'Monto'

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis
          dataKey="status"
          stroke="#94a3b8"
          tick={{ fill: '#94a3b8', fontSize: 12 }}
        />
        <YAxis
          stroke="#94a3b8"
          tick={{ fill: '#94a3b8', fontSize: 12 }}
          tickFormatter={(value) => (metric === 'amount' ? formatCurrency(value) : value.toString())}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '6px',
            color: '#e2e8f0',
          }}
          formatter={(value: number) => [
            metric === 'amount' ? formatCurrency(value) : value.toLocaleString('es-PY'),
            label,
          ]}
          labelStyle={{ color: '#cbd5e1' }}
        />
        <Legend wrapperStyle={{ color: '#cbd5e1' }} />
        <Bar dataKey={dataKey} name={label}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={statusColors[entry.status] || '#3b82f6'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

interface TopClientsChartProps {
  data: TopClient[]
  metric: 'count' | 'amount'
  formatCurrency: (amount: number) => string
}

export function TopClientsChart({ data, metric, formatCurrency }: TopClientsChartProps): JSX.Element {
  const dataKey = metric === 'count' ? 'count' : 'amount_sum'
  const label = metric === 'count' ? 'Cantidad' : 'Monto'

  // Tomar solo top 10
  const topData = data.slice(0, 10)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={topData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis
          type="number"
          stroke="#94a3b8"
          tick={{ fill: '#94a3b8', fontSize: 12 }}
          tickFormatter={(value) => (metric === 'amount' ? formatCurrency(value) : value.toString())}
        />
        <YAxis
          type="category"
          dataKey="client_name"
          stroke="#94a3b8"
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          width={90}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '6px',
            color: '#e2e8f0',
          }}
          formatter={(value: number) => [
            metric === 'amount' ? formatCurrency(value) : value.toLocaleString('es-PY'),
            label,
          ]}
          labelStyle={{ color: '#cbd5e1' }}
        />
        <Bar dataKey={dataKey} fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  )
}
