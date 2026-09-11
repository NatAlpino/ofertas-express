import type { Metadata } from 'next'

import { AppShell } from '@/components/app-shell'

import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: {
    default: 'Ofertas Express',
    template: '%s | Ofertas Express',
  },
}

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <html lang="pt-BR">
    <body>
      <Providers>
        <AppShell>{children}</AppShell>
      </Providers>
    </body>
  </html>
)

export default RootLayout
