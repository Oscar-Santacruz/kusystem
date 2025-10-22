import { type JSX, useState, useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { DayCell, EmployeeCard, type DayType } from '../components'
import { FaChevronLeft, FaChevronRight, FaClock, FaDollarSign, FaUserClock } from 'react-icons/fa'
import { addDays, format, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { getWeekData, upsertSchedule, type Employee } from '../api/calendarApi'

// Tipo para las jornadas del calendario
interface DaySchedule {
  clockIn?: string
  clockOut?: string
  advance?: number
  overtimeHours?: number
  dayType?: DayType
}


export function CalendarPage(): JSX.Element {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [modalData, setModalData] = useState<{
    isOpen: boolean
    employeeId: string
    employeeName: string
    dayIndex: number
    date: Date
    clockIn: string
    clockOut: string
    overtimeHours: number
    advance: number
    advanceDisplayValue: string
    dayType: DayType
    showOvertime: boolean
    validationErrors: Record<string, string>
    isSaving: boolean
    saveMessage: string
  } | null>(null)

  // Estado para drag & drop
  const [dragSource, setDragSource] = useState<{
    employeeId: string
    dayIndex: number
    schedule: DaySchedule
  } | null>(null)
  
  const [dropTarget, setDropTarget] = useState<{
    employeeId: string
    dayIndex: number
  } | null>(null)

  // Estado para reordenar empleados
  const [draggedEmployeeId, setDraggedEmployeeId] = useState<string | null>(null)
  const [draggedOverEmployeeId, setDraggedOverEmployeeId] = useState<string | null>(null)

  // Detect if device supports touch
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false)

  const touchDragStateRef = useRef<null | {
    pointerId: number
    started: boolean
    originEmployeeId: string
    originEmployeeName: string
    originDayIndex: number
    originDate: Date
    schedule: DaySchedule
  }>(null)

  const touchStartPointRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }
    checkTouchDevice()
  }, [])

  // Last used clock in time for autocompletion
  const [lastClockIn, setLastClockIn] = useState<string>('08:00')

  // Load week data
  useEffect(() => {
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

    void loadWeekData()
  }, [currentWeekStart])

  const handlePrevWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, -7))
  }

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, 7))
  }

  const DAYS = Array.from({ length: 7 }, (_, idx) => {
    const date = addDays(currentWeekStart, idx)
    const labelRaw = format(date, 'EEE dd', { locale: es }).replace('.', '')
    const label = labelRaw.charAt(0).toUpperCase() + labelRaw.slice(1)
    return { label, date }
  })

  const handleDayCellInteraction = (employeeId: string, employeeName: string, dayIndex: number, schedule: DaySchedule, date: Date) => {
    const clockIn = schedule?.clockIn || lastClockIn
    const clockOut = schedule?.clockOut || ''
    const advance = schedule?.advance || 0
    
    // Calcular horas extras automáticamente
    let overtimeHours = 0
    let showOvertime = false
    if (clockIn && clockOut) {
      const [inH, inM] = clockIn.split(':').map(Number)
      const [outH, outM] = clockOut.split(':').map(Number)
      const totalMinutes = (outH * 60 + outM) - (inH * 60 + inM)
      const totalHours = totalMinutes / 60
      overtimeHours = Math.max(0, totalHours - 8)
      showOvertime = overtimeHours > 0
    }
    
    setModalData({
      isOpen: true,
      employeeId,
      employeeName,
      dayIndex,
      date,
      clockIn,
      clockOut,
      overtimeHours: schedule?.overtimeHours ?? overtimeHours,
      advance,
      advanceDisplayValue: advance ? advance.toLocaleString('es-PY') : '',
      dayType: schedule?.dayType || 'laboral',
      showOvertime,
      validationErrors: {},
      isSaving: false,
      saveMessage: '',
    })
  }

  const validateModal = (data: typeof modalData) => {
    const errors: Record<string, string> = {}
    
    if (data?.dayType === 'laboral') {
      if (!data.clockIn) errors.clockIn = 'Hora de entrada requerida'
      if (!data.clockOut) errors.clockOut = 'Hora de salida requerida'
      if (data.clockIn && data.clockOut) {
        const inTime = new Date(`1970-01-01T${data.clockIn}:00`)
        const outTime = new Date(`1970-01-01T${data.clockOut}:00`)
        if (outTime <= inTime) {
          errors.clockOut = 'La salida debe ser posterior a la entrada'
        }
      }
    }
    
    if ((data?.advance ?? 0) > 5000000) { // Límite de 5M Gs
      errors.advance = 'El vale supera el límite máximo (5.000.000 Gs)'
    }
    
    return errors
  }

  const handleCloseModal = () => {
    setModalData(null)
  }

  const handleSaveModal = async () => {
    if (!modalData) return
    
    const errors = validateModal(modalData)
    if (Object.keys(errors).length > 0) {
      setModalData({ ...modalData, validationErrors: errors })
      return
    }
    
    setModalData({ ...modalData, isSaving: true, validationErrors: {} })
    
    try {
      const dateStr = format(modalData.date, 'yyyy-MM-dd')
      
      // Map frontend dayType to backend DayType enum
      const dayTypeMap: Record<DayType, 'LABORAL' | 'AUSENTE' | 'LIBRE' | 'NO_LABORAL' | 'FERIADO'> = {
        'laboral': 'LABORAL',
        'ausente': 'AUSENTE',
        'libre': 'LIBRE',
        'no-laboral': 'NO_LABORAL',
        'feriado': 'FERIADO',
      }
      
      const hasAdvanceValue = modalData.advanceDisplayValue !== ''

      await upsertSchedule(modalData.employeeId, dateStr, {
        clockIn: modalData.clockIn || null,
        clockOut: modalData.clockOut || null,
        dayType: dayTypeMap[modalData.dayType],
        overtimeMinutes: Math.round(modalData.overtimeHours * 60),
        advanceAmount: hasAdvanceValue ? modalData.advance : null,
      })
      
      // Update last clock in
      if (modalData.clockIn) {
        setLastClockIn(modalData.clockIn)
      }
      
      setModalData({ ...modalData, isSaving: false, saveMessage: 'Registro actualizado correctamente' })
      
      // Reload week data
      const startDate = format(currentWeekStart, 'yyyy-MM-dd')
      const data = await getWeekData(startDate)
      setEmployees(data.employees)
      
      // Close modal after success message
      setTimeout(() => {
        handleCloseModal()
      }, 1500)
      
    } catch (error) {
      console.error('Error saving schedule:', error)
      setModalData({ ...modalData, isSaving: false, validationErrors: { general: error instanceof Error ? error.message : 'Error al guardar los datos' } })
    }
  }

  const updateModalField = (field: string, value: any) => {
    if (!modalData) return
    
    const newData = { ...modalData, [field]: value, validationErrors: { ...modalData.validationErrors } }
    delete newData.validationErrors[field]
    
    // Auto-calculate overtime when changing clock out
    if (field === 'clockOut' && newData.clockIn && newData.clockOut) {
      const [inH, inM] = newData.clockIn.split(':').map(Number)
      const [outH, outM] = newData.clockOut.split(':').map(Number)
      const totalMinutes = (outH * 60 + outM) - (inH * 60 + inM)
      const totalHours = totalMinutes / 60
      newData.overtimeHours = Math.max(0, totalHours - 8)
      newData.showOvertime = newData.overtimeHours > 0
    }
    
    // Format advance amount - update display value and numeric value
    if (field === 'advance') {
      const cleanedValue = value.replace(/[^\d]/g, '')
      const numericValue = parseInt(cleanedValue) || 0
      newData.advance = numericValue
      newData.advanceDisplayValue = cleanedValue ? numericValue.toLocaleString('es-PY') : ''
    }
    
    setModalData(newData)
  }

  const handleDayTypeChange = (dayType: DayType) => {
    if (!modalData) return
    setModalData({ ...modalData, dayType, validationErrors: {} })
  }

  // Handlers de drag & drop
  const handleDragStart = (employeeId: string, dayIndex: number, schedule: DaySchedule) => {
    setDragSource({ employeeId, dayIndex, schedule })
    setDropTarget(null)
  }

  const handleDragEnd = () => {
    setDragSource(null)
    setDropTarget(null)
  }

  const handleDragOver = (employeeId: string, dayIndex: number) => {
    // Solo permitir drop si es una celda diferente
    if (dragSource && (dragSource.employeeId !== employeeId || dragSource.dayIndex !== dayIndex)) {
      setDropTarget({ employeeId, dayIndex })
    }
  }

  const handleDragLeave = () => {
    setDropTarget(null)
  }

  const handleDrop = async (employeeId: string, dayIndex: number, date: Date) => {
    if (!dragSource) return

    // No copiar sobre la misma celda
    if (dragSource.employeeId === employeeId && dragSource.dayIndex === dayIndex) {
      setDragSource(null)
      setDropTarget(null)
      return
    }

    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      
      // Map frontend dayType to backend DayType enum
      const dayTypeMap: Record<DayType, 'LABORAL' | 'AUSENTE' | 'LIBRE' | 'NO_LABORAL' | 'FERIADO'> = {
        'laboral': 'LABORAL',
        'ausente': 'AUSENTE',
        'libre': 'LIBRE',
        'no-laboral': 'NO_LABORAL',
        'feriado': 'FERIADO',
      }
      
      // Copiar los valores de la celda origen
      const advanceAmount = dragSource.schedule.advance

      await upsertSchedule(employeeId, dateStr, {
        clockIn: dragSource.schedule.clockIn || null,
        clockOut: dragSource.schedule.clockOut || null,
        dayType: dayTypeMap[dragSource.schedule.dayType || 'laboral'],
        overtimeMinutes: Math.round((dragSource.schedule.overtimeHours || 0) * 60),
        advanceAmount: advanceAmount ?? null,
      })

      // Recargar datos
      const startDate = format(currentWeekStart, 'yyyy-MM-dd')
      const data = await getWeekData(startDate)
      setEmployees(data.employees)
    } catch (error) {
      console.error('Error copiando horario:', error)
    } finally {
      setDragSource(null)
      setDropTarget(null)
    }
  }

  const resetTouchDrag = () => {
    touchDragStateRef.current = null
    touchStartPointRef.current = null
  }

  const beginTouchDrag = (state: {
    pointerId: number
    originEmployeeId: string
    originEmployeeName: string
    originDayIndex: number
    originDate: Date
    schedule: DaySchedule
  }) => {
    handleDragStart(state.originEmployeeId, state.originDayIndex, state.schedule)
    touchDragStateRef.current = { ...state, started: true }
  }

  const handleTouchPointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
    employeeId: string,
    employeeName: string,
    dayIndex: number,
    schedule: DaySchedule,
    date: Date,
  ) => {
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') {
      return
    }

    touchDragStateRef.current = {
      pointerId: event.pointerId,
      started: false,
      originEmployeeId: employeeId,
      originEmployeeName: employeeName,
      originDayIndex: dayIndex,
      originDate: date,
      schedule,
    }
    touchStartPointRef.current = { x: event.clientX, y: event.clientY }
    setDropTarget(null)
  }

  const handleTouchPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = touchDragStateRef.current
    if (!state || state.pointerId !== event.pointerId) return

    const startPoint = touchStartPointRef.current
    if (!startPoint) return

    const deltaX = event.clientX - startPoint.x
    const deltaY = event.clientY - startPoint.y

    if (!state.started) {
      if (Math.abs(deltaX) >= 8 || Math.abs(deltaY) >= 8) {
        event.currentTarget.setPointerCapture?.(event.pointerId)
        beginTouchDrag(state)
      } else {
        return
      }
    }

    event.preventDefault()

    const element = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null
    if (!element) {
      setDropTarget(null)
      return
    }

    const cellEl = element.closest('[data-day-cell="true"]') as HTMLElement | null
    if (!cellEl) {
      setDropTarget(null)
      return
    }

    const targetEmployeeId = cellEl.getAttribute('data-employee-id') ?? undefined
    const dayIndexAttr = cellEl.getAttribute('data-day-index')
    const targetDayIndex = typeof dayIndexAttr === 'string' ? Number(dayIndexAttr) : NaN

    if (!targetEmployeeId || Number.isNaN(targetDayIndex)) {
      setDropTarget(null)
      return
    }

    if (targetEmployeeId === state.originEmployeeId && targetDayIndex === state.originDayIndex) {
      setDropTarget(null)
      return
    }

    setDropTarget({ employeeId: targetEmployeeId, dayIndex: targetDayIndex })
  }

  const handleTouchPointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = touchDragStateRef.current
    if (!state || state.pointerId !== event.pointerId) return

    event.currentTarget.releasePointerCapture?.(event.pointerId)

    if (!state.started) {
      handleDayCellInteraction(
        state.originEmployeeId,
        state.originEmployeeName,
        state.originDayIndex,
        state.schedule,
        state.originDate,
      )
      resetTouchDrag()
      return
    }

    const target = dropTarget
    if (target) {
      const targetDayMeta = DAYS[target.dayIndex]
      if (targetDayMeta) {
        void handleDrop(target.employeeId, target.dayIndex, targetDayMeta.date)
      } else {
        handleDragEnd()
      }
    } else {
      handleDragEnd()
    }

    resetTouchDrag()
  }

  const handleTouchPointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = touchDragStateRef.current
    if (!state || state.pointerId !== event.pointerId) return

    event.currentTarget.releasePointerCapture?.(event.pointerId)
    if (state.started) {
      handleDragEnd()
    }
    resetTouchDrag()
  }

  // Handlers para reordenar empleados
  const handleEmployeeDragStart = (employeeId: string) => {
    setDraggedEmployeeId(employeeId)
  }

  const handleEmployeeDragOver = (e: React.DragEvent, employeeId: string) => {
    e.preventDefault()
    if (draggedEmployeeId && draggedEmployeeId !== employeeId) {
      setDraggedOverEmployeeId(employeeId)
    }
  }

  const handleEmployeeDragEnd = () => {
    if (draggedEmployeeId && draggedOverEmployeeId && draggedEmployeeId !== draggedOverEmployeeId) {
      const newEmployees = [...employees]
      const draggedIndex = newEmployees.findIndex(e => e.id === draggedEmployeeId)
      const targetIndex = newEmployees.findIndex(e => e.id === draggedOverEmployeeId)
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const [removed] = newEmployees.splice(draggedIndex, 1)
        newEmployees.splice(targetIndex, 0, removed)
        setEmployees(newEmployees)
        
        // Guardar orden en localStorage
        const orderIds = newEmployees.map(e => e.id)
        localStorage.setItem('hr-employee-order', JSON.stringify(orderIds))
      }
    }
    
    setDraggedEmployeeId(null)
    setDraggedOverEmployeeId(null)
  }

  const handleEmployeeDragLeave = () => {
    setDraggedOverEmployeeId(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-cyan-100 to-blue-200 p-4 sm:p-6">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Calendario de Horario de Empleados</h1>
        </div>

        {/* Calendario Card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
          {/* Header del calendario */}
          <div className="border-b bg-gray-50 p-6">
            <div className="flex items-center justify-between">
              <button onClick={handlePrevWeek} className="rounded-lg p-2 hover:bg-gray-200 transition-colors">
                <FaChevronLeft className="h-5 w-5" />
              </button>
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">Calendario Semanal</h2>
                <p className="text-sm text-gray-600">{`Semana del ${format(currentWeekStart, 'dd')} al ${format(addDays(currentWeekStart, 6), 'dd')} de ${format(currentWeekStart, 'MMMM', { locale: es }).charAt(0).toUpperCase() + format(currentWeekStart, 'MMMM', { locale: es }).slice(1)}`}</p>
              </div>
              <button onClick={handleNextWeek} className="rounded-lg p-2 hover:bg-gray-200 transition-colors">
                <FaChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Grid del calendario */}
          <div className="overflow-x-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                  <p className="mt-2 text-sm text-gray-600">Cargando datos...</p>
                </div>
              </div>
            ) : loadError ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-red-600">{loadError}</p>
                  <button onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Reintentar</button>
                </div>
              </div>
            ) : (
            <div className="min-w-full">
              {/* Header con dias */}
              <div className="mb-3 grid grid-cols-[80px_repeat(7,minmax(90px,1fr))] gap-1 text-[11px] sm:grid-cols-[150px_repeat(7,minmax(80px,1fr))] sm:gap-1.5 md:text-sm lg:grid-cols-[120px_repeat(7,minmax(90px,1fr))] lg:gap-2">
                <div className="font-semibold text-gray-700">Empleado</div>
                {DAYS.map((day, idx) => (
                  <div key={idx} className="text-center font-medium text-gray-700">
                    {day.label}
                  </div>
                ))}
              </div>

              {/* Filas de empleados */}
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className="mb-3 transition-all"
                  draggable
                  onDragStart={() => handleEmployeeDragStart(employee.id)}
                  onDragOver={(e) => handleEmployeeDragOver(e, employee.id)}
                  onDragEnd={handleEmployeeDragEnd}
                  onDragLeave={handleEmployeeDragLeave}
                  style={{
                    opacity: draggedEmployeeId === employee.id ? 0.5 : 1,
                    transform: draggedOverEmployeeId === employee.id ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  <div className="grid grid-cols-[80px_repeat(7,minmax(90px,1fr))] gap-1 sm:grid-cols-[150px_repeat(7,minmax(80px,1fr))] sm:gap-1.5 lg:grid-cols-[120px_repeat(7,minmax(90px,1fr))] lg:gap-2">
                    {/* Card del empleado */}
                    <div className="flex items-start justify-start">
                      <EmployeeCard
                        name={employee.name}
                        avatarUrl={employee.avatarUrl || undefined}
                        weeklyOvertimeHours={employee.weeklyOvertimeHours}
                        weeklyAdvances={employee.weeklyAdvances}
                        weeklyAdvancesAmount={employee.weeklyAdvancesAmount}
                      />
                    </div>

                    {/* Celdas de dias */}
                    {DAYS.map((dayMeta, idx) => {
                      const schedule = employee.schedules.find(s => s.date === format(dayMeta.date, 'yyyy-MM-dd'))
                      const dayTypeMap: Record<string, DayType> = {
                        'LABORAL': 'laboral',
                        'AUSENTE': 'ausente',
                        'LIBRE': 'libre',
                        'NO_LABORAL': 'no-laboral',
                        'FERIADO': 'feriado',
                      }
                      const totalAdvance = schedule?.advances.reduce((sum, adv) => sum + adv.amount, 0) || 0
                      const overtimeHours = schedule ? Math.round(schedule.overtimeMinutes / 60 * 10) / 10 : 0
                      
                      return (
                        <DayCell
                          key={idx}
                          clockIn={schedule?.clockIn || undefined}
                          clockOut={schedule?.clockOut || undefined}
                          advance={totalAdvance > 0 ? totalAdvance : undefined}
                          overtimeHours={overtimeHours}
                          dayType={schedule?.dayType ? dayTypeMap[schedule.dayType] : undefined}
                          date={dayMeta.date}
                          {...(!isTouchDevice
                            ? {
                                onDoubleClick: () => handleDayCellInteraction(
                                  employee.id,
                                  employee.name,
                                  idx,
                                  {
                                    clockIn: schedule?.clockIn || undefined,
                                    clockOut: schedule?.clockOut || undefined,
                                    advance: totalAdvance,
                                    overtimeHours,
                                    dayType: schedule?.dayType ? dayTypeMap[schedule.dayType] : undefined,
                                  },
                                  dayMeta.date,
                                ),
                                onClick: () => handleDayCellInteraction(
                                  employee.id,
                                  employee.name,
                                  idx,
                                  {
                                    clockIn: schedule?.clockIn || undefined,
                                    clockOut: schedule?.clockOut || undefined,
                                    advance: totalAdvance,
                                    overtimeHours,
                                    dayType: schedule?.dayType ? dayTypeMap[schedule.dayType] : undefined,
                                  },
                                  dayMeta.date,
                                ),
                              }
                            : {
                                onPointerDown: (event: React.PointerEvent<HTMLDivElement>) =>
                                  handleTouchPointerDown(
                                    event,
                                    employee.id,
                                    employee.name,
                                    idx,
                                    {
                                      clockIn: schedule?.clockIn || undefined,
                                      clockOut: schedule?.clockOut || undefined,
                                      advance: totalAdvance,
                                      overtimeHours,
                                      dayType: schedule?.dayType ? dayTypeMap[schedule.dayType] : undefined,
                                    },
                                    dayMeta.date,
                                  ),
                                onPointerMove: handleTouchPointerMove,
                                onPointerUp: handleTouchPointerEnd,
                                onPointerCancel: handleTouchPointerCancel,
                              })}
                          onDragStart={() => handleDragStart(employee.id, idx, {
                            clockIn: schedule?.clockIn || undefined,
                            clockOut: schedule?.clockOut || undefined,
                            advance: totalAdvance,
                            overtimeHours,
                            dayType: schedule?.dayType ? dayTypeMap[schedule.dayType] : undefined,
                          })}
                          onDragEnd={handleDragEnd}
                          onDragOver={() => handleDragOver(employee.id, idx)}
                          onDragLeave={handleDragLeave}
                          onDrop={() => handleDrop(employee.id, idx, dayMeta.date)}
                          isDragging={dragSource?.employeeId === employee.id && dragSource?.dayIndex === idx}
                          isDropTarget={dropTarget?.employeeId === employee.id && dropTarget?.dayIndex === idx}
                          dataEmployeeId={employee.id}
                          dataDayIndex={idx}
                        />
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>

          {/* Leyenda */}
          <div className="border-t bg-gray-50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Leyenda:</h3>
            <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="flex h-4 w-4 rounded-sm border border-green-500 bg-green-50"></span>
                <span>Horario Normal</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-4 w-4 rounded-sm border border-orange-400 bg-orange-100"></span>
                <span>Horas Extra</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-4 w-4 rounded-sm border border-red-500 bg-red-50"></span>
                <span>Vale / Ausencia</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-4 w-4 rounded-sm border border-gray-400 bg-gray-100"></span>
                <span>Libre</span>
              </div>
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-200 p-3">
              <span className="text-blue-600 font-semibold">💡</span>
              <p className="text-xs text-blue-800">
                <strong>Tip:</strong> Arrastra una celda con horario para copiar sus valores a otro día u otro empleado.
              </p>
            </div>
          </div>
        </div>

        {/* Modal */}
        {modalData?.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={handleCloseModal}>
            <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 sm:p-8">
                <h3 className="mb-2 text-xl sm:text-2xl font-bold text-gray-900">
                  {modalData.employeeName}
                </h3>
                <p className="mb-6 text-base sm:text-lg text-gray-600">
                  {format(modalData.date, "EEEE dd 'de' MMMM", { locale: es })}
                </p>

                {/* Tipo de día */}
                <div className="mb-6">
                  <h4 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Tipo de Día</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { type: 'laboral' as DayType, label: 'Laboral', color: 'bg-green-100 text-green-800 border-green-200' },
                      { type: 'ausente' as DayType, label: 'Ausente', color: 'bg-red-100 text-red-800 border-red-200' },
                      { type: 'libre' as DayType, label: 'Libre', color: 'bg-gray-100 text-gray-800 border-gray-200' },
                      { type: 'feriado' as DayType, label: 'Feriado', color: 'bg-purple-100 text-purple-800 border-purple-200' },
                    ].map(({ type, label, color }) => (
                      <button
                        key={type}
                        onClick={() => handleDayTypeChange(type)}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                          modalData.dayType === type
                            ? `${color} ring-2 ring-blue-300`
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {modalData.dayType === 'laboral' && (
                  <>
                    {/* Horario Laboral */}
                    <div className="mb-6">
                      <h4 className="mb-4 flex items-center text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        <FaClock className="mr-2 h-4 w-4 text-gray-500" />
                        Horario Laboral
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Entrada</label>
                          <div className="relative">
                            <input
                              type="time"
                              step="900"
                              value={modalData.clockIn}
                              onChange={(e) => updateModalField('clockIn', e.target.value)}
                              className={`w-full rounded-lg border-2 px-3 py-2 pl-9 sm:px-4 sm:py-3 sm:pl-10 text-sm sm:text-base font-medium text-gray-900 bg-white focus:ring-2 transition-colors placeholder:text-gray-400 ${
                                modalData.validationErrors.clockIn
                                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                  : 'border-gray-300 focus:border-blue-600 focus:ring-blue-500'
                              }`}
                              style={{
                                boxShadow: modalData.validationErrors.clockIn 
                                  ? 'none' 
                                  : '0 0 0 2px rgba(37, 99, 235, 0.2)'
                              }}
                            />
                            <FaClock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                          </div>
                          {modalData.validationErrors.clockIn && (
                            <p className="mt-1 text-sm text-red-600">{modalData.validationErrors.clockIn}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Salida</label>
                          <div className="relative">
                            <input
                              type="time"
                              step="900"
                              value={modalData.clockOut}
                              onChange={(e) => updateModalField('clockOut', e.target.value)}
                              className={`w-full rounded-lg border-2 px-3 py-2 pl-9 sm:px-4 sm:py-3 sm:pl-10 text-sm sm:text-base font-medium text-gray-900 bg-white focus:ring-2 transition-colors placeholder:text-gray-400 ${
                                modalData.validationErrors.clockOut
                                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                  : 'border-gray-300 focus:border-blue-600 focus:ring-blue-500'
                              }`}
                              style={{
                                boxShadow: modalData.validationErrors.clockOut 
                                  ? 'none' 
                                  : '0 0 0 2px rgba(37, 99, 235, 0.2)'
                              }}
                            />
                            <FaClock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                          </div>
                          {modalData.validationErrors.clockOut && (
                            <p className="mt-1 text-sm text-red-600">{modalData.validationErrors.clockOut}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Horas Extras */}
                    {modalData.showOvertime && (
                      <div className="mb-6">
                        <h4 className="mb-4 flex items-center text-sm font-semibold text-gray-700 uppercase tracking-wide">
                          <FaUserClock className="mr-2 h-4 w-4 text-gray-500" />
                          Horas Extras
                        </h4>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.5"
                            value={modalData.overtimeHours}
                            onChange={(e) => updateModalField('overtimeHours', parseFloat(e.target.value) || 0)}
                            className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 pl-9 sm:px-4 sm:py-3 sm:pl-10 text-sm sm:text-base font-medium text-gray-900 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
                            style={{ boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.2)' }}
                            placeholder="0.0"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base font-medium text-gray-500">h</span>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">Calculadas automáticamente basado en horario</p>
                      </div>
                    )}
                  </>
                )}

                {/* Adelanto */}
                <div className="mb-6">
                  <h4 className="mb-4 flex items-center text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    <FaDollarSign className="mr-2 h-4 w-4 text-gray-500" />
                    Adelanto
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vale (Gs.)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={modalData.advanceDisplayValue}
                        onChange={(e) => updateModalField('advance', e.target.value)}
                        className={`w-full rounded-lg border-2 px-3 py-2 pl-9 sm:px-4 sm:py-3 sm:pl-10 text-sm sm:text-base font-medium text-gray-900 bg-white focus:ring-2 transition-colors placeholder:text-gray-400 ${
                          modalData.validationErrors.advance
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                            : 'border-gray-300 focus:border-blue-600 focus:ring-blue-500'
                        }`}
                        style={{
                          boxShadow: modalData.validationErrors.advance 
                            ? 'none' 
                            : '0 0 0 2px rgba(37, 99, 235, 0.2)'
                        }}
                        placeholder="0"
                      />
                      <FaDollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    </div>
                    {modalData.validationErrors.advance && (
                      <p className="mt-1 text-sm text-red-600">{modalData.validationErrors.advance}</p>
                    )}
                  </div>
                </div>

                {/* Mensajes de error general */}
                {modalData.validationErrors.general && (
                  <div className="mb-6 rounded-lg bg-red-50 p-4">
                    <p className="text-sm text-red-800">{modalData.validationErrors.general}</p>
                  </div>
                )}

                {/* Mensaje de éxito */}
                {modalData.saveMessage && (
                  <div className="mb-6 rounded-lg bg-green-50 p-4">
                    <p className="text-sm text-green-800">{modalData.saveMessage}</p>
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCloseModal}
                    disabled={modalData.isSaving}
                    className="flex-1 rounded-lg border-2 border-gray-300 bg-white px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveModal}
                    disabled={modalData.isSaving}
                    className={`flex-1 rounded-lg border-2 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 ${
                      modalData.isSaving
                        ? 'border-gray-300 bg-gray-400 text-gray-700 cursor-not-allowed'
                        : 'border-green-600 bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                    }`}
                  >
                    {modalData.isSaving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
