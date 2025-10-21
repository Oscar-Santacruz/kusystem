import { createElement, type ReactElement } from 'react'
import type { ModuleDescriptor } from '@/shared/types/module'
import { ProductsListPage } from './pages/ProductsListPage'
import { ProductEditPage } from './pages/ProductEditPage'

function el(c: any): ReactElement { return createElement(c) }

export const productsModule: ModuleDescriptor = {
  id: 'products',
  routes: [
    { path: 'products', element: el(ProductsListPage), requiredPermission: 'products:view' },
    { path: 'products/:id/edit', element: el(ProductEditPage), requiredPermission: 'products:view' },
  ],
  nav: [
    { label: 'Productos', to: '/main/products', requiredPermission: 'products:view' },
  ],
}

export default productsModule
