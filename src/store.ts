import { create } from 'zustand'
import { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
}))

interface SearchState {
  query: string
  ordering?: string
  dates?: string
  setQuery: (query: string) => void
  setFilters: (filters: { ordering?: string; dates?: string }) => void
  clearFilters: () => void
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  ordering: undefined,
  dates: undefined,
  setQuery: (query) => set({ query }),
  setFilters: (filters) => set(filters),
  clearFilters: () => set({ query: '', ordering: undefined, dates: undefined }),
}))
