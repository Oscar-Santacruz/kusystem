import { lazy, Suspense, createElement, type ReactElement } from 'react'
import type { ModuleDescriptor } from '@/shared/types/module'

const QuotesListPage = lazy(() => import('./pages/QuotesListPage').then(m => ({ default: m.QuotesListPage })))
const QuoteNewPage = lazy(() => import('./pages/QuoteNewPage').then(m => ({ default: m.QuoteNewPage })))
const QuoteDetailPage = lazy(() => import('./pages/QuoteDetailPage').then(m => ({ default: m.QuoteDetailPage })))
const QuoteEditPage = lazy(() => import('./pages/QuoteEditPage').then(m => ({ default: m.QuoteEditPage })))
const QuotePrintPage = lazy(() => import('./pages/QuotePrintPage').then(m => ({ default: m.QuotePrintPage })))

function suspense(el: ReactElement): ReactElement {
  const fallback = createElement('div', { className: 'p-4' }, 'Cargando…')
  return createElement(Suspense, { fallback }, el)
}

export const quotesModule: ModuleDescriptor = {
  id: 'quotes',
  routes: [
    { path: 'quotes', element: suspense(createElement(QuotesListPage)) },
    { path: 'quotes/new', element: suspense(createElement(QuoteNewPage)) },
    { path: 'quotes/:id', element: suspense(createElement(QuoteDetailPage)) },
    { path: 'quotes/:id/edit', element: suspense(createElement(QuoteEditPage)) },
    { path: 'quotes/:id/print', element: suspense(createElement(QuotePrintPage)) },
  ],
  nav: [
    { label: 'Presupuestos', to: '/main/quotes' },
  ],
}
