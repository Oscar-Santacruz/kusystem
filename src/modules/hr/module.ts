import { createElement, type ReactElement } from 'react'
import type { ModuleDescriptor } from '@/shared/types/module'
import { CalendarPage } from './pages/CalendarPage'

function el(c: any): ReactElement {
  return createElement(c)
}

export const hrModule: ModuleDescriptor = {
  id: 'hr',
  routes: [{ path: 'hr/calendar', element: el(CalendarPage), requiredPermission: 'hr-calendar:view' }],
  nav: [{ label: 'Recursos Humanos', to: '/main/hr/calendar', requiredPermission: 'hr-calendar:view' }],
}

export default hrModule
