import { FaCalendarAlt, FaUser, FaUsers } from 'react-icons/fa'
import type { Employee } from '../../api/calendarApi'
import type { ReportFilters } from '../types'
import { REPORT_DEPARTMENTS } from '../types'

type Props = {
  filters: ReportFilters
  employees: Employee[]
  onChange: (updater: (prev: ReportFilters) => ReportFilters) => void
}

export function ReportFiltersForm({ filters, employees, onChange }: Props) {
  const handleFilterChange = <K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) => {
    onChange(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Configuración del Reporte</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Reporte
          </label>
          <div className="space-y-2">
            <label
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                filters.reportType === 'weekly-all'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="reportType"
                value="weekly-all"
                checked={filters.reportType === 'weekly-all'}
                onChange={() => handleFilterChange('reportType', 'weekly-all')}
                className="mr-3 w-4 h-4"
              />
              <FaUsers className="mr-2 text-blue-600 text-lg" />
              <span className="font-semibold text-gray-800">Reporte Semanal - Todos los Empleados</span>
            </label>

            <label
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                filters.reportType === 'employee-range'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-green-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="reportType"
                value="employee-range"
                checked={filters.reportType === 'employee-range'}
                onChange={() => handleFilterChange('reportType', 'employee-range')}
                className="mr-3 w-4 h-4"
              />
              <FaUser className="mr-2 text-green-600 text-lg" />
              <span className="font-semibold text-gray-800">Reporte por Empleado - Rango de Fechas</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaCalendarAlt className="inline mr-2" />
            Rango de Fechas
          </label>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Inicio</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={event => handleFilterChange('startDate', event.target.value)}
                className="w-full px-4 py-3 text-gray-900 font-medium border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Fin</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={event => handleFilterChange('endDate', event.target.value)}
                className="w-full px-4 py-3 text-gray-900 font-medium border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Departamento
          </label>
          <select
            value={filters.department || 'all'}
            onChange={event => handleFilterChange('department', event.target.value)}
            className="w-full px-4 py-3 text-gray-900 font-medium border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white cursor-pointer"
          >
            {REPORT_DEPARTMENTS.map(option => (
              <option key={option.value} value={option.value} className="font-medium">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tipo de Día
          </label>
          <select
            value={filters.dayType || 'all'}
            onChange={event => handleFilterChange('dayType', event.target.value as ReportFilters['dayType'])}
            className="w-full px-4 py-3 text-gray-900 font-medium border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white cursor-pointer"
          >
            <option value="all" className="font-medium">Todos los tipos</option>
            <option value="laboral" className="font-medium">Laboral</option>
            <option value="ausente" className="font-medium">Ausente</option>
            <option value="libre" className="font-medium">Libre</option>
            <option value="feriado" className="font-medium">Feriado</option>
          </select>
        </div>

        {filters.reportType === 'employee-range' && (
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Seleccionar Empleado
            </label>
            <select
              value={filters.selectedEmployeeId || ''}
              onChange={event => handleFilterChange('selectedEmployeeId', event.target.value || undefined)}
              className="w-full px-4 py-3 text-gray-900 font-medium border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white cursor-pointer"
            >
              <option value="" className="font-medium text-gray-500">Seleccione un empleado...</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.id} className="font-medium text-gray-900">
                  {employee.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  )
}
