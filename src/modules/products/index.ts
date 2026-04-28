import { createElement, type ReactElement } from 'react'
import type { ModuleDescriptor } from '@/shared/types/module'
import { ProductsListPage } from './pages/ProductsListPage'
import { ProductEditPage } from './pages/ProductEditPage'
import { ProductTemplatesListPage } from './pages/ProductTemplatesListPage'
import { ProductTemplateFormPage } from './pages/ProductTemplateFormPage'

function el(c: any): ReactElement { return createElement(c) }

export const productsModule: ModuleDescriptor = {
  id: 'products',
  routes: [
    { path: 'products', element: el(ProductsListPage), requiredPermission: 'products:view' },
    { path: 'products/:id/edit', element: el(ProductEditPage), requiredPermission: 'products:view' },
    { path: 'products/config/templates', element: el(ProductTemplatesListPage), requiredPermission: 'products:view' },
    { path: 'products/config/templates/new', element: el(ProductTemplateFormPage), requiredPermission: 'products:view' },
    { path: 'products/config/templates/:id/edit', element: el(ProductTemplateFormPage), requiredPermission: 'products:view' },
  ],
  nav: [
    { label: 'Productos', to: '/main/products', requiredPermission: 'products:view' },
    { label: 'Tipos de Producto', to: '/main/products/config/templates', requiredPermission: 'products:view' },
  ],
}

export default productsModule
