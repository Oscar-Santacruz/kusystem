import { lazy, Suspense, createElement, type ReactElement } from 'react'
import type { ModuleDescriptor } from '@/shared/types/module'

const ProductsListPage = lazy(() => import('./pages/ProductsListPage').then(m => ({ default: m.ProductsListPage })))
const ProductEditPage = lazy(() => import('./pages/ProductEditPage').then(m => ({ default: m.ProductEditPage })))

function suspense(el: ReactElement): ReactElement {
  const fallback = createElement('div', { className: 'p-4' }, 'Cargando…')
  return createElement(Suspense, { fallback }, el)
}

export const productsModule: ModuleDescriptor = {
  id: 'products',
  routes: [
    { path: 'products', element: suspense(createElement(ProductsListPage)) },
    { path: 'products/:id/edit', element: suspense(createElement(ProductEditPage)) },
  ],
  nav: [
    { label: 'Productos', to: '/main/products' },
  ],
}

export default productsModule
