import { type JSX } from 'react'
import { FaCalendarCheck } from 'react-icons/fa'

export type WeekInitializerField = 'clockIn' | 'clockOut'

export type WeekInitializerErrors = Partial<Record<WeekInitializerField | 'general', string>>

interface WeekInitializerModalProps {
  isOpen: boolean
  clockIn: string
  clockOut: string
  errors: WeekInitializerErrors
  isSubmitting: boolean
  successMessage: string | null
  onClose: () => void
  onFieldChange: (field: WeekInitializerField, value: string) => void
  onSubmit: () => void
}

export function WeekInitializerModal({
  isOpen,
  clockIn,
  clockOut,
  errors,
  isSubmitting,
  successMessage,
  onClose,
  onFieldChange,
  onSubmit,
}: WeekInitializerModalProps): JSX.Element | null {
  if (!isOpen) return null

  const handleOverlayClick = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      onClick={handleOverlayClick}
    >
      <div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl"
        onClick={event => event.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
              <FaCalendarCheck className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Inicializar semana</h3>
              <p className="text-sm text-gray-600">
                Aplica un horario por defecto de lunes a sábado para todos los empleados visibles.
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Los domingos se dejan sin cambios para respetar descansos o configuraciones especiales.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="week-clock-in">
                Hora de entrada
              </label>
              <div className="relative">
                <input
                  id="week-clock-in"
                  type="time"
                  step="900"
                  value={clockIn}
                  onChange={event => onFieldChange('clockIn', event.target.value)}
                  className={`w-full rounded-lg border-2 px-3 py-2 text-sm font-medium text-gray-900 focus:ring-2 transition-colors sm:px-4 sm:py-3 sm:text-base ${
                    errors.clockIn
                      ? 'border-red-300 bg-white focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-300 bg-white focus:border-green-600 focus:ring-green-500'
                  }`}
                />
              </div>
              {errors.clockIn && <p className="mt-1 text-sm text-red-600">{errors.clockIn}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="week-clock-out">
                Hora de salida
              </label>
              <div className="relative">
                <input
                  id="week-clock-out"
                  type="time"
                  step="900"
                  value={clockOut}
                  onChange={event => onFieldChange('clockOut', event.target.value)}
                  className={`w-full rounded-lg border-2 px-3 py-2 text-sm font-medium text-gray-900 focus:ring-2 transition-colors sm:px-4 sm:py-3 sm:text-base ${
                    errors.clockOut
                      ? 'border-red-300 bg-white focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-300 bg-white focus:border-green-600 focus:ring-green-500'
                  }`}
                />
              </div>
              {errors.clockOut && <p className="mt-1 text-sm text-red-600">{errors.clockOut}</p>}
            </div>

            {errors.general && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-700">{errors.general}</p>
              </div>
            )}

            {successMessage && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:px-6 sm:py-3 sm:text-base"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex-1 rounded-lg border-2 border-green-600 bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:px-6 sm:py-3 sm:text-base"
            >
              {isSubmitting ? 'Aplicando...' : 'Aplicar a la semana'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
