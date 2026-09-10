'use client'

import { setupWorker } from 'msw/browser'
import { handlers } from '@/mocks/handlers'

export const startMockWorker = () => {
  const worker = setupWorker(...handlers)
  return worker.start({ onUnhandledRequest: 'bypass' })
}
