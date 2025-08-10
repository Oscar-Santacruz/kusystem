import { lazy, Suspense, createElement, type ReactElement } from 'react'
import type { ModuleDescriptor } from '@/shared/types/module'

const ClientsListPage = lazy(() => import('./pages/ClientsListPage').then(m => ({ default: m.ClientsListPage })))
const ClientNewPage = lazy(() => import('./pages/ClientNewPage').then(m => ({ default: m.ClientNewPage })))
const ClientEditPage = lazy(() => import('./pages/ClientEditPage').then(m => ({ default: m.ClientEditPage })))

function suspense(el: ReactElement): ReactElement {
  const fallback = createElement('div', { className: 'p-4' }, 'Cargando…')
  return createElement(Suspense, { fallback }, el)
}

export const clientsModule: ModuleDescriptor = {
  id: 'clients',
  routes: [
    { path: 'clients', element: suspense(createElement(ClientsListPage)) },
    { path: 'clients/new', element: suspense(createElement(ClientNewPage)) },
    { path: 'clients/:id/edit', element: suspense(createElement(ClientEditPage)) },
  ],
  nav: [
    { label: 'Clientes', to: '/main/clients' },
  ],
}

export default clientsModule
