import { FaChartBar, FaClock, FaUserFriends, FaPercent, FaHandHoldingUsd, FaChartPie } from 'react-icons/fa'
import type { ReportData } from '../../api/calendarApi'

type Props = {
  stats: ReportData['stats'] | null
  visible: boolean
  onToggle: () => void
}

const formatter = new Intl.NumberFormat('es-PY', { maximumFractionDigits: 1 })

export function ReportStatsGrid({ stats, visible, onToggle }: Props) {
  if (!stats) return null

  const items = [
    {
      icon: <FaUserFriends className="text-indigo-500 text-xl" />,
      title: 'Empleados Totales',
      value: stats.totalEmployees.toString(),
    },
    {
      icon: <FaChartPie className="text-blue-500 text-xl" />,
      title: 'Días Registrados',
      value: stats.totalDays.toString(),
    },
    {
      icon: <FaChartBar className="text-green-500 text-xl" />,
      title: 'Asistencias',
      value: stats.totalAttendance.toString(),
    },
    {
      icon: <FaPercent className="text-purple-500 text-xl" />,
      title: 'Tasa de Asistencia',
      value: `${formatter.format(stats.attendanceRate)}%`,
    },
    {
      icon: <FaClock className="text-orange-500 text-xl" />,
      title: 'Horas Extra Totales',
      value: formatter.format(stats.totalOvertimeHours) + 'h',
    },
    {
      icon: <FaHandHoldingUsd className="text-teal-500 text-xl" />,
      title: 'Adelantos Totales',
      value: new Intl.NumberFormat('es-PY').format(stats.totalAdvancesAmount),
    },
  ]

  return (
    <div className="mt-8">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        {visible ? 'Ocultar estadísticas' : 'Mostrar estadísticas'}
      </button>

      {visible && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map(item => (
            <div
              key={item.title}
              className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">{item.icon}</div>
                <div>
                  <p className="text-sm text-gray-500">{item.title}</p>
                  <p className="text-lg font-semibold text-gray-900">{item.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
