'use client'

import type { ReactNode } from 'react'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

export const createWrapper = (client?: QueryClient) => {
  const queryClient = client ?? createTestQueryClient()
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return Wrapper
}

export const renderHookWithClient = <T,>(hook: () => T, client?: QueryClient) =>
  renderHook(hook, { wrapper: createWrapper(client) })
