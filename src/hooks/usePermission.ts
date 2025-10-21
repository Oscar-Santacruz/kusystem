import { usePermissionsStore, type Permission } from '../lib/permissions-store'

export function usePermission(permission: string) {
  return usePermissionsStore((state) => state.hasPermission(permission as Permission))
}
