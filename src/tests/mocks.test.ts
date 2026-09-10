import { describe, expect, it } from 'vitest'

describe('msw mock server', () => {
  it('enables checkout V2 by default', async () => {
    const response = await fetch('/api/feature-flags/checkoutV2')

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ enabled: true })
  })

  it.each([{}, { offerIds: [] }, { offerIds: 'oferta-1' }])(
    'rejects checkout with invalid offer IDs: %j',
    async (body) => {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      expect(response.status).toBe(400)
      expect(await response.json()).toEqual({ message: 'offerIds is required' })
    }
  )

  it('serves the offers fixture over a mocked request', async () => {
    const response = await fetch('/api/offers')
    expect(response.ok).toBe(true)

    const data = await response.json()
    expect(data).toHaveLength(3)
    expect(data[0]).toMatchObject({
      id: 'oferta-1',
      title: 'Negocie agora',
    })
  })
})
