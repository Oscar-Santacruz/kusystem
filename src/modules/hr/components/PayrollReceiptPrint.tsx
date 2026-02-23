import { forwardRef } from 'react'
import logo from '@/assets/logo.png'
import type { EmployeePayment } from '../api/payrollApi'
import { formatCurrency } from '@/shared/utils/format'

export interface PayrollReceiptPrintProps {
    payment: EmployeePayment
    employee: { firstName: string, lastName: string, document?: string }
    orgLogoUrl?: string | null
    orgRuc?: string | null
    orgName?: string | null
}

export const PayrollReceiptPrint = forwardRef<HTMLDivElement, PayrollReceiptPrintProps>(function PayrollReceiptPrint(
    { payment, employee, orgLogoUrl, orgRuc, orgName },
    ref
) {
    const formatDateUpper = (dateString: string) => {
        const d = new Date(dateString)
        const day = String(d.getDate()).padStart(2, '0')
        const month = d.toLocaleString('es-PY', { month: 'long' }).toUpperCase()
        const year = String(d.getFullYear())
        return `${day} DE ${month} DE ${year}`
    }

    return (
        <div
            ref={ref}
            className="mx-auto w-[210mm] max-w-full bg-white p-8 shadow print:shadow-none border border-[#cbd5e1] text-black"
        >
            {/* Encabezado */}
            <div className="flex items-start justify-between border-b pb-4 mb-6 border-black">
                <div className="flex items-center gap-4">
                    <img
                        src={orgLogoUrl || (logo as any)}
                        alt="Logo"
                        className="h-20 w-48 object-contain"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                    />
                </div>
                <div className="text-right">
                    <div className="text-2xl font-black tracking-wide text-black uppercase">
                        Recibo de Salario
                    </div>
                    <div className="mt-2 text-lg font-bold">
                        N° {payment.receiptNumber || payment.id.slice(0, 8).toUpperCase()}
                    </div>
                    <div className="text-sm font-semibold mt-1">
                        Fecha Emisión: {formatDateUpper(payment.paymentDate)}
                    </div>
                    {orgRuc && (
                        <div className="mt-1 text-xs font-medium text-gray-700">
                            {orgName} | RUC: {orgRuc}
                        </div>
                    )}
                </div>
            </div>

            {/* Datos del Empleado y Periodo */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border border-black p-3 rounded-sm">
                    <div className="text-xs font-bold uppercase mb-1 border-b border-gray-300 pb-1">Datos del Empleado</div>
                    <div className="text-lg font-bold">
                        {employee.firstName} {employee.lastName}
                    </div>
                    {employee.document && (
                        <div className="text-sm">Documento: {employee.document}</div>
                    )}
                </div>
                <div className="border border-black p-3 rounded-sm">
                    <div className="text-xs font-bold uppercase mb-1 border-b border-gray-300 pb-1">Periodo Liquidado</div>
                    <div className="text-sm font-medium mt-2">
                        Desde: <span className="font-bold">{formatDateUpper(payment.startDate)}</span>
                    </div>
                    <div className="text-sm font-medium">
                        Hasta: <span className="font-bold">{formatDateUpper(payment.endDate)}</span>
                    </div>
                </div>
            </div>

            {/* Detalle de Liquidación */}
            <div className="border border-black rounded-sm overflow-hidden mb-8">
                <table className="w-full text-sm border-collapse">
                    <thead className="bg-gray-100 border-b border-black">
                        <tr>
                            <th className="px-4 py-2 text-left border-r border-black font-bold uppercase">Concepto</th>
                            <th className="px-4 py-2 text-right border-r border-black font-bold uppercase w-32">Cant.</th>
                            <th className="px-4 py-2 text-right font-bold uppercase w-40">Monto</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300">
                        {/* Salario Base */}
                        <tr>
                            <td className="px-4 py-3 border-r border-black">Salario (Días trabajados)</td>
                            <td className="px-4 py-3 text-right border-r border-black">{payment.totalDaysWorked} días</td>
                            <td className="px-4 py-3 text-right">{formatCurrency(Number(payment.baseAmount))}</td>
                        </tr>
                        {/* Horas Extras */}
                        {Number(payment.totalOvertimeHours) > 0 && (
                            <tr>
                                <td className="px-4 py-3 border-r border-black">Horas Extras (50%)</td>
                                <td className="px-4 py-3 text-right border-r border-black">{payment.totalOvertimeHours} hrs</td>
                                <td className="px-4 py-3 text-right">{formatCurrency(Number(payment.overtimeAmount))}</td>
                            </tr>
                        )}
                        {/* Descuentos (Adelantos) */}
                        {Number(payment.advancesAmount) > 0 && (
                            <tr>
                                <td className="px-4 py-3 border-r border-black text-red-600 font-medium">Otros Descuentos / Vales / Adelantos</td>
                                <td className="px-4 py-3 text-right border-r border-black"></td>
                                <td className="px-4 py-3 text-right text-red-600 font-medium">-{formatCurrency(Number(payment.advancesAmount))}</td>
                            </tr>
                        )}

                        {/* Relleno para que la tabla tenga mejor altura */}
                        <tr className="h-16">
                            <td className="border-r border-black"></td>
                            <td className="border-r border-black"></td>
                            <td></td>
                        </tr>
                    </tbody>
                    <tfoot className="border-t border-black bg-gray-50">
                        <tr>
                            <td colSpan={2} className="px-4 py-3 text-right border-r border-black font-bold uppercase text-lg">
                                Total a Cobrar (Neto)
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-lg">
                                {formatCurrency(Number(payment.totalAmount))}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Firmas */}
            <div className="mt-16 pt-8 grid grid-cols-2 gap-8 text-center text-sm">
                <div>
                    <div className="mx-auto w-48 border-t border-black pt-2">
                        Firma del Empleador
                    </div>
                </div>
                <div>
                    <div className="mx-auto w-48 border-t border-black pt-2">
                        Recibí Conforme (Firma del Empleado)
                    </div>
                </div>
            </div>

            <div className="mt-12 text-center text-xs text-gray-400">
                Documento generado por Kusystem - ID: {payment.id}
            </div>
        </div>
    )
})
