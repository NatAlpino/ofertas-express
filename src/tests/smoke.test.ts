import { describe, expect, it } from 'vitest'

describe('test setup smoke', () => {
  it('runs with jest-dom matchers available', () => {
    expect(true).toBe(true)
    expect(document.body).toBeInTheDocument()
  })
})
