import { createElement, type ReactElement } from 'react'
import type { ModuleDescriptor } from '@/shared/types/module'
import { QuotesListPage } from './pages/QuotesListPage'
import { QuoteNewPage } from './pages/QuoteNewPage'
import { QuoteDetailPage } from './pages/QuoteDetailPage'
import { QuoteEditPage } from './pages/QuoteEditPage'
import { QuotePrintPage } from './pages/QuotePrintPage'
import { QuotesAnalyticsPage } from './pages/QuotesAnalyticsPage'

function el(c: any): ReactElement { return createElement(c) }

export const quotesModule: ModuleDescriptor = {
  id: 'quotes',
  routes: [
    { path: 'quotes', element: el(QuotesListPage), requiredPermission: 'quotes:view' },
    { path: 'quotes/analytics', element: el(QuotesAnalyticsPage), requiredPermission: 'quotes:view' },
    { path: 'quotes/new', element: el(QuoteNewPage), requiredPermission: 'quotes:view' },
    { path: 'quotes/:id', element: el(QuoteDetailPage), requiredPermission: 'quotes:view' },
    { path: 'quotes/:id/edit', element: el(QuoteEditPage), requiredPermission: 'quotes:view' },
    { path: 'quotes/:id/print', element: el(QuotePrintPage), requiredPermission: 'quotes:view' },
  ],
  nav: [
    { label: 'Presupuestos', to: '/main/quotes', requiredPermission: 'quotes:view' },
    { label: 'Analytics', to: '/main/quotes/analytics', requiredPermission: 'quotes:view' },
  ],
}
