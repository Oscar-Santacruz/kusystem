import { createElement, type ReactElement } from 'react'
import type { ModuleDescriptor } from '@/shared/types/module'
import { ProductsListPage } from './pages/ProductsListPage'
import { ProductEditPage } from './pages/ProductEditPage'

function el(c: any): ReactElement { return createElement(c) }

export const productsModule: ModuleDescriptor = {
  id: 'products',
  routes: [
    { path: 'products', element: el(ProductsListPage) },
    { path: 'products/:id/edit', element: el(ProductEditPage) },
  ],
  nav: [
    { label: 'Productos', to: '/main/products' },
  ],
}

export default productsModule
