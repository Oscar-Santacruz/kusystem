import { type JSX } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProductForm } from '@/modules/products/components/ProductForm'
import { useCreateProduct } from '@/modules/products/hooks/useProducts'

export function ProductNewPage(): JSX.Element {
  const create = useCreateProduct()
  const navigate = useNavigate()

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Nuevo Producto</h1>
      </div>

      <ProductForm
        pending={create.isPending}
        onSubmit={(vals) => {
          create.mutate(vals, {
            onSuccess: () => navigate('/main/products'),
          })
        }}
      />
    </div>
  )
}

export default ProductNewPage
