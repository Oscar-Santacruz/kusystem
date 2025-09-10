import { createElement, type ReactElement } from 'react'
import type { ModuleDescriptor } from '@/shared/types/module'
import { ClientsListPage } from './pages/ClientsListPage'
import { ClientNewPage } from './pages/ClientNewPage'
import { ClientEditPage } from './pages/ClientEditPage'

function el(c: any): ReactElement { return createElement(c) }

export const clientsModule: ModuleDescriptor = {
  id: 'clients',
  routes: [
    { path: 'clients', element: el(ClientsListPage) },
    { path: 'clients/new', element: el(ClientNewPage) },
    { path: 'clients/:id/edit', element: el(ClientEditPage) },
  ],
  nav: [
    { label: 'Clientes', to: '/main/clients' },
  ],
}

export default clientsModule
