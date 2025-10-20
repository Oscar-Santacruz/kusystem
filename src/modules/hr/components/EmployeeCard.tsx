import { type JSX, useEffect, useState } from 'react'
import { MdAccessTime } from 'react-icons/md'
import { PiCurrencyCircleDollarFill } from 'react-icons/pi'
import { FaUser } from 'react-icons/fa'

export interface EmployeeCardProps {
  /** URL de la foto de perfil del empleado */
  avatarUrl?: string
  /** Nombre completo del empleado */
  name: string
  /** Cantidad de horas extras acumuladas en la semana */
  weeklyOvertimeHours: number
  /** Cantidad de vales/adelantos solicitados en la semana */
  weeklyAdvances: number
  /** Monto total de vales (opcional, para mostrar) */
  weeklyAdvancesAmount?: number
  /** Clase adicional */
  className?: string
  /** Callback al hacer click */
  onClick?: () => void
}

export function EmployeeCard(props: EmployeeCardProps): JSX.Element {
  const {
    avatarUrl,
    name,
    weeklyOvertimeHours,
    weeklyAdvancesAmount,
    className,
    onClick,
  } = props

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < 640
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      setIsMobile(window.innerWidth < 640)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const maxChars = isMobile ? 12 : 20
  const displayName = name.length > maxChars ? `${name.slice(0, maxChars)}…` : name

  const combinedClassName = [
    'relative flex h-full w-full max-w-[80px] flex-col items-center justify-between gap-2 rounded-md border bg-white px-2 py-3 text-[11px] shadow-sm transition-all hover:shadow-md sm:max-w-[120px]',
    onClick && 'cursor-pointer',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={combinedClassName} onClick={onClick}>
      {/* Avatar */}
      <div className="relative flex w-full flex-col items-center gap-1.5">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="h-10 w-10 rounded-full border border-gray-200 object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600">
            <FaUser className="h-5 w-5 text-white" />
          </div>
        )}
        <h3 className="w-full truncate text-center text-[11px] font-semibold text-gray-900 leading-tight sm:text-[12px]" title={name}>
          {displayName}
        </h3>
      </div>

      {/* Badges responsive */}
      {isMobile ? (
        <div className="mt-2 flex w-full flex-wrap items-center justify-center gap-2">
          {weeklyAdvancesAmount && weeklyAdvancesAmount > 0 ? (
            <div className="flex items-center gap-1 rounded-full bg-[#f8d7da] px-2 py-0.5 text-[10px] font-semibold text-[#842029] shadow-md whitespace-nowrap">
              <PiCurrencyCircleDollarFill className="h-3 w-3" />
              <span>{`${weeklyAdvancesAmount.toLocaleString('es-PY')}`}</span>
            </div>
          ) : null}
          {weeklyOvertimeHours > 0 ? (
            <div className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 shadow-md whitespace-nowrap">
              <MdAccessTime className="h-3 w-3" />
              <span>{`+${weeklyOvertimeHours}h`}</span>
            </div>
          ) : null}
        </div>
      ) : (
        <>
          <div className="mt-2 flex w-full flex-wrap items-center justify-center gap-2">
            {weeklyAdvancesAmount && weeklyAdvancesAmount > 0 ? (
              <div className="flex items-center gap-1 rounded-full bg-[#f8d7da] px-2 py-0.5 text-[10px] font-semibold text-[#842029] shadow-md whitespace-nowrap">
                <PiCurrencyCircleDollarFill className="h-3 w-3" />
                <span>{`${weeklyAdvancesAmount.toLocaleString('es-PY')}`}</span>
              </div>
            ) : null}
          </div>
          {weeklyOvertimeHours > 0 ? (
            <div className="absolute right-2 top-2">
              <div className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 shadow-md whitespace-nowrap">
                <MdAccessTime className="h-3 w-3" />
                <span>{`+${weeklyOvertimeHours}h`}</span>
              </div>
            </div>
          ) : null}
        </>
      )}

    </div>
  )
}
