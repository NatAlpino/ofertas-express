import type { Metadata } from 'next'

import { AppShell } from '@/components/app-shell'

import { Providers } from './providers'
import './globals.css'

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
