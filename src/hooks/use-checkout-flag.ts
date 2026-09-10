'use client'

import { useQuery } from '@tanstack/react-query'

import { apiFetch } from '@/services/api'

export const useCheckoutFlag = () => {
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
