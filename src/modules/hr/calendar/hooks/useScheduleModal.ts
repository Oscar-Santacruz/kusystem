import { useState } from 'react'
import { format } from 'date-fns'
import { upsertSchedule } from '../../api/calendarApi'
import type { DayType } from '../../components'

interface DaySchedule {
  clockIn?: string
  clockOut?: string
  advance?: number
  overtimeHours?: number
  dayType?: DayType
}

interface ModalData {
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
}

interface UseScheduleModalResult {
  modalData: ModalData | null
  openModal: (
    employeeId: string,
    employeeName: string,
    dayIndex: number,
    schedule: DaySchedule | undefined,
    date: Date,
    lastClockIn: string
  ) => void
  closeModal: () => void
  updateModalField: (field: string, value: any) => void
  handleDayTypeChange: (dayType: DayType) => void
  saveModal: (onSuccess?: () => void) => Promise<void>
}

const DAY_TYPE_MAP: Record<DayType, 'LABORAL' | 'AUSENTE' | 'LIBRE' | 'NO_LABORAL' | 'FERIADO' | 'MEDIO_DIA'> = {
  laboral: 'LABORAL',
  ausente: 'AUSENTE',
  libre: 'LIBRE',
  'no-laboral': 'NO_LABORAL',
  feriado: 'FERIADO',
  'medio-dia': 'MEDIO_DIA',
}

export function useScheduleModal(): UseScheduleModalResult {
  const [modalData, setModalData] = useState<ModalData | null>(null)

  const validateModal = (data: ModalData | null): Record<string, string> => {
    if (!data) return {}
    const errors: Record<string, string> = {}

    if (data.dayType === 'laboral') {
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

    if (data.advance > 5000000) {
      errors.advance = 'El vale supera el límite máximo (5.000.000 Gs)'
    }

    return errors
  }

  const openModal = (
    employeeId: string,
    employeeName: string,
    dayIndex: number,
    schedule: DaySchedule | undefined,
    date: Date,
    lastClockIn: string
  ) => {
    const clockIn = schedule?.clockIn || lastClockIn
    const clockOut = schedule?.clockOut || ''
    const advance = schedule?.advance || 0

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

  const closeModal = () => {
    setModalData(null)
  }

  const updateModalField = (field: string, value: any) => {
    if (!modalData) return

    const newData = { ...modalData, [field]: value, validationErrors: { ...modalData.validationErrors } }
    delete newData.validationErrors[field]

    if (field === 'clockOut' && newData.clockIn && newData.clockOut) {
      const [inH, inM] = newData.clockIn.split(':').map(Number)
      const [outH, outM] = newData.clockOut.split(':').map(Number)
      const totalMinutes = (outH * 60 + outM) - (inH * 60 + inM)
      const totalHours = totalMinutes / 60
      newData.overtimeHours = Math.max(0, totalHours - 8)
      newData.showOvertime = newData.overtimeHours > 0
    }

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

  const saveModal = async (onSuccess?: () => void) => {
    if (!modalData) return

    const errors = validateModal(modalData)
    if (Object.keys(errors).length > 0) {
      setModalData({ ...modalData, validationErrors: errors })
      return
    }

    setModalData({ ...modalData, isSaving: true, validationErrors: {} })

    try {
      const dateStr = format(modalData.date, 'yyyy-MM-dd')

      await upsertSchedule(modalData.employeeId, dateStr, {
        clockIn: modalData.clockIn || null,
        clockOut: modalData.clockOut || null,
        dayType: DAY_TYPE_MAP[modalData.dayType],
        overtimeMinutes: Math.round(modalData.overtimeHours * 60),
        advanceAmount: modalData.advance || 0,
      })

      setModalData({ ...modalData, isSaving: false, saveMessage: 'Registro actualizado correctamente' })

      setTimeout(() => {
        closeModal()
        onSuccess?.()
      }, 1500)
    } catch (error) {
      console.error('Error saving schedule:', error)
      setModalData({
        ...modalData,
        isSaving: false,
        validationErrors: { general: error instanceof Error ? error.message : 'Error al guardar los datos' },
      })
    }
  }

  return {
    modalData,
    openModal,
    closeModal,
    updateModalField,
    handleDayTypeChange,
    saveModal,
  }
}
