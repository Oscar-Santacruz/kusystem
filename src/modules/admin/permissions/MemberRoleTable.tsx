import { Button } from '@/shared/ui/button'
import { Tag } from '@/shared/ui/tag'

type Member = { id: string; role: string; user: { id: string; email: string | null; name: string | null } }

interface MemberRoleTableProps {
  members: Member[]
  onChangeRole: (member: Member, newRole: string) => void
  isLoading?: boolean
  currentUserId?: string
}

export function MemberRoleTable({
  members,
  onChangeRole,
  isLoading = false,
  currentUserId,
}: MemberRoleTableProps) {
  const availableRoles = ['owner', 'admin', 'member']

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'red'
      case 'admin':
        return 'blue'
      case 'member':
        return 'gray'
      default:
        return 'gray'
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-slate-800">
        <thead className="bg-slate-900">
          <tr>
            <th className="text-left px-4 py-3 border-b border-slate-800">Nombre</th>
            <th className="text-left px-4 py-3 border-b border-slate-800">Email</th>
            <th className="text-left px-4 py-3 border-b border-slate-800">Rol actual</th>
            <th className="text-left px-4 py-3 border-b border-slate-800">Cambiar rol</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="odd:bg-slate-900/40">
              <td className="px-4 py-3 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="font-medium">{member.user.name || 'Sin nombre'}</div>
                  {member.user.id === currentUserId && (
                    <span className="text-xs text-slate-400">(Tú)</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 border-b border-slate-800">
                {member.user.email || 'Sin email'}
              </td>
              <td className="px-4 py-3 border-b border-slate-800">
                <Tag color={getRoleColor(member.role)}>{member.role}</Tag>
              </td>
              <td className="px-4 py-3 border-b border-slate-800">
                <div className="flex gap-2 flex-wrap">
                  {availableRoles
                    .filter((role) => role !== member.role)
                    .map((role) => (
                      <Button
                        key={role}
                        size="sm"
                        variant="ghost"
                        onClick={() => onChangeRole(member, role)}
                        disabled={isLoading}
                        className="text-xs"
                      >
                        Cambiar a {role}
                      </Button>
                    ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
