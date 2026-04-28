import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getEmployee, createEmployee, updateEmployee } from '../api/employeeApi'

export function EmployeeFormPage() {
    const { id } = useParams<{ id: string }>()
    const isNew = !id || id === 'new'
    const navigate = useNavigate()
    const qc = useQueryClient()

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        salaryType: 'MONTHLY' as 'MONTHLY' | 'WEEKLY' | 'DAILY',
        salaryAmount: '',
        defaultShiftEnd: '',
    })

    const [errorMsg, setErrorMsg] = useState('')

    const { data: employee, isLoading: isLoadingEmployee } = useQuery({
        queryKey: ['hr-employee', id],
        queryFn: () => getEmployee(id!),
        enabled: !isNew,
    })

    useEffect(() => {
        if (employee && !isNew) {
            setForm({
                firstName: employee.firstName,
                lastName: employee.lastName,
                email: employee.email || '',
                phone: employee.phone || '',
                department: employee.department || '',
                salaryType: employee.salaryType,
                salaryAmount: employee.salaryAmount ? String(employee.salaryAmount) : '',
                defaultShiftEnd: employee.defaultShiftEnd || '',
            })
        }
    }, [employee, isNew])

    const saveMutation = useMutation({
        mutationFn: (data: any) => isNew ? createEmployee(data) : updateEmployee(id!, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['hr-employees'] })
            qc.invalidateQueries({ queryKey: ['hr-employee', id] })
            navigate('/main/hr/employees')
        },
        onError: (err: any) => {
            setErrorMsg(err?.response?.data?.error || err.message || 'Error al guardar el empleado')
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMsg('')

        if (!form.firstName.trim() || !form.lastName.trim()) {
            setErrorMsg('Nombres y Apellidos son obligatorios')
            return
        }

        const payload = {
            ...form,
            salaryAmount: form.salaryAmount ? Number(form.salaryAmount) : null,
            email: form.email || null,
            phone: form.phone || null,
            department: form.department || null,
            defaultShiftEnd: form.defaultShiftEnd || null,
        }

        saveMutation.mutate(payload)
    }

    if (!isNew && isLoadingEmployee) return <div className="p-6">Cargando datos del empleado...</div>

    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/main/hr/employees" className="text-slate-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">{isNew ? 'Nuevo Empleado' : 'Editar Empleado'}</h1>
                    <p className="text-slate-400 text-sm">Completa la información personal y las condiciones laborales</p>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                {errorMsg && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <h3 className="text-lg font-medium border-b border-slate-800 pb-2">Información Personal</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                                Nombres <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={form.firstName}
                                onChange={e => setForm({ ...form, firstName: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                                Apellidos <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={form.lastName}
                                onChange={e => setForm({ ...form, lastName: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                                Teléfono
                            </label>
                            <input
                                type="text"
                                value={form.phone}
                                onChange={e => setForm({ ...form, phone: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <h3 className="text-lg font-medium border-b border-slate-800 pb-2 pt-4">Condiciones Laborales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                                Departamento
                            </label>
                            <input
                                type="text"
                                value={form.department}
                                onChange={e => setForm({ ...form, department: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                                placeholder="Ej. Ventas, Taller, Administración"
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                                    Tipo de Sueldo <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={form.salaryType}
                                    onChange={e => setForm({ ...form, salaryType: e.target.value as any })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="MONTHLY">Fijo Mensual</option>
                                    <option value="WEEKLY">Fijo Semanal</option>
                                    <option value="DAILY">Pago por Día Trabajado</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                                    Monto {form.salaryType === 'MONTHLY' ? '(Mensual)' : form.salaryType === 'WEEKLY' ? '(Semanal)' : '(Diario)'}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-slate-500 text-sm">₲</span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={form.salaryAmount ? Number(form.salaryAmount).toLocaleString('es-PY') : ''}
                                        onChange={e => {
                                            const rawValue = e.target.value.replace(/\D/g, '')
                                            setForm({ ...form, salaryAmount: rawValue })
                                        }}
                                        className="w-full bg-slate-950 border border-slate-800 rounded pl-8 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                                        placeholder="Opcional"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-lg font-medium border-b border-slate-800 pb-2 pt-4">Horario por Defecto (Opcional)</h3>
                    <p className="text-xs text-slate-400 -mt-2 mb-4">Se usará para autocompletar el calendario de asistencia en RRHH.</p>
                    <div className="grid grid-cols-2 max-w-sm gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                                Hora de Salida
                            </label>
                            <input
                                type="time"
                                value={form.defaultShiftEnd}
                                onChange={e => setForm({ ...form, defaultShiftEnd: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-800 flex justify-end gap-3">
                        <Link
                            to="/main/hr/employees"
                            className="px-4 py-2 border border-slate-700 hover:bg-slate-800 rounded text-slate-300 transition-colors font-medium text-sm"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={saveMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded font-medium disabled:opacity-50 transition-colors text-sm"
                        >
                            {saveMutation.isPending ? 'Guardando...' : 'Guardar Empleado'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
