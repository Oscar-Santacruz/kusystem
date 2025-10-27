import { type JSX, useState, useRef, useEffect } from 'react'
import { format, startOfWeek, endOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { FaCalendarAlt, FaFileDownload, FaPrint, FaUser, FaUsers, FaChartBar, FaFileExcel } from 'react-icons/fa'
import { getReportData, getEmployees, type ReportData, type ReportFilters as ApiReportFilters, type Employee } from '../api/calendarApi'
import html2pdf from 'html2pdf.js'

type ReportType = 'weekly-all' | 'employee-range'

interface ReportFilters {
  reportType: ReportType
  startDate: string
  endDate: string
  selectedEmployeeId?: string
  department?: string
  dayType?: 'all' | 'laboral' | 'ausente' | 'libre' | 'feriado'
}

export function ReportsPage(): JSX.Element {
  const reportRef = useRef<HTMLDivElement>(null)
  const [filters, setFilters] = useState<ReportFilters>({
    reportType: 'weekly-all',
    startDate: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    endDate: format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    department: 'all',
    dayType: 'all',
  })
  
  const [employees, setEmployees] = useState<Employee[]>([])
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showStats, setShowStats] = useState(false)

  // Cargar empleados al montar el componente
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const employeesData = await getEmployees()
        setEmployees(employeesData)
      } catch (err) {
        console.error('Error cargando empleados:', err)
      }
    }
    loadEmployees()
  }, [])

  const handleGenerateReport = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Mapear dayType de frontend a backend
      const dayTypeMap: Record<string, 'LABORAL' | 'AUSENTE' | 'LIBRE' | 'NO_LABORAL' | 'FERIADO'> = {
        'laboral': 'LABORAL',
        'ausente': 'AUSENTE',
        'libre': 'LIBRE',
        'feriado': 'FERIADO',
      }

      // Construir filtros para la API
      const apiFilters: ApiReportFilters = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        department: filters.department === 'all' ? undefined : filters.department,
        dayType: filters.dayType && filters.dayType !== 'all' ? dayTypeMap[filters.dayType] : undefined,
      }

      // Si es reporte individual, agregar employeeId
      if (filters.reportType === 'employee-range' && filters.selectedEmployeeId) {
        apiFilters.employeeId = filters.selectedEmployeeId
      }

      const data = await getReportData(apiFilters)
      setReportData(data)
    } catch (err) {
      setError('Error al generar el reporte')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrintReport = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    if (!reportRef.current || !reportData) return
    
    try {
      // Generar filas de la tabla
      let tableRows = ''
      reportData.employees?.forEach((employee: Employee) => {
        employee.schedules?.forEach((schedule: any) => {
          const advances = schedule.advances.reduce((sum: number, adv: any) => sum + adv.amount, 0)
          tableRows += `
            <tr style="background-color: #ffffff;">
              <td style="border: 1px solid #d1d5db; padding: 10px; font-weight: bold; color: #000;">${employee.name}</td>
              <td style="border: 1px solid #d1d5db; padding: 10px; color: #000;">${employee.department || 'Sin depto'}</td>
              <td style="border: 1px solid #d1d5db; padding: 10px; color: #000;">${format(new Date(schedule.date), "dd/MM/yyyy")}</td>
              <td style="border: 1px solid #d1d5db; padding: 10px; color: #000;">${schedule.clockIn || '-'}</td>
              <td style="border: 1px solid #d1d5db; padding: 10px; color: #000;">${schedule.clockOut || '-'}</td>
              <td style="border: 1px solid #d1d5db; padding: 10px; color: #000;">${schedule.dayType}</td>
              <td style="border: 1px solid #d1d5db; padding: 10px; text-align: right; color: #000;">
                ${schedule.overtimeMinutes > 0 ? `${(schedule.overtimeMinutes / 60).toFixed(1)}h` : '-'}
              </td>
              <td style="border: 1px solid #d1d5db; padding: 10px; text-align: right; color: #000;">
                ${advances > 0 ? `₲${advances.toLocaleString('es-PY')}` : '-'}
              </td>
            </tr>
          `
        })
      })
      
      // Crear HTML completo
      const pdfHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; background: white; }
            h1 { text-align: center; margin-bottom: 10px; color: #000; font-size: 24px; }
            p { text-align: center; margin-bottom: 20px; color: #333; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background-color: #2563eb; color: white; border: 1px solid #2563eb; padding: 10px; text-align: left; font-weight: bold; }
            td { border: 1px solid #d1d5db; padding: 10px; color: #000; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .footer { margin-top: 20px; font-size: 11px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <h1>${filters.reportType === 'weekly-all' 
            ? 'Reporte Semanal - Todos los Empleados'
            : 'Reporte Individual por Rango de Fechas'}</h1>
          <p>${format(new Date(filters.startDate), "dd 'de' MMMM yyyy", { locale: es })} - ${format(new Date(filters.endDate), "dd 'de' MMMM yyyy", { locale: es })}</p>
          
          <table>
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Departamento</th>
                <th>Fecha</th>
                <th>Entrada</th>
                <th>Salida</th>
                <th>Tipo</th>
                <th style="text-align: right;">Horas Extra</th>
                <th style="text-align: right;">Adelantos</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          
          <div class="footer">
            Generado el ${format(new Date(), "dd 'de' MMMM yyyy 'a las' HH:mm", { locale: es })}
          </div>
        </body>
        </html>
      `
      
      // Configuración optimizada
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `reporte-${filters.reportType}-${format(new Date(), 'yyyy-MM-dd')}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'landscape'
        }
      }
      
      // Crear elemento temporal
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = pdfHTML
      tempDiv.style.width = '1200px'
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.top = '0'
      document.body.appendChild(tempDiv)
      
      // Esperar un momento para que se renderice
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Generar PDF
      await html2pdf().set(opt).from(tempDiv).save()
      
      // Limpiar
      document.body.removeChild(tempDiv)
      
    } catch (error) {
      console.error('Error generando PDF:', error)
      setError('Error al generar el PDF. Intente con la opción de impresión.')
    }
  }

  const handleDownloadExcel = () => {
    if (!reportData) return
    
    // Crear CSV simple (puede mejorarse con una librería como xlsx)
    let csv = 'Empleado,Fecha,Entrada,Salida,Horas Extra,Adelantos\n'
    
    reportData.employees?.forEach((employee: Employee) => {
      employee.schedules?.forEach((schedule: any) => {
        const advances = schedule.advances?.reduce((sum: number, adv: any) => sum + adv.amount, 0) || 0
        csv += `"${employee.name}","${format(new Date(schedule.date), 'dd/MM/yyyy')}","${schedule.clockIn || ''}","${schedule.clockOut || ''}","${schedule.overtimeMinutes > 0 ? (schedule.overtimeMinutes / 60).toFixed(1) + 'h' : ''}","${advances.toLocaleString('es-PY')}"\n`
      })
    })
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `reporte-${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const calculateStats = () => {
    if (!reportData?.stats) return null
    
    return {
      totalEmployees: reportData.stats.totalEmployees,
      totalDays: reportData.stats.totalDays,
      attendanceCount: reportData.stats.totalAttendance,
      attendanceRate: reportData.stats.attendanceRate.toFixed(1),
      totalOvertimeHours: reportData.stats.totalOvertimeHours.toFixed(1),
      totalAdvances: reportData.stats.totalAdvancesAmount.toLocaleString('es-PY'),
      avgOvertimePerEmployee: reportData.stats.avgOvertimePerEmployee.toFixed(1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-cyan-100 to-blue-200 p-4 sm:p-6">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Reportes de Horarios</h1>
          <p className="text-gray-600">Genera reportes semanales y por empleado con opción de impresión</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Configuración del Reporte</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tipo de reporte */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Reporte
              </label>
              <div className="space-y-2">
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  filters.reportType === 'weekly-all' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="reportType"
                    value="weekly-all"
                    checked={filters.reportType === 'weekly-all'}
                    onChange={(e) => setFilters({ ...filters, reportType: e.target.value as ReportType })}
                    className="mr-3 w-4 h-4"
                  />
                  <FaUsers className="mr-2 text-blue-600 text-lg" />
                  <span className="font-semibold text-gray-800">Reporte Semanal - Todos los Empleados</span>
                </label>
                
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  filters.reportType === 'employee-range' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 hover:border-green-300 hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="reportType"
                    value="employee-range"
                    checked={filters.reportType === 'employee-range'}
                    onChange={(e) => setFilters({ ...filters, reportType: e.target.value as ReportType })}
                    className="mr-3 w-4 h-4"
                  />
                  <FaUser className="mr-2 text-green-600 text-lg" />
                  <span className="font-semibold text-gray-800">Reporte por Empleado - Rango de Fechas</span>
                </label>
              </div>
            </div>

            {/* Rango de fechas */}
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
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="w-full px-4 py-3 text-gray-900 font-medium border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Fin</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="w-full px-4 py-3 text-gray-900 font-medium border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Filtros adicionales */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Departamento
              </label>
              <select
                value={filters.department || 'all'}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="w-full px-4 py-3 text-gray-900 font-medium border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white cursor-pointer"
              >
                <option value="all" className="font-medium">Todos los departamentos</option>
                <option value="ventas" className="font-medium">Ventas</option>
                <option value="produccion" className="font-medium">Producción</option>
                <option value="administracion" className="font-medium">Administración</option>
                <option value="logistica" className="font-medium">Logística</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo de Día
              </label>
              <select
                value={filters.dayType || 'all'}
                onChange={(e) => setFilters({ ...filters, dayType: e.target.value as any })}
                className="w-full px-4 py-3 text-gray-900 font-medium border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white cursor-pointer"
              >
                <option value="all" className="font-medium">Todos los tipos</option>
                <option value="laboral" className="font-medium">Laboral</option>
                <option value="ausente" className="font-medium">Ausente</option>
                <option value="libre" className="font-medium">Libre</option>
                <option value="feriado" className="font-medium">Feriado</option>
              </select>
            </div>

            {/* Selector de empleado (solo si es reporte individual) */}
            {filters.reportType === 'employee-range' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Seleccionar Empleado
                </label>
                <select
                  value={filters.selectedEmployeeId || ''}
                  onChange={(e) => setFilters({ ...filters, selectedEmployeeId: e.target.value })}
                  className="w-full px-4 py-3 text-gray-900 font-medium border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white cursor-pointer"
                >
                  <option value="" className="font-medium text-gray-500">Seleccione un empleado...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id} className="font-medium text-gray-900">
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={handleGenerateReport}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
            >
              <FaCalendarAlt />
              {isLoading ? 'Generando...' : 'Generar Reporte'}
            </button>
            
            {reportData && (
              <>
                <button
                  onClick={handlePrintReport}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  <FaPrint />
                  Imprimir
                </button>
                
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  <FaFileDownload />
                  Descargar PDF
                </button>
                
                <button
                  onClick={handleDownloadExcel}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  <FaFileExcel />
                  Descargar Excel
                </button>
                
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  <FaChartBar />
                  {showStats ? 'Ocultar' : 'Ver'} Estadísticas
                </button>
              </>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Panel de Estadísticas */}
        {showStats && reportData && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaChartBar className="text-orange-600" />
              Estadísticas del Período
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-800">{calculateStats()?.totalEmployees}</div>
                <div className="text-sm text-blue-600">Total Empleados</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-800">{calculateStats()?.attendanceRate}%</div>
                <div className="text-sm text-green-600">Tasa Asistencia</div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-800">{calculateStats()?.totalOvertimeHours}h</div>
                <div className="text-sm text-purple-600">Horas Extra Totales</div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-800">₲{calculateStats()?.totalAdvances}</div>
                <div className="text-sm text-orange-600">Adelantos Totales</div>
              </div>
              
              <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                <div className="text-2xl font-bold text-cyan-800">{calculateStats()?.avgOvertimePerEmployee}h</div>
                <div className="text-sm text-cyan-600">Promedio Extra/Empleado</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-800">{calculateStats()?.totalDays}</div>
                <div className="text-sm text-gray-600">Total Días</div>
              </div>
            </div>
          </div>
        )}

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
                  {reportData.employees?.map((employee: Employee) => 
                    employee.schedules.map((schedule: any) => (
                      <tr key={`${employee.id}-${schedule.date}`} className="hover:bg-blue-50 transition-colors">
                        <td className="border border-gray-300 px-4 py-3 font-bold text-gray-900">{employee.name}</td>
                        <td className="border border-gray-300 px-4 py-3">
                          <span className="px-3 py-1.5 bg-blue-100 text-blue-900 rounded-md text-sm font-semibold">
                            {employee.department || 'Sin depto'}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-900 font-medium">
                          {format(new Date(schedule.date), "dd/MM/yyyy")}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-900 font-semibold">
                          {schedule.clockIn || <span className="text-gray-400">-</span>}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-900 font-semibold">
                          {schedule.clockOut || <span className="text-gray-400">-</span>}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <span className={`px-3 py-1.5 rounded-md text-sm font-bold ${
                            schedule.dayType === 'LABORAL' ? 'bg-green-100 text-green-900' :
                            schedule.dayType === 'AUSENTE' ? 'bg-red-100 text-red-900' :
                            schedule.dayType === 'LIBRE' ? 'bg-gray-200 text-gray-900' :
                            schedule.dayType === 'FERIADO' ? 'bg-purple-100 text-purple-900' :
                            'bg-yellow-100 text-yellow-900'
                          }`}>
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
                            ? `₲${schedule.advances.reduce((sum: number, adv: any) => sum + adv.amount, 0).toLocaleString('es-PY')}`
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
      </div>

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
  )
}
