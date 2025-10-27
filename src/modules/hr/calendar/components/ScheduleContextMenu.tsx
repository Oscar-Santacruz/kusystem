import { type JSX, useEffect, useRef } from 'react'
import { FaCopy, FaPaste, FaClone, FaUsers } from 'react-icons/fa'

interface ScheduleContextMenuProps {
  x: number
  y: number
  onClose: () => void
  onCopy: () => void
  onPaste: () => void
  onDuplicateWeek: () => void
  onDuplicateAllEmployees: () => void
  hasClipboard: boolean
  hasSchedule: boolean
}

export function ScheduleContextMenu({
  x,
  y,
  onClose,
  onCopy,
  onPaste,
  onDuplicateWeek,
  onDuplicateAllEmployees,
  hasClipboard,
  hasSchedule,
}: ScheduleContextMenuProps): JSX.Element {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  // Ajustar posición si se sale de la pantalla
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect()
      const adjustedX = x + rect.width > window.innerWidth ? window.innerWidth - rect.width - 10 : x
      const adjustedY = y + rect.height > window.innerHeight ? window.innerHeight - rect.height - 10 : y
      
      menuRef.current.style.left = `${adjustedX}px`
      menuRef.current.style.top = `${adjustedY}px`
    }
  }, [x, y])

  const MenuItem = ({ 
    icon: Icon, 
    label, 
    onClick, 
    disabled = false,
    danger = false,
  }: { 
    icon: typeof FaCopy
    label: string
    onClick: () => void
    disabled?: boolean
    danger?: boolean
  }) => (
    <button
      onClick={() => {
        if (!disabled) {
          onClick()
          onClose()
        }
      }}
      disabled={disabled}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
        disabled
          ? 'cursor-not-allowed text-gray-400'
          : danger
          ? 'text-red-700 hover:bg-red-50'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  )

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[200px] rounded-lg border border-gray-200 bg-white shadow-xl"
      style={{ left: x, top: y }}
    >
      <div className="py-1">
        <MenuItem
          icon={FaCopy}
          label="Copiar horario"
          onClick={onCopy}
          disabled={!hasSchedule}
        />
        <MenuItem
          icon={FaPaste}
          label="Pegar horario"
          onClick={onPaste}
          disabled={!hasClipboard}
        />
        <div className="my-1 border-t border-gray-200" />
        <MenuItem
          icon={FaClone}
          label="Duplicar a toda la semana"
          onClick={onDuplicateWeek}
          disabled={!hasSchedule}
        />
        <MenuItem
          icon={FaUsers}
          label="Duplicar a todos los empleados"
          onClick={onDuplicateAllEmployees}
          disabled={!hasSchedule}
        />
      </div>
    </div>
  )
}
