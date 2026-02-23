import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { listEmployees, toggleEmployeeStatus } from '../api/employeeApi'

export function EmployeesListPage() {
    const qc = useQueryClient()
    const navigate = useNavigate()
    const [showInactive, setShowInactive] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const { data: employees = [], isLoading, isError } = useQuery({
        queryKey: ['hr-employees'],
        queryFn: listEmployees,
    })

    const toggleStatus = useMutation({
        mutationFn: toggleEmployeeStatus,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['hr-employees'] })
        },
    })

    if (isLoading) return <div className="p-6">Cargando personal...</div>
    if (isError) return <div className="p-6 text-red-500">Error al cargar listado de personal</div>

    const filteredEmployees = employees.filter((emp) => {
        if (!showInactive && !emp.isActive) return false
        if (searchTerm) {
            const s = searchTerm.toLowerCase()
            if (!emp.name.toLowerCase().includes(s) &&
                !(emp.department || '').toLowerCase().includes(s) &&
                !(emp.email || '').toLowerCase().includes(s)) {
                return false
            }
        }
        return true
    })

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Personal</h1>
                    <p className="text-slate-400 text-sm">Gestiona la nómina de empleados y sus esquemas salariales</p>
                </div>
                <Link
                    to="/main/hr/employees/new"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors text-center"
                >
                    Nuevo Empleado
                </Link>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="w-full sm:max-w-xs relative">
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email, depto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showInactive}
                        onChange={(e) => setShowInactive(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-600 h-4 w-4"
                    />
                    Mostrar Inactivos
                </label>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-slate-800/50 text-slate-300 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-4 py-3 font-medium">Nombre</th>
                                <th className="px-4 py-3 font-medium">Contacto</th>
                                <th className="px-4 py-3 font-medium">Departamento</th>
                                <th className="px-4 py-3 font-medium text-right">Sueldo / Tipo</th>
                                <th className="px-4 py-3 font-medium text-center">Estado</th>
                                <th className="px-4 py-3 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                        No se encontraron empleados.
                                    </td>
                                </tr>
                            ) : (
                                filteredEmployees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-200">{emp.name}</div>
                                            {emp.defaultShiftEnd && (
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    Fin de turno: {emp.defaultShiftEnd}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-slate-300">{emp.email || '—'}</div>
                                            <div className="text-xs text-slate-500">{emp.phone || ''}</div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-300">{emp.department || '—'}</td>
                                        <td className="px-4 py-3 text-right">
                                            {emp.salaryAmount ? (
                                                <>
                                                    <div className="font-medium">
                                                        {new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(emp.salaryAmount)}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {emp.salaryType === 'MONTHLY' ? 'Mensual' : emp.salaryType === 'WEEKLY' ? 'Semanal' : 'Diario'}
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="text-slate-500">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${emp.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                                }`}>
                                                {emp.isActive ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/main/hr/employees/${emp.id}`)}
                                                    className="text-slate-400 hover:text-white p-1 rounded"
                                                    title="Editar"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`¿Estás seguro que deseas ${emp.isActive ? 'INACTIVAR' : 'ACTIVAR'} a ${emp.name}?`)) {
                                                            toggleStatus.mutate(emp.id)
                                                        }
                                                    }}
                                                    disabled={toggleStatus.isPending}
                                                    className={`${emp.isActive ? 'text-orange-400 hover:text-orange-300' : 'text-green-400 hover:text-green-300'} p-1 rounded disabled:opacity-50`}
                                                    title={emp.isActive ? 'Inactivar' : 'Activar'}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        {emp.isActive ? (
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                        ) : (
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        )}
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
