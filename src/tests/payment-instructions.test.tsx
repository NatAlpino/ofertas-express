
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'


import { PaymentInstructionsDialog } from '@/screens/checkout/payment-instructions-dialog'

describe('payment instructions clipboard fallback', () => {
  it('copies the Pix code without Clipboard API and removes the temporary textarea', async () => {
    const user = userEvent.setup()
    const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
    const execCommandDescriptor = Object.getOwnPropertyDescriptor(document, 'execCommand')
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined })
    const execCommand = vi.fn(() => {
      const textarea = document.querySelector('textarea')
      expect(textarea).toHaveValue('pix-copy-code')
      expect(textarea).toHaveAttribute('readonly')
      expect(textarea?.selectionStart).toBe(0)
      expect(textarea?.selectionEnd).toBe('pix-copy-code'.length)
      return true
    })
    Object.defineProperty(document, 'execCommand', { configurable: true, value: execCommand })
    try {
      render(
        <PaymentInstructionsDialog
          instructions={{
            method: 'pix',
            pix: { copyCode: 'pix-copy-code', qrCodePayload: 'pix-payload' },
          }}
          onCancel={vi.fn()}
          onConclude={vi.fn()}
        />
      )

      await user.click(screen.getByRole('button', { name: 'Copiar código' }))
      expect(execCommand).toHaveBeenCalledWith('copy')
      expect(await screen.findByText('Código copiado!')).toBeVisible()
      expect(document.querySelector('textarea')).not.toBeInTheDocument()
    } finally {
      if (clipboardDescriptor) Object.defineProperty(navigator, 'clipboard', clipboardDescriptor)
      else Reflect.deleteProperty(navigator, 'clipboard')
      if (execCommandDescriptor)
        Object.defineProperty(document, 'execCommand', execCommandDescriptor)
      else Reflect.deleteProperty(document, 'execCommand')
    }
  })
})
