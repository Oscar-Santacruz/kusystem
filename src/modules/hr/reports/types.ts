import { format, startOfWeek, endOfWeek } from 'date-fns'
import type { ReportFilters as ApiReportFilters } from '../api/calendarApi'

export type ReportType = 'weekly-all' | 'employee-range'

export type ReportDayType = 'all' | 'laboral' | 'ausente' | 'libre' | 'feriado'

export interface ReportFilters {
  reportType: ReportType
  startDate: string
  endDate: string
  selectedEmployeeId?: string
  department?: string
  dayType?: ReportDayType
}

export const createDefaultFilters = (): ReportFilters => ({
  reportType: 'weekly-all',
  startDate: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
  endDate: format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
  department: 'all',
  dayType: 'all',
})

export const REPORT_DAY_TYPE_MAP: Record<Exclude<ReportDayType, 'all'>, NonNullable<ApiReportFilters['dayType']>> = {
  laboral: 'LABORAL',
  ausente: 'AUSENTE',
  libre: 'LIBRE',
  feriado: 'FERIADO',
}

export const REPORT_DEPARTMENTS = [
  { value: 'all', label: 'Todos los departamentos' },
  { value: 'ventas', label: 'Ventas' },
  { value: 'produccion', label: 'Producción' },
  { value: 'administracion', label: 'Administración' },
  { value: 'logistica', label: 'Logística' },
]
