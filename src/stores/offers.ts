import { create } from 'zustand'

interface CompletedOffersState {
  completedIds: string[]
  markCompleted: (ids: string[]) => void
}

const mergeCompleted = (completedIds: string[], ids: string[]) => [
  ...completedIds,
  ...ids.filter((id) => !completedIds.includes(id)),
]

export const useCompletedOffersStore = create<CompletedOffersState>((set) => ({
  completedIds: [],
  markCompleted: (ids) =>
    set((state) => ({ completedIds: mergeCompleted(state.completedIds, ids) })),
}))
