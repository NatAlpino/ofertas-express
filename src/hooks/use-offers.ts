'use client'

import { useQuery } from '@tanstack/react-query'

import type { Offer } from '@/types'

import { apiFetch } from '@/services/api'

export const useOffers = () =>
  useQuery({
    queryKey: ['offers'],
    queryFn: () => apiFetch<Offer[]>('/api/offers'),
  })
