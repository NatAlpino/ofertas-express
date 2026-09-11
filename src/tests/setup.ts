import '@testing-library/jest-dom/vitest'

import { beforeAll, afterEach, afterAll } from 'vitest'

import { resetIdempotencyStore } from '@/mocks/handlers'
import { server } from '@/mocks/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
  server.resetHandlers()
  resetIdempotencyStore()
})

afterAll(() => server.close())
