import type { ModuleDescriptor, ModuleNavItem, ModuleRoute } from '@/shared/types/module'
import { quotesModule } from '@/modules/quotes'
import { clientsModule } from '@/modules/clients'
import { productsModule } from '@/modules/products'
import { clientBranchesModule } from '@/modules/client-branches'

export const modules: ModuleDescriptor[] = [quotesModule, clientsModule, productsModule, clientBranchesModule]

export function getMainChildrenRoutes(): ModuleRoute[] {
  try {
    const ids = modules.map((m) => m.id)
    console.log('[registry] modules loaded:', ids)
    const allRoutes = modules.flatMap((m) => m.routes)
    console.log('[registry] routes injected:', allRoutes.map((r) => r.path))
    return allRoutes
  } catch (e) {
    console.error('[registry] error building routes:', e)
    return modules.flatMap((m) => m.routes)
  }
}

export function getModuleNavItems(): ModuleNavItem[] {
  return modules.flatMap((m) => m.nav ?? [])
}
