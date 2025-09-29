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
    { path: 'quotes', element: el(QuotesListPage) },
    { path: 'quotes/analytics', element: el(QuotesAnalyticsPage) },
    { path: 'quotes/new', element: el(QuoteNewPage) },
    { path: 'quotes/:id', element: el(QuoteDetailPage) },
    { path: 'quotes/:id/edit', element: el(QuoteEditPage) },
    { path: 'quotes/:id/print', element: el(QuotePrintPage) },
  ],
  nav: [
    { label: 'Presupuestos', to: '/main/quotes' },
    { label: 'Analytics', to: '/main/quotes/analytics' },
  ],
}
