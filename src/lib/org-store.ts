import { create } from 'zustand'

export type OrgState = {
  orgId: string | null
  setOrgId: (id: string | null) => void
}

const STORAGE_KEY = 'orgId'

export const useOrgStore = create<OrgState>((set) => ({
  orgId: (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null),
  setOrgId: (id) => {
    if (typeof window !== 'undefined') {
      if (id) localStorage.setItem(STORAGE_KEY, id)
      else localStorage.removeItem(STORAGE_KEY)
    }
    set({ orgId: id })
  },
}))
