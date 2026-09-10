import { beforeEach, describe, expect, it } from 'vitest'
import { useCompletedOffersStore } from '@/stores/offers'

describe('useCompletedOffersStore', () => {
  beforeEach(() => {
    useCompletedOffersStore.setState({ completedIds: [] })
  })

  it('marks offers as completed', () => {
    useCompletedOffersStore.getState().markCompleted(['oferta-1', 'oferta-2'])

    expect(useCompletedOffersStore.getState().completedIds).toEqual(['oferta-1', 'oferta-2'])
  })

  it('does not duplicate ids', () => {
    useCompletedOffersStore.getState().markCompleted(['oferta-1'])
    useCompletedOffersStore.getState().markCompleted(['oferta-1', 'oferta-3'])

    expect(useCompletedOffersStore.getState().completedIds).toEqual(['oferta-1', 'oferta-3'])
  })
})
