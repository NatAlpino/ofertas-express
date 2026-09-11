'use client'

import { useMutation } from '@tanstack/react-query'

import { apiFetch } from '@/services/api'
import type { CheckoutRequest } from '@/types'
import { parseCheckoutResponse } from '@/services/contracts'

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
