import type { ModuleDescriptor, ModuleNavItem, ModuleRoute } from '@/shared/types/module'
import { quotesModule } from '@/modules/quotes'
import { clientsModule } from '@/modules/clients'
import { productsModule } from '@/modules/products'
import { clientBranchesModule } from '@/modules/client-branches'
import { hrModule } from '@/modules/hr/module'
import { createElement, type ReactElement } from 'react'
import { PermissionRoute } from '@/auth/PermissionRoute'

export const modules: ModuleDescriptor[] = [
  quotesModule,
  clientsModule,
  productsModule,
  clientBranchesModule,
  hrModule,
]

export function getMainChildrenRoutes(): ModuleRoute[] {
  try {
    const allRoutes = modules.flatMap((m) => m.routes)
    return allRoutes.map((route) => {
      if (!route.requiredPermission) {
        return route
      }
      return {
        ...route,
        element: createElement(
          PermissionRoute,
          { permission: route.requiredPermission },
          route.element as ReactElement,
        ),
      }
    })
  } catch (e) {
    console.error('[registry] error building routes:', e)
    return modules.flatMap((m) => m.routes)
  }
}

export function getModuleNavItems(): ModuleNavItem[] {
  return modules.flatMap((m) => m.nav ?? [])
}
