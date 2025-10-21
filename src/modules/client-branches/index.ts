import { createElement, type ReactElement } from 'react'
import type { ModuleDescriptor } from '@/shared/types/module'
import { BranchesListPage } from './pages/BranchesListPage'
import { BranchNewPage } from './pages/BranchNewPage'
import { BranchEditPage } from './pages/BranchEditPage'

function el(c: any): ReactElement { return createElement(c) }

export const clientBranchesModule: ModuleDescriptor = {
  id: 'client-branches',
  routes: [
    { path: 'clients/:clientId/branches', element: el(BranchesListPage), requiredPermission: 'clients:view' },
    { path: 'clients/:clientId/branches/new', element: el(BranchNewPage), requiredPermission: 'clients:view' },
    { path: 'client-branches/:id/edit', element: el(BranchEditPage), requiredPermission: 'clients:view' },
  ],
}

export default clientBranchesModule
