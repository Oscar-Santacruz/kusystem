import { FaCalendarAlt, FaFileDownload, FaFileExcel, FaPrint, FaChartBar } from 'react-icons/fa'

interface Props {
  hasData: boolean
  isLoading: boolean
  isGenerating: boolean
  onGenerate: () => void
  onPrint: () => void
  onDownloadPdf: () => void
  onDownloadExcel: () => void
  onToggleStats: () => void
  statsVisible: boolean
}

export function ReportActionsBar({
  hasData,
  isLoading,
  isGenerating,
  onGenerate,
  onPrint,
  onDownloadPdf,
  onDownloadExcel,
  onToggleStats,
  statsVisible,
}: Props) {
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <button
        onClick={onGenerate}
        disabled={isLoading || isGenerating}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
      >
        <FaCalendarAlt />
        {isGenerating ? 'Generando…' : 'Generar Reporte'}
      </button>

      <button
        onClick={onPrint}
        disabled={!hasData}
        className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <FaPrint />
        Imprimir
      </button>

      <button
        onClick={onDownloadPdf}
        disabled={!hasData}
        className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <FaFileDownload />
        Descargar PDF
      </button>

      <button
        onClick={onDownloadExcel}
        disabled={!hasData}
        className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <FaFileExcel />
        Exportar CSV
      </button>

      <button
        onClick={onToggleStats}
        disabled={!hasData}
        className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <FaChartBar />
        {statsVisible ? 'Ocultar estadísticas' : 'Ver estadísticas'}
      </button>
    </div>
  )
}
