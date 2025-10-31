import { useState, useEffect } from 'react'
import { addDays, format, startOfWeek } from 'date-fns'
import { getWeekData, type Employee } from '../../api/calendarApi'

interface UseWeekSchedulesResult {
  currentWeekStart: Date
  employees: Employee[]
  isLoading: boolean
  loadError: string | null
  goToPrevWeek: () => void
  goToNextWeek: () => void
  reloadWeekData: () => Promise<void>
}

export function useWeekSchedules(): UseWeekSchedulesResult {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadWeekData = async () => {
    try {
      setIsLoading(true)
      setLoadError(null)
      const startDate = format(currentWeekStart, 'yyyy-MM-dd')
      const data = await getWeekData(startDate)

      // Aplicar orden personalizado desde localStorage
      const savedOrder = localStorage.getItem('hr-employee-order')
      if (savedOrder) {
        try {
          const orderIds = JSON.parse(savedOrder) as string[]
          const orderedEmployees = [...data.employees].sort((a, b) => {
            const indexA = orderIds.indexOf(a.id)
            const indexB = orderIds.indexOf(b.id)
            if (indexA === -1 && indexB === -1) return 0
            if (indexA === -1) return 1
            if (indexB === -1) return -1
            return indexA - indexB
          })
          setEmployees(orderedEmployees)
        } catch {
          setEmployees(data.employees)
        }
      } else {
        setEmployees(data.employees)
      }
    } catch (error) {
      console.error('Error loading week data:', error)
      setLoadError(error instanceof Error ? error.message : 'Error al cargar datos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadWeekData()
  }, [currentWeekStart])

  const goToPrevWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, -7))
  }

  const goToNextWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, 7))
  }

  const reloadWeekData = async () => {
    await loadWeekData()
  }

  return {
    currentWeekStart,
    employees,
    isLoading,
    loadError,
    goToPrevWeek,
    goToNextWeek,
    reloadWeekData,
  }
}
