'use client'

import type { QueryClient } from '@tanstack/react-query'

import { CHECKOUT_V2_FLAG_KEY } from './handlers'

declare global {
  interface Window {
    setCheckoutV2?: (enabled: boolean | null) => void
  }
}

export const setCheckoutV2Override = (enabled: boolean | null) => {
  if (enabled === null) {
    window.localStorage.removeItem(CHECKOUT_V2_FLAG_KEY)
    return
  }
  window.localStorage.setItem(CHECKOUT_V2_FLAG_KEY, String(enabled))
}

export const exposeFlagToggle = (queryClient: QueryClient) => {
  window.setCheckoutV2 = (enabled) => {
    setCheckoutV2Override(enabled)
    void queryClient.invalidateQueries({ queryKey: ['feature-flags', 'checkoutV2'] })
  }
}
