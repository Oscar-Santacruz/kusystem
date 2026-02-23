import { createElement, type ReactElement } from 'react'
import type { ModuleDescriptor } from '@/shared/types/module'
import { CalendarPage } from './pages/CalendarPage'
import { ReportsPage } from './pages/ReportsPage'
import { EmployeesListPage } from './pages/EmployeesListPage'
import { EmployeeFormPage } from './pages/EmployeeFormPage'
import { PayrollPage } from './pages/PayrollPage'

function el(c: any): ReactElement {
  return createElement(c)
}

export const hrModule: ModuleDescriptor = {
  id: 'hr',
  routes: [
    { path: 'hr/calendar', element: el(CalendarPage), requiredPermission: 'hr-calendar:view' },
    { path: 'hr/reports', element: el(ReportsPage), requiredPermission: 'hr-calendar:view' },
    { path: 'hr/employees', element: el(EmployeesListPage), requiredPermission: 'hr-calendar:view' },
    { path: 'hr/employees/:id', element: el(EmployeeFormPage), requiredPermission: 'hr-calendar:view' },
    { path: 'hr/payroll', element: el(PayrollPage), requiredPermission: 'hr-calendar:view' },
  ],
  nav: [
    { label: 'Personal', to: '/main/hr/employees', requiredPermission: 'hr-calendar:view' },
    { label: 'Calendario RRHH', to: '/main/hr/calendar', requiredPermission: 'hr-calendar:view' },
    { label: 'Liquidaciones', to: '/main/hr/payroll', requiredPermission: 'hr-calendar:view' },
    { label: 'Reportes RRHH', to: '/main/hr/reports', requiredPermission: 'hr-calendar:view' },
  ],
}

export default hrModule
