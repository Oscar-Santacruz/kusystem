import { lazy, Suspense, createElement, type ReactElement } from 'react'
import type { ModuleDescriptor } from '@/shared/types/module'

const BranchesListPage = lazy(() => import('./pages/BranchesListPage').then(m => ({ default: m.BranchesListPage })))
const BranchNewPage = lazy(() => import('./pages/BranchNewPage').then(m => ({ default: m.BranchNewPage })))
const BranchEditPage = lazy(() => import('./pages/BranchEditPage').then(m => ({ default: m.BranchEditPage })))

function suspense(el: ReactElement): ReactElement {
  const fallback = createElement('div', { className: 'p-4' }, 'Cargando…')
  return createElement(Suspense, { fallback }, el)
}

export const clientBranchesModule: ModuleDescriptor = {
  id: 'client-branches',
  routes: [
    { path: 'clients/:clientId/branches', element: suspense(createElement(BranchesListPage)) },
    { path: 'clients/:clientId/branches/new', element: suspense(createElement(BranchNewPage)) },
    { path: 'client-branches/:id/edit', element: suspense(createElement(BranchEditPage)) },
  ],
}

export default clientBranchesModule
