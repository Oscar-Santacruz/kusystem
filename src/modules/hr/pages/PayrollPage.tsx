import { useQuery, useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { listEmployees } from '../api/employeeApi'
import { payrollApi } from '../api/payrollApi'
import type { PayrollPreviewResponse, EmployeePayment } from '../api/payrollApi'
import { formatCurrency } from '@/shared/utils/format'
import { useCurrentOrganization } from '@/shared/hooks/useCurrentOrganization'
import { PayrollReceiptPrint } from '../components/PayrollReceiptPrint'

export function PayrollPage() {
    const [activeTab, setActiveTab] = useState<'NEW' | 'HISTORY'>('NEW')
    const [employeeId, setEmployeeId] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [preview, setPreview] = useState<PayrollPreviewResponse | null>(null)
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [printPayment, setPrintPayment] = useState<EmployeePayment | null>(null)

    const { logoUrl: orgLogoUrl, ruc: orgRuc, organization } = useCurrentOrganization()
    const orgName = organization?.name || ''

    const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({
        queryKey: ['hr-employees'],
        queryFn: () => listEmployees(),
    })

    const previewMutation = useMutation({
        mutationFn: () => payrollApi.getPreview({ employeeId, startDate, endDate }),
        onSuccess: (data) => {
            setPreview(data)
            setErrorMsg('')
        },
        onError: (err: any) => {
            setPreview(null)
            setErrorMsg(err?.response?.data?.error || err.message || 'Error al calcular la liquidación')
        }
    })

    const executeMutation = useMutation({
        mutationFn: () => payrollApi.execute({ employeeId, startDate, endDate }),
        onSuccess: () => {
            setSuccessMsg('Liquidación generada y registrada con éxito')
            setPreview(null)
            // Invalidar historial para que se actualice
        },
        onError: (err: any) => {
            setErrorMsg(err?.response?.data?.error || err.message || 'Error al registrar el pago')
        }
    })

    const { data: history = [], isLoading: isLoadingHistory } = useQuery({
        queryKey: ['hr-payroll-history', employeeId],
        queryFn: () => payrollApi.getHistory(employeeId),
        enabled: activeTab === 'HISTORY' && !!employeeId,
    })

    const handlePreview = (e: React.FormEvent) => {
        e.preventDefault()
        setSuccessMsg('')
        if (!employeeId || !startDate || !endDate) {
            setErrorMsg('Por favor completa todos los campos')
            return
        }
        previewMutation.mutate()
    }

    const handleExecute = () => {
        if (!preview) return
        if (confirm('¿Estás seguro de registrar este pago? Se marcarán los días y vales como pagados y no podrán volverse a liquidar.')) {
            executeMutation.mutate()
        }
    }

    const handlePrint = (payment: EmployeePayment) => {
        setPrintPayment(payment)
        setTimeout(() => {
            window.print()
        }, 100)
    }

    const selectedEmployeeObj = employees.find(e => e.id === employeeId)

    return (
        <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
            {/* Header del módulo */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold">Liquidación de Salarios</h1>
                    <p className="text-slate-400 text-sm">Calcula y registra los pagos de salario por periodo</p>
                </div>
                <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                    <button
                        onClick={() => setActiveTab('NEW')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'NEW' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    >
                        Nueva Liquidación
                    </button>
                    <button
                        onClick={() => setActiveTab('HISTORY')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'HISTORY' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    >
                        Historial
                    </button>
                </div>
            </div>

            <div className="print:hidden">
                {activeTab === 'NEW' && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <form onSubmit={handlePreview} className="gap-4 flex flex-col md:flex-row items-end">
                            <div className="w-full md:w-1/3">
                                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                                    Empleado
                                </label>
                                <select
                                    required
                                    value={employeeId}
                                    onChange={(e) => {
                                        setEmployeeId(e.target.value)
                                        setPreview(null) // Reset preview al cambiar de empleado
                                    }}
                                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="">Seleccione un empleado...</option>
                                    {employees.filter(e => e.isActive).map(e => (
                                        <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="w-full md:w-1/4">
                                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                                    Fecha Inicial
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={startDate}
                                    onChange={(e) => {
                                        setStartDate(e.target.value)
                                        setPreview(null)
                                    }}
                                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="w-full md:w-1/4">
                                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                                    Fecha Final
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={endDate}
                                    onChange={(e) => {
                                        setEndDate(e.target.value)
                                        setPreview(null)
                                    }}
                                    min={startDate}
                                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="w-full md:w-auto">
                                <button
                                    type="submit"
                                    disabled={previewMutation.isPending || isLoadingEmployees}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded font-medium disabled:opacity-50 transition-colors text-sm h-10 whitespace-nowrap"
                                >
                                    {previewMutation.isPending ? 'Calculando...' : 'Calcular Liquidación'}
                                </button>
                            </div>
                        </form>

                        {errorMsg && (
                            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                                {errorMsg}
                            </div>
                        )}
                        {successMsg && (
                            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm">
                                {successMsg}
                            </div>
                        )}

                        {preview && (
                            <div className="mt-8 border border-slate-800 rounded-lg overflow-hidden">
                                <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
                                    <h3 className="font-medium text-lg text-white">Vista Previa de Liquidación</h3>
                                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">Rango: {preview.period.startDate} al {preview.period.endDate}</span>
                                </div>

                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900">
                                    {/* Detalles de Días y Extras */}
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Detalle Asistencia</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-400">Total días trabajados a pagar:</span>
                                                    <span className="font-medium text-white">{preview.summary.totalDaysWorked} días</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-400">Total horas extras:</span>
                                                    <span className="font-medium text-white">{preview.summary.totalOvertimeHours} hrs</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Vales / Adelantos en el Periodo</h4>
                                            {preview.summary.advancesAmount > 0 ? (
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm text-red-400">
                                                        <span>Total a descontar:</span>
                                                        <span className="font-medium">{formatCurrency(preview.summary.advancesAmount)}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-500">
                                                        (Se incluyen {preview.daysIncluded.filter(d => d.advance > 0).length + preview.orphanAdvances.length} vales no pagados)
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-500">No hay adelantos pendientes a descontar en este periodo.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Totales y Resumen Financiero */}
                                    <div className="space-y-6 md:border-l border-slate-800 md:pl-8">
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Resumen de Liquidación</h4>

                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-400">Salario Base (<span className="text-xs">{preview.employee.salaryType}</span>)</span>
                                                    <span className="text-slate-300">{formatCurrency(preview.employee.salaryAmount)}</span>
                                                </div>

                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-400">Cálculo Base ({preview.summary.totalDaysWorked} días x {formatCurrency(preview.employee.dailyRate)})</span>
                                                    <span className="font-medium text-white">{formatCurrency(preview.summary.baseAmount)}</span>
                                                </div>

                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-400">Horas Extras ({preview.summary.totalOvertimeHours} hrs)</span>
                                                    <span className="font-medium text-emerald-400">+{formatCurrency(preview.summary.overtimeAmount)}</span>
                                                </div>

                                                {preview.summary.advancesAmount > 0 && (
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-slate-400">Adelantos / Vales</span>
                                                        <span className="font-medium text-red-400">-{formatCurrency(preview.summary.advancesAmount)}</span>
                                                    </div>
                                                )}

                                                <div className="pt-4 mt-2 border-t border-slate-800">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-sm font-bold text-slate-300">TOTAL A PAGAR</span>
                                                        <span className="text-2xl font-bold text-white tracking-tight">
                                                            {formatCurrency(preview.summary.totalAmount)}
                                                        </span>
                                                    </div>
                                                    <p className="text-right text-xs text-emerald-500 font-medium tracking-wide">(Neto)</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <button
                                                onClick={handleExecute}
                                                disabled={executeMutation.isPending || preview.summary.totalAmount === 0 && preview.summary.totalDaysWorked === 0}
                                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:shadow-none transition-all"
                                            >
                                                {executeMutation.isPending ? 'Registrando...' : 'Confirmar y Guardar Pago'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'HISTORY' && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
                        <div className="w-full md:w-1/3">
                            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                                Seleccionar Empleado
                            </label>
                            <select
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                            >
                                <option value="">Seleccione un empleado...</option>
                                {employees.map(e => (
                                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                                ))}
                            </select>
                        </div>

                        {employeeId && (
                            isLoadingHistory ? (
                                <div className="text-slate-400 text-sm py-4">Cargando historial...</div>
                            ) : history.length === 0 ? (
                                <div className="text-slate-500 text-sm py-8 text-center border-t border-slate-800">
                                    No hay liquidaciones registradas para este empleado.
                                </div>
                            ) : (
                                <div className="overflow-x-auto border border-slate-800 rounded-lg">
                                    <table className="w-full text-left text-sm text-slate-300">
                                        <thead className="bg-slate-950/50 text-slate-400 uppercase text-xs">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Fecha de Pago</th>
                                                <th className="px-4 py-3 font-medium">Periodo Pagado</th>
                                                <th className="px-4 py-3 font-medium text-right">Días</th>
                                                <th className="px-4 py-3 font-medium text-right">Hrs Extras</th>
                                                <th className="px-4 py-3 font-medium text-right">Adelantos</th>
                                                <th className="px-4 py-3 font-medium text-right">Total Pagado</th>
                                                <th className="px-4 py-3 font-medium text-center">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/50">
                                            {history.map((payment) => (
                                                <tr key={payment.id} className="hover:bg-slate-800/20 transition-colors">
                                                    <td className="px-4 py-3">
                                                        {new Date(payment.paymentDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-400">
                                                        {new Date(payment.startDate).toLocaleDateString()} - {new Date(payment.endDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">{payment.totalDaysWorked}</td>
                                                    <td className="px-4 py-3 text-right">{payment.totalOvertimeHours}</td>
                                                    <td className="px-4 py-3 text-right text-red-400">
                                                        {Number(payment.advancesAmount) > 0 ? `-${formatCurrency(Number(payment.advancesAmount))}` : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-medium text-white">
                                                        {formatCurrency(Number(payment.totalAmount))}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            onClick={() => handlePrint(payment)}
                                                            className="text-xs text-blue-400 hover:text-blue-300 underline"
                                                        >
                                                            Imprimir
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>

            {/* Print View Container (Hidden in screen, block in print) */}
            <div className="hidden print:block fixed inset-0 bg-white z-[9999]">
                {printPayment && selectedEmployeeObj && (
                    <PayrollReceiptPrint
                        payment={printPayment}
                        employee={selectedEmployeeObj}
                        orgLogoUrl={orgLogoUrl!}
                        orgRuc={orgRuc!}
                        orgName={orgName!}
                    />
                )}
            </div>
        </div>
    )
}
