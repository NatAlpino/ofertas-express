import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { handlers } from '@/mocks/handlers'

import { Providers } from '@/app/providers'

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

  it.each(['development', 'production', 'test'])('starts the mock worker only in %s', (environment) => {
    vi.stubEnv('NODE_ENV', environment)
    const { rerender } = renderHook(() => null, { wrapper: Providers })

    rerender()
    if (environment === 'development') {
      expect(setupWorker).toHaveBeenCalledExactlyOnceWith(...handlers)
      expect(startWorker).toHaveBeenCalledExactlyOnceWith({ onUnhandledRequest: 'bypass' })
    } else {
      expect(setupWorker).not.toHaveBeenCalled()
      expect(startWorker).not.toHaveBeenCalled()
    }
  })
})
