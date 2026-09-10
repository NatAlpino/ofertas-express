import { create } from 'zustand'

interface SessionState {
  username: string | null
  login: (username: string) => void
  logout: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  username: null,
  login: (username) => set({ username }),
  logout: () => set({ username: null }),
}))
