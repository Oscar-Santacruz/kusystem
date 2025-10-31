import { type JSX, useState, useRef } from 'react'
import { useWeekSchedules } from '../calendar/hooks/useWeekSchedules'
import { useScheduleModal } from '../calendar/hooks/useScheduleModal'
import { useScheduleClipboard } from '../calendar/hooks/useScheduleClipboard'
import { ScheduleGrid } from '../calendar/components/ScheduleGrid'
import { ScheduleModal } from '../calendar/components/ScheduleModal'
import { ScheduleContextMenu } from '../calendar/components/ScheduleContextMenu'
import type { DaySchedule } from '../components'

export function CalendarPageRefactored(): JSX.Element {
  const [lastClockIn, setLastClockIn] = useState<string>('08:00')
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    employeeId: string
    dayIndex: number
    schedule: DaySchedule | undefined
    date: Date
  } | null>(null)

  const clipboard = useScheduleClipboard()

  const {
    currentWeekStart,
    employees,
    isLoading,
    loadError,
    goToPrevWeek,
    goToNextWeek,
    reloadWeekData,
  } = useWeekSchedules()

  const {
    modalData,
    openModal,
    closeModal,
    updateModalField,
    handleDayTypeChange,
    saveModal,
  } = useScheduleModal()

  const handleDayCellClick = (
    employeeId: string,
    employeeName: string,
    dayIndex: number,
    schedule: DaySchedule | undefined,
    date: Date
  ) => {
    openModal(employeeId, employeeName, dayIndex, schedule, date, lastClockIn)
  }

  const handleContextMenu = (
    e: React.MouseEvent,
    employeeId: string,
    dayIndex: number,
    schedule: DaySchedule | undefined,
    date: Date
  ) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      employeeId,
      dayIndex,
      schedule,
      date,
    })
  }

  const handleSaveModal = async () => {
    await saveModal(() => {
      // Actualizar lastClockIn si se guardó una entrada
      if (modalData?.clockIn) {
        setLastClockIn(modalData.clockIn)
      }
      reloadWeekData()
    })
  }

  const handleCopySchedule = () => {
    if (!contextMenu) return
    clipboard.copy(contextMenu.schedule)
    setContextMenu(null)
  }

  const handlePasteSchedule = async () => {
    if (!contextMenu) return
    const schedule = clipboard.paste()
    if (!schedule) return

    try {
      // Aquí iría la lógica para pegar el horario
      // Por ahora solo cerramos el menú
      setContextMenu(null)
      await reloadWeekData()
    } catch (error) {
      console.error('Error pegando horario:', error)
    }
  }

  const handleDuplicateWeek = async () => {
    if (!contextMenu) return
    // Lógica para duplicar a toda la semana
    setContextMenu(null)
    await reloadWeekData()
  }

  const handleDuplicateAllEmployees = async () => {
    if (!contextMenu) return
    // Lógica para duplicar a todos los empleados
    setContextMenu(null)
    await reloadWeekData()
  }

  const closeContextMenu = () => {
    setContextMenu(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando calendario...</p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error al cargar los datos</div>
          <p className="text-gray-600">{loadError}</p>
          <button
            onClick={reloadWeekData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Calendario de Horarios</h1>
          <p className="text-gray-600">Gestiona los horarios y asistencia de los empleados</p>
        </div>

        {/* Grid principal */}
        <ScheduleGrid
          currentWeekStart={currentWeekStart}
          employees={employees}
          onDayCellClick={handleDayCellClick}
          onContextMenu={handleContextMenu}
          goToPrevWeek={goToPrevWeek}
          goToNextWeek={goToNextWeek}
        />

        {/* Modal */}
        <ScheduleModal
          modalData={modalData}
          onClose={closeModal}
          onUpdateField={updateModalField}
          onDayTypeChange={handleDayTypeChange}
          onSave={handleSaveModal}
        />

        {/* Menú contextual */}
        {contextMenu && (
          <ScheduleContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={closeContextMenu}
            onCopy={handleCopySchedule}
            onPaste={handlePasteSchedule}
            onDuplicateWeek={handleDuplicateWeek}
            onDuplicateAllEmployees={handleDuplicateAllEmployees}
          />
        )}
      </div>
    </div>
  )
}
