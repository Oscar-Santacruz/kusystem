import { type JSX } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ProductForm } from '@/modules/products/components/ProductForm'
import { useProduct, useUpdateProduct } from '@/modules/products/hooks/useProducts'
import { useToast } from '@/shared/ui/toast'

export function ProductEditPage(): JSX.Element {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useProduct(id)
  const update = useUpdateProduct()
  const navigate = useNavigate()
  const { success } = useToast()

  if (isLoading) return <div className="p-4">Cargando…</div>
  if (!data) return <div className="p-4">No se encontró el producto</div>

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Editar Producto</h1>
      </div>

      <ProductForm
        initialValues={{
          sku: data.sku,
          name: data.name,
          unit: data.unit,
          price: data.price,
          taxRate: data.taxRate,
        }}
        pending={update.isPending}
        onSubmit={(vals) => {
          if (!id) return
          update.mutate({ id, input: vals }, {
            onSuccess: () => {
              success('Producto actualizado')
              navigate('/main/products')
            },
          })
        }}
      />
    </div>
  )
}

export default ProductEditPage
