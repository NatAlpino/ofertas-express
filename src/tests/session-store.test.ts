import { useSessionStore } from '@/stores/session'
import { beforeEach, describe, expect, it } from 'vitest'

describe('useSessionStore', () => {
  beforeEach(() => {
    useSessionStore.getState().logout()
  })

  it('logs in with the given username', () => {
    useSessionStore.getState().login('maria.silva')

    expect(useSessionStore.getState().username).toBe('maria.silva')
  })

  it('clears the session on logout', () => {
    useSessionStore.getState().login('maria.silva')
    useSessionStore.getState().logout()

    expect(useSessionStore.getState().username).toBeNull()
  })
})
