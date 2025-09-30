import { Modal } from '@/shared/components/Modal'
import { ProductForm } from '@/modules/products/components/ProductForm'
import { useCreateProduct, useProduct, useUpdateProduct } from '@/modules/products/hooks/useProducts'
import type { Product, CreateProductInput, UpdateProductInput } from '@/shared/types/domain'
import { useEffect, useId, useMemo, useState, type JSX } from 'react'

export type ProductModalMode = 'create' | 'edit'

export interface ProductModalProps {
  mode: ProductModalMode
  open: boolean
  onClose: () => void
  productId?: string // requerido en edit
  onSuccess?: (mode: ProductModalMode, product: Product) => void
}

// Utilidad: deep compare simple para detectar cambios
function isEqual(a: unknown, b: unknown): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b)
  } catch {
    return false
  }
}

/**
 * Modal unificado (crear/editar) para productos.
 * - Título y CTA dinámicos
 * - Carga con skeleton en modo edit
 * - Guard de cambios no guardados
 * - Reutiliza ProductForm
 */
export function ProductModal({ mode, open, onClose, productId, onSuccess }: ProductModalProps): JSX.Element {
  const formId = useId()
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const isEdit = mode === 'edit'

  // Datos de edición
  const productQuery = useProduct(isEdit ? productId : undefined)
  const product: Product | undefined = isEdit ? productQuery.data : undefined
  const isLoading = isEdit && productQuery.isLoading

  // Estado del flag "Incluye IVA"
  const [priceIncludesTax, setPriceIncludesTax] = useState<boolean>(false)

  // Snapshot inicial para guard de cambios
  const [initialSnapshot, setInitialSnapshot] = useState<CreateProductInput | null>(null)
  const [currentValues, setCurrentValues] = useState<CreateProductInput | null>(null)

  const title = isEdit ? 'Editar Producto' : 'Nuevo Producto'
  const cta = isEdit ? 'Guardar cambios' : 'Crear Producto'

  // Construir initialValues para el formulario
  const initialValues: CreateProductInput | null = useMemo(() => {
    if (isEdit) {
      if (!product) return null
      const taxRate = product.taxRate || 0
      const showGross = product.priceIncludesTax === true
      const displayPrice = showGross ? Math.round(product.price * (1 + taxRate)) : product.price
      return {
        sku: product.sku,
        name: product.name,
        description: product.description,
        unit: product.unit,
        price: displayPrice || 0,
        cost: product.cost || 0,
        taxRate,
        stock: product.stock || 0,
        minStock: product.minStock || 0,
        barcode: product.barcode,
        imageUrl: product.imageUrl || '',
        priceIncludesTax: product.priceIncludesTax ?? false,
      }
    }
    // Defaults para creación
    return {
      sku: '',
      name: '',
      description: '',
      unit: 'UN',
      price: 0,
      cost: 0,
      taxRate: 0.1,
      stock: 0,
      minStock: 0,
      barcode: '',
      imageUrl: '',
      priceIncludesTax: false,
    }
  }, [isEdit, product])

  // Sync estado local al abrir/cargar
  useEffect(() => {
    if (!open) return
    if (initialValues) {
      setPriceIncludesTax(Boolean(initialValues.priceIncludesTax))
      setInitialSnapshot(initialValues)
      setCurrentValues(initialValues)
    }
  }, [open, initialValues])

  // Guard de cambios al cerrar
  function guardedClose() {
    const base = initialSnapshot
    const next = currentValues
    if (base && next && !isEqual(base, next)) {
      const confirmClose = window.confirm('Hay cambios sin guardar. ¿Cerrar de todos modos?')
      if (!confirmClose) return
    }
    onClose()
  }

  // Submit handler unificado
  async function handleSubmit(vals: CreateProductInput): Promise<void> {
    // Tomar el valor del modo IVA desde estado del modal
    const submitIncludesTax = priceIncludesTax === true
    if (isEdit) {
      if (!product) return
      const input: UpdateProductInput = submitIncludesTax
        ? { ...vals, price: vals.price / (1 + (vals.taxRate || 0)), priceIncludesTax: true }
        : { ...vals, priceIncludesTax: false }
      const updated = await updateMutation.mutateAsync({ id: product.id, input })
      // Si el hook retorna el producto actualizado, emitir onSuccess
      if (updated) {
        onSuccess?.('edit', updated as unknown as Product)
      }
      // Resetear snapshot para evitar el guard al cerrar después de guardar
      setInitialSnapshot(null)
      setCurrentValues(null)
      onClose()
    } else {
      const input: CreateProductInput = submitIncludesTax
        ? { ...vals, price: vals.price / (1 + (vals.taxRate || 0)), priceIncludesTax: true }
        : { ...vals, priceIncludesTax: false }
      const created = await createMutation.mutateAsync(input)
      if (created) {
        onSuccess?.('create', created as unknown as Product)
      }
      // Resetear snapshot para evitar el guard al cerrar después de guardar
      setInitialSnapshot(null)
      setCurrentValues(null)
      onClose()
    }
  }

  // Loading skeleton en modo edición
  const footer = (
    <>
      <button
        type="button"
        className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        onClick={guardedClose}
        disabled={createMutation.isPending || updateMutation.isPending}
      >
        Cancelar
      </button>
      <button
        type="submit"
        form={formId}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        disabled={createMutation.isPending || updateMutation.isPending || (isEdit && isLoading)}
      >
        {(createMutation.isPending || updateMutation.isPending) ? 'Procesando…' : cta}
      </button>
    </>
  )

  return (
    <Modal open={open} title={title} onClose={guardedClose} size="xl" footer={footer} mobileFullScreen>
      {isEdit && isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-slate-200" />
          <div className="h-10 rounded bg-slate-200" />
          <div className="h-24 rounded bg-slate-200" />
          <div className="h-10 rounded bg-slate-200" />
        </div>
      ) : initialValues ? (
        <ProductForm
          initialValues={initialValues}
          pending={createMutation.isPending || updateMutation.isPending}
          priceIncludesTax={priceIncludesTax}
          onChangePriceIncludesTax={setPriceIncludesTax}
          formId={formId}
          onChange={(v) => setCurrentValues(v)}
          onSubmit={handleSubmit}
        />
      ) : null}
    </Modal>
  )
}

export default ProductModal
