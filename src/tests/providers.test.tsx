import { useTheme } from '@mui/material'
import { renderHook } from '@testing-library/react'
import { useQueryClient } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { theme } from '@/theme'
import { Providers } from '@/app/providers'
import { handlers } from '@/mocks/handlers'

const { startWorker, setupWorker } = vi.hoisted(() => {
  const startWorker = vi.fn().mockResolvedValue(undefined)
  return { startWorker, setupWorker: vi.fn(() => ({ start: startWorker })) }
})
vi.mock('msw/browser', () => ({
  setupWorker,
}))

describe('application providers', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.unstubAllEnvs())

  it.each(['development', 'production', 'test'])('initializes providers in %s', (environment) => {
    vi.stubEnv('NODE_ENV', environment)
    const { result, rerender } = renderHook(
      () => ({
        client: useQueryClient(),
        theme: useTheme(),
      }),
      { wrapper: Providers }
    )
    const client = result.current.client

    expect(client.getDefaultOptions().queries).toMatchObject({ retry: false, staleTime: 30_000 })
    expect(result.current.theme.palette.primary.main).toBe(theme.palette.primary.main)
    rerender()
    expect(result.current.client).toBe(client)
    if (environment === 'development') {
      expect(setupWorker).toHaveBeenCalledExactlyOnceWith(...handlers)
      expect(startWorker).toHaveBeenCalledExactlyOnceWith({ onUnhandledRequest: 'bypass' })
    } else {
      expect(setupWorker).not.toHaveBeenCalled()
      expect(startWorker).not.toHaveBeenCalled()
    }
  })
})
