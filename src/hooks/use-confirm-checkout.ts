'use client'

import { useMutation } from '@tanstack/react-query'


import { apiFetch } from '@/services/api'
import { parseCheckoutResponse } from '@/services/contracts'
import type { CheckoutRequest } from '@/types'

export const buildIdempotencyKey = ({ offerIds, paymentMethod }: CheckoutRequest) =>
  `${offerIds.join(',')}|${paymentMethod ?? 'direct'}`

export const useConfirmCheckout = () =>
  useMutation({
    mutationFn: async (payload: CheckoutRequest) =>
      parseCheckoutResponse(
        await apiFetch<unknown>('/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': buildIdempotencyKey(payload),
          },
          body: JSON.stringify(payload),
        })
      ),
  })
