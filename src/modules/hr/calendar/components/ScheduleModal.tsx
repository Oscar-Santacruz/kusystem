import { type JSX } from 'react'
import type { DayType } from '../../components'
import type { ModalData } from '../hooks/useScheduleModal'

interface Props {
  modalData: ModalData | null
  onClose: () => void
  onUpdateField: (field: string, value: any) => void
  onDayTypeChange: (dayType: DayType) => void
  onSave: () => Promise<void>
}

export function ScheduleModal({ modalData, onClose, onUpdateField, onDayTypeChange, onSave }: Props): JSX.Element {
  if (!modalData || !modalData.isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Editar horario - {modalData.employeeName}
          </h3>

          {modalData.saveMessage ? (
            <div className="text-center py-8">
              <div className="text-green-600 font-medium mb-2">{modalData.saveMessage}</div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tipo de día */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de día</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['laboral', 'ausente', 'libre', 'feriado'] as DayType[]).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => onDayTypeChange(type)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        modalData.dayType === type
                          ? type === 'laboral'
                            ? 'bg-green-100 text-green-800 border-2 border-green-300'
                            : type === 'ausente'
                            ? 'bg-red-100 text-red-800 border-2 border-red-300'
                            : type === 'libre'
                            ? 'bg-gray-100 text-gray-800 border-2 border-gray-300'
                            : 'bg-purple-100 text-purple-800 border-2 border-purple-300'
                          : 'bg-gray-50 text-gray-600 border-2 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Campos de horario (solo para días laborales) */}
              {modalData.dayType === 'laboral' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hora de entrada</label>
                    <input
                      type="time"
                      value={modalData.clockIn}
                      onChange={e => onUpdateField('clockIn', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {modalData.validationErrors.clockIn && (
                      <p className="text-red-500 text-sm mt-1">{modalData.validationErrors.clockIn}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hora de salida</label>
                    <input
                      type="time"
                      value={modalData.clockOut}
                      onChange={e => onUpdateField('clockOut', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {modalData.validationErrors.clockOut && (
                      <p className="text-red-500 text-sm mt-1">{modalData.validationErrors.clockOut}</p>
                    )}
                  </div>

                  {modalData.showOvertime && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Horas extra</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={modalData.overtimeHours}
                        onChange={e => onUpdateField('overtimeHours', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                </>
              )}

              {/* Adelanto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adelanto (Gs)</label>
                <input
                  type="text"
                  value={modalData.advanceDisplayValue}
                  onChange={e => onUpdateField('advance', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {modalData.validationErrors.advance && (
                  <p className="text-red-500 text-sm mt-1">{modalData.validationErrors.advance}</p>
                )}
              </div>

              {/* Error general */}
              {modalData.validationErrors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{modalData.validationErrors.general}</p>
                </div>
              )}
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={modalData.isSaving}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              {modalData.saveMessage ? 'Cerrar' : 'Cancelar'}
            </button>
            {!modalData.saveMessage && (
              <button
                onClick={onSave}
                disabled={modalData.isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {modalData.isSaving ? 'Guardando...' : 'Guardar'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
