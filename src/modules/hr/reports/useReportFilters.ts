import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getEmployees, getReportData, type Employee, type ReportFilters as ApiReportFilters } from '../api/calendarApi'
import { createDefaultFilters, REPORT_DAY_TYPE_MAP, type ReportFilters } from './types'

interface UseReportFiltersResult {
  filters: ReportFilters
  updateFilters: (updater: (prev: ReportFilters) => ReportFilters) => void
  employees: Employee[]
  reportData: Awaited<ReturnType<typeof getReportData>> | null
  isLoading: boolean
  isGenerating: boolean
  error: string | null
  generateReport: () => Promise<void>
}

function buildApiFilters(filters: ReportFilters): ApiReportFilters {
  const apiFilters: ApiReportFilters = {
    startDate: filters.startDate,
    endDate: filters.endDate,
    department: filters.department === 'all' ? undefined : filters.department,
    dayType: filters.dayType && filters.dayType !== 'all' ? REPORT_DAY_TYPE_MAP[filters.dayType] : undefined,
  }

  if (filters.reportType === 'employee-range' && filters.selectedEmployeeId) {
    apiFilters.employeeId = filters.selectedEmployeeId
  }

  return apiFilters
}

export function useReportFilters(initialFilters?: Partial<ReportFilters>): UseReportFiltersResult {
  const [filters, setFilters] = useState<ReportFilters>(() => ({
    ...createDefaultFilters(),
    ...initialFilters,
  }))
  const queryClient = useQueryClient()

  const employeesQuery = useQuery({
    queryKey: ['hr', 'reports', 'employees'],
    queryFn: getEmployees,
    staleTime: 5 * 60 * 1000,
  })

  const reportQuery = useQuery({
    queryKey: ['hr', 'reports', 'data', filters],
    queryFn: () => getReportData(buildApiFilters(filters)),
    enabled: false,
    gcTime: 5 * 60 * 1000,
  })

  const generateReport = async () => {
    await reportQuery.refetch()
  }

  const updateFilters = (updater: (prev: ReportFilters) => ReportFilters) => {
    setFilters(prev => {
      const next = updater(prev)
      queryClient.setQueryData(['hr', 'reports', 'data', next], (current: Awaited<ReturnType<typeof getReportData>> | undefined) => current)
      return next
    })
  }

  const error = employeesQuery.error || reportQuery.error

  const status = useMemo(() => ({
    isLoading: employeesQuery.isLoading,
    isGenerating: reportQuery.isFetching,
    error: error instanceof Error ? error.message : null,
  }), [employeesQuery.isLoading, reportQuery.isFetching, error])

  return {
    filters,
    updateFilters,
    employees: employeesQuery.data ?? [],
    reportData: reportQuery.data ?? null,
    isLoading: status.isLoading,
    isGenerating: status.isGenerating,
    error: status.error,
    generateReport,
  }
}
