const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

function getTenantId(): string {
  const orgId = localStorage.getItem('orgId') || localStorage.getItem('organizationId')
  if (!orgId) {
    throw new Error('No tenant ID found. Please select an organization.')
  }
  return orgId
}

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
  const tenantId = getTenantId()
  const res = await fetch(`${API_BASE}/hr/calendar/week?start=${startDate}`, {
    headers: {
      'X-Tenant-Id': tenantId,
    },
  })

  if (!res.ok) {
    throw new Error(`Error fetching week data: ${res.statusText}`)
  }

  return res.json()
}

/**
 * Actualiza el horario de un empleado en una fecha específica
 */
export async function upsertSchedule(
  employeeId: string,
  date: string,
  data: ScheduleUpsertInput
): Promise<{ ok: boolean }> {
  const tenantId = getTenantId()
  const res = await fetch(`${API_BASE}/hr/calendar/week/${employeeId}/${date}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Id': tenantId,
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(error.error || 'Error updating schedule')
  }

  return res.json()
}

/**
 * Obtiene la lista de empleados
 */
export async function getEmployees(): Promise<Employee[]> {
  const tenantId = getTenantId()
  const res = await fetch(`${API_BASE}/hr/calendar/employees`, {
    headers: {
      'X-Tenant-Id': tenantId,
    },
  })

  if (!res.ok) {
    throw new Error(`Error fetching employees: ${res.statusText}`)
  }

  return res.json()
}
