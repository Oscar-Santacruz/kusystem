import type { ReactNode } from 'react'

export interface ModuleRoute {
  path: string
  element: ReactNode
}

export interface ModuleNavItem {
  label: string
  to: string
}

export interface ModuleDescriptor {
  id: string
  routes: ModuleRoute[]
  nav?: ModuleNavItem[]
}
