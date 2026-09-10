'use client'

import { useMutation } from '@tanstack/react-query'

import type { CheckoutRequest, CheckoutResponse } from '@/types'

import { apiFetch } from '@/services/api'

export const useConfirmCheckout = () =>
  useMutation({
    mutationFn: (payload: CheckoutRequest) =>
      apiFetch<CheckoutResponse>('/api/checkout', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  })
