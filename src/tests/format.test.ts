import { describe, expect, it } from 'vitest'

import { discountPercent, formatBRL, formatDate } from '@/utils/format'

const NBSP = '\u00A0'

describe('discountPercent', () => {
  it.each([0, -100])('returns zero for a non-positive debt (%s)', (debt) => {
    expect(discountPercent(debt, 50)).toBe(0)
  })

  it('rounds the discount to a whole percentage', () => {
    expect(discountPercent(300, 100)).toBe(67)
  })

  it('clamps to zero when the offer price exceeds the debt', () => {
    expect(discountPercent(100, 150)).toBe(0)
  })
})

describe('formatBRL', () => {
  it('formats cents as BRL currency', () => {
    expect(formatBRL(98000)).toBe(`R$${NBSP}980,00`)
    expect(formatBRL(245000)).toBe(`R$${NBSP}2.450,00`)
    expect(formatBRL(155000)).toBe(`R$${NBSP}1.550,00`)
  })

  it('formats zero', () => {
    expect(formatBRL(0)).toBe(`R$${NBSP}0,00`)
  })
})

describe('formatDate', () => {
  it('formats an ISO date as pt-BR date', () => {
    expect(formatDate(new Date(2026, 8, 10).toISOString())).toBe('10/09/2026')
  })

  it('returns an empty string for an invalid date', () => {
    expect(formatDate('not-a-date')).toBe('')
  })
})
