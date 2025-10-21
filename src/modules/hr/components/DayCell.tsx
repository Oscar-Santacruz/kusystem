import { type JSX } from 'react'
import { isSameDay } from 'date-fns'
import { MdAccessTime } from 'react-icons/md'
import { BiLogIn, BiLogOut } from 'react-icons/bi'
import { PiCurrencyCircleDollarFill } from 'react-icons/pi'

export type DayType = 'laboral' | 'ausente' | 'libre' | 'no-laboral' | 'feriado'

export interface DayCellProps {
  /** Hora de entrada en formato HH:MM (ej: "09:00") */
  clockIn?: string
  /** Hora de salida en formato HH:MM (ej: "18:00") */
  clockOut?: string
  /** Monto del vale/adelanto si existe */
  advance?: number
  /** Horas extras trabajadas */
  overtimeHours?: number
  /** Tipo de dia */
  dayType?: DayType
  /** Fecha del dia (para resaltar hoy) */
  date?: Date
  /** Clase adicional */
  className?: string
  /** Callback al hacer click */
  onClick?: () => void
  /** Callback al hacer doble click */
  onDoubleClick?: () => void
  /** Callback cuando inicia el drag */
  onDragStart?: () => void
  /** Callback cuando termina el drag */
  onDragEnd?: () => void
  /** Callback cuando se arrastra sobre esta celda */
  onDragOver?: (e: React.DragEvent) => void
  /** Callback cuando se sale del hover durante drag */
  onDragLeave?: () => void
  /** Callback cuando se suelta sobre esta celda */
  onDrop?: () => void
  /** Si está siendo arrastrada */
  isDragging?: boolean
  /** Si es un target válido para drop */
  isDropTarget?: boolean
}

const dayTypeConfig: Record<DayType, { bg: string; border: string; text: string }> = {
  laboral: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-900',
  },
  ausente: {
    bg: 'bg-[#f8d7da]',
    border: 'border-[#f1aeb5]',
    text: 'text-[#842029]',
  },
  libre: {
    bg: 'bg-gray-100',
    border: 'border-gray-200',
    text: 'text-gray-500',
  },
  'no-laboral': {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
  },
  feriado: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
  },
}

export function DayCell(props: DayCellProps): JSX.Element {
  const {
    clockIn,
    clockOut,
    advance,
    overtimeHours = 0,
    dayType = 'laboral',
    className,
    onClick,
    onDoubleClick,
    date,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragLeave,
    onDrop,
    isDragging = false,
    isDropTarget = false,
  } = props

  const config = dayTypeConfig[dayType]
  const showContent = dayType === 'laboral' && (clockIn || clockOut)
  const isToday = date ? isSameDay(date, new Date()) : false
  const hasDragHandlers = onDragStart || onDragEnd || onDragOver || onDrop

  const combinedClassName = [
    'relative z-10 rounded-md border bg-white p-2 text-[10px] leading-tight shadow-sm transition-all',
    config.bg,
    config.border,
    config.text,
    isToday && 'ring-2 ring-blue-300 shadow-md',
    onClick && 'cursor-pointer hover:shadow-md',
    hasDragHandlers && showContent && 'cursor-move',
    isDragging && 'opacity-50 scale-95',
    isDropTarget && 'ring-2 ring-yellow-400 shadow-lg scale-105',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    onDragOver?.(e)
  }

  return (
    <div
      className={combinedClassName}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      draggable={hasDragHandlers && showContent ? true : undefined}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {showContent ? (
        <DayCellContent
          clockIn={clockIn}
          clockOut={clockOut}
          advance={advance}
          overtimeHours={overtimeHours}
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <span className="text-[10px] font-medium uppercase opacity-60">
            {dayType === 'ausente' && 'Ausente'}
            {dayType === 'libre' && 'Libre'}
            {dayType === 'no-laboral' && 'No Laboral'}
            {dayType === 'feriado' && 'Feriado'}
          </span>
        </div>
      )}
    </div>
  )
}

interface DayCellContentProps {
  clockIn?: string
  clockOut?: string
  advance?: number
  overtimeHours: number
}

function DayCellContent(props: DayCellContentProps): JSX.Element {
  const { clockIn, clockOut, advance, overtimeHours } = props

  const sections = [
    {
      key: 'entry',
      show: true,
      icon: (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white">
          <BiLogIn className="h-3.5 w-3.5" />
        </div>
      ),
      value: clockIn ?? '--:--',
      valueClass: 'text-[11px] font-medium text-slate-900 whitespace-nowrap',
    },
    {
      key: 'exit',
      show: true,
      icon: (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-white">
          <BiLogOut className="h-3.5 w-3.5" />
        </div>
      ),
      value: clockOut ?? '--:--',
      valueClass: 'text-[11px] font-medium text-slate-900 whitespace-nowrap',
    },
    {
      key: 'advance',
      show: Boolean(advance && advance > 0),
      icon: (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f8d7da] text-[#842029]">
          <PiCurrencyCircleDollarFill className="h-3.5 w-3.5" />
        </div>
      ),
      value: advance ? `${advance.toLocaleString()}` : '',
      valueClass: 'text-[11px] font-medium text-[#842029] whitespace-nowrap',
    },
    {
      key: 'overtime',
      show: overtimeHours > 0,
      icon: (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <MdAccessTime className="h-3.5 w-3.5" />
        </div>
      ),
      value: `+${overtimeHours}h`,
      valueClass: 'text-[11px] font-medium text-emerald-700 whitespace-nowrap'
    }
  ]

  const visible = sections.filter((section) => section.show)

  return (
    <div className={`grid gap-2 ${visible.length > 1 ? 'sm:grid-cols-2' : ''}`}>
      {visible.map((section) => (
        <div
          key={section.key}
          className="flex items-center justify-center gap-2 text-left sm:flex-col sm:gap-1 sm:text-center"
        >
          {section.icon}
          <div className={section.valueClass}>{section.value}</div>
        </div>
      ))}
    </div>
  )
}
