import type { ReactElement } from 'react'

export interface ModuleRoute {
  path: string
  element: ReactElement
  requiredPermission?: string
}

export interface ModuleNavItem {
  label: string
  to: string
  requiredPermission?: string
}

export interface ModuleDescriptor {
  id: string
  routes: ModuleRoute[]
  nav?: ModuleNavItem[]
}
