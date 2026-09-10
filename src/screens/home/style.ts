import type { SxProps, Theme } from '@mui/material'

export const offersPageStyles = {
  pageContainer: {
    justifyContent: 'center',
    px: { xs: 2, md: 3 },
    py: { xs: 3, md: 4 },
  },
  pageColumn: { width: '100%' },
  pageHeader: { mb: 3 },
  pageSubtitle: { color: 'text.secondary', mt: 0.5 },
  successAlert: { mb: 3 },
  offerList: { listStyle: 'none', m: 0, p: 0 },
  stateBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    py: 8,
  },
  card: { height: '100%' },
  cardContent: { display: 'flex', flexDirection: 'column', gap: 2 },
  cardHeader: { alignItems: 'center', justifyContent: 'space-between' },
  cardPrices: { alignItems: 'flex-start' },
  debtValue: { color: 'text.secondary', textDecoration: 'line-through' },
} satisfies Record<string, SxProps<Theme>>
