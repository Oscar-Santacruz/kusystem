import { ApiInstance } from '@/services/api'
import type { Employee } from './calendarApi'

export interface CreateEmployeeInput {
    firstName: string
    lastName: string
    email?: string
    phone?: string
    department?: string
    salaryType: 'MONTHLY' | 'WEEKLY' | 'DAILY'
    salaryAmount?: number | null
    defaultShiftStart?: string | null
    defaultShiftEnd?: string | null
}

export type UpdateEmployeeInput = Partial<CreateEmployeeInput>

export async function listEmployees(): Promise<Employee[]> {
    return ApiInstance.get<Employee[]>('/hr/employees')
}

export async function getEmployee(id: string): Promise<Employee> {
    return ApiInstance.get<Employee>(`/hr/employees/${id}`)
}

export async function createEmployee(data: CreateEmployeeInput): Promise<Employee> {
    return ApiInstance.post<Employee>('/hr/employees', {
        data,
        headers: { 'Content-Type': 'application/json' },
    })
}

export async function updateEmployee(id: string, data: UpdateEmployeeInput): Promise<Employee> {
    return ApiInstance.put<Employee>(`/hr/employees/${id}`, {
        data,
        headers: { 'Content-Type': 'application/json' },
    })
}

export async function toggleEmployeeStatus(id: string): Promise<{ ok: boolean; isActive: boolean }> {
    return ApiInstance.put<{ ok: boolean; isActive: boolean }>(`/hr/employees/${id}/toggle-status`, {
        headers: { 'Content-Type': 'application/json' },
    })
}
