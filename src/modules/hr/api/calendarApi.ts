import { ApiInstance } from '@/services/api'

export interface Employee {
  id: string
  firstName: string
  lastName: string
  name: string
  email: string | null
  phone: string | null
  avatarUrl: string | null
  department: string | null
  monthlySalary: number | null
  defaultShiftStart: string | null
  defaultShiftEnd: string | null
  weeklyOvertimeHours: number
  weeklyAdvances: number
  weeklyAdvancesAmount: number
  // Métricas para reportes
  totalOvertimeHours?: number
  totalAdvances?: number
  totalAdvancesAmount?: number
  attendanceCount?: number
  totalDays?: number
  attendanceRate?: number
  schedules: EmployeeSchedule[]
}

export interface EmployeeSchedule {
  id: string
  date: string
  clockIn: string | null
  clockOut: string | null
  overtimeMinutes: number
  dayType: 'LABORAL' | 'AUSENTE' | 'LIBRE' | 'NO_LABORAL' | 'FERIADO'
  notes: string | null
  advances: EmployeeAdvance[]
}

export interface EmployeeAdvance {
  id: string
  amount: number
  currency: string
  reason: string | null
  issuedAt: string
}

export interface WeekData {
  startDate: string
  endDate: string
  employees: Employee[]
}

export interface ScheduleUpsertInput {
  clockIn?: string | null
  clockOut?: string | null
  dayType: 'LABORAL' | 'AUSENTE' | 'LIBRE' | 'NO_LABORAL' | 'FERIADO'
  overtimeMinutes?: number
  advanceAmount?: number | null
  notes?: string | null
}

export interface InitializeWeekInput {
  startDate: string
  clockIn: string
  clockOut: string
}

/**
 * Obtiene los datos de la semana (empleados + horarios + adelantos)
 */
export async function getWeekData(startDate: string): Promise<WeekData> {
  return ApiInstance.get<WeekData>(`/hr/calendar/week?start=${startDate}`)
}

/**
 * Actualiza el horario de un empleado en una fecha específica
 */
export async function upsertSchedule(
  employeeId: string,
  date: string,
  data: ScheduleUpsertInput
): Promise<{ ok: boolean }> {
  return ApiInstance.put<{ ok: boolean }>(`/hr/calendar/week/${employeeId}/${date}`, {
    data,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function initializeWeekSchedules({ startDate, clockIn, clockOut }: InitializeWeekInput): Promise<{ ok: boolean; updatedSchedules: number }>
{
  return ApiInstance.post<{ ok: boolean; updatedSchedules: number }>(`/hr/calendar/week/initialize`, {
    data: {
      startDate,
      clockIn,
      clockOut,
    },
    headers: { 'Content-Type': 'application/json' },
  })
}

export interface ReportFilters {
  startDate: string
  endDate: string
  employeeId?: string
  department?: string
  dayType?: 'LABORAL' | 'AUSENTE' | 'LIBRE' | 'NO_LABORAL' | 'FERIADO'
}

export interface ReportStats {
  totalEmployees: number
  totalDays: number
  totalAttendance: number
  attendanceRate: number
  totalOvertimeHours: number
  totalAdvancesAmount: number
  avgOvertimePerEmployee: number
}

export interface ReportData {
  startDate: string
  endDate: string
  filters: {
    employeeId?: string
    department?: string
    dayType?: string
  }
  stats: ReportStats
  employees: Employee[]
}

/**
 * Obtiene la lista de empleados
 */
export async function getEmployees(): Promise<Employee[]> {
  return ApiInstance.get<Employee[]>('/hr/calendar/employees')
}

/**
 * Obtiene datos de reportes con filtros
 */
export async function getReportData(filters: ReportFilters): Promise<ReportData> {
  const params = new URLSearchParams()
  params.append('startDate', filters.startDate)
  params.append('endDate', filters.endDate)
  
  if (filters.employeeId) params.append('employeeId', filters.employeeId)
  if (filters.department && filters.department !== 'all') params.append('department', filters.department)
  if (filters.dayType) params.append('dayType', filters.dayType)

  return ApiInstance.get<ReportData>(`/hr/calendar/reports?${params.toString()}`)
}
