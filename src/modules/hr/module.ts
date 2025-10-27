import { createElement, type ReactElement } from 'react'
import type { ModuleDescriptor } from '@/shared/types/module'
import { CalendarPage } from './pages/CalendarPage'
import { ReportsPage } from './pages/ReportsPage'

function el(c: any): ReactElement {
  return createElement(c)
}

export const hrModule: ModuleDescriptor = {
  id: 'hr',
  routes: [
    { path: 'hr/calendar', element: el(CalendarPage), requiredPermission: 'hr-calendar:view' },
    { path: 'hr/reports', element: el(ReportsPage), requiredPermission: 'hr-calendar:view' },
  ],
  nav: [
    { label: 'Calendario RRHH', to: '/main/hr/calendar', requiredPermission: 'hr-calendar:view' },
    { label: 'Reportes RRHH', to: '/main/hr/reports', requiredPermission: 'hr-calendar:view' },
  ],
}

export default hrModule
