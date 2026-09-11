import '@testing-library/jest-dom/vitest'

import { beforeAll, afterEach, afterAll } from 'vitest'

import { server } from '@/mocks/server'
import { resetIdempotencyStore } from '@/mocks/handlers'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
  server.resetHandlers()
  resetIdempotencyStore()
})

afterAll(() => server.close())
