import { useState } from 'react'
import { Button } from '@/shared/ui/button'

type PermissionRow = { id: string; resource: string; action: string; description?: string | null }
type RolePermissions = Record<string, string[]>

interface PermissionMatrixProps {
  permissions: PermissionRow[]
  rolePermissions: RolePermissions
  onUpdateRole: (role: string, permissions: string[]) => Promise<void>
  isLoading?: boolean
}

export function PermissionMatrix({
  permissions,
  rolePermissions,
  onUpdateRole,
  isLoading = false,
}: PermissionMatrixProps) {
  const [pendingChanges, setPendingChanges] = useState<Record<string, string[]>>({})

  const roles = Object.keys(rolePermissions).sort()

  const handleToggle = (role: string, permission: string, checked: boolean) => {
    const currentPermissions = pendingChanges[role] ?? rolePermissions[role] ?? []
    const updatedPermissions = checked
      ? [...currentPermissions, permission]
      : currentPermissions.filter((p) => p !== permission)

    setPendingChanges((prev) => ({
      ...prev,
      [role]: updatedPermissions,
    }))
  }

  const handleSave = async (role: string) => {
    if (!(role in pendingChanges)) return

    try {
      await onUpdateRole(role, pendingChanges[role])
      setPendingChanges((prev) => {
        const next = { ...prev }
        delete next[role]
        return next
      })
    } catch (error) {
      console.error('Error updating permissions:', error)
    }
  }

  const getEffectivePermissions = (role: string) => {
    return pendingChanges[role] ?? rolePermissions[role] ?? []
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Matriz de permisos</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-slate-800">
          <thead className="bg-slate-900">
            <tr>
              <th className="text-left px-4 py-3 border-b border-slate-800">Permiso</th>
              {roles.map((role) => (
                <th key={role} className="text-center px-4 py-3 border-b border-slate-800">
                  {role}
                  {role in pendingChanges && (
                    <Button
                      size="sm"
                      className="ml-2"
                      onClick={() => handleSave(role)}
                      disabled={isLoading}
                    >
                      Guardar
                    </Button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissions.map((perm) => (
              <tr key={perm.id} className="odd:bg-slate-900/40">
                <td className="px-4 py-3 border-b border-slate-800">
                  <div className="space-y-1">
                    <div className="font-medium">{perm.resource}:{perm.action}</div>
                    {perm.description && (
                      <div className="text-xs text-slate-400">{perm.description}</div>
                    )}
                  </div>
                </td>
                {roles.map((role) => {
                  const effectivePermissions = getEffectivePermissions(role)
                  const hasPermission = effectivePermissions.includes(`${perm.resource}:${perm.action}`)
                  const hasPendingChange = role in pendingChanges

                  return (
                    <td key={role} className="text-center px-4 py-3 border-b border-slate-800">
                      <input
                        type="checkbox"
                        checked={hasPermission}
                        onChange={(e) => handleToggle(role, `${perm.resource}:${perm.action}`, e.target.checked)}
                        disabled={isLoading || role === 'owner'}
                        className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-600 rounded focus:ring-blue-500"
                      />
                      {hasPendingChange && (
                        <span className="ml-2 text-xs text-yellow-400">*</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {Object.keys(pendingChanges).length > 0 && (
        <div className="text-sm text-slate-400">
          * Cambios pendientes. Hacé clic en "Guardar" para aplicar.
        </div>
      )}
    </div>
  )
}
