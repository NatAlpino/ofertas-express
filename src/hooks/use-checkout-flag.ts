'use client'

import { useQuery } from '@tanstack/react-query'

import { apiFetch } from '@/services/api'
import { parseCheckoutFlag } from '@/services/contracts'

export const useCheckoutFlag = () => {
  const query = useQuery({
    queryKey: ['feature-flags', 'checkoutV2'],
    queryFn: async () => parseCheckoutFlag(await apiFetch<unknown>('/api/feature-flags/checkoutV2')),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    retry: false,
  })

  return {
    ...query,
    isV2: query.data?.enabled === true,
  }
}
