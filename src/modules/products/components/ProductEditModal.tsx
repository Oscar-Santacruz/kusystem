import { Modal } from '@/shared/components/Modal'
import { ProductForm } from '@/modules/products/components/ProductForm'
import { useUpdateProduct } from '@/modules/products/hooks/useProducts'
import type { Product, UpdateProductInput } from '@/shared/types/domain'
import { useEffect, useId, useState, type JSX } from 'react'

export interface ProductEditModalProps {
  open: boolean
  onClose: () => void
  product: Product
  onSuccess?: (product: Product) => void
}

export function ProductEditModal({ open, onClose, product, onSuccess }: ProductEditModalProps): JSX.Element {
  const updateProduct = useUpdateProduct()
  const [priceIncludesTax, setPriceIncludesTax] = useState<boolean>(product.priceIncludesTax ?? false)
  const formId = useId()

  // Sincronizar estado local cuando cambie el producto o se reabra el modal
  useEffect(() => {
    setPriceIncludesTax(product.priceIncludesTax ?? false)
  }, [product])

  // Preparar initial values para el formulario. Si el precio incluye IVA, mostrar precio bruto (neto * (1 + tasa))
  const initialValues = {
    sku: product.sku,
    name: product.name,
    description: product.description,
    unit: product.unit,
    price: (product.priceIncludesTax ? Math.round(product.price * (1 + (product.taxRate || 0))) : product.price) || 0,
    cost: product.cost || 0,
    taxRate: product.taxRate || 0,
    stock: product.stock || 0,
    minStock: product.minStock || 0,
    barcode: product.barcode,
    imageUrl: product.imageUrl || '',
    priceIncludesTax: product.priceIncludesTax,
  }

  return (
    <Modal
      open={open}
      title="Editar Producto"
      onClose={onClose}
      size="xl"
      footer={
        <>
          <button
            type="button"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            onClick={onClose}
            disabled={updateProduct.isPending}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form={formId}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={updateProduct.isPending}
          >
            {updateProduct.isPending ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </>
      }
    >
      <ProductForm
        initialValues={initialValues}
        pending={updateProduct.isPending}
        priceIncludesTax={priceIncludesTax}
        formId={formId}
        onChangePriceIncludesTax={setPriceIncludesTax}
        onSubmit={(vals) => {
          // Si el precio incluye IVA, convertir a precio neto antes de enviar
          const input: UpdateProductInput = priceIncludesTax
            ? { ...vals, price: vals.price / (1 + (vals.taxRate || 0)), priceIncludesTax: true }
            : { ...vals, priceIncludesTax: false }

          updateProduct.mutate(
            { id: product.id, input },
            {
              onSuccess: (p) => {
                onSuccess?.(p)
                onClose()
              },
            }
          )
        }}
      />
    </Modal>
  )
}

export default ProductEditModal
