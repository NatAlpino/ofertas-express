import type { HistoryEntry } from '@/stores/history'
import { beforeEach, describe, expect, it } from 'vitest'
import { sortByPaidAtDesc, useHistoryStore } from '@/stores/history'

const entry = (overrides: Partial<HistoryEntry>): HistoryEntry => ({
  id: 'acordo-1',
  titles: ['Negocie agora'],
  total: 98000,
  method: 'pix',
  paidAt: '2026-09-10T12:00:00.000Z',
  ...overrides,
})

describe('useHistoryStore', () => {
  beforeEach(() => {
    useHistoryStore.setState({ entries: [] })
  })

  it('adds an entry to the top of the list', () => {
    useHistoryStore.getState().add(entry({ id: 'acordo-1' }))
    useHistoryStore.getState().add(entry({ id: 'acordo-2', method: 'boleto' }))

    expect(useHistoryStore.getState().entries.map((item) => item.id)).toEqual([
      'acordo-2',
      'acordo-1',
    ])
  })
})

describe('sortByPaidAtDesc', () => {
  it('orders entries from newest to oldest', () => {
    const sorted = sortByPaidAtDesc([
      entry({ id: 'older', paidAt: '2026-09-01T10:00:00.000Z' }),
      entry({ id: 'newer', paidAt: '2026-09-10T10:00:00.000Z' }),
    ])

    expect(sorted.map((item) => item.id)).toEqual(['newer', 'older'])
  })
})
