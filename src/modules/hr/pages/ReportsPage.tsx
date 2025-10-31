import { type JSX, useRef, useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useReportFilters } from '../reports/useReportFilters'
import { ReportFiltersForm } from '../reports/components/ReportFiltersForm'
import { ReportActionsBar } from '../reports/components/ReportActionsBar'
import { ReportStatsGrid } from '../reports/components/ReportStatsGrid'
import { useReportExport } from '../reports/useReportExport'

export function ReportsPage(): JSX.Element {
  const reportRef = useRef<HTMLDivElement>(null)
  const [showStats, setShowStats] = useState(false)

  const {
    filters,
    updateFilters,
    employees,
    reportData,
    isLoading,
    isGenerating,
    error,
    generateReport,
  } = useReportFilters()

  const { handlePrintReport, handleDownloadPDF, handleDownloadExcel } = useReportExport({
    reportRef,
    reportData,
    filters,
    onError: (msg) => console.error(msg),
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-cyan-100 to-blue-200 p-4 sm:p-6">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Reportes de Horarios</h1>
          <p className="text-gray-600">Genera reportes semanales y por empleado con opción de impresión</p>
        </div>

        {/* Filtros */}
        <ReportFiltersForm filters={filters} employees={employees} onChange={updateFilters} />

        {/* Acciones */}
        <ReportActionsBar
          hasData={!!reportData}
          isLoading={isLoading}
          isGenerating={isGenerating}
          onGenerate={generateReport}
          onPrint={handlePrintReport}
          onDownloadPdf={handleDownloadPDF}
          onDownloadExcel={handleDownloadExcel}
          onToggleStats={() => setShowStats(v => !v)}
          statsVisible={showStats}
        />

        {/* Error */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Estadísticas */}
        <ReportStatsGrid stats={reportData?.stats ?? null} visible={showStats} onToggle={() => setShowStats(v => !v)} />

        {/* Vista previa del reporte */}
        {reportData && (
          <div ref={reportRef} className="bg-white rounded-2xl shadow-xl p-6 print:shadow-none">
            <div className="mb-6 print:mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {filters.reportType === 'weekly-all'
                  ? 'Reporte Semanal - Todos los Empleados'
                  : 'Reporte Individual por Rango de Fechas'}
              </h2>
              <p className="text-gray-600">
                {format(new Date(filters.startDate), "dd 'de' MMMM yyyy", { locale: es })} - {' '}
                {format(new Date(filters.endDate), "dd 'de' MMMM yyyy", { locale: es })}
              </p>
            </div>

            {/* Contenido del reporte */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <th className="border border-blue-500 px-4 py-3 text-left font-bold">Empleado</th>
                    <th className="border border-blue-500 px-4 py-3 text-left font-bold">Departamento</th>
                    <th className="border border-blue-500 px-4 py-3 text-left font-bold">Fecha</th>
                    <th className="border border-blue-500 px-4 py-3 text-left font-bold">Entrada</th>
                    <th className="border border-blue-500 px-4 py-3 text-left font-bold">Salida</th>
                    <th className="border border-blue-500 px-4 py-3 text-left font-bold">Tipo</th>
                    <th className="border border-blue-500 px-4 py-3 text-right font-bold">Horas Extra</th>
                    <th className="border border-blue-500 px-4 py-3 text-right font-bold">Adelantos</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {reportData.employees?.map(employee =>
                    employee.schedules.map(schedule => (
                      <tr key={`${employee.id}-${schedule.date}`} className="hover:bg-blue-50 transition-colors">
                        <td className="border border-gray-300 px-4 py-3 font-bold text-gray-900">{employee.name}</td>
                        <td className="border border-gray-300 px-4 py-3">
                          <span className="px-3 py-1.5 bg-blue-100 text-blue-900 rounded-md text-sm font-semibold">
                            {employee.department || 'Sin depto'}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-900 font-medium">
                          {format(new Date(schedule.date), 'dd/MM/yyyy')}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-900 font-semibold">
                          {schedule.clockIn || <span className="text-gray-400">-</span>}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-900 font-semibold">
                          {schedule.clockOut || <span className="text-gray-400">-</span>}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <span
                            className={`px-3 py-1.5 rounded-md text-sm font-bold ${
                              schedule.dayType === 'LABORAL'
                                ? 'bg-green-100 text-green-900'
                                : schedule.dayType === 'AUSENTE'
                                ? 'bg-red-100 text-red-900'
                                : schedule.dayType === 'LIBRE'
                                ? 'bg-gray-200 text-gray-900'
                                : schedule.dayType === 'FERIADO'
                                ? 'bg-purple-100 text-purple-900'
                                : 'bg-yellow-100 text-yellow-900'
                            }`}
                          >
                            {schedule.dayType}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-right text-gray-900 font-bold">
                          {schedule.overtimeMinutes > 0
                            ? `${(schedule.overtimeMinutes / 60).toFixed(1)}h`
                            : <span className="text-gray-400">-</span>}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-right text-gray-900 font-bold">
                          {schedule.advances.length > 0
                            ? `₲${schedule.advances.reduce((sum, adv) => sum + adv.amount, 0).toLocaleString('es-PY')}`
                            : <span className="text-gray-400">-</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Estilos para impresión */}
        <style>{`
          @media print {
            body {
              background: white !important;
            }
            .print\\:shadow-none {
              box-shadow: none !important;
            }
            button {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </div>
  )
}
