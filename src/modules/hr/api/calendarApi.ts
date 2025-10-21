import { ApiInstance } from '@/services/api'

export interface Employee {
  id: string
  firstName: string
  lastName: string
  name: string
  email: string | null
  phone: string | null
  avatarUrl: string | null
  monthlySalary: number | null
  defaultShiftStart: string | null
  defaultShiftEnd: string | null
  weeklyOvertimeHours: number
  weeklyAdvances: number
  weeklyAdvancesAmount: number
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

/**
 * Obtiene la lista de empleados
 */
export async function getEmployees(): Promise<Employee[]> {
  return ApiInstance.get<Employee[]>('/hr/calendar/employees')
}
