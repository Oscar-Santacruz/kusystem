import type { ModuleDescriptor, ModuleNavItem, ModuleRoute } from '@/shared/types/module'
import { quotesModule } from '@/modules/quotes'
import { clientsModule } from '@/modules/clients'
import { productsModule } from '@/modules/products'
import { clientBranchesModule } from '@/modules/client-branches'

export const modules: ModuleDescriptor[] = [quotesModule, clientsModule, productsModule, clientBranchesModule]

export function getMainChildrenRoutes(): ModuleRoute[] {
  return modules.flatMap((m) => m.routes)
}

export function getModuleNavItems(): ModuleNavItem[] {
  return modules.flatMap((m) => m.nav ?? [])
}
