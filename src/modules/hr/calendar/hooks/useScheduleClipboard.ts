import { useState, useCallback } from 'react'

export interface ClipboardSchedule {
  clockIn?: string
  clockOut?: string
  advance?: number
  overtimeHours?: number
  dayType?: 'laboral' | 'ausente' | 'libre' | 'no-laboral' | 'feriado'
}

export function useScheduleClipboard() {
  const [clipboard, setClipboard] = useState<ClipboardSchedule | null>(null)

  const copy = useCallback((schedule: ClipboardSchedule) => {
    setClipboard(schedule)
  }, [])

  const paste = useCallback(() => {
    return clipboard
  }, [clipboard])

  const clear = useCallback(() => {
    setClipboard(null)
  }, [])

  const hasContent = clipboard !== null

  return { copy, paste, clear, hasContent, clipboard }
}
