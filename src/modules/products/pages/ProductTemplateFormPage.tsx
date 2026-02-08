
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiInstance } from '@/services/api'
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'
import type { ProductTemplate } from '@/shared/types/domain'

type AttributeType = 'text' | 'number' | 'date' | 'select'

interface AttributeDef {
    key: string
    label: string
    type: AttributeType
    required: boolean
    optionsStr: string // Para editar opciones como texto separado por comas
}

export function ProductTemplateFormPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const qc = useQueryClient()
    const isEdit = id && id !== 'new'

    const [name, setName] = useState('')
    const [attributes, setAttributes] = useState<AttributeDef[]>([])

    const { data: template, isLoading } = useQuery({
        queryKey: ['product-templates', id],
        queryFn: async () => {
            const res = await ApiInstance.get<ProductTemplate>(`/product-templates/${id}`)
            return res
        },
        enabled: !!isEdit
    })

    useEffect(() => {
        if (template) {
            setName(template.name)
            const attrs: AttributeDef[] = Object.entries(template.attributes || {}).map(([key, val]: [string, any]) => ({
                key,
                label: val.label,
                type: val.type,
                required: !!val.required,
                optionsStr: val.options?.join(', ') || ''
            }))
            setAttributes(attrs)
        }
    }, [template])

    const mutation = useMutation({
        mutationFn: async () => {
            // Convertir array a objeto
            const attrsObj: Record<string, any> = {}
            for (const attr of attributes) {
                if (!attr.key || !attr.label) continue
                attrsObj[attr.key] = {
                    label: attr.label,
                    type: attr.type,
                    required: attr.required,
                    options: attr.type === 'select' ? attr.optionsStr.split(',').map(s => s.trim()).filter(Boolean) : undefined
                }
            }

            const payload = {
                name,
                attributes: attrsObj
            }

            if (isEdit) {
                await ApiInstance.put(`/product-templates/${id}`, { data: payload })
            } else {
                await ApiInstance.post('/product-templates', { data: payload })
            }
        },
        onSuccess: () => {
            toast.success('Plantilla guardada correctamente')
            qc.invalidateQueries({ queryKey: ['product-templates'] })
            navigate('/main/products/config/templates')
        },
        onError: (err: any) => {
            toast.error('Error al guardar: ' + (err.response?.data?.error || err.message))
        }
    })

    const addAttribute = () => {
        setAttributes([...attributes, { key: '', label: '', type: 'text', required: false, optionsStr: '' }])
    }

    const removeAttribute = (index: number) => {
        setAttributes(attributes.filter((_, i) => i !== index))
    }

    const updateAttribute = (index: number, field: keyof AttributeDef, value: any) => {
        const newAttrs = [...attributes]
        newAttrs[index] = { ...newAttrs[index], [field]: value }
        // Auto-generar key desde label si key está vacía
        if (field === 'label' && !newAttrs[index].key) {
            newAttrs[index].key = value.toLowerCase().replace(/[^a-z0-9]/g, '_')
        }
        setAttributes(newAttrs)
    }

    if (isEdit && isLoading) return <div className="p-8">Cargando...</div>

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 text-slate-500 hover:text-slate-800 mb-4"
            >
                <ArrowLeft size={18} /> Volver
            </button>

            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Editar Tipo de Producto' : 'Nuevo Tipo de Producto'}</h1>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Tipo (ej. Vehículo)</label>
                    <input
                        type="text"
                        className="w-full max-w-md rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nombre..."
                    />
                </div>

                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-slate-700">Atributos Personalizados</h3>
                        <button
                            onClick={addAttribute}
                            className="flex items-center gap-1 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md hover:bg-blue-100"
                        >
                            <Plus size={16} /> Agregar campo
                        </button>
                    </div>

                    <div className="space-y-3">
                        {attributes.map((attr, i) => (
                            <div key={i} className="flex flex-wrap md:flex-nowrap gap-3 items-start p-3 border rounded-md bg-slate-50">
                                <div className="w-full md:w-1/4">
                                    <label className="block text-xs text-slate-500 mb-1">Etiqueta (Label)</label>
                                    <input
                                        type="text"
                                        className="w-full text-sm rounded-md border-slate-300"
                                        value={attr.label}
                                        onChange={(e) => updateAttribute(i, 'label', e.target.value)}
                                        placeholder="Ej: Color"
                                    />
                                </div>
                                <div className="w-full md:w-1/4">
                                    <label className="block text-xs text-slate-500 mb-1">ID (Key)</label>
                                    <input
                                        type="text"
                                        className="w-full text-sm rounded-md border-slate-300 bg-slate-100 font-mono text-xs"
                                        value={attr.key}
                                        onChange={(e) => updateAttribute(i, 'key', e.target.value)}
                                        placeholder="color"
                                    />
                                </div>
                                <div className="w-full md:w-1/6">
                                    <label className="block text-xs text-slate-500 mb-1">Tipo</label>
                                    <select
                                        className="w-full text-sm rounded-md border-slate-300"
                                        value={attr.type}
                                        onChange={(e) => updateAttribute(i, 'type', e.target.value)}
                                    >
                                        <option value="text">Texto</option>
                                        <option value="number">Número</option>
                                        <option value="date">Fecha</option>
                                        <option value="select">Lista (Select)</option>
                                    </select>
                                </div>

                                {attr.type === 'select' && (
                                    <div className="w-full md:w-1/4">
                                        <label className="block text-xs text-slate-500 mb-1">Opciones (sep. por comas)</label>
                                        <input
                                            type="text"
                                            className="w-full text-sm rounded-md border-slate-300"
                                            value={attr.optionsStr}
                                            onChange={(e) => updateAttribute(i, 'optionsStr', e.target.value)}
                                            placeholder="Rojo, Azul, Verde"
                                        />
                                    </div>
                                )}

                                <div className="pt-6 flex items-center gap-2">
                                    <label className="inline-flex items-center gap-1 cursor-pointer" title="Requerido">
                                        <input
                                            type="checkbox"
                                            checked={attr.required}
                                            onChange={(e) => updateAttribute(i, 'required', e.target.checked)}
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-xs text-slate-600">Req.</span>
                                    </label>
                                    <button
                                        onClick={() => removeAttribute(i)}
                                        className="text-slate-400 hover:text-red-500 p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {attributes.length === 0 && (
                            <p className="text-sm text-slate-400 text-center py-4">Sin atributos. Agrega campos para definir este tipo de producto.</p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <button
                        onClick={() => mutation.mutate()}
                        disabled={mutation.isPending || !name}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Save size={18} />
                        {mutation.isPending ? 'Guardando...' : 'Guardar Plantilla'}
                    </button>
                </div>
            </div>
        </div>
    )
}
