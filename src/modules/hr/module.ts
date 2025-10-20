import { createElement, type ReactElement } from 'react'
import type { ModuleDescriptor } from '@/shared/types/module'
import { CalendarPage } from './pages/CalendarPage'

function el(c: any): ReactElement {
  return createElement(c)
}

export const hrModule: ModuleDescriptor = {
  id: 'hr',
  routes: [{ path: 'hr/calendar', element: el(CalendarPage) }],
  nav: [{ label: 'Recursos Humanos', to: '/main/hr/calendar' }],
}

export default hrModule
