'use client'

import { ThemeProvider } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { startMockWorker } from '@/mocks/browser'
import { exposeFlagToggle } from '@/mocks/flag-toggle'
import { theme } from '@/theme'

const startWorkerInDev = (queryClient: QueryClient) => {
  if (process.env.NODE_ENV === 'development') {
    startMockWorker()
    exposeFlagToggle(queryClient)
  }
}

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, staleTime: 30_000 },
        },
      })
  )

  useEffect(() => startWorkerInDev(queryClient), [queryClient])

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}
