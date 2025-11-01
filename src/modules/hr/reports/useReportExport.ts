import { useRef } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ReportData, Employee } from '../api/calendarApi'
import type { ReportFilters } from './types'

interface Props {
  reportRef: React.RefObject<HTMLDivElement | null>
  reportData: ReportData | null
  filters: ReportFilters
  onError?: (message: string) => void
}

export function useReportExport({ reportRef, reportData, filters, onError }: Props) {
  const html2pdfRef = useRef<Awaited<typeof import('html2pdf.js')>['default'] | null>(null)

  const handlePrintReport = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    if (!reportRef.current || !reportData) return

    try {
      if (!html2pdfRef.current) {
        const module = await import('html2pdf.js')
        html2pdfRef.current = module.default
      }
      const html2pdf = html2pdfRef.current
      if (!html2pdf) {
        throw new Error('No se pudo cargar el módulo html2pdf')
      }

      // Generar filas de la tabla
      let tableRows = ''
      reportData.employees?.forEach((employee: Employee) => {
        employee.schedules?.forEach(schedule => {
          const advances = schedule.advances.reduce((sum, adv) => sum + adv.amount, 0)
          tableRows += `
            <tr style="background-color: #ffffff;">
              <td style="border: 1px solid #d1d5db; padding: 10px; font-weight: bold; color: #000;">${employee.name}</td>
              <td style="border: 1px solid #d1d5db; padding: 10px; color: #000;">${employee.department || 'Sin depto'}</td>
              <td style="border: 1px solid #d1d5db; padding: 10px; color: #000;">${format(new Date(schedule.date), 'dd/MM/yyyy')}</td>
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
          letterRendering: true,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'landscape',
        },
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
      onError?.('Error al generar el PDF. Intente con la opción de impresión.')
    }
  }

  const handleDownloadExcel = () => {
    if (!reportData) return

    // Crear CSV simple (puede mejorarse con una librería como xlsx)
    let csv = 'Empleado,Fecha,Entrada,Salida,Horas Extra,Adelantos\n'

    reportData.employees?.forEach(employee => {
      employee.schedules?.forEach(schedule => {
        const advances = schedule.advances?.reduce((sum, adv) => sum + adv.amount, 0) ?? 0
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

  return {
    handlePrintReport,
    handleDownloadPDF,
    handleDownloadExcel,
  }
}
