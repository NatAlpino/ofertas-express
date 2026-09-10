import { http, HttpResponse } from 'msw'
import type { CheckoutRequest, CheckoutResponse } from '@/services/types'
import { offers } from '@/mocks/data'

export const handlers = [
  http.get('/api/offers', () => {
    return HttpResponse.json(offers)
  }),

  http.get('/api/feature-flags/checkoutV2', () => {
    return HttpResponse.json({ enabled: true })
  }),

  http.post('/api/checkout', async ({ request }) => {
    const body = (await request.json()) as CheckoutRequest
    if (!Array.isArray(body.offerIds) || body.offerIds.length === 0) {
      return HttpResponse.json({ message: 'offerIds is required' }, { status: 400 })
    }
    const response: CheckoutResponse = {
      agreementId: 'acordo-123',
      status: 'confirmed',
    }
    return HttpResponse.json(response, { status: 201 })
  }),
]
