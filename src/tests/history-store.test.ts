import { describe, expect, it } from 'vitest'

import { sortByPaidAtDesc } from '@/stores/history'
import type { HistoryEntry } from '@/stores/history'

const entry = (overrides: Partial<HistoryEntry>): HistoryEntry => ({
  id: 'acordo-1',
  titles: ['Negocie agora'],
  total: 98000,
  method: 'pix',
  paidAt: '2026-09-10T12:00:00.000Z',
  ...overrides,
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
