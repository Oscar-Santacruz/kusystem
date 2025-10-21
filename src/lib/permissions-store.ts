import { create } from 'zustand'

export type Permission = `${string}:${string}`

type PermissionMap = Record<string, true>
export type PermissionsState = {
  permissions: PermissionMap
  isOwner: boolean
  setPermissions: (perms: Permission[]) => void
  addPermission: (perm: Permission) => void
  removePermission: (perm: Permission) => void
  setIsOwner: (value: boolean) => void
  hasPermission: (perm: Permission) => boolean
  reset: () => void
}

function arrayToMap(perms: Permission[]): PermissionMap {
  const map: PermissionMap = {}
  for (const perm of perms) {
    map[perm] = true
  }
  return map
}

export const usePermissionsStore = create<PermissionsState>((set, get) => ({
  permissions: {},
  isOwner: false,
  setPermissions: (perms) => {
    set({ permissions: arrayToMap(perms) })
  },
  addPermission: (perm) => {
    set((state) => ({
      permissions: { ...state.permissions, [perm]: true },
    }))
  },
  removePermission: (perm) => {
    set((state) => {
      const next = { ...state.permissions }
      delete next[perm]
      return { permissions: next }
    })
  },
  setIsOwner: (value) => set({ isOwner: value }),
  hasPermission: (perm) => {
    const { isOwner, permissions } = get()
    return isOwner || Boolean(permissions[perm])
  },
  reset: () => set({ permissions: {}, isOwner: false }),
}))
