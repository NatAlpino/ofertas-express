import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'

import RootLayout, { metadata } from '@/app/layout'

vi.mock('@/app/providers', () => ({
  Providers: ({ children }: { children: ReactNode }) => (
    <div data-testid="providers">{children}</div>
  ),
}))
vi.mock('@/components/app-shell', () => ({
  AppShell: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}))

describe('root layout', () => {
  it('sets the document language and composes providers, navigation and route content', () => {
    render(
      <RootLayout>
        <p>Route content</p>
      </RootLayout>,
      { container: document }
    )

    expect(document.documentElement).toHaveAttribute('lang', 'pt-BR')
    expect(within(screen.getByTestId('providers')).getByRole('main')).toHaveTextContent(
      'Route content'
    )
    expect(metadata.title).toEqual({ default: 'Ofertas Express', template: '%s | Ofertas Express' })
  })
})
