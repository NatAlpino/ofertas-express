import { create } from 'zustand'

export type HistoryMethod = 'pix' | 'boleto' | 'direct'

export interface HistoryEntry {
  id: string
  titles: string[]
  total: number
  method: HistoryMethod
  paidAt: string
}

interface HistoryState {
  entries: HistoryEntry[]
  add: (entry: HistoryEntry) => void
}

export const useHistoryStore = create<HistoryState>((set) => ({
  entries: [],
  add: (entry) => set((state) => ({ entries: [entry, ...state.entries] })),
}))

export const sortByPaidAtDesc = (entries: HistoryEntry[]) =>
  [...entries].sort((a, b) => b.paidAt.localeCompare(a.paidAt))
