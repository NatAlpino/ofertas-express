'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/services/api'
import type { CheckoutRequest, CheckoutResponse, Offer } from '@/services/types'

export function useOffers() {
  return useQuery({
    queryKey: ['offers'],
    queryFn: () => apiFetch<Offer[]>('/api/offers'),
  })
}

export function useCheckoutFlag() {
  const query = useQuery({
    queryKey: ['feature-flags', 'checkoutV2'],
    queryFn: () => apiFetch<{ enabled: boolean }>('/api/feature-flags/checkoutV2'),
    retry: false,
  })

  return {
    ...query,
    isV2: query.data?.enabled === true,
  }
}

export function useConfirmCheckout() {
  return useMutation({
    mutationFn: (payload: CheckoutRequest) =>
      apiFetch<CheckoutResponse>('/api/checkout', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  })
}
