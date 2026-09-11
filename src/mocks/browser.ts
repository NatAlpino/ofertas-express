'use client'

import { setupWorker } from 'msw/browser'

import { handlers } from '@/mocks/handlers'

let startPromise: Promise<unknown> | undefined

export const startMockWorker = () => {
  startPromise ??= setupWorker(...handlers).start({ onUnhandledRequest: 'bypass' })
  return startPromise
}
