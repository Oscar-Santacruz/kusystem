import { createElement, type ReactElement } from 'react'
import type { ModuleDescriptor } from '@/shared/types/module'
import { ClientsListPage } from './pages/ClientsListPage'
import { ClientNewPage } from './pages/ClientNewPage'
import { ClientEditPage } from './pages/ClientEditPage'

function el(c: any): ReactElement { return createElement(c) }

export const clientsModule: ModuleDescriptor = {
  id: 'clients',
  routes: [
    { path: 'clients', element: el(ClientsListPage), requiredPermission: 'clients:view' },
    { path: 'clients/new', element: el(ClientNewPage), requiredPermission: 'clients:view' },
    { path: 'clients/:id/edit', element: el(ClientEditPage), requiredPermission: 'clients:view' },
  ],
  nav: [
    { label: 'Clientes', to: '/main/clients', requiredPermission: 'clients:view' },
  ],
}

export default clientsModule
