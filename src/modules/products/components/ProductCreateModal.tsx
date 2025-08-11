import { Modal } from '@/shared/components/Modal'
import { ProductForm } from '@/modules/products/components/ProductForm'
import { useCreateProduct } from '@/modules/products/hooks/useProducts'
import type { Product } from '@/shared/types/domain'
import type { JSX } from 'react'

export interface ProductCreateModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (product: Product) => void
}

export function ProductCreateModal({ open, onClose, onSuccess }: ProductCreateModalProps): JSX.Element {
  const createProduct = useCreateProduct()

  return (
    <Modal open={open} title="Nuevo Producto" onClose={onClose}>
      <ProductForm
        pending={createProduct.isPending}
        onSubmit={(vals) => {
          createProduct.mutate(vals, {
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
