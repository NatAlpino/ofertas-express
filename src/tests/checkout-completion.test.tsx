import type { ComponentProps } from 'react'
import { act, render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { offers } from '@/mocks/data'
import { createWrapper } from '@/tests/utils'
import { useCartStore } from '@/stores/cart'
import CheckoutPage from '@/app/checkout/page'
import { useHistoryStore } from '@/stores/history'
import { useCompletedOffersStore } from '@/stores/offers'
import type { PaymentInstructionsDialog } from '@/screens/checkout/payment-instructions-dialog'

let dialogProps: ComponentProps<typeof PaymentInstructionsDialog>

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn(), push: vi.fn() }) }))
vi.mock('@/screens/checkout/payment-instructions-dialog', () => ({
  PaymentInstructionsDialog: (props: ComponentProps<typeof PaymentInstructionsDialog>) => {
    dialogProps = props
    return null
  },
}))

describe('checkout completion callback', () => {
  beforeEach(() => {
    useCartStore.getState().clear()
    useHistoryStore.setState({ entries: [] })
    useCompletedOffersStore.setState({ completedIds: [] })
  })

  it('does not create a history entry without an agreement', () => {
    useCartStore.getState().add(offers[0])
    render(<CheckoutPage />, { wrapper: createWrapper() })

    // Exercise the defensive callback contract directly; the real dialog is closed in this state.
    expect(dialogProps.instructions).toBeNull()
    act(() => dialogProps.onConclude())

    expect(useHistoryStore.getState().entries).toEqual([])
  })
})
