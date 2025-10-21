import { Suspense } from 'react'
import { PermissionMatrix } from '@/modules/admin/permissions/PermissionMatrix'
import { MemberRoleTable } from '@/modules/admin/permissions/MemberRoleTable'
import { useAdminPermissions } from '@/hooks/useAdminPermissions'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogBody, DialogFooter, DialogHeader } from '@/shared/ui/dialog'
import { Tag } from '@/shared/ui/tag'

export function PermissionsPage() {
  const {
    dashboard,
    isLoading,
    isError,
    refetch,
    matrixProps,
    membersProps,
    state,
  } = useAdminPermissions()

  if (isLoading) {
    return <div className="p-6">Cargando permisos…</div>
  }

  if (isError || !dashboard) {
    return (
      <div className="p-6 space-y-3">
        <h1 className="text-2xl font-semibold text-red-400">Error al cargar permisos</h1>
        <p className="text-slate-400">Reintentá más tarde o contactá con soporte.</p>
        <Button onClick={() => refetch()}>Reintentar</Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Permisos de la organización</h1>
          <p className="text-sm text-slate-400">
            Administrá qué acciones puede realizar cada rol. Los cambios se aplican de inmediato.
          </p>
        </div>
        <div className="flex gap-2">
          <Tag color="blue">Rol actual: {state.currentRole ?? '—'}</Tag>
          <Button variant="ghost" onClick={() => refetch()}>Actualizar</Button>
        </div>
      </div>

      <Suspense fallback={<div className="p-6">Cargando matriz…</div>}>
        <PermissionMatrix {...matrixProps} />
      </Suspense>

      <div>
        <h2 className="text-xl font-semibold mb-4">Miembros y roles</h2>
        <MemberRoleTable {...membersProps} />
      </div>

      <Dialog open={state.dialog.open} onClose={state.dialog.close}>
        <DialogHeader>
          <h3 className="text-lg font-semibold">Cambiar rol</h3>
          <p className="text-sm text-slate-400">Seleccioná el nuevo rol para {state.dialog.member?.user.email}</p>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-2">
            {state.availableRoles.map((role) => (
              <Button
                key={role}
                fullWidth
                variant={state.dialog.selectedRole === role ? 'primary' : 'ghost'}
                onClick={() => state.dialog.selectRole(role)}
              >
                {role}
              </Button>
            ))}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={state.dialog.close}>Cancelar</Button>
          <Button onClick={state.dialog.confirm} disabled={!state.dialog.selectedRole || state.dialog.isSaving}>
            Guardar
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
