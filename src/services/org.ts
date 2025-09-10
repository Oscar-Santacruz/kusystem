import { ApiInstance } from '@/services/api'

export type Organization = {
  id: string
  name: string
  slug?: string | null
  logoUrl?: string | null
}

export type Membership = {
  id: string
  role: 'owner' | 'admin' | 'member' | string
  tenantId: string
  tenant: Organization
}

export async function createOrganization(input: { name: string; slug: string; logoUrl?: string | null }) {
  return ApiInstance.post<Organization>('/organizations', {
    data: { name: input.name, slug: input.slug, ...(input.logoUrl ? { logoUrl: input.logoUrl } : {}) },
    headers: { 'Content-Type': 'application/json' },
  })
}

export type MyOrganizationsResponse = { data: Array<{ id: string; role: string; tenant: Organization }> }

export async function getMyOrganizations() {
  return ApiInstance.get<MyOrganizationsResponse>('/organizations/me')
}

export async function createInvitation(input: { email: string; role: 'admin' | 'member' }) {
  return ApiInstance.post<{ ok: boolean; id: string; token: string; inviteUrl: string }>('/invitations', {
    data: input,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function getInvitationByToken(token: string) {
  return ApiInstance.get<{ email: string; role: string; organization: { id: string; name: string } }>(
    `/public/invitations/${encodeURIComponent(token)}`,
  )
}

export async function acceptInvitation(token: string) {
  return ApiInstance.post<{ ok: boolean; tenantId: string }>(`/public/invitations/${encodeURIComponent(token)}/accept`)
}

export type Member = { id: string; role: string; tenantId: string; user: { id: string; email: string; name?: string | null } }

export async function listMembers() {
  return ApiInstance.get<{ data: Member[] }>('/members')
}

export async function removeMember(userId: string) {
  return ApiInstance.delete<{ ok: boolean }>(`/members/${encodeURIComponent(userId)}`)
}
