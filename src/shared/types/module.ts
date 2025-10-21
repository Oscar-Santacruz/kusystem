import type { ReactNode } from 'react'

export interface ModuleRoute {
  path: string
  element: ReactNode
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
