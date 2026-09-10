import { http, HttpResponse } from 'msw'

import type { CheckoutRequest, CheckoutResponse } from '@/types'

import { offers } from './data'

const buildPaymentInstructions = (method: CheckoutRequest['paymentMethod']) => {
  if (method === 'pix') {
    const copyCode =
      '00020126580014br.gov.bcb.pix0136f2b0-7d4a-4c8e-9a21-3f5c8d7e9b12020400530398658002BR5915OFERTAS EXPRESS6009SAO PAULO62070503***6304A1B2'
    return {
      method: 'pix' as const,
      pix: { qrCodePayload: copyCode, copyCode },
    }
  }
  if (method === 'boleto') {
    return {
      method: 'boleto' as const,
      boleto: {
        barcode: '23793.38128 60007.827136 95000.063305 1 99010000015500',
        dueDate: new Date().toISOString(),
      },
    }
  }
  return undefined
}

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
      payment: buildPaymentInstructions(body.paymentMethod),
    }
    return HttpResponse.json(response, { status: 201 })
  }),
]
