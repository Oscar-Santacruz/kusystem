import { type JSX } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProductForm } from '@/modules/products/components/ProductForm'
import { useCreateProduct } from '@/modules/products/hooks/useProducts'
import { useToast } from '@/shared/ui/toast'

export function ProductNewPage(): JSX.Element {
  const create = useCreateProduct()
  const navigate = useNavigate()
  const { success } = useToast()

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Nuevo Producto</h1>
      </div>

      <ProductForm
        pending={create.isPending}
        onSubmit={(vals) => {
          create.mutate(vals, {
            onSuccess: () => {
              success('Producto creado')
              navigate('/main/products')
            },
          })
        }}
      />
    </div>
  )
}

export default ProductNewPage
