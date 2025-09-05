import { Modal } from '@/shared/components/Modal'
import { ProductForm } from '@/modules/products/components/ProductForm'
import { useCreateProduct } from '@/modules/products/hooks/useProducts'
import type { Product } from '@/shared/types/domain'
import { useId, useState, type JSX } from 'react'

export interface ProductCreateModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (product: Product) => void
}

export function ProductCreateModal({ open, onClose, onSuccess }: ProductCreateModalProps): JSX.Element {
  const createProduct = useCreateProduct()
  const [priceIncludesTax, setPriceIncludesTax] = useState(false)
  const formId = useId()

  return (
    <Modal
      open={open}
      title="Nuevo Producto"
      onClose={onClose}
      size="xl"
      footer={
        <>
          <button
            type="button"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            onClick={onClose}
            disabled={createProduct.isPending}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form={formId}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={createProduct.isPending}
          >
            {createProduct.isPending ? 'Creando…' : 'Crear Producto'}
          </button>
        </>
      }
    >
      <ProductForm
        pending={createProduct.isPending}
        priceIncludesTax={priceIncludesTax}
        formId={formId}
        onChangePriceIncludesTax={setPriceIncludesTax}
        onSubmit={(vals) => {
          // Si el precio incluye IVA, convertir a precio neto antes de enviar
          const input = priceIncludesTax
            ? { ...vals, price: vals.price / (1 + (vals.taxRate || 0)), priceIncludesTax: true }
            : { ...vals, priceIncludesTax: false }
          createProduct.mutate(input, {
            onSuccess: (p) => {
              onSuccess(p)
              onClose()
            },
          })
        }}
      />
    </Modal>
  )
}

export default ProductCreateModal
