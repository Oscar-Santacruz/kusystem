import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getRolePermissionsDashboard, updateRolePermissions, updateMembershipRole } from '@/services/org'
import { useAuth0 } from '@auth0/auth0-react'
import { useMemo, useState } from 'react'
import { useOrgStore } from '@/lib/org-store'
import { toast } from 'sonner'

type Member = { id: string; role: string; user: { id: string; email: string | null; name: string | null } }
type PermissionRow = { id: string; resource: string; action: string; description?: string | null }
type RolePermissions = Record<string, string[]>

interface DialogState {
  open: boolean
  member: Member | null
  selectedRole: string | null
  isSaving: boolean
  selectRole: (role: string) => void
  confirm: () => void
  close: () => void
}

export function useAdminPermissions() {
  const { user, isAuthenticated } = useAuth0()
  const orgId = useOrgStore((s) => s.orgId)
  const qc = useQueryClient()

  const [dialogState, setDialogState] = useState<Omit<DialogState, 'selectRole' | 'confirm' | 'close'>>({
    open: false,
    member: null,
    selectedRole: null,
    isSaving: false,
  })

  const isReady = useMemo(() => {
    const ready = Boolean(orgId && isAuthenticated && user?.sub)
    console.log('[useAdminPermissions] isReady:', ready, { orgId, isAuthenticated, userSub: user?.sub })
    return ready
  }, [orgId, isAuthenticated, user?.sub])

  const dashboard = useQuery({
    queryKey: ['admin-permissions-dashboard', orgId],
    queryFn: () => {
      console.log('[useAdminPermissions] Ejecutando fetch...')
      return getRolePermissionsDashboard()
    },
    enabled: isReady,
    staleTime: 30_000,
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ role, permissions }: { role: string; permissions: string[] }) =>
      updateRolePermissions(role, permissions),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-permissions-dashboard', orgId] })
      toast.success('Permisos actualizados correctamente')
    },
    onError: (error) => {
      console.error('Error updating role permissions:', error)
      toast.error('Error al actualizar permisos')
    },
  })

  const updateMembershipMutation = useMutation({
    mutationFn: ({ membershipId, role }: { membershipId: string; role: string }) =>
      updateMembershipRole(membershipId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-permissions-dashboard', orgId] })
      qc.invalidateQueries({ queryKey: ['members', orgId] })
      setDialogState((prev) => ({ ...prev, open: false, member: null, selectedRole: null }))
      toast.success('Rol actualizado correctamente')
    },
    onError: (error) => {
      console.error('Error updating membership role:', error)
      toast.error('Error al actualizar rol')
    },
  })

  const handleChangeRole = (member: Member, newRole: string) => {
    setDialogState({
      open: true,
      member,
      selectedRole: newRole,
      isSaving: false,
    })
  }

  const confirmRoleChange = () => {
    if (!dialogState.member || !dialogState.selectedRole) return

    setDialogState((prev) => ({ ...prev, isSaving: true }))
    updateMembershipMutation.mutate({
      membershipId: dialogState.member!.id,
      role: dialogState.selectedRole!,
    })
  }

  const closeDialog = () => {
    setDialogState((prev) => ({ ...prev, open: false, member: null, selectedRole: null, isSaving: false }))
  }

  const selectRole = (role: string) => {
    setDialogState((prev) => ({ ...prev, selectedRole: role }))
  }

  const currentUserId = user?.sub
  const currentMembership = dashboard.data?.members.find(
    (m: { user: { id: string } }) => m.user.id === currentUserId
  )

  return {
    dashboard: dashboard.data,
    isLoading: (!isReady && !dashboard.isError) || dashboard.isLoading || updateRoleMutation.isPending || updateMembershipMutation.isPending,
    isError: dashboard.isError,
    refetch: dashboard.refetch,

    matrixProps: {
      permissions: dashboard.data?.permissions ?? [],
      rolePermissions: dashboard.data?.rolePermissions ?? {},
      onUpdateRole: (role: string, permissions: string[]) =>
        updateRoleMutation.mutate({ role, permissions }),
      isLoading: updateRoleMutation.isPending,
    },

    membersProps: {
      members: dashboard.data?.members ?? [],
      onChangeRole: handleChangeRole,
      isLoading: updateMembershipMutation.isPending,
      currentUserId,
    },

    state: {
      currentRole: currentMembership?.role,
      availableRoles: ['owner', 'admin', 'member'],
      dialog: {
        ...dialogState,
        selectRole,
        confirm: confirmRoleChange,
        close: closeDialog,
      },
    },
  }
}
