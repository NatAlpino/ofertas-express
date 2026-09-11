'use client'

import { useQuery } from '@tanstack/react-query'

import { apiFetch } from '@/services/api'
import { parseOffers } from '@/services/contracts'

export const useOffers = () =>
  useQuery({
    queryKey: ['offers'],
    queryFn: async () => parseOffers(await apiFetch<unknown>('/api/offers')),
  })
