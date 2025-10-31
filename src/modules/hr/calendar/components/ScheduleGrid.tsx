import { type JSX } from 'react'
import { addDays, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { DayCell, EmployeeCard } from '../../components'
import type { Employee } from '../../api/calendarApi'
import type { DaySchedule } from '../../components'

interface Props {
  currentWeekStart: Date
  employees: Employee[]
  onDayCellClick: (
    employeeId: string,
    employeeName: string,
    dayIndex: number,
    schedule: DaySchedule | undefined,
    date: Date
  ) => void
  onContextMenu: (
    e: React.MouseEvent,
    employeeId: string,
    dayIndex: number,
    schedule: DaySchedule | undefined,
    date: Date
  ) => void
  goToPrevWeek: () => void
  goToNextWeek: () => void
}

export function ScheduleGrid({
  currentWeekStart,
  employees,
  onDayCellClick,
  onContextMenu,
  goToPrevWeek,
  goToNextWeek,
}: Props): JSX.Element {
  const DAYS = Array.from({ length: 7 }, (_, idx) => {
    const date = addDays(currentWeekStart, idx)
    const labelRaw = format(date, 'EEE dd', { locale: es }).replace('.', '')
    const label = labelRaw.charAt(0).toUpperCase() + labelRaw.slice(1)
    return { label, date }
  })

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      {/* Header de navegación de semana */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPrevWeek}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <FaChevronLeft />
          Semana anterior
        </button>

        <h2 className="text-xl font-semibold text-gray-800">
          Semana del {format(currentWeekStart, "dd 'de' MMMM", { locale: es })}
        </h2>

        <button
          onClick={goToNextWeek}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Semana siguiente
          <FaChevronRight />
        </button>
      </div>

      {/* Grid de calendario */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-3 bg-gray-50 text-left font-semibold text-gray-700">
                Empleado
              </th>
              {DAYS.map((day, idx) => (
                <th key={idx} className="border border-gray-300 px-4 py-3 bg-gray-50 text-center font-semibold text-gray-700 min-w-[120px]">
                  {day.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map(employee => (
              <tr key={employee.id}>
                <td className="border border-gray-300 px-4 py-3 bg-gray-50">
                  <EmployeeCard employee={employee} />
                </td>
                {DAYS.map((day, idx) => {
                  const schedule = employee.schedules.find(s => s.date === format(day.date, 'yyyy-MM-dd'))
                  const daySchedule: DaySchedule | undefined = schedule
                    ? {
                        clockIn: schedule.clockIn || undefined,
                        clockOut: schedule.clockOut || undefined,
                        advance: schedule.advances.reduce((sum, adv) => sum + adv.amount, 0),
                        overtimeHours: schedule.overtimeMinutes / 60,
                        dayType: schedule.dayType.toLowerCase() as DaySchedule['dayType'],
                      }
                    : undefined

                  return (
                    <td key={idx} className="border border-gray-300 p-2">
                      <DayCell
                        employeeId={employee.id}
                        employeeName={employee.name}
                        dayIndex={idx}
                        schedule={daySchedule}
                        date={day.date}
                        onClick={() => onDayCellClick(employee.id, employee.name, idx, daySchedule, day.date)}
                        onContextMenu={e => onContextMenu(e, employee.id, idx, daySchedule, day.date)}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
