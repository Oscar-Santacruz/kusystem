import type { ReactNode } from 'react'
import { usePermission } from '@/hooks/usePermission'

interface PermissionRouteProps {
  permission?: string
  children?: ReactNode
}

export function PermissionRoute({ permission, children }: PermissionRouteProps) {
  const hasAccess = permission ? usePermission(permission) : true

  if (!hasAccess) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold text-red-500">Acceso denegado</h2>
        <p className="mt-2 text-sm text-slate-400">
          No tenés permisos para ver esta sección. Pedí acceso a tu administrador.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
