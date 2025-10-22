import { create } from 'zustand'

export type OrgState = {
  orgId: string | null
  setOrgId: (id: string | null) => void
  currentOrg: OrgMeta | null
  setCurrentOrg: (meta: OrgMeta | null) => void
  organizations: OrgMeta[]
  setOrganizations: (list: OrgMeta[]) => void
}

const STORAGE_KEY = 'orgId'
const STORAGE_META_KEY = 'orgMeta'

export type OrgMeta = {
  id: string
  name: string | null
  logoUrl: string | null
  ruc: string | null
}

const parseOrgMeta = (raw: string | null): OrgMeta | null => {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<OrgMeta> | null
    if (!parsed || typeof parsed !== 'object') return null
    return {
      id: String(parsed.id ?? ''),
      name: parsed.name ?? null,
      logoUrl: parsed.logoUrl ?? null,
      ruc: parsed.ruc ?? null,
    }
  } catch {
    return null
  }
}

export const useOrgStore = create<OrgState>((set) => ({
  orgId: (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null),
  currentOrg: (typeof window !== 'undefined' ? parseOrgMeta(localStorage.getItem(STORAGE_META_KEY)) : null),
  organizations: [],
  setOrgId: (id) => {
    if (typeof window !== 'undefined') {
      if (id) localStorage.setItem(STORAGE_KEY, id)
      else localStorage.removeItem(STORAGE_KEY)
    }
    set({ orgId: id })
  },
  setCurrentOrg: (meta) => {
    if (typeof window !== 'undefined') {
      try {
        if (meta) localStorage.setItem(STORAGE_META_KEY, JSON.stringify(meta))
        else localStorage.removeItem(STORAGE_META_KEY)
      } catch { /* noop */ }
    }
    set({ currentOrg: meta })
  },
  setOrganizations: (list) => set({ organizations: Array.isArray(list) ? list : [] }),
}))
