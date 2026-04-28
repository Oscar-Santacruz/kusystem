
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiInstance } from '@/services/api'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Edit } from 'lucide-react'
import type { ProductTemplate } from '@/shared/types/domain'

export function ProductTemplatesListPage() {
    const navigate = useNavigate()
    const qc = useQueryClient()

    const { data: templates, isLoading } = useQuery({
        queryKey: ['product-templates'],
        queryFn: async () => {
            const res = await ApiInstance.get<{ data: ProductTemplate[] }>('/product-templates')
            return res.data
        }
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await ApiInstance.delete(`/product-templates/${id}`)
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['product-templates'] })
        },
        onError: (err: any) => {
            alert('Error al eliminar: ' + (err.response?.data?.error || err.message))
        }
    })

    if (isLoading) return <div className="p-8">Cargando plantillas...</div>

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Tipos de Producto</h1>
                    <p className="text-slate-500">Define plantillas para productos especiales (ej. Vehículos, Inmuebles).</p>
                </div>
                <button
                    onClick={() => navigate('new')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Nuevo Tipo
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates?.map((t) => (
                    <div key={t.id} className="bg-white border rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-semibold text-lg text-slate-800">{t.name}</h3>
                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                                    {Object.keys(t.attributes).length} campos
                                </span>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => navigate(`${t.id}/edit`)}
                                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm('¿Eliminar este tipo de producto?')) {
                                            deleteMutation.mutate(t.id)
                                        }
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Campos definidos:</p>
                            <ul className="text-sm text-slate-600 space-y-1">
                                {Object.values(t.attributes).slice(0, 5).map((attr, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                        {attr.label}
                                    </li>
                                ))}
                                {Object.keys(t.attributes).length > 5 && (
                                    <li className="text-xs text-slate-400 pl-3">+ {Object.keys(t.attributes).length - 5} más...</li>
                                )}
                            </ul>
                        </div>
                    </div>
                ))}

                {templates?.length === 0 && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed rounded-lg bg-slate-50">
                        <p className="text-slate-500 mb-2">No tienes tipos de productos definidos.</p>
                        <button
                            onClick={() => navigate('new')}
                            className="text-blue-600 font-medium hover:underline"
                        >
                            Crear el primero (ej. Vehículo)
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
