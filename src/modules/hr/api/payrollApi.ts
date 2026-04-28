import { ApiInstance } from '@/services/api'

export interface PayrollPreviewQuery {
    employeeId: string
    startDate: string
    endDate: string
}

export interface PayrollRequest {
    employeeId: string
    startDate: string
    endDate: string
}

export interface PayrollPreviewResponse {
    employee: {
        id: string
        name: string
        salaryType: string
        salaryAmount: number
        dailyRate: number
        hourlyRate: number
    }
    period: {
        startDate: string
        endDate: string
    }
    daysIncluded: Array<{
        date: string
        type: string
        overtimeMinutes: number
        advance: number
    }>
    orphanAdvances: Array<{
        id: string
        amount: number
        date: string
    }>
    summary: {
        totalDaysWorked: number
        totalOvertimeHours: number
        baseAmount: number
        overtimeAmount: number
        advancesAmount: number
        totalAmount: number
    }
}

export interface EmployeePayment {
    id: string
    tenantId: string
    employeeId: string
    startDate: string
    endDate: string
    paymentDate: string
    totalDaysWorked: string | number
    totalOvertimeHours: string | number
    baseAmount: string | number
    overtimeAmount: string | number
    advancesAmount: string | number
    totalAmount: string | number
    receiptNumber?: string
    notes?: string
    createdAt: string
    updatedAt: string
}

export const payrollApi = {
    getPreview: async (params: PayrollPreviewQuery): Promise<PayrollPreviewResponse> => {
        return ApiInstance.get<PayrollPreviewResponse>('/hr/payroll/preview', { params })
    },

    execute: async (data: PayrollRequest): Promise<{ ok: boolean; payment: EmployeePayment }> => {
        return ApiInstance.post<{ ok: boolean; payment: EmployeePayment }>('/hr/payroll/execute', { data })
    },

    getHistory: async (employeeId: string): Promise<EmployeePayment[]> => {
        return ApiInstance.get<EmployeePayment[]>(`/hr/payroll/history/${employeeId}`)
    }
}
